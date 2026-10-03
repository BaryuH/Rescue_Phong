import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Chặn browser double-click zoom trên canvas và giao diện game
window.addEventListener('dblclick', (e) => {
  const target = e.target as HTMLElement | null;
  if (target && (target.tagName === 'CANVAS' || target.closest('#game-container'))) {
    e.preventDefault();
  }
}, { passive: false });

// Chặn Ctrl + cuộn chuột phóng to trình duyệt ngoài ý muốn
window.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// Chặn gesture zoom trên thiết bị Safari / iOS
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
