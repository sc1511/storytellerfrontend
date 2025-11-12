/**
 * World Herbs Drawer Component
 * De oude houten lade met wereld-kruiden voor setting selectie
 * Gebaseerd op StoryGeneratorPage transformation visie
 */

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { cn } from '../../lib/utils'

interface WorldHerbsDrawerProps {
  onSelect: (setting: { id: string; label: string; nl: string }) => void
  onCustomInput?: (text: string) => void
  onCustomWorld: () => void
  selectedSetting?: string
  className?: string
}

const settings = [
  { id: 'castle', label: 'Kasteel', emoji: '🏰', nl: 'magisch kasteel', herb: 'mini-castle' },
  { id: 'forest', label: 'Bos', emoji: '🌲', nl: 'betoverd bos', herb: 'pinecone' },
  { id: 'space', label: 'Ruimte', emoji: '🌌', nl: 'verre ruimte', herb: 'moonstone' },
  { id: 'ocean', label: 'Oceaan', emoji: '🌊', nl: 'diepe oceaan', herb: 'shell' },
  { id: 'mountain', label: 'Berg', emoji: '⛰️', nl: 'hoge berg', herb: 'crystal' },
  { id: 'city', label: 'Stad', emoji: '🏙️', nl: 'drukke stad', herb: 'gem' },
]

export function WorldHerbsDrawer({
  onSelect,
  onCustomInput,
  onCustomWorld,
  selectedSetting,
  className = '',
}: WorldHerbsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const drawerContentRef = useRef<HTMLDivElement>(null)
  const herbRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    // Drawer entrance
    if (drawerRef.current) {
      gsap.from(drawerRef.current, {
        x: 200,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      })
    }
  }, [])

  const handleOpen = () => {
    if (!isOpen && drawerContentRef.current) {
      setIsOpen(true)
      gsap.to(drawerContentRef.current, {
        x: -150,
        duration: 0.6,
        ease: 'power2.out',
      })

      // Stagger herb animations
      herbRefs.current.forEach((herb, index) => {
        if (herb) {
          gsap.from(herb, {
            y: 20,
            opacity: 0,
            scale: 0.8,
            duration: 0.4,
            delay: index * 0.1,
            ease: 'back.out(1.7)',
          })
        }
      })
    }
  }

  const handleHerbClick = (setting: typeof settings[0], index: number) => {
    const herb = herbRefs.current[index]
    if (!herb || !drawerRef.current) return

    // Animate herb floating to cauldron
    const tl = gsap.timeline({
      onComplete: () => {
        onSelect(setting)
        // Hide all herbs
        herbRefs.current.forEach((h) => {
          if (h) {
            gsap.to(h, {
              opacity: 0,
              scale: 0,
              duration: 0.3,
            })
          }
        })
        // Close drawer
        if (drawerContentRef.current) {
          gsap.to(drawerContentRef.current, {
            x: 0,
            duration: 0.5,
          })
        }
        setIsOpen(false)
      },
    })

    // Float to center
    tl.to(herb, {
      x: '-50vw',
      y: '-50vh',
      rotation: 360,
      scale: 1.5,
      duration: 1,
      ease: 'power2.inOut',
    })

    // Dissolve effect
    tl.to(herb, {
      opacity: 0,
      scale: 0,
      duration: 0.5,
    })

    // Add particles (green leaves for forest, etc.)
    const particles = document.createElement('div')
    particles.className = 'absolute w-2 h-2 bg-green-400 rounded-full'
    particles.style.left = '50%'
    particles.style.top = '50%'
    document.body.appendChild(particles)

    gsap.to(particles, {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      opacity: 0,
      scale: 0,
      duration: 1,
      onComplete: () => particles.remove(),
    })

    return tl
  }

  return (
    <div
      ref={drawerRef}
      className={cn('absolute right-8 top-1/2 -translate-y-1/2 z-10', className)}
    >
      {/* Drawer handle */}
      <button
        onClick={handleOpen}
        className="mb-4 w-12 h-12 bg-amber-800 rounded-lg shadow-lg flex items-center justify-center text-white text-xl hover:bg-amber-700 transition-all"
      >
        {isOpen ? '→' : '←'}
      </button>

      {/* Drawer */}
      <div className="relative w-40 h-96 bg-gradient-to-br from-amber-900 via-amber-950 to-amber-900 rounded-lg shadow-2xl border-4 border-amber-800 overflow-hidden">
        {/* Drawer content */}
        <div
          ref={drawerContentRef}
          className="absolute inset-0 p-4"
          style={{ transform: 'translateX(100%)' }}
        >
          <h3 className="text-white font-bold text-lg mb-4 text-center">
            Wereld-Kruiden
          </h3>
          <div className="space-y-3">
            {settings.map((setting, index) => (
              <div
                key={setting.id}
                ref={(el) => {
                  herbRefs.current[index] = el
                }}
                onClick={() => handleHerbClick(setting, index)}
                className={cn(
                  'relative w-full h-16 bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-lg shadow-lg cursor-pointer transition-all flex items-center justify-center',
                  selectedSetting === setting.id
                    ? 'ring-4 ring-green-400 scale-110'
                    : 'hover:scale-105'
                )}
              >
                <div className="text-3xl">{setting.emoji}</div>
                <div className="absolute bottom-1 left-1 right-1 text-center">
                  <p className="text-xs text-white font-medium">{setting.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Input Field */}
      <div className="mt-4">
        <button
          onClick={() => setShowInput(!showInput)}
          className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-teal-700 transition-all"
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
              placeholder="Typ je eigen plaats..."
              className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-green-400 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400"
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
                className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-lg font-bold hover:from-teal-700 hover:to-green-700 transition-all"
              >
                ✓ Gebruik deze plaats
              </button>
            )}
          </div>
        )}
      </div>

      {/* Imagination Crystal */}
      <button
        onClick={onCustomWorld}
        className="mt-4 w-full px-4 py-3 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-lg shadow-lg text-white font-bold text-sm hover:scale-105 transition-all relative overflow-hidden"
        style={{
          boxShadow: '0 0 20px rgba(147, 51, 234, 0.6)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          <img src="/icon_star_alone-removebg-preview.png" alt="" className="w-5 h-5 object-contain" />
          Verbeeldingskristal
          <img src="/icon_star_alone-removebg-preview.png" alt="" className="w-5 h-5 object-contain" />
        </span>
      </button>
    </div>
  )
}

