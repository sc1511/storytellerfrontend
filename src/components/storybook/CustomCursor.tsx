/**
 * CustomCursor Component
 * Speelse, geanimeerde cursor die reageert op interacties
 * Gebaseerd op rich_story_app_vision.md
 */

import { useEffect, useState, useRef } from 'react'
import { useMousePosition } from '../../hooks/useMousePosition'
import { gsap } from 'gsap'
import { cn } from '../../lib/utils'

interface CustomCursorProps {
  enabled?: boolean
  variant?: 'default' | 'pointer' | 'text' | 'grab'
}

export function CustomCursor({ enabled = true, variant = 'default' }: CustomCursorProps) {
  const { x, y } = useMousePosition()
  const [currentVariant, setCurrentVariant] = useState(variant)
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<HTMLDivElement[]>([])

  // Update cursor position
  useEffect(() => {
    if (!enabled || !cursorRef.current) return

    gsap.to(cursorRef.current, {
      x,
      y,
      duration: 0.3,
      ease: 'power2.out',
    })

    // Trail effect (3 dots)
    trailRefs.current.forEach((trail, index) => {
      gsap.to(trail, {
        x,
        y,
        duration: 0.2 + index * 0.1,
        delay: index * 0.05,
        ease: 'power2.out',
      })
    })
  }, [x, y, enabled])

  // Update variant based on hover
  useEffect(() => {
    if (!enabled) return

    const updateCursor = () => {
      const hovered = document.querySelector(':hover')
      
      if (hovered?.matches('button, a, [role="button"]')) {
        setCurrentVariant('pointer')
      } else if (hovered?.matches('input, textarea')) {
        setCurrentVariant('text')
      } else if (hovered?.matches('[draggable="true"]')) {
        setCurrentVariant('grab')
      } else {
        setCurrentVariant('default')
      }
    }

    document.addEventListener('mouseover', updateCursor)
    return () => document.removeEventListener('mouseover', updateCursor)
  }, [enabled])

  // Cursor variants
  const cursorVariants = {
    default: 'w-6 h-6 border-2 border-primary rounded-full',
    pointer: 'w-8 h-8 border-2 border-primary scale-150',
    text: 'w-1 h-6 bg-primary',
    grab: 'w-6 h-6 border-2 border-accent rounded-full',
  }

  if (!enabled) return null

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={cn(
          'fixed pointer-events-none z-50',
          'transform -translate-x-1/2 -translate-y-1/2',
          cursorVariants[currentVariant]
        )}
        style={{
          left: x,
          top: y,
        }}
      />

      {/* Trail effect */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) trailRefs.current[i] = el
          }}
          className={cn(
            'fixed pointer-events-none z-40',
            'w-2 h-2 bg-primary/30 rounded-full',
            'transform -translate-x-1/2 -translate-y-1/2'
          )}
          style={{
            left: x,
            top: y,
          }}
        />
      ))}
    </>
  )
}

