import { createRoot } from 'react-dom/client'
import './lib/gsap-plugins' // Register GSAP plugins (including InertiaPlugin)
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

// StrictMode disabled to prevent issues with:
// - installHook.js console spam (from React DevTools trying to hook into double renders)
// - Cards disappearing during render (double renders conflict with GSAP animations)
// - Font flashing issues (double renders cause font re-loading)
// - GSAP animation conflicts (refs get reset during double render)
// 
// Note: StrictMode is useful for catching bugs, but causes too many issues with
// GSAP animations, refs, and complex state management in this app.
// If you need to enable it for debugging, wrap only specific components.
createRoot(rootElement).render(<App />)
