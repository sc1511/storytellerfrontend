/**
 * Character Essence Jars Component
 * De plank met essentie-potjes voor karakter selectie
 * Gebaseerd op StoryGeneratorPage transformation visie
 */

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { cn } from '../../lib/utils'
import { useInertiaHover } from '../../hooks/useInertiaHover'

interface CharacterEssenceJarsProps {
  onSelect: (character: { id: string; label: string; nl: string }) => void
  onCustomInput?: (text: string) => void
  selectedCharacter?: string
  className?: string
}

const characters = [
  { id: 'knight', label: 'Ridder', emoji: '🛡️', nl: 'dappere ridder', essence: 'sand' },
  { id: 'cat', label: 'Kat', emoji: '🐱', nl: 'magische kat', essence: 'sparkle' },
  { id: 'astronaut', label: 'Astronaut', emoji: '🚀', nl: 'avontuurlijke astronaut', essence: 'star' },
  { id: 'pirate', label: 'Piraat', emoji: '🏴‍☠️', nl: 'stoere piraat', essence: 'wind' },
  { id: 'wizard', label: 'Tovenaar', emoji: '🧙', nl: 'wijze tovenaar', essence: 'magic' },
  { id: 'dragon', label: 'Draak', emoji: '🐉', nl: 'vriendelijke draak', essence: 'fire' },
]

export function CharacterEssenceJars({
  onSelect,
  onCustomInput,
  selectedCharacter,
  className = '',
}: CharacterEssenceJarsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const jarRefs = useRef<(HTMLDivElement | null)[]>([])
  const [customInput, setCustomInput] = useState('')
  const [showInput, setShowInput] = useState(false)

  // Register InertiaPlugin
  useEffect(() => {
    gsap.registerPlugin(InertiaPlugin)
  }, [])

  // Apply inertia hover effect
  useInertiaHover(containerRef)

  useEffect(() => {
    // Entrance animation
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        x: -200,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      })
    }

    // Stagger jar animations
    jarRefs.current.forEach((jar, index) => {
      if (jar) {
        gsap.from(jar, {
          y: 50,
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          delay: index * 0.1,
          ease: 'back.out(1.7)',
        })
      }
    })
  }, [])

  const handleJarClick = (character: typeof characters[0], index: number) => {
    const jar = jarRefs.current[index]
    if (!jar || !containerRef.current) return

    // Animate jar flying to center (cauldron position)
    const tl = gsap.timeline({
      onComplete: () => {
        onSelect(character)
        // Hide all jars
        jarRefs.current.forEach((j) => {
          if (j) {
            gsap.to(j, {
              opacity: 0,
              scale: 0,
              duration: 0.3,
            })
          }
        })
        // Hide container
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            x: -200,
            duration: 0.5,
          })
        }
      },
    })

    // Fly to center
    tl.to(jar, {
      x: '50vw',
      y: '-50vh',
      rotation: 180,
      scale: 1.2,
      duration: 1,
      ease: 'power2.inOut',
    })

    // Tilt and pour
    tl.to(jar, {
      rotation: 270,
      duration: 0.5,
      ease: 'power2.in',
    })

    // Essence pours out (visual effect)
    const essence = document.createElement('div')
    essence.className = 'absolute w-8 h-32 bg-gradient-to-b from-transparent to-yellow-400 rounded-full opacity-70'
    essence.style.left = '50%'
    essence.style.top = '50%'
    jar.appendChild(essence)

    tl.to(essence, {
      height: 200,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    })

    return tl
  }

  return (
    <div
      ref={containerRef}
      className={cn('absolute left-8 top-1/2 -translate-y-1/2 z-10', className)}
    >
      {/* Shelf */}
      <div className="bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 rounded-lg p-4 shadow-2xl mb-4">
        <h3 className="text-white font-bold text-lg mb-4 text-center">
          Essentie van de Held
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {characters.map((character, index) => (
            <div
              key={character.id}
              ref={(el) => {
                jarRefs.current[index] = el
              }}
              onClick={() => handleJarClick(character, index)}
              data-inertia-hover
              className={cn(
                'relative w-20 h-24 cursor-pointer transition-all',
                selectedCharacter === character.id
                  ? 'scale-110 ring-4 ring-yellow-400'
                  : 'hover:scale-105'
              )}
              style={{ willChange: 'transform' }}
            >
              {/* Jar */}
              <div data-inertia-target className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg shadow-lg border-2 border-blue-300">
                {/* Jar neck */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-4 bg-blue-500 rounded-t-lg border-2 border-blue-400" />
                
                {/* Essence animation */}
                <div className="absolute inset-2 overflow-hidden rounded-lg">
                  {character.essence === 'sand' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-400 animate-pulse" />
                  )}
                  {character.essence === 'star' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src="/icon_star2-removebg-preview.png" alt="Star" className="w-8 h-8 object-contain" />
                      </div>
                    </div>
                  )}
                  {character.essence === 'sparkle' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-pink-200 via-pink-300 to-pink-400 animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src="/icon_star_alone-removebg-preview.png" alt="Sparkle" className="w-6 h-6 object-contain" />
                      </div>
                    </div>
                  )}
                  {character.essence === 'wind' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src="/icon_star_moon-removebg-preview.png" alt="Wind" className="w-6 h-6 object-contain" />
                      </div>
                    </div>
                  )}
                  {character.essence === 'magic' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-200 via-purple-300 to-purple-400 animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src="/icon_star_alone-removebg-preview.png" alt="Magic" className="w-6 h-6 object-contain" />
                      </div>
                    </div>
                  )}
                  {character.essence === 'fire' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-200 via-red-300 to-orange-400 animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src="/icon_star2-removebg-preview.png" alt="Fire" className="w-6 h-6 object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center">
                <div className="text-2xl mb-1">{character.emoji}</div>
                <p className="text-xs text-white font-medium whitespace-nowrap">
                  {character.label}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Custom Input Field */}
        <div className="mt-4">
          <button
            onClick={() => setShowInput(!showInput)}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            {showInput ? '✕ Sluiten' : '✏️ Of typ zelf...'}
          </button>
          
          {showInput && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && customInput.trim() && onCustomInput) {
                    onCustomInput(customInput.trim())
                    setCustomInput('')
                    setShowInput(false)
                  }
                }}
                placeholder="Typ je eigen karakter..."
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-purple-400 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400"
                style={{
                  color: '#ffffff',
                }}
                autoFocus
              />
              {customInput.trim() && (
                <button
                  onClick={() => {
                    if (onCustomInput) {
                      onCustomInput(customInput.trim())
                      setCustomInput('')
                      setShowInput(false)
                    }
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-bold hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  ✓ Gebruik dit karakter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

