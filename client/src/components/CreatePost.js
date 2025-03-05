import axios from 'axios';
import React, { useCallback, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './CreatePost.css';

const CreatePost = ({ onPostCreated, onClose }) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({
    unit: 'px',
    width: 200,
    height: 200,
    x: 0,
    y: 0,
    aspect: 1
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [caption, setCaption] = useState('');
  const [mode, setMode] = useState('file');
  const [loading, setLoading] = useState(false);
  const [cropPreview, setCropPreview] = useState(null);
  const [isCropping, setIsCropping] = useState(true);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Adjust image display and initialize crop based on container dimensions
  const onImageLoad = useCallback((img) => {
    imgRef.current = img;
    img.crossOrigin = 'anonymous';

    const maxWidth = Math.min(800, window.innerWidth - 40);
    const maxHeight = Math.min(600, window.innerHeight - 200);

    const { naturalWidth: width, naturalHeight: height } = img;
    const aspectRatio = width / height;

    let displayWidth, displayHeight;

    if (aspectRatio > 1) {
      displayWidth = Math.min(maxWidth, width);
      displayHeight = displayWidth / aspectRatio;
    } else {
      displayHeight = Math.min(maxHeight, height);
      displayWidth = displayHeight * aspectRatio;
    }

    // Set initial square crop
    const cropSize = Math.min(displayWidth, displayHeight);
    const x = (displayWidth - cropSize) / 2;
    const y = (displayHeight - cropSize) / 2;

    const newCrop = {
      unit: 'px',
      width: cropSize,
      height: cropSize,
      x: x,
      y: y,
      aspect: 1
    };

    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
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
    if (url && /^(https?:\/\/).+\.(jpeg|jpg|gif|png|svg)$/.test(url)) {
      setSrc(url);
      setIsCropping(true);
      setCropPreview(null);
    }
  };

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size to desired output size
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
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
          resolve(URL.createObjectURL(blob));
        },
        'image/jpeg',
        1.0 // Maximum quality
      );
    });
  }, [completedCrop]);

  const generatePreview = useCallback(async () => {
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
  }, [getCroppedImg]);

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
                  placeholder="Paste image URL"
                  className="url-input insta-url-input"
                />
                <small className="supported-formats">
                  Supports: JPEG, PNG, GIF, SVG
                </small>
              </div>
            )}
          </div>

          {src && (
            <div className="crop-container insta-crop-area">
              {isCropping ? (
                <div className="crop-wrapper">
                  <ReactCrop
                    src={src}
                    onImageLoad={onImageLoad}
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    className="react-crop"
                    ruleOfThirds
                    minWidth={100}
                    minHeight={100}
                    circularCrop={false}
                    style={{
                      background: 'transparent',
                      maxHeight: '60vh',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  />
                  <div className="crop-controls">
                    <button
                      type="button"
                      className="insta-button primary"
                      onClick={generatePreview}
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