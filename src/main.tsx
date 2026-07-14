import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite HMR websocket connection errors in preview/sandbox environment
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || '';
  const stack = event.reason?.stack || '';
  if (
    msg.toLowerCase().includes('websocket') ||
    msg.toLowerCase().includes('vite') ||
    stack.toLowerCase().includes('websocket')
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  const errorMsg = event.error?.message || '';
  if (
    msg.toLowerCase().includes('websocket') ||
    errorMsg.toLowerCase().includes('websocket')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
}

