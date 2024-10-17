import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot correctly
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// Select the root element from the DOM
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement); // Only use createRoot here
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
