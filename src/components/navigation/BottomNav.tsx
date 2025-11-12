import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { cn } from '../../lib/utils'
import { NeonIconButton } from '../ui/NeonIconButton'

// K-pop Color Palette
const KPOP_COLORS = {
  pastelPink: '#FFB6C1',
  mintGreen: '#B2EBF2',
  skyBlue: '#87CEEB',
  warmPeach: '#FFDAB9',
  ivory: '#FFFAF0',
  warmBeige: '#F5DEB3',
  softCoral: '#FF9999',
  lightPeach: '#FFE4B5',
}

// Definieer de navigatie-items met icon images
const navItems = [
  { path: '/library', label: 'Bibliotheek', icon: '/icon_star2-removebg-preview.png' },
  { path: '/profile', label: 'Profiel', icon: '/icon_star_alone-removebg-preview.png' },
  { path: '/settings', label: 'Instellingen', icon: '/icon_settings-removebg-preview.png' },
]

export default function BottomNav() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const amuletRef = useRef<HTMLDivElement>(null)

  // --- De Magie: GSAP voor de radiale animatie ---
  useEffect(() => {
    if (!amuletRef.current) return

    const icons = gsap.utils.toArray<HTMLElement>('.nav-icon', amuletRef.current)
    const tl = gsap.timeline({ paused: true, reversed: true })
    const radius = 100 // De grootte van de boog

    // De animatie die de iconen in een boog uitspreidt
    icons.forEach((icon, i) => {
      const angle = -180 + (180 / (icons.length - 1)) * i // Verdeel over een halve cirkel
      const x = radius * Math.cos((angle * Math.PI) / 180)
      const y = radius * Math.sin((angle * Math.PI) / 180)

      tl.to(
        icon,
        {
          duration: 0.5,
          autoAlpha: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0,
          x: isOpen ? x : 0,
          y: isOpen ? y : 0,
          ease: 'back.out(1.7)',
        },
        i * 0.07
      )
    })

    if (isOpen) {
      tl.play()
    } else {
      tl.reverse()
    }

    return () => {
      tl.kill()
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav
      ref={amuletRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      {/* De andere navigatie-items, initieel onzichtbaar en in het midden - icon zelf is de button */}
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={cn(
              'nav-icon absolute top-0 left-0 w-16 h-16 flex items-center justify-center',
              'transition-all duration-300',
              'opacity-0 scale-0', // Start onzichtbaar
            )}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
          >
            <img
              src={item.icon}
              alt={item.label}
              className="w-full h-full object-contain"
              style={{
                filter: isActive 
                  ? 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))' 
                  : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                opacity: isActive ? 1 : 0.8,
              }}
            />
          </Link>
        )
      })}

      {/* Home button verwijderd - niet nodig in dit project */}
    </nav>
  )
}
