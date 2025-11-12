/**
 * Catalyst Objects Component
 * De fluwelen doek met finale voorwerpen
 * Gebaseerd op StoryGeneratorPage transformation visie
 */

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { cn } from '../../lib/utils'

interface CatalystObjectsProps {
  onSelect: (object: { id: string; label: string; nl: string }) => void
  onCustomInput?: (text: string) => void
  selectedObject?: string
  className?: string
}

const objects = [
  { id: 'sword', label: 'Zwaard', emoji: '⚔️', nl: 'gouden zwaard' },
  { id: 'ball', label: 'Bal', emoji: '⚽', nl: 'magische bal' },
  { id: 'map', label: 'Kaart', emoji: '🗺️', nl: 'geheime kaart' },
  { id: 'key', label: 'Sleutel', emoji: '🔑', nl: 'mysterieuze sleutel' },
  { id: 'book', label: 'Boek', emoji: '📖', nl: 'oud boek' },
  { id: 'compass', label: 'Kompas', emoji: '🧭', nl: 'glimmend kompas' },
]

export function CatalystObjects({
  onSelect,
  onCustomInput,
  selectedObject,
  className = '',
}: CatalystObjectsProps) {
  const clothRef = useRef<HTMLDivElement>(null)
  const objectRefs = useRef<(HTMLDivElement | null)[]>([])
  const [customInput, setCustomInput] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    // Cloth unrolls animation
    if (clothRef.current) {
      gsap.from(clothRef.current, {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.3,
      })
    }

    // Objects appear with stagger
    objectRefs.current.forEach((obj, index) => {
      if (obj) {
        gsap.from(obj, {
          y: 50,
          opacity: 0,
          scale: 0.5,
          duration: 0.6,
          delay: 0.5 + index * 0.1,
          ease: 'back.out(1.7)',
        })
      }
    })
  }, [])

  const handleObjectClick = (object: typeof objects[0], index: number) => {
    const obj = objectRefs.current[index]
    if (!obj || !clothRef.current) return

    // Drag and drop animation
    const tl = gsap.timeline({
      onComplete: () => {
        onSelect(object)
        // Hide all objects
        objectRefs.current.forEach((o) => {
          if (o) {
            gsap.to(o, {
              opacity: 0,
              scale: 0,
              duration: 0.3,
            })
          }
        })
        // Roll up cloth
        gsap.to(clothRef.current, {
          scaleY: 0,
          duration: 0.5,
        })
      },
    })

    // Drop animation (falling into cauldron)
    tl.to(obj, {
      y: '50vh',
      rotation: 720,
      scale: 1.5,
      duration: 1,
      ease: 'power2.in',
    })

    // Splash effect
    tl.to(obj, {
      opacity: 0,
      scale: 0,
      duration: 0.3,
    })

    return tl
  }

  return (
    <div className={cn('absolute top-20 left-1/2 -translate-x-1/2 z-10', className)}>
      {/* Velvet cloth */}
      <div
        ref={clothRef}
        className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-lg p-6 shadow-2xl border-4 border-purple-700"
        style={{
          minWidth: '500px',
        }}
      >
        <h3 className="text-white font-bold text-xl mb-4 text-center">
          De Katalysator
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {objects.map((object, index) => (
            <div
              key={object.id}
              ref={(el) => {
                objectRefs.current[index] = el
              }}
              onClick={() => handleObjectClick(object, index)}
              className={cn(
                'relative w-24 h-24 bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 rounded-lg shadow-lg cursor-pointer transition-all flex items-center justify-center hover:scale-110',
                selectedObject === object.id && 'ring-4 ring-yellow-400 scale-110'
              )}
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/icon_star2-removebg-preview.png" alt={object.label} className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center">
                <p className="text-xs text-white font-medium whitespace-nowrap">
                  {object.label}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Custom Input Field */}
        <div className="mt-4">
          <button
            onClick={() => setShowInput(!showInput)}
            className="w-full px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-bold hover:from-yellow-700 hover:to-orange-700 transition-all"
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
                placeholder="Typ je eigen voorwerp..."
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-yellow-400 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400"
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
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg font-bold hover:from-orange-700 hover:to-yellow-700 transition-all"
                >
                  ✓ Gebruik dit voorwerp
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

