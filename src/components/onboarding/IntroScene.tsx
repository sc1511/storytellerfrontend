/**
 * Intro Scene Component
 * Simpel: video achtergrond, tekst, start button
 */

import { useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'

interface IntroSceneProps {
  onComplete: () => void
  onLibrary?: () => void
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
}

// Cat messages array - roteert bij elke klik
const CAT_MESSAGES = [
  "Oh! Jij weer! Nieuw avontuur (PLAY) of oude glorie (LIBRARY)?",
  "Miauw... zin in iets nieuws? Klik op PLAY. Of snuffel in de LIBRARY.",
  "Ik voel creatieve vibes... druk op PLAY! Of ben je nostalgisch vandaag?",
  "Wacht! Eerst even kiezen: nieuw verhaal (PLAY) of terug in de tijd (LIBRARY)?",
  "PLAY is voor dappere dromers, LIBRARY voor wijze legendes. Jij kiest.",
  "Hé jij! Ja jij! Maak magie met PLAY, of herlees je meesterwerken in LIBRARY.",
  "Zin in chaos? PLAY. Zin in chill? LIBRARY. Ik oordeel niet (oké, een beetje).",
  "PLAY of LIBRARY... jouw keuze bepaalt mijn humeur. 😼",
  "Nieuw verhaal? PLAY. Oude favorieten? LIBRARY. Katten houden van keuzes.",
  "Druk op PLAY en laat de glitter knallen — of chill in de LIBRARY met je hits.",
];

export function IntroScene({ onComplete, onLibrary }: IntroSceneProps) {
  const [showButton, setShowButton] = useState(false)
  const [showCatMessage, setShowCatMessage] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const verticalMarqueeRef1 = useRef<HTMLDivElement>(null)
  const verticalMarqueeRef2 = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const catMessageRef = useRef<HTMLDivElement>(null)

  // Na 3 seconden de button tonen (GIF's zijn direct zichtbaar)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Marquee animaties voor beide teksten
  useEffect(() => {
    // Koreaanse tekst marquee (naar links)
    if (marqueeRef.current) {
      const marquee = marqueeRef.current
      const content = marquee.querySelector('.marquee-content') as HTMLElement
      
      if (content) {
        setTimeout(() => {
          const clone = content.cloneNode(true) as HTMLElement
          clone.className = 'marquee-content flex whitespace-nowrap'
          marquee.appendChild(clone)
          
          const contentWidth = content.offsetWidth
          gsap.set(clone, { x: contentWidth })
          
          gsap.to([content, clone], {
            x: `-=${contentWidth}`,
            duration: 20,
            ease: 'none',
            repeat: -1,
          })
        }, 100)
      }
    }
    
    // Vertical marquees removed for better performance
  }, [])

  // Zachtjes fade-in animatie voor start button
  useEffect(() => {
    if (showButton && buttonRef.current) {
      gsap.fromTo(buttonRef.current, 
        { 
          opacity: 0, 
          scale: 0.8,
          y: 20
        },
        { 
          opacity: 1, 
          scale: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out'
        }
      )
    }
  }, [showButton])

  // Animate cat message when it appears
  useEffect(() => {
    if (showCatMessage && catMessageRef.current) {
      // Fade in and scale up
      gsap.fromTo(catMessageRef.current, 
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
        if (catMessageRef.current) {
          gsap.to(catMessageRef.current, {
            opacity: 0,
            scale: 0.8,
            y: -20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => setShowCatMessage(false)
          });
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showCatMessage, currentMessageIndex])

  const handleCatClick = () => {
    if (showCatMessage && catMessageRef.current) {
      // Als bericht al zichtbaar is, verberg het eerst en toon dan volgende
      gsap.to(catMessageRef.current, {
        opacity: 0,
        scale: 0.8,
        y: -20,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          const nextIndex = (currentMessageIndex + 1) % CAT_MESSAGES.length
          setCurrentMessageIndex(nextIndex)
          setShowCatMessage(true)
        }
      });
    } else {
      // Eerste keer klikken - toon eerste bericht
      const nextIndex = (currentMessageIndex + 1) % CAT_MESSAGES.length
      setCurrentMessageIndex(nextIndex)
      setShowCatMessage(true)
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{ background: `linear-gradient(135deg, ${KPOP_COLORS.darkBg} 0%, ${KPOP_COLORS.darkBgSecondary} 50%, ${KPOP_COLORS.darkBgTertiary} 100%)` }}>
      {/* GIF achtergrond - Kat kleiner en bovenaan - Klikbaar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ zIndex: 1 }}>
        <button
          onClick={handleCatClick}
          onMouseEnter={() => setIsCatHovered(true)}
          onMouseLeave={() => setIsCatHovered(false)}
          className="w-auto h-[40vh] max-h-[400px] object-contain cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 group"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            position: 'relative',
          }}
          title="Klik voor een bericht!"
        >
          <img
            src="/cat-upsidedown-unscreen.gif"
            alt=""
            className="w-full h-full object-contain transition-all duration-300"
            style={{
              filter: 'drop-shadow(0 0 15px rgba(255, 16, 240, 0.5))',
            }}
          />
          
          {/* Hover tooltip - "Klik voor meer info!" */}
          {isCatHovered && !showCatMessage && (
            <div
              ref={catTooltipRef}
              className="absolute left-1/2 -translate-x-1/2 top-[calc(40vh+20px)] z-50 px-4 py-3 rounded-2xl shadow-2xl pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                border: `2px solid ${KPOP_COLORS.neonCyan}`,
                boxShadow: `
                  0 0 15px ${KPOP_COLORS.neonCyan}66,
                  0 0 30px ${KPOP_COLORS.neonCyan}44,
                  inset 0 0 15px ${KPOP_COLORS.neonCyan}22
                `,
                minWidth: '200px',
                maxWidth: '300px',
                whiteSpace: 'nowrap',
                animation: 'fadeInTooltip 0.3s ease-out',
              }}
            >
              <div className="text-center">
                <p
                  className="text-base md:text-lg font-bold"
                  style={{
                    color: KPOP_COLORS.neonCyan,
                    fontFamily: "'Poppins', sans-serif",
                    textShadow: `0 0 8px ${KPOP_COLORS.neonCyan}, 0 0 16px ${KPOP_COLORS.neonCyan}66`,
                    lineHeight: '1.3',
                  }}
                >
                  👆 Klik voor meer info!
                </p>
              </div>
              
              {/* Arrow pointing up to cat */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-[-12px] w-0 h-0"
                style={{
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderBottom: `12px solid ${KPOP_COLORS.neonCyan}`,
                  filter: `drop-shadow(0 -2px 4px ${KPOP_COLORS.neonCyan}66)`,
                }}
              />
            </div>
          )}
        </button>
      </div>


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
        
        {/* Geometric shapes */}
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
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`,
              }}
            />
          );
        })}
      </div>

      {/* Noodles icons in background - scattered */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(6)].map((_, i) => {
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
                animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
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

      {/* Background particles / Stars */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(60)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 5}px`,
              height: `${1 + Math.random() * 5}px`,
              background: ['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF', '#FFD700'][i % 5],
              boxShadow: `0 0 ${3 + Math.random() * 8}px ${['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF', '#FFD700'][i % 5]}`,
              animation: `neon-flicker ${2 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Two buttons - PLAY and LIBRARY - Midden van het scherm - verschijnt na 3 seconden */}
      {showButton && (
        <div
          ref={buttonRef}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row items-center justify-center gap-8"
          style={{
            top: '50%', // Midden van het scherm
            opacity: 0, // Start onzichtbaar, wordt geanimeerd door GSAP
            zIndex: 70,
          }}
        >
          {/* PLAY Button */}
          <div
            className="flex flex-col items-center justify-center gap-4 cursor-pointer group"
            onClick={onComplete}
            style={{
              transition: 'transform 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* Play triangle icon */}
            <div
              className="relative"
              style={{
                width: '120px',
                height: '120px',
              }}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-full h-full"
                style={{
                  filter: `
                    drop-shadow(0 0 20px #FF10F0) 
                    drop-shadow(0 0 40px #B026FF) 
                    drop-shadow(0 0 60px #00F0FF)
                  `,
                }}
              >
                <polygon 
                  points="5 3 19 12 5 21 5 3" 
                  fill="#00F0FF" 
                  stroke="#00F0FF" 
                  strokeWidth="2"
                />
              </svg>
            </div>
            {/* "PLAY" tekst eronder */}
            <div
              className="text-3xl md:text-4xl font-black"
              style={{
                background: `linear-gradient(135deg, #FF10F0 0%, #B026FF 50%, #00F0FF 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 20px rgba(255, 16, 240, 0.5)',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '0.1em',
              }}
            >
              PLAY
            </div>
          </div>

          {/* LIBRARY Button */}
          {onLibrary && (
            <div
              className="flex flex-col items-center justify-center gap-4 cursor-pointer group"
              onClick={onLibrary}
              style={{
                transition: 'transform 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Library book icon - Squid Game style (triangle with book) */}
              <div
                className="relative"
                style={{
                  width: '120px',
                  height: '120px',
                }}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="w-full h-full"
                  style={{
                    filter: `
                      drop-shadow(0 0 20px #B026FF) 
                      drop-shadow(0 0 40px #FF10F0) 
                      drop-shadow(0 0 60px #00FFFF)
                    `,
                  }}
                >
                  {/* Book shape - Squid Game triangle style */}
                  <path 
                    d="M6 4C6 3.44772 6.44772 3 7 3H17C17.5523 3 18 3.44772 18 4V20C18 20.5523 17.5523 21 17 21H7C6.44772 21 6 20.5523 6 20V4Z" 
                    fill="#B026FF" 
                    stroke="#FF10F0" 
                    strokeWidth="2"
                  />
                  {/* Book pages lines */}
                  <line x1="9" y1="7" x2="15" y2="7" stroke="#00FFFF" strokeWidth="1.5" />
                  <line x1="9" y1="10" x2="15" y2="10" stroke="#00FFFF" strokeWidth="1.5" />
                  <line x1="9" y1="13" x2="15" y2="13" stroke="#00FFFF" strokeWidth="1.5" />
                  <line x1="9" y1="16" x2="15" y2="16" stroke="#00FFFF" strokeWidth="1.5" />
                </svg>
              </div>
              {/* "LIBRARY" tekst eronder */}
              <div
                className="text-3xl md:text-4xl font-black"
                style={{
                  background: `linear-gradient(135deg, #B026FF 0%, #FF10F0 50%, #00FFFF 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 20px rgba(176, 38, 255, 0.5)',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '0.1em',
                }}
              >
                LIBRARY
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cat Message - Neon Bordje */}
      {showCatMessage && (
        <div
          ref={catMessageRef}
          className="absolute left-1/2 top-[20%] -translate-x-1/2 z-50 px-8 py-6 rounded-3xl shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
            border: `3px solid ${KPOP_COLORS.neonPink}`,
            boxShadow: `
              0 0 20px ${KPOP_COLORS.neonPink}66,
              0 0 40px ${KPOP_COLORS.neonPurple}44,
              inset 0 0 20px ${KPOP_COLORS.neonPink}22
            `,
            minWidth: '320px',
            maxWidth: '85vw',
            cursor: 'pointer',
          }}
          onClick={() => {
            if (catMessageRef.current) {
              gsap.to(catMessageRef.current, {
                opacity: 0,
                scale: 0.8,
                y: -20,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => setShowCatMessage(false)
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
              {CAT_MESSAGES[currentMessageIndex]}
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

      {/* Koreaanse tekst marquee - onderste helft van scherm, blijft zichtbaar tijdens overgang */}
      <div 
        ref={marqueeRef}
        className="absolute bottom-0 left-0 right-0 h-[50vh] overflow-hidden pointer-events-none"
        style={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 55, // Net boven blokjes overlay (z-50) zodat marquee zichtbaar blijft
          position: 'fixed', // Fixed zodat het boven de overlay blijft
        }}
      >
        <div className="marquee-content flex whitespace-nowrap" style={{ willChange: 'transform' }}>
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              lang="ko"
              className="korean-text text-6xl md:text-8xl lg:text-9xl font-display font-black mx-8 md:mx-16"
              style={{
                color: KPOP_COLORS.neonPink,
                textShadow: `
                  0 0 8px ${KPOP_COLORS.neonPink},
                  0 0 12px ${KPOP_COLORS.neonPink}88,
                  0 0 16px ${KPOP_COLORS.neonPink}66
                `,
              }}
            >
              환영해요
            </span>
          ))}
        </div>
      </div>
      
      {/* Vertical marquees removed for better performance */}

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes bounce-glow {
            0%, 100% { 
              transform: translateY(0px) scale(1);
            }
            50% { 
              transform: translateY(-15px) scale(1.05);
            }
          }
          
          .animate-bounce-glow img {
            filter: drop-shadow(0 0 30px ${KPOP_COLORS.neonPink}) 
                    drop-shadow(0 0 60px ${KPOP_COLORS.neonPurple}) 
                    drop-shadow(0 0 90px ${KPOP_COLORS.neonBlue});
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          @keyframes pulse-glow {
            0%, 100% {
              filter: drop-shadow(0 0 30px ${KPOP_COLORS.neonPink}) 
                      drop-shadow(0 0 60px ${KPOP_COLORS.neonPurple}) 
                      drop-shadow(0 0 90px ${KPOP_COLORS.neonBlue});
            }
            50% {
              filter: drop-shadow(0 0 40px ${KPOP_COLORS.neonPink}) 
                      drop-shadow(0 0 80px ${KPOP_COLORS.neonPurple}) 
                      drop-shadow(0 0 120px ${KPOP_COLORS.neonBlue});
            }
          }
          
          .animate-bounce-glow {
            animation: bounce-glow 2s ease-in-out infinite;
          }
          
          .star-button-glow img {
            filter: drop-shadow(0 0 20px #FFD700) 
                    drop-shadow(0 0 35px #FFC107) 
                    drop-shadow(0 0 50px #FFA500);
            transition: filter 0.3s ease;
          }
          
          .star-button-glow:hover img {
            filter: drop-shadow(0 0 30px #FFD700) 
                    drop-shadow(0 0 50px #FFC107) 
                    drop-shadow(0 0 70px #FFA500)
                    drop-shadow(0 0 90px #FF8C00);
            animation: pulse-glow-gold 1.5s ease-in-out infinite;
          }
          
          @keyframes pulse-glow-gold {
            0%, 100% {
              filter: drop-shadow(0 0 20px #FFD700) 
                      drop-shadow(0 0 35px #FFC107) 
                      drop-shadow(0 0 50px #FFA500);
            }
            50% {
              filter: drop-shadow(0 0 30px #FFD700) 
                      drop-shadow(0 0 50px #FFC107) 
                      drop-shadow(0 0 70px #FFA500)
                      drop-shadow(0 0 90px #FF8C00);
            }
          }
          
          /* Cat GIF hover effect */
          button.group:hover img {
            filter: drop-shadow(0 0 25px ${KPOP_COLORS.neonPink}) 
                    drop-shadow(0 0 50px ${KPOP_COLORS.neonPurple}) 
                    drop-shadow(0 0 75px ${KPOP_COLORS.neonBlue});
          }
          
          button.group:active img {
            filter: drop-shadow(0 0 35px ${KPOP_COLORS.neonPink}) 
                    drop-shadow(0 0 70px ${KPOP_COLORS.neonPurple}) 
                    drop-shadow(0 0 105px ${KPOP_COLORS.neonBlue})
                    drop-shadow(0 0 140px ${KPOP_COLORS.neonCyan});
          }
          
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
          
          @keyframes fadeInTooltip {
            0% {
              opacity: 0;
              transform: translateY(-10px) scale(0.9);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  )
}
