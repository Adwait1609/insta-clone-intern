# Instagram Clone

A responsive Instagram-like web application built with React and Node.js that allows users to view a feed of posts and create new posts with image cropping functionality.

## Features

- 📱 Responsive design (mobile and desktop views)
- 🖼️ Image upload from local storage
- 🔗 Image upload via URL
- ✂️ Image cropping functionality
- 🌙 Dark/Light mode toggle
- 📝 Caption support for posts
- ⏱️ Timestamp for each post
- 🗑️ Delete post functionality
- 🔄 Auto-updating feed
- 📊 Grid to single column responsive layout

## Technologies Used

### Frontend
- React.js
- react-image-crop
- Axios for API calls
- CSS3 for styling

### Backend
- Node.js
- Express.js
- cors for Cross-Origin Resource Sharing
- body-parser for parsing JSON

## Prerequisites

Before running this project, make sure you have:
- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/insta-clone.git
cd insta-clone
```

2. Install dependencies for the client:

```bash

cd client
npm install

```

3. Install dependencies for the server:

```bash

cd ../server
npm install

```

## Running the Application

1. Start the server (from the server directory):

```bash

node index.js

```
The server will start on http://localhost:3001

2. In a new terminal, start the client (from the client directory):

```bash

npm start

```
The client will start on http://localhost:3000

## Testing the Application

1. Open http://localhost:3000 in your browser
2. Test the following features:
   - Click "Create Post" to open the post creation dialog
   - Try uploading an image from your computer
   - Try adding an image using a URL
   - Test the image cropping functionality
   - Add a caption to your post
   - Submit the post and see it appear in the feed
   - Test the dark/light mode toggle
   - Try deleting a post
   - Check the responsive layout on different screen sizes

## Project Structure

```
insta-clone/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js        # Main application component
│   │   └── App.css       # Main styles
│   └── public/           # Static files
└── server/               # Backend Node.js server
    ├── index.js         # Server entry point
    └── posts.json       # Local database
     file


```

## Features Implementation

### Image Upload
- Supports local file upload
- Supports image URL input
- Handles CORS for external images
- Supports common image formats (JPG, PNG, GIF, WEBP)

### Image Cropping
- Square aspect ratio cropping
- Interactive crop area selection
- Preview before posting
- Maintains image quality

### Responsive Design
- Desktop: Single column feed layout (Instagram style)
- Mobile: Single column feed
- Adaptive image containers
- Responsive text and spacing

## Limitations & Notes

- Images are stored as URLs or Base64 strings in a local JSON file
- No authentication system implemented
- Server needs to be running for the application to work
- External image URLs must allow CORS for URL upload feature

## Future Improvements

- Add user authentication
- Implement proper image storage
- Add image filters
- Add like and comment functionality
- Add user profiles
- Improve image optimization








