const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());

// Increase payload size limit to 50MB
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const DATA_FILE = path.join(__dirname, 'posts.json');

// Initialize empty posts array if file doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]');
}

// Get all posts
app.get('/posts', (req, res) => {
  const posts = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(posts.reverse()); // Show newest first
});

// Create new post
app.post('/posts', (req, res) => {
  const posts = JSON.parse(fs.readFileSync(DATA_FILE));
  const newPost = {
    id: Date.now(),
    ...req.body,
    timestamp: new Date().toISOString()
  };
  posts.push(newPost);
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  res.status(201).json(newPost);
});

// Delete a specific post by id
app.delete('/posts/:id', (req, res) => {
  let posts = JSON.parse(fs.readFileSync(DATA_FILE));
  const id = Number(req.params.id);
  const newPosts = posts.filter((post) => post.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(newPosts, null, 2));
  res.status(200).json({ message: 'Post deleted' });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));