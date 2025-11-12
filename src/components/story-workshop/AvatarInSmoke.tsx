/**
 * AvatarInSmoke Component
 * Toont de avatar in een rook effect, klikbaar met contextuele teksten
 */

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { AvatarVideo } from '../avatar/AvatarVideo'
import type { AvatarCustomization } from '../../types'

// K-pop Dark Neon Color Palette
const KPOP_COLORS = {
  neonPink: '#FF10F0',
  neonBlue: '#00F0FF',
  neonPurple: '#B026FF',
  neonCyan: '#00FFFF',
  neonMagenta: '#FF00FF',
  darkBg: '#0a0a1a',
  darkBgSecondary: '#1a1a2e',
  darkBgTertiary: '#16213e',
}

// Avatar messages per stap - roteert bij elke klik
const AVATAR_MESSAGES = {
  'start': [
    "Tijd om iets episch te maken!",
    "Klik mij en laten we beginnen.",
    "We gaan verhalen bouwen, klaar?",
    "Jij typt, ik cheer!",
    "Oké… de show start nu!",
  ],
  'character': [
    "Wie wordt de ster van dit avontuur?",
    "Eén hoofdrol, zoveel mogelijkheden!",
    "Kies slim… of kies grappig, werkt ook.",
    "Main character, jouw keuze, jouw stijl.",
    "Jij regisseert. Wie staat in de spotlight?",
  ],
  'setting': [
    "Waar gebeurt dit verhaal?",
    "Stad, bos, ruimte… jij beslist!",
    "De plek maakt de vibe. Kies!",
    "Elke plek is een avontuur. Klik één.",
    "Oké, showtime… waar gaan we heen?",
  ],
  'object': [
    "Wat hoort erbij?",
    "Elk verhaal heeft iets bijzonders. Kies!",
    "Een voorwerp, een plot twist, wat wordt het?",
    "Zonder item geen chaos. Typ of klik!",
    "Kies iets cools. Echt, ik hou ervan.",
  ],
  'creation': [
    "Alles klaar? Genereren maar!",
    "Let's gooo… woorden incoming!",
    "De fantasie-machine start nu!",
    "Hou je vast, dit wordt geweldig.",
    "Klik en zie magie gebeuren!",
  ],
}

interface AvatarInSmokeProps {
  customization: AvatarCustomization | null | undefined
  currentStep: 'character' | 'setting' | 'custom-world' | 'object' | 'creation' | 'loading'
}

export function AvatarInSmoke({ customization, currentStep }: AvatarInSmokeProps) {
  const [showMessage, setShowMessage] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const smokeRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)

  // Bepaal welke messages te tonen op basis van currentStep
  const getMessagesForStep = () => {
    if (currentStep === 'character') return AVATAR_MESSAGES.character
    if (currentStep === 'setting' || currentStep === 'custom-world') return AVATAR_MESSAGES.setting
    if (currentStep === 'object') return AVATAR_MESSAGES.object
    if (currentStep === 'creation' || currentStep === 'loading') return AVATAR_MESSAGES.creation
    return AVATAR_MESSAGES.start
  }

  // Animate smoke effect
  useEffect(() => {
    if (smokeRef.current) {
      const smokeParticles = smokeRef.current.querySelectorAll('.smoke-particle')
      smokeParticles.forEach((particle, i) => {
        gsap.to(particle, {
          y: `random(-100, -200)`,
          x: `random(-50, 50)`,
          opacity: `random(0.3, 0.7)`,
          scale: `random(1, 1.5)`,
          duration: `random(3, 6)`,
          repeat: -1,
          ease: 'sine.inOut',
          delay: i * 0.2,
        })
      })
    }
  }, [])

  // Animate message when it appears
  useEffect(() => {
    if (showMessage && messageRef.current) {
      gsap.fromTo(messageRef.current, 
        { 
          opacity: 0, 
          scale: 0.8,
          y: 20
        },
        { 
          opacity: 1, 
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: 'back.out(1.7)'
        }
      )

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        if (messageRef.current) {
          gsap.to(messageRef.current, {
            opacity: 0,
            scale: 0.8,
            y: -20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => setShowMessage(false)
          });
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showMessage, currentMessageIndex, currentStep])

  const handleAvatarClick = () => {
    const messages = getMessagesForStep()
    if (showMessage && messageRef.current) {
      // Als bericht al zichtbaar is, verberg het eerst en toon dan volgende
      gsap.to(messageRef.current, {
        opacity: 0,
        scale: 0.8,
        y: -20,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          const nextIndex = (currentMessageIndex + 1) % messages.length
          setCurrentMessageIndex(nextIndex)
          setShowMessage(true)
        }
      });
    } else {
      // Eerste keer klikken - toon eerste bericht
      const nextIndex = (currentMessageIndex + 1) % messages.length
      setCurrentMessageIndex(nextIndex)
      setShowMessage(true)
    }
  }

  if (!customization) return null

  const messages = getMessagesForStep()

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-8 right-8 z-30"
      style={{ zIndex: 30 }}
    >
      {/* Avatar in smoke - Klikbaar */}
      <button
        onClick={handleAvatarClick}
        className="relative w-32 h-32 md:w-40 md:h-40 cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 group"
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
        title="Klik voor een bericht!"
      >
        {/* Smoke effect */}
        <div 
          ref={smokeRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            filter: 'blur(8px)',
            opacity: 0.6,
          }}
        >
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="smoke-particle absolute rounded-full"
              style={{
                left: `${20 + (i % 5) * 20}%`,
                bottom: `${10 + Math.floor(i / 5) * 15}%`,
                width: `${20 + Math.random() * 30}px`,
                height: `${20 + Math.random() * 30}px`,
                background: `radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(200, 200, 200, 0.2) 50%, transparent 100%)`,
              }}
            />
          ))}
        </div>

        {/* Avatar */}
        <div
          ref={avatarRef}
          className={`relative z-10 w-full h-full ${customization?.avatarId === 'stitch' ? 'rounded-3xl' : 'rounded-full'} ${customization?.avatarId === 'stitch' ? 'overflow-visible' : 'overflow-hidden'}`}
          style={{
            filter: 'drop-shadow(0 0 20px rgba(255, 16, 240, 0.5))',
            border: `3px solid ${KPOP_COLORS.neonPink}`,
            boxShadow: `0 0 30px ${KPOP_COLORS.neonPink}66`,
            padding: customization?.avatarId === 'stitch' ? '10%' : '0',
          }}
        >
          <AvatarVideo
            customization={customization}
            context="default"
            autoplay
            loop
            muted
            className="w-full h-full"
          />
        </div>
      </button>

      {/* Avatar Message - Neon Bordje - Rechts boven de avatar */}
      {showMessage && (
        <div
          ref={messageRef}
          className="absolute right-0 bottom-[calc(100%+20px)] z-50 px-6 py-4 rounded-3xl shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
            border: `3px solid ${KPOP_COLORS.neonPink}`,
            boxShadow: `
              0 0 20px ${KPOP_COLORS.neonPink}66,
              0 0 40px ${KPOP_COLORS.neonPurple}44,
              inset 0 0 20px ${KPOP_COLORS.neonPink}22
            `,
            minWidth: '280px',
            maxWidth: 'calc(50vw - 2rem)',
            cursor: 'pointer',
          }}
          onClick={() => {
            if (messageRef.current) {
              gsap.to(messageRef.current, {
                opacity: 0,
                scale: 0.8,
                y: -20,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => setShowMessage(false)
              });
            }
          }}
        >
          <div className="text-center">
            <p
              className="text-xl md:text-2xl font-bold glow-text"
              style={{
                color: KPOP_COLORS.neonCyan,
                fontFamily: "'Poppins', sans-serif",
                textShadow: `0 0 10px ${KPOP_COLORS.neonCyan}, 0 0 20px ${KPOP_COLORS.neonCyan}66`,
                lineHeight: '1.4',
              }}
            >
              {messages[currentMessageIndex]}
            </p>
          </div>
          
          {/* Pulsing glow ring */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              border: `2px solid ${KPOP_COLORS.neonPurple}`,
              opacity: 0.6,
              animation: 'pulse-glow-border 2s ease-in-out infinite',
            }}
          />
        </div>
      )}

      <style>
        {`
          @keyframes pulse-glow-border {
            0%, 100% {
              opacity: 0.6;
              box-shadow: 0 0 20px ${KPOP_COLORS.neonPurple}44;
            }
            50% {
              opacity: 1;
              box-shadow: 0 0 40px ${KPOP_COLORS.neonPurple}88, 0 0 60px ${KPOP_COLORS.neonPink}66;
            }
          }
        `}
      </style>
    </div>
  )
}

