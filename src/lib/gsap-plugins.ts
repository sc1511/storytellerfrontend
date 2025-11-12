/**
 * GSAP Plugins Setup & Utilities
 * Register all GSAP plugins for use in the storytelling app
 * 
 * Note: ScrollTrigger en TextPlugin zijn gratis.
 * Draggable, Flip, MotionPathPlugin, Observer vereisen Club GreenSock membership.
 * Voor MVP gebruiken we alleen de gratis plugins.
 */

import { gsap } from 'gsap'

// Free plugins (included with GSAP)
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

// Try to import InertiaPlugin (may not be available in all GSAP versions)
let InertiaPlugin: any
try {
  InertiaPlugin = require('gsap/InertiaPlugin').InertiaPlugin
} catch (e) {
  // InertiaPlugin not available - that's okay
  InertiaPlugin = null
}

// Register free plugins
if (typeof window !== 'undefined') {
  try {
    const plugins: any[] = [ScrollTrigger, TextPlugin]
    if (InertiaPlugin) {
      plugins.push(InertiaPlugin)
    }
    gsap.registerPlugin(...plugins)
  } catch (e) {
    console.warn('GSAP plugins could not be registered:', e)
  }
}

// Premium plugins (optional - only if Club GreenSock membership)
// These will be undefined if not available, which is fine for MVP
let Draggable: any
let Flip: any
let MotionPathPlugin: any
let Observer: any

// Try to load premium plugins (will fail gracefully if not available)
if (typeof window !== 'undefined') {
  try {
    // Only attempt to load if you have Club GreenSock membership
    // Uncomment these if you have the premium plugins:
    // Draggable = require('gsap/Draggable').Draggable
    // Flip = require('gsap/Flip').Flip
    // MotionPathPlugin = require('gsap/MotionPathPlugin').MotionPathPlugin
    // Observer = require('gsap/Observer').Observer
    // gsap.registerPlugin(Draggable, Flip, MotionPathPlugin, Observer)
  } catch (e) {
    // Premium plugins not available - that's okay for MVP
  }
}

export { gsap, ScrollTrigger, TextPlugin }
export { InertiaPlugin }
export type { Draggable, Flip, MotionPathPlugin, Observer }

