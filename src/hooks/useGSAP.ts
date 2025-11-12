import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * Custom React Hook voor GSAP animations
 * Maakt het makkelijker om GSAP te gebruiken in React componenten
 */

export function useGSAP() {
  const scopeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scopeRef.current) return

    // Set context voor GSAP (auto cleanup)
    const ctx = gsap.context(() => {
      // GSAP context is ready
    }, scopeRef)

    // Cleanup
    return () => ctx.revert()
  }, [])

  return scopeRef
}

/**
 * Hook voor animaties op mount
 */
export function useGSAPAnimation(
  animationFn: (element: HTMLElement) => void | gsap.core.Tween | gsap.core.Timeline,
  deps: React.DependencyList = []
) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const animation = animationFn(elementRef.current)

    return () => {
      if (animation && typeof animation === 'object' && 'kill' in animation) {
        (animation as gsap.core.Tween | gsap.core.Timeline).kill()
      }
    }
  }, deps)

  return elementRef as React.RefObject<HTMLElement>
}

/**
 * Hook voor scroll-triggered animations
 * (gebruikt ScrollTrigger plugin indien geïnstalleerd)
 */
export function useScrollAnimation() {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    // Basic scroll animation (zonder ScrollTrigger plugin)
    const handleScroll = () => {
      const element = elementRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0

      if (isVisible) {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        })
      }
    }

    // Initial state
    gsap.set(elementRef.current, {
      opacity: 0,
      y: 50,
    })

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return elementRef
}

