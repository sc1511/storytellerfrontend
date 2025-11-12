/**
 * Magical Creation Component
 * De finale animatie wanneer het verhaal wordt gecreëerd
 * Gebaseerd op StoryGeneratorPage transformation visie
 */

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

interface MagicalCreationProps {
  onComplete: () => void
  className?: string
}

export function MagicalCreation({ onComplete, className = '' }: MagicalCreationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const vortexRef = useRef<HTMLDivElement>(null)
  const smokeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !vortexRef.current || !smokeRef.current) return

    const tl = gsap.timeline({
      onComplete,
    })

    // PLOP sound effect (visual)
    tl.to(containerRef.current, {
      scale: 1.1,
      duration: 0.2,
      ease: 'power2.out',
    })

    // Flash
    tl.to(containerRef.current, {
      backgroundColor: '#ffffff',
      duration: 0.1,
    })

    // Smoke fills screen
    tl.to(smokeRef.current, {
      opacity: 1,
      scale: 3,
      duration: 1,
      ease: 'power2.out',
    })

    // Vortex appears
    tl.to(vortexRef.current, {
      opacity: 1,
      scale: 1,
      rotation: 360,
      duration: 1.5,
      ease: 'power2.inOut',
    }, '-=0.5')

    // Smoke dissolves
    tl.to(smokeRef.current, {
      opacity: 0,
      duration: 1,
    }, '-=0.5')

    // Vortex continues spinning
    gsap.to(vortexRef.current, {
      rotation: '+=360',
      duration: 2,
      repeat: -1,
      ease: 'none',
    })

    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 flex items-center justify-center ${className}`}
    >
      {/* Smoke */}
      <div
        ref={smokeRef}
        className="absolute inset-0 bg-gradient-radial from-white/80 via-white/40 to-transparent opacity-0"
        style={{
          transform: 'scale(0)',
        }}
      />

      {/* Vortex */}
      <div
        ref={vortexRef}
        className="relative w-64 h-64 opacity-0"
        style={{
          transform: 'scale(0)',
        }}
      >
        <div className="absolute inset-0 rounded-full border-8 border-white/30" />
        <div className="absolute inset-4 rounded-full border-8 border-white/20" />
        <div className="absolute inset-8 rounded-full border-8 border-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl">🌀</div>
        </div>
      </div>
    </div>
  )
}

