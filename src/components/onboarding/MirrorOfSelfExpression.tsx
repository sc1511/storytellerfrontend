/**
 * Scene 3: Avatar and Language Selection
 * K-pop inspired design with tactile buttons
 */

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { Heart } from 'lucide-react'
import type { AvatarCustomization } from '../../types'
import { AvatarVideo } from '../avatar/AvatarVideo'
import { getAvatarVideo, detectAvatarId } from '../../lib/avatarVideos'
import { NeonIconButton } from '../ui/NeonIconButton'

interface MirrorOfSelfExpressionProps {
  onAvatarComplete: (customization: AvatarCustomization) => void
  onLanguageSelect: (language: 'en' | 'nl') => void
  onBack?: () => void
}

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
  // Additional colors for avatar reveal
  deepPurple: '#9B59B6',
  pastelPink: '#FFB6C1',
  warmPeach: '#FFB347',
  softCoral: '#FF7F7F',
  skyBlue: '#87CEEB',
  mintGreen: '#98FB98',
  coolMint: '#B0E0E6',
  electricBlue: '#4A90E2',
  lavender: '#E6E6FA',
  ivory: '#FFFFF0',
  warmBeige: '#F5F5DC',
}

// Component to play avatar videos in sequence for reveal animation
function AvatarRevealVideo({ 
  customization, 
  onComplete 
}: { 
  customization: AvatarCustomization
  onComplete: () => void 
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [mediaSrc, setMediaSrc] = useState<string | null>(null)

  // Video sequence: default -> book -> cat (alle varianten van de avatar)
  const videoSequence: Array<'default' | 'book' | 'cat'> = ['default', 'book', 'cat']
  
  // Check of het een GIF of MP4 is
  const isGif = mediaSrc?.endsWith('.gif')

  useEffect(() => {
    const avatarId = detectAvatarId(customization)
    if (!avatarId) {
      // Fallback: wait 3 seconds then complete
      setTimeout(onComplete, 3000)
      return
    }

    // Get first media
    const firstMedia = getAvatarVideo(avatarId, videoSequence[0])
    if (firstMedia) {
      setMediaSrc(firstMedia)
    } else {
      // Fallback: wait 3 seconds then complete
      setTimeout(onComplete, 3000)
    }
  }, [customization, onComplete])

  useEffect(() => {
    if (!mediaSrc || !containerRef.current) return

    const container = containerRef.current
    const avatarId = detectAvatarId(customization)

    // Animate scale up when media starts - Minimal
    gsap.to(container, {
      scale: 1.05, // Grow to 105%
      duration: 0.3,
      ease: 'power2.out',
    })

    const handleNext = () => {
      // Scale back down slightly before next media
      gsap.to(container, {
        scale: 1.0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          // Move to next media in sequence
          const nextIndex = currentVideoIndex + 1
          
          if (nextIndex < videoSequence.length) {
            const nextMedia = getAvatarVideo(avatarId, videoSequence[nextIndex])
            if (nextMedia) {
              setCurrentVideoIndex(nextIndex)
              setMediaSrc(nextMedia)
              // Scale back up for next media - Minimal
              gsap.to(container, {
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.out',
              })
            } else {
              // No more media, complete
              onComplete()
            }
          } else {
            // All media played, scale up one last time then complete - Minimal
            gsap.to(container, {
              scale: 1.1,
              duration: 0.3,
              ease: 'power2.out',
              onComplete: () => {
                onComplete()
              }
            })
          }
        }
      })
    }

    if (isGif) {
      // Voor GIF's: wacht 2 seconden per GIF (GIF's loopen automatisch)
      const timer = setTimeout(() => {
        handleNext()
      }, 2000)

      return () => clearTimeout(timer)
    } else {
      // Voor MP4's: gebruik video events
      if (!videoRef.current) return

      const video = videoRef.current

      const handlePlaying = () => {
        gsap.to(container, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out',
        })
      }

      const handleEnded = () => {
        handleNext()
      }

      const handleLoadedData = () => {
        video.play().catch(err => {
          console.log('Video play error:', err)
          handleNext()
        })
      }

      video.addEventListener('playing', handlePlaying)
      video.addEventListener('ended', handleEnded)
      video.addEventListener('loadeddata', handleLoadedData)
      
      video.load()

      return () => {
        video.removeEventListener('playing', handlePlaying)
        video.removeEventListener('ended', handleEnded)
        video.removeEventListener('loadeddata', handleLoadedData)
      }
    }
  }, [mediaSrc, currentVideoIndex, customization, onComplete, isGif])

  if (!mediaSrc) {
    return null
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        transformOrigin: 'center',
      }}
    >
      {isGif ? (
        <img
          ref={imgRef}
          src={mediaSrc}
          alt="Avatar"
          className="w-full h-full object-cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          loading="eager"
          decoding="async"
        />
      ) : (
        <video
          ref={videoRef}
          src={mediaSrc}
          autoPlay
          loop={false}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}
    </div>
  )
}

// Rolling Korean letters background component - Alleen onderste horizontale scrolling
const RollingKoreanBackground = () => {
  const marqueeRef2 = useRef<HTMLDivElement>(null)

  // Korean words related to dreams, magic, and self-expression
  const koreanWords = ['꿈', '마법', '별', '우주', '나', '사랑', '희망', '빛']

  useEffect(() => {
    // Alleen bottom marquee (onderste horizontale scrolling)
    if (marqueeRef2.current) {
      const content = marqueeRef2.current.querySelector('.marquee-content') as HTMLElement
      if (content) {
        setTimeout(() => {
          const clone = content.cloneNode(true) as HTMLElement
          clone.className = 'marquee-content flex whitespace-nowrap'
          marqueeRef2.current?.appendChild(clone)

          const contentWidth = content.offsetWidth
          gsap.set(clone, { x: -contentWidth })
          gsap.to([content, clone], {
            x: `+=${contentWidth}`,
            duration: 15,
            ease: 'none',
            repeat: 0, // Run once and stop
            onComplete: () => {
              // Animation complete, elements stay in place
            }
          })
        }, 100)
      }
    }
  }, [])

  return (
    <>
      {/* Bottom marquee - right to left - Alleen deze behouden */}
      <div
        ref={marqueeRef2}
        className="absolute bottom-0 left-0 right-0 h-[15vh] overflow-hidden pointer-events-none"
        style={{ zIndex: 1, opacity: 0.5 }}
      >
        <div className="marquee-content flex whitespace-nowrap items-center h-full">
          {[...Array(15)].map((_, i) => {
            const color = i % 2 === 0 ? KPOP_COLORS.neonPink : KPOP_COLORS.neonCyan;
            return (
              <span
                key={i}
                lang="ko"
                className="text-8xl font-black mx-12"
                style={{
                  color: color,
                  fontFamily: "'Noto Sans KR', sans-serif",
                  textShadow: `
                    0 0 8px ${color},
                    0 0 12px ${color}88,
                    0 0 16px ${color}66
                  `,
                }}
              >
                {koreanWords[(i + 3) % koreanWords.length]}
              </span>
            );
          })}
        </div>
      </div>
    </>
  )
}

// Alle beschikbare avatars (inclusief nieuwe avatarpink, avatarpurple, avatarbrown)
const availableAvatars = [
  // Legacy avatars
  {
    id: 'avatar1',
    name: 'Avatar 1',
    video: '/avatar1/avatar1-unscreen.gif',
    color: KPOP_COLORS.warmPeach,
    customization: {
      avatarId: 'avatar1',
      skinColor: '#FFDBB3',
      hairStyle: 'short',
      hairColor: '#D4A574',
      eyeColor: '#FFBF00',
      accessories: [],
    } as AvatarCustomization,
  },
  {
    id: 'avatar2',
    name: 'Avatar 2',
    video: '/avatar2/avatar2-unscreen.gif',
    color: KPOP_COLORS.softCoral,
    customization: {
      avatarId: 'avatar2',
      skinColor: '#FFDBB3',
      hairStyle: 'medium',
      hairColor: '#D4A574',
      eyeColor: '#FFBF00',
      accessories: [],
    } as AvatarCustomization,
  },
  {
    id: 'avatar4',
    name: 'Avatar 4',
    video: '/avatar4/avatar4-unscreen.gif',
    color: KPOP_COLORS.skyBlue,
    customization: {
      avatarId: 'avatar4',
      skinColor: '#FFDBB3',
      hairStyle: 'long',
      hairColor: '#D4A574',
      eyeColor: '#FFBF00',
      accessories: [],
    } as AvatarCustomization,
  },
  {
    id: 'avatar5',
    name: 'Avatar 5',
    video: '/avatar5/avatar5-unscreen.gif',
    color: KPOP_COLORS.pastelPink,
    customization: {
      avatarId: 'avatar5',
      skinColor: '#FFDBB3',
      hairStyle: 'short',
      hairColor: '#D4A574',
      eyeColor: '#FFBF00',
      accessories: [],
    } as AvatarCustomization,
  },
  {
    id: 'avatar6',
    name: 'Avatar 6',
    video: '/avatar6/avatar6-unscreen.gif',
    color: KPOP_COLORS.mintGreen,
    customization: {
      avatarId: 'avatar6',
      skinColor: '#FFDBB3',
      hairStyle: 'medium',
      hairColor: '#D4A574',
      eyeColor: '#FFBF00',
      accessories: [],
    } as AvatarCustomization,
  },
  // Nieuwe avatars met alle contexten
  {
    id: 'avatarpink',
    name: 'Pink Avatar',
    video: '/avatarpink/avatarpink-intro-2--unscreen.gif',
    color: KPOP_COLORS.neonPink,
    customization: {
      avatarId: 'avatarpink',
      skinColor: '#FFDBB3',
      hairStyle: 'long',
      hairColor: '#FF10F0',
      eyeColor: '#FF10F0',
      accessories: [],
    } as AvatarCustomization,
  },
  {
    id: 'avatarpurple',
    name: 'Purple Avatar',
    video: '/avatarpurple/avatarpurple-intro-unscreen.gif',
    color: KPOP_COLORS.neonPurple,
    customization: {
      avatarId: 'avatarpurple',
      skinColor: '#FFDBB3',
      hairStyle: 'long',
      hairColor: '#B026FF',
      eyeColor: '#B026FF',
      accessories: [],
    } as AvatarCustomization,
  },
  {
    id: 'avatarbrown',
    name: 'Brown Avatar',
    video: '/avatarbrown/avatarbrown-intro-2--unscreen.gif',
    color: '#8B4513',
    customization: {
      avatarId: 'avatarbrown',
      skinColor: '#D4A574',
      hairStyle: 'medium',
      hairColor: '#8B4513',
      eyeColor: '#8B4513',
      accessories: [],
    } as AvatarCustomization,
  },
  // Stitch avatar
  {
    id: 'stitch',
    name: 'Stitch',
    video: '/stitch/stitch_happy-unscreen.gif',
    color: KPOP_COLORS.neonBlue,
    customization: {
      avatarId: 'stitch',
      skinColor: '#4A90E2',
      hairStyle: 'short',
      hairColor: '#4A90E2',
      eyeColor: '#00F0FF',
      accessories: [],
    } as AvatarCustomization,
  },
  // Spiderman avatar
  {
    id: 'spiderman',
    name: 'Spiderman',
    video: '/spiderman/spiderman-intro-unscreen.gif',
    color: '#E63946',
    customization: {
      avatarId: 'spiderman',
      skinColor: '#E63946',
      hairStyle: 'short',
      hairColor: '#E63946',
      eyeColor: '#FFFFFF',
      accessories: [],
    } as AvatarCustomization,
  },
]

export function MirrorOfSelfExpression({
  onAvatarComplete,
  onLanguageSelect,
  onBack,
}: MirrorOfSelfExpressionProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'reveal' | 'language'>('select')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([])
  const revealRef = useRef<HTMLDivElement>(null)

  // Animation for select step
  useEffect(() => {
    if (step === 'select') {
      const tl = gsap.timeline()
      tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .fromTo('.floating-circle', { scale: 0, opacity: 0 }, {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          stagger: 0.02,
          ease: 'power2.out'
        }, '-=0.2')
        .fromTo(avatarRefs.current, { y: 50, opacity: 0, scale: 0.9 }, {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.05,
          duration: 0.3,
          ease: 'power2.out'
        }, '-=0.2')

      // No continuous animations - only animate on interaction
      // Floating circles and avatars stay still for better performance
    }
  }, [step])

  // Animation for reveal step - animate container in
  useEffect(() => {
    if (step === 'reveal' && revealRef.current) {
      // Animate reveal container in
      gsap.fromTo(revealRef.current,
        { scale: 0, opacity: 0, rotation: -180 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.5, ease: 'back.out(1.7)' }
      )
    }
  }, [step])

  // Animation for language step
  useEffect(() => {
    if (step === 'language') {
      const tl = gsap.timeline()
      tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1 })
        .fromTo('.lang-button', { y: 100, opacity: 0, scale: 0.8 }, {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.2,
          duration: 1,
          ease: 'back.out(1.4)'
        }, '-=0.5')
    }
  }, [step])

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatarId(avatarId)
    const index = availableAvatars.findIndex(a => a.id === avatarId)

    if (index !== -1 && avatarRefs.current[index]) {
      // Animate floating circles on click
      const floatingCircles = document.querySelectorAll('.floating-circle');
      floatingCircles.forEach((circle: any, i) => {
        if (circle) {
          const randomY = gsap.utils.random(-30, 30);
          const randomX = gsap.utils.random(-30, 30);
          const randomScale = gsap.utils.random(0.9, 1.1);
          gsap.to(circle, {
            y: randomY,
            x: randomX,
            scale: randomScale,
            duration: 0.5,
            ease: 'power2.out',
            delay: i * 0.05,
            onComplete: () => {
              // Return to original position
              gsap.to(circle, {
                y: 0,
                x: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.in'
              });
            }
          });
        }
      });

      // Animate selected avatar
      gsap.to(avatarRefs.current[index], {
        scale: 1.15,
        duration: 0.4,
        ease: 'back.out(1.7)',
        onComplete: () => {
          // Direct naar reveal step - geen extra bevestiging nodig
          setStep('reveal')
        }
      })
      
      // Fade out other avatars
      avatarRefs.current.forEach((ref, i) => {
        if (ref && i !== index) {
          gsap.to(ref, {
            opacity: 0.3,
            scale: 0.9,
            duration: 0.3,
            ease: 'power2.in'
          })
        }
      })
    }
  }

  // handleReveal is now handled automatically in the useEffect for reveal step

  if (step === 'reveal') {
    const selectedAvatar = availableAvatars.find(a => a.id === selectedAvatarId)

    return (
      <div
        ref={containerRef}
        className="min-h-screen flex items-center justify-center relative overflow-x-hidden overflow-y-visible"
        style={{
          background: `linear-gradient(135deg, ${KPOP_COLORS.darkBg} 0%, ${KPOP_COLORS.darkBgSecondary} 50%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
        }}
      >
        {/* Back button - Links boven - Terug naar avatar selectie */}
        {onBack && (
          <button
            onClick={() => setStep('select')}
            className="absolute top-6 left-6 z-30 group"
            title="Terug"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              width: '80px',
              height: '80px',
              zIndex: 100,
            }}
          >
            <NeonIconButton
              type="back"
              onClick={() => setStep('select')}
              size="lg"
              color="purple"
              title="Terug"
              style={{ width: '80px', height: '80px' }}
            />
          </button>
        )}
        {/* Static Korean letters background - like StoryGeneratorPage but fewer */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {[...Array(15)].map((_, i) => {
            const koreanWords = ['이야기', '상상', '모험', '마법', '별', '우주', '꿈', '환상', '신비', '기적'];
            const word = koreanWords[i % koreanWords.length];
            const colors = [KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan];
            const color = colors[i % colors.length];
            return (
              <div
                key={`korean-${i}`}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${20 + Math.random() * 40}px`,
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontWeight: 900,
                  color: color,
                  opacity: 0.15 + Math.random() * 0.1,
                  textShadow: `
                    0 0 10px ${color}66,
                    0 0 20px ${color}44,
                    0 0 30px ${color}22
                  `,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  pointerEvents: 'none',
                }}
              >
                {word}
              </div>
            );
          })}
        </div>

        {/* Magical starburst particles - Static for better performance */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute pointer-events-none particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${6 + Math.random() * 12}px`,
              height: `${6 + Math.random() * 12}px`,
              background: [
                KPOP_COLORS.neonPink,
                KPOP_COLORS.neonBlue,
                KPOP_COLORS.neonPurple,
                KPOP_COLORS.neonCyan,
                KPOP_COLORS.neonMagenta,
              ][Math.floor(Math.random() * 5)],
              borderRadius: i % 3 === 0 ? '50%' : '0%',
              opacity: 0.7,
              zIndex: 2,
              boxShadow: `0 0 20px ${[
                KPOP_COLORS.neonPink,
                KPOP_COLORS.neonBlue,
                KPOP_COLORS.neonPurple,
                KPOP_COLORS.neonCyan,
              ][Math.floor(Math.random() * 4)]}`,
              // No animation - static for better performance
            }}
          />
        ))}

        {/* Multiple glowing orbs - Static for better performance */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full opacity-40"
          style={{
            background: `radial-gradient(circle, ${KPOP_COLORS.neonBlue} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            // No animation - static for better performance
          }}
        />
        <div className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full opacity-35"
          style={{
            background: `radial-gradient(circle, ${KPOP_COLORS.deepPurple} 0%, transparent 70%)`,
            filter: 'blur(45px)',
            // No animation - static for better performance
          }}
        />
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${KPOP_COLORS.coolMint} 0%, transparent 70%)`,
            filter: 'blur(35px)',
            // No animation - static for better performance
          }}
        />
        <div className="absolute bottom-1/3 right-1/3 w-52 h-52 rounded-full opacity-38"
          style={{
            background: `radial-gradient(circle, ${KPOP_COLORS.pastelPink} 0%, transparent 70%)`,
            filter: 'blur(38px)',
            // No animation - static for better performance
          }}
        />

        {/* Main content - centered - Hoger geplaatst */}
        <div className="relative z-20 text-center w-full max-w-4xl px-4" style={{ marginTop: '-18vh' }}>
          {/* Title with sparkle effect - MORE DRAMATIC */}
          <div ref={revealRef} className="mb-8">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-black mb-2 sm:mb-4"
              style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.electricBlue} 0%, ${KPOP_COLORS.deepPurple} 30%, ${KPOP_COLORS.pastelPink} 60%, ${KPOP_COLORS.coolMint} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(74, 144, 226, 0.6)) drop-shadow(0 0 60px rgba(155, 89, 182, 0.4))',
                fontFamily: "'Noto Sans KR', 'Nunito', sans-serif",
                letterSpacing: '-0.02em',
                textShadow: '0 0 80px rgba(255, 255, 255, 0.8)',
              }}
            >
              <span lang="ko" className="korean-text">완벽해요!</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black"
              style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.deepPurple} 0%, ${KPOP_COLORS.pastelPink} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.2))',
                fontFamily: "'Nunito', sans-serif",
              }}>
              Your avatar comes to life!
            </p>
          </div>

          {/* Avatar video container - Responsive */}
          {selectedAvatar && (
            <div className="relative w-full max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4">
              {/* Multiple glow rings - Minder intens */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${KPOP_COLORS.electricBlue}60 0%, ${KPOP_COLORS.deepPurple}50 30%, ${KPOP_COLORS.pastelPink}40 60%, transparent 80%)`,
                  filter: 'blur(40px)',
                  animation: 'pulse-glow-magical 2s ease-in-out infinite',
                  transform: 'scale(1.2)',
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${KPOP_COLORS.coolMint}50 0%, ${KPOP_COLORS.lavender}40 50%, transparent 70%)`,
                  filter: 'blur(30px)',
                  animation: 'pulse-glow-magical 2.5s ease-in-out infinite 0.5s',
                  transform: 'scale(1.1)',
                }}
              />

              {/* Avatar video - Responsive */}
              <div
                className={`relative w-full aspect-square ${selectedAvatar?.id === 'stitch' ? 'rounded-3xl' : 'rounded-full'} ${selectedAvatar?.id === 'stitch' ? 'overflow-visible' : 'overflow-hidden'} mx-auto`}
                style={{
                  maxWidth: 'clamp(200px, 50vw, 300px)',
                  maxHeight: 'clamp(200px, 50vw, 300px)',
                  border: `6px solid ${KPOP_COLORS.ivory}`,
                  boxShadow: `
                    0 0 40px ${KPOP_COLORS.electricBlue},
                    0 0 70px ${KPOP_COLORS.deepPurple}80,
                    0 0 100px ${KPOP_COLORS.pastelPink}60,
                    0 8px 0 0 ${KPOP_COLORS.warmBeige},
                    0 20px 60px rgba(0, 0, 0, 0.3),
                    inset 0 -4px 8px rgba(0, 0, 0, 0.1),
                    inset 0 3px 6px rgba(255, 255, 255, 0.9)
                  `,
                  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${KPOP_COLORS.ivory} 100%)`,
                  // No animation - static for better performance
                  padding: selectedAvatar?.id === 'stitch' ? '10%' : '0',
                }}
              >
                <AvatarRevealVideo
                  customization={selectedAvatar.customization}
                  onComplete={() => {
                    // This will be called after all videos play
                    const selectedAvatar = availableAvatars.find(a => a.id === selectedAvatarId)
                    if (selectedAvatar) {
                      onAvatarComplete(selectedAvatar.customization)
                      
                      const tl = gsap.timeline({
                        onComplete: () => {
                          setStep('language')
                        },
                      })

                      // Fade out particles
                      tl.to('.particle', {
                        opacity: 0,
                        scale: 0,
                        duration: 0.8,
                        stagger: 0.01,
                        ease: 'power2.in'
                      }, 0)
                      
                      // Fade out avatar
                      if (revealRef.current) {
                        tl.to(revealRef.current, {
                          scale: 0.8,
                          opacity: 0,
                          duration: 0.6,
                          ease: 'power2.in'
                        }, 0.2)
                      }

                      // Fade out container
                      tl.to(containerRef.current, {
                        opacity: 0,
                        duration: 0.4,
                        ease: 'power2.in'
                      }, 0.4)
                    }
                  }}
                />
              </div>

              {/* Neon geometric elements around avatar - Static for better performance */}
              {[...Array(16)].map((_, i) => {
                const colors = [KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan];
                const color = colors[i % colors.length];
                const distance = 200 + (i % 4) * 30;
                const size = 20 + (i % 3) * 15;
                const shapeType = i % 3;
                
                return (
                  <div
                    key={i}
                    className="absolute pointer-events-none"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: `${size}px`,
                      height: `${size}px`,
                      transform: `translate(-50%, -50%) rotate(${i * 22.5}deg) translateY(-${distance}px)`,
                      zIndex: 5,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        border: `3px solid ${color}`,
                        borderRadius: shapeType === 0 ? '50%' : shapeType === 1 ? '0%' : '20%',
                        background: shapeType === 2 ? `linear-gradient(135deg, ${color}22, transparent)` : 'transparent',
                        boxShadow: `
                          0 0 20px ${color}88,
                          0 0 40px ${color}66,
                          0 0 60px ${color}44,
                          inset 0 0 15px ${color}22
                        `,
                        transform: shapeType === 2 ? 'rotate(45deg)' : 'none',
                        opacity: 0.8,
                      }}
                    />
                  </div>
                )
              })}
              
              {/* Additional neon lines - Static for better performance */}
              {[...Array(8)].map((_, i) => {
                const colors = [KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan];
                const color = colors[i % colors.length];
                const distance = 180 + (i % 3) * 25;
                const angle = i * 45;
                
                return (
                  <div
                    key={`line-${i}`}
                    className="absolute pointer-events-none"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: `${60 + (i % 3) * 20}px`,
                      height: '3px',
                      background: `linear-gradient(90deg, transparent, ${color}88, ${color}, ${color}88, transparent)`,
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
                      zIndex: 4,
                      boxShadow: `0 0 15px ${color}66`,
                      opacity: 0.7,
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>

        <style>
          {`
            @keyframes pulse-orb-intense {
              0%, 100% {
                transform: scale(1);
                opacity: 0.4;
              }
              50% {
                transform: scale(1.4);
                opacity: 0.6;
              }
            }

            @keyframes pulse-glow-magical {
              0%, 100% {
                opacity: 0.7;
                transform: scale(1.4) rotate(0deg);
              }
              33% {
                opacity: 0.9;
                transform: scale(1.5) rotate(120deg);
              }
              66% {
                opacity: 0.8;
                transform: scale(1.45) rotate(240deg);
              }
            }

            @keyframes avatar-float {
              0%, 100% {
                transform: translateY(0px) scale(1);
              }
              50% {
                transform: translateY(-20px) scale(1.02);
              }
            }

            @keyframes neon-rotate-magical {
              0%, 100% {
                transform: translate(-50%, -50%) rotate(0deg) translateY(var(--distance, -200px)) rotate(0deg);
                opacity: 0.8;
              }
              50% {
                transform: translate(-50%, -50%) rotate(180deg) translateY(calc(var(--distance, -200px) - 40px)) rotate(-180deg);
                opacity: 1;
              }
            }

            @keyframes neon-pulse-intense {
              0%, 100% {
                transform: scale(1);
                opacity: 0.8;
                filter: brightness(1);
              }
              50% {
                transform: scale(1.2);
                opacity: 1;
                filter: brightness(1.5);
              }
            }
            
            @keyframes neon-line-pulse {
              0%, 100% {
                opacity: 0.5;
                transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(var(--distance, -180px)) scaleX(1);
              }
              50% {
                opacity: 1;
                transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(calc(var(--distance, -180px) - 20px)) scaleX(1.3);
              }
            }

            @keyframes float-particle {
              0%, 100% {
                transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
                opacity: 0.7;
              }
              33% {
                transform: translateY(-30px) translateX(15px) rotate(120deg) scale(1.2);
                opacity: 1;
              }
              66% {
                transform: translateY(-15px) translateX(-10px) rotate(240deg) scale(0.9);
                opacity: 0.8;
              }
            }
            
            /* Particle hover effect - Feller en sneller bij hover */
            .particle {
              transition: all 0.3s ease;
            }
            
            .particle-hover {
              animation-duration: ${1.5 + Math.random() * 2}s !important;
              box-shadow: 0 0 ${15 + Math.random() * 20}px currentColor, 0 0 ${25 + Math.random() * 30}px currentColor !important;
              transform: scale(${1.3 + Math.random() * 0.4}) !important;
              opacity: 1 !important;
            }
            
            /* Star particles hover effect - Feller en sneller bij hover */
            .star-particle {
              transition: all 0.3s ease;
            }
            
            .star-hover {
              animation-duration: ${1 + Math.random() * 2}s !important;
              box-shadow: 0 0 ${8 + Math.random() * 12}px currentColor, 0 0 ${15 + Math.random() * 20}px currentColor !important;
              transform: scale(${1.2 + Math.random() * 0.3}) !important;
            }
          `}
        </style>
      </div>
    )
  }

  if (step === 'language') {
    return (
      <div
        ref={containerRef}
        className="scene-content min-h-screen flex items-center justify-center relative overflow-x-hidden overflow-y-visible p-4"
        style={{
          background: `linear-gradient(135deg, ${KPOP_COLORS.darkBg} 0%, ${KPOP_COLORS.darkBgSecondary} 50%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
        }}
      >
        {/* Back button - Links boven - Terug naar avatar selectie */}
        {onBack && (
          <button
            onClick={() => setStep('select')}
            className="absolute top-6 left-6 z-30 group"
            title="Terug"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              width: '80px',
              height: '80px',
              zIndex: 100,
            }}
          >
            <NeonIconButton
              type="back"
              onClick={() => setStep('select')}
              size="lg"
              color="purple"
              title="Terug"
              style={{ width: '80px', height: '80px' }}
            />
          </button>
        )}
        {/* Static Korean letters removed for better performance */}

        {/* Rolling Korean Background - Alleen onderste horizontale scrolling */}
        <RollingKoreanBackground />

        {/* Neon Geometric Shapes and Lines - Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {/* Diagonal lines */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`line-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${150 + Math.random() * 250}px`,
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${[KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan][i % 4]}66, transparent)`,
                transform: `rotate(${-45 + Math.random() * 90}deg)`,
                boxShadow: `0 0 15px ${[KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan][i % 4]}44`,
                opacity: 0.25 + Math.random() * 0.25,
              }}
            />
          ))}
          
          {/* Geometric shapes - Static for better performance */}
          {[...Array(15)].map((_, i) => {
            const colors = [KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan];
            const color = colors[i % colors.length];
            const size = 25 + Math.random() * 50;
            return (
              <div
                key={`shape-${i}`}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  border: `2px solid ${color}`,
                  borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '0%' : '20%',
                  boxShadow: `
                    0 0 20px ${color}66,
                    0 0 40px ${color}44,
                    inset 0 0 20px ${color}22
                  `,
                  opacity: 0.15 + Math.random() * 0.25,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  // No animation - static for better performance
                }}
              />
            );
          })}
        </div>

        {/* Background particles / Stars - Static for better performance */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {[...Array(30)].map((_, i) => {
            const starColor = ['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF', '#FFD700'][i % 5];
            return (
              <div
                key={`star-${i}`}
                className="absolute rounded-full star-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${1 + Math.random() * 5}px`,
                  height: `${1 + Math.random() * 5}px`,
                  background: starColor,
                  boxShadow: `0 0 ${3 + Math.random() * 8}px ${starColor}`,
                  // No animation - static for better performance
                }}
              />
            );
          })}
        </div>

        <div className="text-center space-y-6 sm:space-y-8 md:space-y-12 max-w-4xl relative px-4" style={{ zIndex: 20 }}>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-black mb-2 sm:mb-4 glow-text"
            style={{
              color: KPOP_COLORS.neonPink,
              fontFamily: "'Noto Sans KR', 'Nunito', sans-serif",
              letterSpacing: '-0.02em'
            }}
          >
            <span lang="ko" className="korean-text">언어를 선택하세요</span>
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black glow-text"
            style={{
              color: KPOP_COLORS.neonBlue,
              fontFamily: "'Poppins', sans-serif",
              textShadow: `0 0 10px ${KPOP_COLORS.neonBlue}, 0 0 20px ${KPOP_COLORS.neonBlue}66`,
            }}>
            Choose your language
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center pt-4 sm:pt-6 md:pt-8 relative" style={{ zIndex: 30 }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Nederlands button clicked');
                if (!selectedAvatarId) {
                  alert('Selecteer eerst een avatar voordat je een taal kiest!');
                  return;
                }
                onLanguageSelect('nl');
              }}
              className="lang-button group transition-all duration-300 hover:scale-105 active:scale-95 relative"
              style={{ zIndex: 30, pointerEvents: 'auto', cursor: 'pointer' }}
              disabled={!selectedAvatarId}
            >
              <div
                className="relative px-6 py-5 sm:px-8 sm:py-6 md:px-10 md:py-7 lg:px-12 lg:py-8 rounded-2xl sm:rounded-3xl shadow-2xl transition-transform duration-300 group-hover:translate-y-[-4px] group-active:translate-y-[2px] glow-border w-full sm:w-auto min-w-[200px] sm:min-w-[250px]"
                style={{
                  background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                  border: `2px solid ${KPOP_COLORS.neonPink}`,
                  boxShadow: `
                    0 0 10px ${KPOP_COLORS.neonPink}44,
                    inset 0 0 10px ${KPOP_COLORS.neonPink}22
                  `,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `
                    0 0 20px ${KPOP_COLORS.neonPink},
                    0 0 40px ${KPOP_COLORS.neonPink}66,
                    inset 0 0 20px ${KPOP_COLORS.neonPink}33
                  `
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `
                    0 0 10px ${KPOP_COLORS.neonPink}44,
                    inset 0 0 10px ${KPOP_COLORS.neonPink}22
                  `
                }}
              >
                {/* Neon glow highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent pointer-events-none rounded-2xl" />

                <div className="relative">
                  <div 
                    className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2 font-black"
                    style={{ 
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 'clamp(1.5em, 4vw, 1.8em)',
                      fontWeight: 900,
                      letterSpacing: '0.15em',
                      color: KPOP_COLORS.neonPink,
                      textShadow: `0 0 10px ${KPOP_COLORS.neonPink}, 0 0 20px ${KPOP_COLORS.neonPink}66`,
                    }}>
                    NL
                  </div>
                  <div 
                    className="text-sm sm:text-base md:text-lg font-black"
                    style={{ 
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 900,
                      color: '#ffffff',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                      letterSpacing: '0.02em',
                    }}>
                    Nederlands
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('English button clicked');
                if (!selectedAvatarId) {
                  alert('Selecteer eerst een avatar voordat je een taal kiest!');
                  return;
                }
                onLanguageSelect('en');
              }}
              className="lang-button group transition-all duration-300 hover:scale-105 active:scale-95 relative"
              style={{ zIndex: 30, pointerEvents: 'auto', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredLanguage('en')}
              onMouseLeave={() => setHoveredLanguage(null)}
              disabled={!selectedAvatarId}
            >
              <div
                className="relative px-6 py-5 sm:px-8 sm:py-6 md:px-10 md:py-7 lg:px-12 lg:py-8 rounded-2xl sm:rounded-3xl shadow-2xl transition-transform duration-300 group-hover:translate-y-[-4px] group-active:translate-y-[2px] glow-border w-full sm:w-auto min-w-[200px] sm:min-w-[250px]"
                style={{
                  background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                  border: `2px solid ${KPOP_COLORS.neonBlue}`,
                  boxShadow: `
                    0 0 10px ${KPOP_COLORS.neonBlue}44,
                    inset 0 0 10px ${KPOP_COLORS.neonBlue}22
                  `,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `
                    0 0 20px ${KPOP_COLORS.neonBlue},
                    0 0 40px ${KPOP_COLORS.neonBlue}66,
                    inset 0 0 20px ${KPOP_COLORS.neonBlue}33
                  `
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `
                    0 0 10px ${KPOP_COLORS.neonBlue}44,
                    inset 0 0 10px ${KPOP_COLORS.neonBlue}22
                  `
                }}
              >
                {/* Neon glow highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent pointer-events-none rounded-2xl" />

                <div className="relative">
                  <div 
                    className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2 font-black"
                    style={{ 
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 'clamp(1.5em, 4vw, 1.8em)',
                      fontWeight: 900,
                      letterSpacing: '0.15em',
                      color: KPOP_COLORS.neonBlue,
                      textShadow: `0 0 10px ${KPOP_COLORS.neonBlue}, 0 0 20px ${KPOP_COLORS.neonBlue}66`,
                    }}>
                    EN
                  </div>
                  <div 
                    className="text-sm sm:text-base md:text-lg font-black"
                    style={{ 
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 900,
                      color: '#ffffff',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                      letterSpacing: '0.02em',
                    }}>
                    English
                  </div>
                </div>
              </div>
            </button>
          </div>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-display font-medium glow-text px-4"
            style={{ color: KPOP_COLORS.neonCyan, opacity: 0.8 }}>
            Je kunt dit later altijd veranderen
          </p>
        </div>

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          `}
        </style>
      </div>
    )
  }

  // Avatar selection
  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-y-auto w-full flex flex-col items-center justify-center p-4"
      style={{
        background: '#000000', // Zwarte achtergrond zoals icon_noodles.png - minder druk
      }}
    >
      {/* Back button - Links boven */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-30 group"
          title="Terug"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            width: '80px',
            height: '80px',
            zIndex: 100,
          }}
        >
          <NeonIconButton
            type="back"
            onClick={onBack}
            size="lg"
            color="purple"
            title="Terug"
            style={{ width: '80px', height: '80px' }}
          />
        </button>
      )}
      {/* Minimal background - zwarte achtergrond met alleen subtiele elementen */}
      {/* Neon Hearts Background - Only show on hover for better performance */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ zIndex: 1 }}
        onMouseEnter={(e) => {
          // Show hearts on hover
          const hearts = e.currentTarget.querySelectorAll('[data-heart]');
          hearts.forEach((heart: any) => {
            if (heart) {
              gsap.to(heart, {
                opacity: 0.6,
                scale: 1.1,
                duration: 0.3,
                ease: 'power2.out'
              });
            }
          });
        }}
        onMouseLeave={(e) => {
          // Hide hearts when not hovering
          const hearts = e.currentTarget.querySelectorAll('[data-heart]');
          hearts.forEach((heart: any) => {
            if (heart) {
              gsap.to(heart, {
                opacity: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.in'
              });
            }
          });
        }}
      >
        {[...Array(8)].map((_, i) => {
          const heartColors = [
            { stroke: '#FF10F0', glow: '#FF10F0' },
            { stroke: '#00F0FF', glow: '#00F0FF' },
            { stroke: '#B026FF', glow: '#B026FF' },
            { stroke: '#00FFFF', glow: '#00FFFF' },
            { stroke: '#FFD700', glow: '#FFD700' },
          ];
          const color = heartColors[i % heartColors.length];
          const size = 40 + Math.random() * 60;
          const rotation = Math.random() * 360;
          
          return (
            <div
              key={`heart-${i}`}
              data-heart
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: 0, // Hidden by default
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <Heart
                size={size}
                strokeWidth={2}
                style={{
                  color: color.stroke,
                  filter: `
                    drop-shadow(0 0 10px ${color.glow}88)
                    drop-shadow(0 0 20px ${color.glow}66)
                    drop-shadow(0 0 30px ${color.glow}44)
                  `,
                  stroke: color.stroke,
                  fill: 'none',
                }}
              />
            </div>
          );
        })}
      </div>
      
      {/* Noodles icons in background - static for better performance */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(4)].map((_, i) => {
          const size = 80 + Math.random() * 120;
          return (
            <div
              key={`noodle-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: 0.15 + Math.random() * 0.15,
                transform: `rotate(${Math.random() * 360}deg)`,
                // No animation - static for better performance
              }}
            >
              <img
                src="/icon_noodles.png"
                alt=""
                className="w-full h-full object-contain"
                style={{
                  filter: `
                    drop-shadow(0 0 20px ${['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF'][i % 4]}88)
                    drop-shadow(0 0 40px ${['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF'][i % 4]}66)
                  `,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Subtle background particles - floating circles, only animate on click */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(15)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full floating-circle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              background: ['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF'][i % 4],
              boxShadow: `0 0 ${2 + Math.random() * 3}px ${['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF'][i % 4]}`,
              opacity: 0.2 + Math.random() * 0.2,
              // No animation - only animate on click for better performance
            }}
          />
        ))}
      </div>

      {/* Title - Responsive */}
      <h1
        className="absolute top-[5%] sm:top-[8%] text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-center z-20 px-4"
        style={{
          background: `linear-gradient(135deg, ${KPOP_COLORS.electricBlue} 0%, ${KPOP_COLORS.deepPurple} 30%, ${KPOP_COLORS.pastelPink} 60%, ${KPOP_COLORS.coolMint} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 30px rgba(74, 144, 226, 0.6)) drop-shadow(0 0 60px rgba(155, 89, 182, 0.4))',
          fontFamily: "'Noto Sans KR', 'Nunito', sans-serif",
          letterSpacing: '-0.02em'
        }}
      >
        <span lang="ko" className="korean-text">아바타를 선택하세요</span>
      </h1>

      {/* Subtitle - Responsive */}
      <p className="absolute top-[12%] sm:top-[17%] text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-center z-20 px-4"
        style={{
          background: `linear-gradient(135deg, ${KPOP_COLORS.deepPurple} 0%, ${KPOP_COLORS.electricBlue} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.2))',
          fontFamily: "'Nunito', sans-serif",
        }}>
        Choose your perfect avatar
      </p>

      {/* Avatar grid - Responsive layout */}
      <div className="absolute top-[50%] sm:top-[60%] md:top-[70%] lg:top-[75%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 z-20 px-2 sm:px-4">
        {availableAvatars.flatMap((avatar, index) => {
          // Different neon colors for each card
          const neonColors = [
            { border: KPOP_COLORS.neonPink, glow: KPOP_COLORS.neonPink },
            { border: KPOP_COLORS.neonPurple, glow: KPOP_COLORS.neonPurple },
            { border: KPOP_COLORS.neonBlue, glow: KPOP_COLORS.neonBlue },
            { border: KPOP_COLORS.neonCyan, glow: KPOP_COLORS.neonCyan },
            { border: '#00FF88', glow: '#00FF88' }, // Green variant
          ];
          const cardColor = neonColors[index % neonColors.length];
          const isSelected = selectedAvatarId === avatar.id;
          const isHovered = hoveredIndex === index;
          
          const koreanWords = ['우주', '마법', '꿈', '사랑', '희망', '별', '모험', '여행'];
          const frameColor = [KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan][index % 4];
          const frameSizes = [
            { w: 80, h: 100 },
            { w: 120, h: 140 },
            { w: 100, h: 120 },
            { w: 90, h: 110 },
            { w: 110, h: 130 },
          ];
          const frameSize = frameSizes[index % frameSizes.length];
          const fontSize = 20 + (index % 3) * 15; // Variabele font sizes

          return [
            // Korean text frame before avatar (except first) - Responsive
            index > 0 && (
              <div
                key={`frame-${index}`}
                className="relative flex items-center justify-center"
                style={{
                  width: `clamp(${frameSize.w * 0.6}px, ${frameSize.w * 0.8}vw, ${frameSize.w}px)`,
                  height: `clamp(${frameSize.h * 0.6}px, ${frameSize.h * 0.8}vw, ${frameSize.h}px)`,
                }}
              >
                <div
                  className="relative rounded-xl p-3 flex items-center justify-center"
                  style={{
                    background: 'transparent',
                    border: `2px solid ${frameColor}`,
                    boxShadow: `0 0 20px ${frameColor}66, 0 0 40px ${frameColor}44`,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <div
                    className="text-center"
                    style={{
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontSize: `${fontSize}px`,
                      fontWeight: 900,
                      color: frameColor,
                      textShadow: `0 0 10px ${frameColor}88, 0 0 20px ${frameColor}66`,
                    }}
                  >
                    {koreanWords[index % koreanWords.length]}
                  </div>
                </div>
              </div>
            ),
            // Avatar card with neon icon
            <div
              key={avatar.id}
              ref={el => { avatarRefs.current[index] = el }}
              onClick={() => handleAvatarSelect(avatar.id)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative cursor-pointer transition-all duration-300"
              style={{
                transform: isHovered || isSelected ? 'scale(1.08) translateY(-8px)' : 'scale(1)'
              }}
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '1 / 1',
                  width: 'clamp(120px, 20vw, 200px)',
                  minHeight: (avatar.id === 'stitch' || avatar.id === 'spiderman') 
                    ? 'clamp(140px, 22vw, 220px)' 
                    : 'clamp(120px, 20vw, 200px)',
                  maxHeight: (avatar.id === 'stitch' || avatar.id === 'spiderman') 
                    ? 'clamp(160px, 24vw, 240px)' 
                    : 'clamp(140px, 22vw, 220px)',
                  background: 'transparent', // Transparent background
                  border: isSelected 
                    ? `3px solid ${cardColor.border}`
                    : isHovered
                    ? `2px solid ${cardColor.border}88`
                    : `2px solid ${cardColor.border}44`,
                  boxShadow: isSelected
                    ? `
                      0 0 40px ${cardColor.glow}88,
                      0 0 80px ${cardColor.glow}66,
                      0 0 120px ${cardColor.glow}44,
                      0 0 160px ${cardColor.glow}22
                    `
                    : isHovered
                    ? `
                      0 0 30px ${cardColor.glow}66,
                      0 0 60px ${cardColor.glow}44,
                      0 0 90px ${cardColor.glow}22
                    `
                    : `
                      0 0 15px ${cardColor.glow}33,
                      0 0 30px ${cardColor.glow}22
                    `,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                  {/* Avatar video - gebruik intro context voor selectie, alleen eerste frame */}
                  <div 
                    className="relative w-full h-full flex items-center justify-center z-0"
                    style={{
                      padding: (avatar.id === 'stitch' || avatar.id === 'spiderman') ? '8%' : '1rem',
                      overflow: 'visible',
                      filter: isSelected 
                        ? `drop-shadow(0 0 30px ${cardColor.glow}88) drop-shadow(0 0 60px ${cardColor.glow}66)`
                        : isHovered
                        ? `drop-shadow(0 0 20px ${cardColor.glow}66) drop-shadow(0 0 40px ${cardColor.glow}44)`
                        : `drop-shadow(0 0 10px ${cardColor.glow}33)`,
                      transition: 'filter 0.3s ease',
                      transform: (avatar.id === 'stitch' || avatar.id === 'spiderman') ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    <AvatarVideo
                      customization={avatar.customization}
                      context="intro"
                      autoplay={false}
                      loop={false}
                      muted
                      static={true}
                      className="w-full h-full"
                    />
                  </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div 
                    className="absolute top-3 right-3 w-10 h-10 z-20 flex items-center justify-center rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${cardColor.glow} 0%, ${cardColor.border} 100%)`,
                      boxShadow: `
                        0 0 20px ${cardColor.glow}88,
                        0 0 40px ${cardColor.glow}66,
                        inset 0 0 10px rgba(255, 255, 255, 0.3)
                      `,
                    }}
                  >
                    <NeonIconButton type="correct" size="sm" color="cyan" style={{ width: '24px', height: '24px' }} />
                  </div>
                )}

                {/* Hover glow effect */}
                {isHovered && !isSelected && (
                  <div 
                    className="absolute inset-0 pointer-events-none z-5"
                    style={{
                      background: `radial-gradient(circle at center, ${cardColor.glow}15 0%, transparent 70%)`,
                      animation: 'glow-pulse 2s ease-in-out infinite',
                    }}
                  />
                )}
              </div>
            </div>
          ].filter(Boolean); // Remove false values (for first avatar without frame)
        })}
      </div>


        {/* Helper text - Responsive */}
        {!selectedAvatarId && (
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 text-sm sm:text-base md:text-lg lg:text-xl font-display font-medium text-center px-4 z-20 flex items-center justify-center gap-2 sm:gap-3 glow-text"
            style={{ color: KPOP_COLORS.neonCyan }}>
            <img src="/icon_star_alone-removebg-preview.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain" />
            <span className="whitespace-nowrap">Klik op een avatar om te kiezen</span>
            <img src="/icon_star_alone-removebg-preview.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain" />
          </div>
        )}

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  )
}
