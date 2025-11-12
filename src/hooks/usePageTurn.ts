/**
 * usePageTurn Hook
 * GSAP 3D page turn animation
 * Gebaseerd op rich_story_app_vision.md
 */

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface UsePageTurnOptions {
  direction?: 'left' | 'right'
  duration?: number
  onComplete?: () => void
}

export function usePageTurn(
  pageRef: React.RefObject<HTMLElement>,
  options: UsePageTurnOptions = {}
) {
  const { direction = 'right', duration = 1.2, onComplete } = options
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const turnPage = () => {
    if (!pageRef.current) return

    // Cleanup previous animation
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    // Set transform origin based on direction
    const transformOrigin = direction === 'right' ? 'left center' : 'right center'
    gsap.set(pageRef.current, { transformOrigin })

    // Create timeline
    const tl = gsap.timeline({
      onComplete,
    })

    // 3D page turn effect
    tl.to(pageRef.current, {
      rotationY: direction === 'right' ? -180 : 180,
      duration,
      ease: 'power2.inOut',
    })

    // Add subtle shadow during turn
    tl.to(
      pageRef.current,
      {
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        duration: duration * 0.5,
      },
      '<'
    )

    // Remove shadow
    tl.to(
      pageRef.current,
      {
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        duration: duration * 0.5,
      },
      '>-0.5'
    )

    timelineRef.current = tl

    return tl
  }

  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [])

  return { turnPage }
}

