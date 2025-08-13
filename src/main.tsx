import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app.css';
import './tg-viewport';
import './tg-header-buffer';
import './layout-engine';
import './gestures-guard';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
