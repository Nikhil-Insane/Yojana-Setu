import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './css/style.css'
import './css/leaflet-map.css'
import './index.css'
import App from './App.jsx'

// Apply saved theme before React hydrates to prevent flash of wrong theme
const savedTheme = localStorage.getItem('ys_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
