import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/app.css'

// Detect Tauri environment and add class to body
if (typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)) {
  document.body.classList.add('tauri');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
