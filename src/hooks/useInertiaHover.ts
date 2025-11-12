/**
 * useInertiaHover Hook
 * Implements Made With GSAP Inertia Plugin hover effect
 * Based on: https://madewithgsap.com/effects/tutorial000
 * Falls back to regular GSAP animations if InertiaPlugin is not available
 */

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// Try to import InertiaPlugin, but don't fail if it doesn't exist
let InertiaPlugin: any
try {
  InertiaPlugin = require('gsap/InertiaPlugin').InertiaPlugin
} catch (e) {
  // InertiaPlugin not available - use fallback
  InertiaPlugin = null
}

export function useInertiaHover(containerRef: React.RefObject<HTMLElement>) {
  const oldXRef = useRef(0)
  const oldYRef = useRef(0)
  const deltaXRef = useRef(0)
  const deltaYRef = useRef(0)
  const mouseXRef = useRef(0)
  const mouseYRef = useRef(0)

  useEffect(() => {
    if (!containerRef.current) return

    const root = containerRef.current

    // Try to register InertiaPlugin if available
    if (InertiaPlugin) {
      try {
        gsap.registerPlugin(InertiaPlugin)
      } catch (e) {
        console.warn('InertiaPlugin registration failed:', e)
      }
    }

    // Track mouse movement delta
    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX
      mouseYRef.current = e.clientY
      
      deltaXRef.current = e.clientX - oldXRef.current
      deltaYRef.current = e.clientY - oldYRef.current

      oldXRef.current = e.clientX
      oldYRef.current = e.clientY
    }

    root.addEventListener('mousemove', handleMouseMove)

    // Apply hover effect to all hoverable items
    const hoverableItems = root.querySelectorAll('[data-inertia-hover]')
    
    hoverableItems.forEach((el) => {
      const element = el as HTMLElement
      const target = (element.querySelector('[data-inertia-target]') || element) as HTMLElement

      // Mouse enter handler
      const handleMouseEnter = () => {
        // Reset transform
        gsap.set(target, { x: 0, y: 0, rotate: 0 })
        
        const tl = gsap.timeline({
          onComplete: () => {
            tl.kill()
          },
        })
        
        // Calculate movement based on mouse position relative to element
        const rect = element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const offsetX = (mouseXRef.current - centerX) / rect.width
        const offsetY = (mouseYRef.current - centerY) / rect.height

        if (InertiaPlugin) {
          // Use InertiaPlugin if available
          tl.to(target, {
            inertia: {
              x: {
                velocity: deltaXRef.current * 40,
                end: 0,
              },
              y: {
                velocity: deltaYRef.current * 40,
                end: 0,
              },
            },
          })
        } else {
          // Fallback: Use regular GSAP animation with calculated offset - VEEL GROTER!
          tl.to(target, {
            x: offsetX * 50, // VEEL meer beweging!
            y: offsetY * 50 - 20, // Omhoog + muis beweging
            scale: 1.3, // Nog groter!
            duration: 0.4,
            ease: 'back.out(1.7)', // Bounce effect
          })
          tl.to(target, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
          }, '-=0.2')
        }

        // Random rotation for extra life - GROTER!
        tl.fromTo(
          target,
          {
            rotate: 0,
          },
          {
            duration: 0.5,
            rotate: (Math.random() - 0.5) * 20, // -10 to 10 degrees
            yoyo: true,
            repeat: 1,
            ease: 'elastic.out(1, 0.5)', // Meer bounce!
          },
          '<'
        )
      }

      element.addEventListener('mouseenter', handleMouseEnter)
      
      // Cleanup on mouse leave - return to center
      const handleMouseLeave = () => {
        gsap.to(target, {
          x: 0,
          y: 0,
          rotate: 0,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
      
      element.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      root.removeEventListener('mousemove', handleMouseMove)
      hoverableItems.forEach((el) => {
        const element = el as HTMLElement
        const target = element.querySelector('[data-inertia-target]') || element
        gsap.killTweensOf(target)
      })
    }
  }, [containerRef])
}

