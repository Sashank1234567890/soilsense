import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './styles/index.css';

// Automatically attach Bearer token to all outgoing axios requests dynamically
axios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('soilsense_token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
}, (error) => Promise.reject(error));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
