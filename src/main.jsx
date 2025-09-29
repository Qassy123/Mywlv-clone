import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// ✅ only import Tailwind index.css (do not import App.css)
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <App />
)
