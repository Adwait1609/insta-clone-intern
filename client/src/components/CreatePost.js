import axios from 'axios';
import React, { useCallback, useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './CreatePost.css';

const CreatePost = ({ onPostCreated, onClose }) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [caption, setCaption] = useState('');
  const [mode, setMode] = useState('file');
  const [loading, setLoading] = useState(false);
  const [cropPreview, setCropPreview] = useState(null);
  const [isCropping, setIsCropping] = useState(true);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // This function centers and creates a default crop when image loads
  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  const onImageLoad = useCallback((e) => {
    const img = e.currentTarget;
    imgRef.current = img;

    // Set crossOrigin for URL images
    img.crossOrigin = "anonymous";

    const { width, height } = img;
    const aspect = 1;

    // Calculate crop area
    const cropWidth = Math.min(width, height);
    const x = (width - cropWidth) / 2;
    const y = (height - cropWidth) / 2;

    const newCrop = {
      unit: 'px',
      x,
      y,
      width: cropWidth,
      height: cropWidth,
      aspect
    };

    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCrop(undefined); // Reset crop state
      const reader = new FileReader();
      reader.onload = (e) => {
        setSrc(e.target.result);
        setIsCropping(true);
        setCropPreview(null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setSrc(url);

    if (url) {
      // Less restrictive URL validation
      const isValidUrl = /^(https?:\/\/).*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);

      if (isValidUrl) {
        // Create a new image to test loading and CORS
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setSrc(url);
          setIsCropping(true);
          setCropPreview(null);
          setCrop(undefined);
        };
        img.onerror = () => {
          alert("Unable to load image. Please try another URL or upload an image.");
        };
        img.src = url;
      }
    }
  };

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas dimensions to match crop size
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    try {
      // Draw white background first
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the cropped image
      ctx.drawImage(
        imgRef.current,
        completedCrop.x,
        completedCrop.y,
        completedCrop.width,
        completedCrop.height,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      // Convert to blob with better quality
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('Canvas is empty');
              return;
            }
            const croppedImageUrl = URL.createObjectURL(blob);
            resolve(croppedImageUrl);
          },
          'image/jpeg',
          1.0 // Maximum quality
        );
      });
    } catch (err) {
      console.error('Error during cropping:', err);
      throw new Error('Failed to crop image. Please try again.');
    }
  }, [completedCrop]);

  const generatePreview = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      alert('Please select a crop area first');
      return;
    }

    try {
      const croppedImage = await getCroppedImg();
      if (croppedImage) {
        setCropPreview(croppedImage);
        setIsCropping(false);
      }
    } catch (e) {
      console.error('Error generating preview:', e);
      alert('Failed to generate crop preview. Please try again.');
    }
  }, [getCroppedImg, completedCrop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageData = cropPreview || src;
      if (!imageData) {
        throw new Error('No image selected');
      }

      await axios.post('http://localhost:3001/posts', {
        image: imageData,
        caption,
        timestamp: new Date().toISOString()
      });

      onPostCreated();
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      alert(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content insta-style" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Post</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="toggle-group insta-toggle">
              <button
                type="button"
                className={`toggle-button ${mode === 'file' ? 'active' : ''}`}
                onClick={() => setMode('file')}
              >
                📁 Upload
              </button>
              <button
                type="button"
                className={`toggle-button ${mode === 'url' ? 'active' : ''}`}
                onClick={() => setMode('url')}
              >
                🔗 URL
              </button>
            </div>
            {mode === 'file' ? (
              <div className="file-input-container insta-upload">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  id="image-input"
                  className="file-input"
                />
                <label htmlFor="image-input" className="file-input-label">
                  {src ? 'Change File' : 'Select from Computer'}
                </label>
              </div>
            ) : (
              <div className="url-input-container">
                <input
                  type="url"
                  value={src || ''}
                  onChange={handleUrlChange}
                  placeholder="Paste image URL here"
                  className="url-input insta-url-input"
                />
                <small className="supported-formats">
                  Supports: JPG, PNG, GIF, WEBP (must start with http:// or https://)
                </small>
              </div>
            )}
          </div>

          {src && (
            <div className="crop-container">
              {isCropping ? (
                <div className="crop-wrapper">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    className="custom-react-crop"
                    minWidth={100}
                    minHeight={100}
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={src}
                      onLoad={onImageLoad}
                      crossOrigin="anonymous"
                      style={{ maxHeight: '60vh', maxWidth: '100%' }}
                    />
                  </ReactCrop>
                  <div className="crop-controls">
                    <button
                      type="button"
                      className="insta-button primary"
                      onClick={generatePreview}
                      disabled={!crop?.width || !crop?.height}
                    >
                      ✂️ Apply Crop
                    </button>
                  </div>
                </div>
              ) : (
                <div className="preview-container">
                  <img
                    src={cropPreview}
                    alt="Preview"
                    className="image-preview insta-preview"
                  />
                  <button
                    type="button"
                    className="insta-button secondary"
                    onClick={() => setIsCropping(true)}
                  >
                    ✏️ Edit Crop
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="caption-container">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption..."
              className="caption-input insta-caption"
              rows="3"
            />
          </div>

          <div className="button-group insta-actions">
            {loading ? (
              <div className="insta-spinner" />
            ) : (
              <>
                <button
                  type="submit"
                  className="insta-button primary"
                  disabled={!src || !completedCrop}
                >
                  {loading ? 'Sharing...' : '📤 Share Post'}
                </button>
                <button
                  type="button"
                  className="insta-button secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;