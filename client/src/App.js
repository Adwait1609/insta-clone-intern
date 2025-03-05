import React, { useState } from 'react';
import './App.css';
import CreatePost from './components/CreatePost';
import Feed from './components/Feed';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <h1>InstaClone</h1>
        <div className="header-buttons">
          <button 
            className="theme-toggle-button"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button 
            className="create-post-button"
            onClick={() => setIsCreatePostOpen(true)}
          >
            Create Post
          </button>
        </div>
      </header>
      
      {isCreatePostOpen && (
        <CreatePost 
          onPostCreated={() => {
            setRefreshKey(prev => prev + 1);
            setIsCreatePostOpen(false);
          }}
          onClose={() => setIsCreatePostOpen(false)}
        />
      )}
      <Feed key={refreshKey} />
    </div>
  );
}

export default App;