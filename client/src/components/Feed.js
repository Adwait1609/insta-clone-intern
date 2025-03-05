// Feed.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './Feed.css';

const Feed = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/posts');
      // Sort posts by timestamp in descending order (newest first)
      const sortedPosts = response.data.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      setPosts(sortedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`http://localhost:3001/posts/${id}`);
      fetchPosts(); // Refresh the feed after deletion
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  return (
    <div className="feed">
      {posts.map((post) => (
        <div key={post.id} className="post">
          <div className="post-header">
            <span className="timestamp">
              {new Date(post.timestamp).toLocaleString()}
            </span>
            <button
              className="delete-button"
              onClick={() => handleDelete(post.id)}
            >
              Delete
            </button>
          </div>
          <div className="post-image-container">
            <img src={post.image} alt="Post content" />
          </div>
          {post.caption && (
            <div className="caption">{post.caption}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Feed;