/**
 * Story Cauldron Component
 * De centrale toverketel waar ingrediënten in worden toegevoegd
 * Gebaseerd op StoryGeneratorPage transformation visie
 */

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'

interface StoryCauldronProps {
  character?: string
  setting?: string
  object?: string
  isCreating?: boolean
  className?: string
}

export function StoryCauldron({
  character,
  setting,
  object,
  isCreating = false,
  className = '',
}: StoryCauldronProps) {
  const cauldronRef = useRef<HTMLDivElement>(null)
  const liquidRef = useRef<HTMLDivElement>(null)
  const steamRef = useRef<HTMLDivElement>(null)
  const [liquidColor, setLiquidColor] = useState('#4a90e2') // Default blue

  useEffect(() => {
    // Update liquid color based on ingredients
    let color = '#4a90e2' // Default blue

    if (character) {
      // Character colors
      if (character.includes('ridder') || character.includes('knight')) color = '#c0c0c0' // Silver
      if (character.includes('kat') || character.includes('cat')) color = '#ff6b9d' // Pink
      if (character.includes('astronaut')) color = '#87ceeb' // Sky blue
      if (character.includes('piraat') || character.includes('pirate')) color = '#D4A574' // Warme karamel - moderner en kindvriendelijker
      if (character.includes('tovenaar') || character.includes('wizard')) color = '#9370db' // Purple
      if (character.includes('draak') || character.includes('dragon')) color = '#ff4500' // Orange-red
    }

    if (setting) {
      // Blend setting colors
      if (setting.includes('kasteel') || setting.includes('castle')) color = mixColor(color, '#d4af37') // Gold
      if (setting.includes('bos') || setting.includes('forest')) color = mixColor(color, '#228b22') // Green
      if (setting.includes('ruimte') || setting.includes('space')) color = mixColor(color, '#191970') // Midnight blue
      if (setting.includes('oceaan') || setting.includes('ocean')) color = mixColor(color, '#1e90ff') // Dodger blue
      if (setting.includes('berg') || setting.includes('mountain')) color = mixColor(color, '#808080') // Gray
      if (setting.includes('stad') || setting.includes('city')) color = mixColor(color, '#ffd700') // Gold
    }

    if (object) {
      // Add object sparkle
      color = addSparkle(color)
    }

    setLiquidColor(color)

    // Animate liquid change
    if (liquidRef.current) {
      gsap.to(liquidRef.current, {
        backgroundColor: color,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    }
  }, [character, setting, object])

  // Bubbling animation when creating
  useEffect(() => {
    if (isCreating && cauldronRef.current) {
      // Create bubbles
      const bubbles = []
      for (let i = 0; i < 20; i++) {
        const bubble = document.createElement('div')
        bubble.className = 'absolute w-4 h-4 bg-white/30 rounded-full'
        bubble.style.left = `${Math.random() * 100}%`
        bubble.style.bottom = '20%'
        cauldronRef.current.appendChild(bubble)
        bubbles.push(bubble)

        gsap.to(bubble, {
          y: -200,
          x: `+=${(Math.random() - 0.5) * 50}`,
          opacity: 0,
          scale: 0,
          duration: Math.random() * 2 + 1,
          repeat: -1,
          delay: Math.random() * 2,
          ease: 'power1.out',
        })
      }

      // Shake animation
      gsap.to(cauldronRef.current, {
        rotation: 2,
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      })

      // Steam animation
      if (steamRef.current) {
        gsap.to(steamRef.current, {
          opacity: 0.8,
          scale: 1.2,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      return () => {
        bubbles.forEach((bubble) => bubble.remove())
        gsap.killTweensOf(cauldronRef.current)
      }
    }
  }, [isCreating])

  // Helper functions
  const mixColor = (color1: string, color2: string): string => {
    // Simple color mixing (in production, use a proper color library)
    return color2 // For now, just use the new color
  }

  const addSparkle = (color: string): string => {
    // Add brightness to simulate sparkle
    return color
  }

  return (
    <div
      ref={cauldronRef}
      className={`relative w-64 h-64 md:w-80 md:h-80 ${className}`}
    >
      {/* Cauldron base */}
      <div className="absolute inset-0 flex items-end justify-center">
        <div className="relative w-3/4 h-3/4">
          {/* Cauldron body */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-full shadow-2xl">
            {/* Cauldron rim */}
            <div className="absolute -top-2 left-0 right-0 h-8 bg-gray-700 rounded-full border-4 border-gray-600" />
            
            {/* Liquid */}
            <div
              ref={liquidRef}
              className="absolute bottom-0 left-0 right-0 h-3/4 rounded-full opacity-80"
              style={{
                backgroundColor: liquidColor,
                boxShadow: `0 0 40px ${liquidColor}, inset 0 0 60px rgba(0, 0, 0, 0.3)`,
              }}
            >
              {/* Liquid glow */}
              <div
                className="absolute inset-0 rounded-full opacity-50"
                style={{
                  background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 70%)`,
                }}
              />
            </div>

            {/* Steam */}
            {isCreating && (
              <div
                ref={steamRef}
                className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/20 rounded-full blur-3xl"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

