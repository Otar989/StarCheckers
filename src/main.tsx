import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app.css';
import './tg-viewport';
import './tg-header-buffer';
import './layout-engine';
import './gestures-guard';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
