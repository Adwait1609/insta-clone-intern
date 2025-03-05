// Feed.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './Feed.css';

const Feed = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/posts');
      // Reverse the post order to show the latest first
      setPosts(res.data.reverse());
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`http://localhost:3001/posts/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  return (
    <div className="feed">
      {posts.map((post) => (
        <div className="post" key={post.id}>
          <div className="post-header">
            <span className="timestamp">{new Date(post.timestamp).toLocaleString()}</span>
            <button
              className="delete-button"
              onClick={() => handleDelete(post.id)}
            >
              Delete
            </button>
          </div>
          <div className="post-image-container">
            <img src={post.image} alt="Posted Content" />
          </div>
          {post.caption && <div className="caption">{post.caption}</div>}
        </div>
      ))}
    </div>
  );
};

export default Feed;