import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { NeonIconButton } from '../ui/NeonIconButton';

gsap.registerPlugin(TextPlugin);

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
};

// Cat messages array voor naam sectie - roteert bij elke klik
const CAT_NAME_MESSAGES = [
  "Sst! Eerst naam. Kattenregels, sorry",
  "Stop! Eerst naam zeggen, dan praten we verder!",
  "Halt! Wie ben jij eigenlijk? Typ je naam!",
  "Naam eerst! Ik praat niet met onbekenden!",
  "Euh... naam graag, ik vergeet anders wie je bent!",
  "Wacht even! Eerst naam, dan glitter en drama!",
  "Naam invoeren! Geen naam, geen magie!",
  "Ik ben Miyu... en jij bent... uh? Naam nu!",
  "Naam! Nu! Voor ik weer m'n zonnebril verlies!",
];

// Rolling Korean letters background component - Alleen onderste horizontale scrolling
const RollingKoreanBackground = () => {
  const marqueeRef2 = useRef<HTMLDivElement>(null)

  const koreanWords = ['환영', '이름', '마법', '별', '우주', '나', '사랑', '희망']

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
};

interface TheGrandEntranceProps {
  onNameSubmit: (name: string) => void;
  onBack?: () => void;
  initialName?: string;
}

export function WhisperingForest({ onNameSubmit, onBack, initialName = '' }: TheGrandEntranceProps) {
  const [name, setName] = useState(initialName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showCatMessage, setShowCatMessage] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputCardRef = useRef<HTMLDivElement>(null);
  const lightRaysRef = useRef<HTMLDivElement>(null);
  const catMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start entrance animatie direct - container is al zichtbaar
    const timer = setTimeout(() => {
      if (hasAnimated) return; // Al geanimeerd, skip
      
      // Zorg dat refs bestaan
      if (!containerRef.current || !inputCardRef.current || !lightRaysRef.current) {
        return;
      }

      const tl = gsap.timeline();

      // Scene entrance - alleen individuele elementen animeren, container blijft zichtbaar
      gsap.set(inputCardRef.current, { opacity: 0, y: 100, rotateX: -30 });
      gsap.set('.floating-blob', { scale: 0, opacity: 0 });
      gsap.set(lightRaysRef.current, { opacity: 0, scale: 0.5 });

      // Scene entrance - animeren individuele elementen
      // Light rays
      tl.to(lightRaysRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'power2.out'
      })
        // Floating blobs
        .to('.floating-blob', {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          stagger: 0.08,
          ease: 'elastic.out(1, 0.6)'
        }, '-=1')
        // Input card - belangrijkste element, komt als laatste
        .to(inputCardRef.current, {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.2,
          ease: 'power3.out'
        }, '-=0.8');
      
      setHasAnimated(true);
    }, 100); // Korte delay om zeker te zijn dat component gemount is

    // Continuous blob morphing and floating - start direct
    gsap.utils.toArray('.floating-blob').forEach((blob: any, i) => {
      gsap.to(blob, {
        y: `random(-80, 80)`,
        x: `random(-80, 80)`,
        scale: `random(0.7, 1.4)`,
        rotation: `random(-180, 180)`,
        duration: `random(4, 8)`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3
      });
    });

    // Rotate light rays continuously - start direct
    gsap.to(lightRaysRef.current, {
      rotation: 360,
      duration: 40,
      repeat: -1,
      ease: 'none'
    });

    // Pulse light rays - start direct
    gsap.to('.light-ray', {
      opacity: 'random(0.3, 0.7)',
      duration: 'random(2, 4)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.2
    });

    // Gentle floating for input card - start direct
    gsap.to(inputCardRef.current, {
      y: -10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    return () => {
      clearTimeout(timer);
      // Cleanup GSAP animations
      gsap.killTweensOf('.floating-blob');
      gsap.killTweensOf(lightRaysRef.current);
      gsap.killTweensOf('.light-ray');
      gsap.killTweensOf(inputCardRef.current);
    };
  }, [hasAnimated]);

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
      );

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
  }, [showCatMessage, currentMessageIndex]);

  const handleSubmit = () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);

    // Direct submit - laat OnboardingPage de grid blocks transition afhandelen
    // Kleine delay voor visuele feedback
    setTimeout(() => {
      onNameSubmit(name);
    }, 200);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-x-hidden overflow-y-visible w-full flex flex-col items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${KPOP_COLORS.darkBg} 0%, ${KPOP_COLORS.darkBgSecondary} 50%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
        opacity: 1,
      }}
    >
      {/* Rolling Korean Background - Alleen onderste horizontale scrolling */}
      <RollingKoreanBackground />

      {/* Kat - Rechts */}
      <button
        onClick={() => {
          // Als naam al ingevuld is, submit
          if (name.trim()) {
            handleSubmit();
          } else {
            // Toon volgende cat message (roterend)
            if (showCatMessage && catMessageRef.current) {
              // Als bericht al zichtbaar is, verberg het eerst en toon dan volgende
              gsap.to(catMessageRef.current, {
                opacity: 0,
                scale: 0.8,
                y: -20,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                  const nextIndex = (currentMessageIndex + 1) % CAT_NAME_MESSAGES.length
                  setCurrentMessageIndex(nextIndex)
                  setShowCatMessage(true)
                }
              });
            } else {
              // Eerste keer klikken - toon eerste bericht
              const nextIndex = (currentMessageIndex + 1) % CAT_NAME_MESSAGES.length
              setCurrentMessageIndex(nextIndex)
              setShowCatMessage(true)
            }
            // Focus op input veld
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            input?.focus();
          }
        }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-auto h-[30vh] max-h-[300px] object-contain cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 group"
        style={{
          zIndex: 2,
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
        title={name.trim() ? 'Klik om door te gaan' : 'Klik om je naam in te vullen'}
      >
        <img
          src="/cat-from-side-unscreen.gif"
          alt=""
          className="w-full h-full object-contain transition-all duration-300"
          style={{
            filter: 'drop-shadow(0 0 15px rgba(255, 16, 240, 0.5))',
          }}
        />
      </button>
      
      {/* Cat Message - Neon Bordje - Vierkant/rechthoekig vakje - Dicht bij de kat */}
      {showCatMessage && (
        <div
          ref={catMessageRef}
          className="absolute bottom-[calc(50vh-15vh-40px)] z-50 px-6 py-5 rounded-3xl shadow-2xl"
          style={{
            right: 'calc(30vh - 150px)', // Dicht bij de kat (30vh is kat hoogte, -150px om dichterbij te komen)
            background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
            border: `3px solid ${KPOP_COLORS.neonPink}`,
            boxShadow: `
              0 0 20px ${KPOP_COLORS.neonPink}66,
              0 0 40px ${KPOP_COLORS.neonPurple}44,
              inset 0 0 20px ${KPOP_COLORS.neonPink}22
            `,
            width: '320px', // Vaste breedte voor vierkant/rechthoekig vakje
            minHeight: '120px', // Minimale hoogte
            maxHeight: '200px', // Maximale hoogte
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
          <div className="text-center w-full">
            <p
              className="text-lg md:text-xl font-bold"
              style={{
                color: KPOP_COLORS.neonCyan,
                fontFamily: "'Poppins', sans-serif",
                textShadow: `0 0 6px ${KPOP_COLORS.neonCyan}88, 0 0 12px ${KPOP_COLORS.neonCyan}66`,
                lineHeight: '1.5',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
              }}
            >
              {CAT_NAME_MESSAGES[currentMessageIndex]}
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
        {[...Array(5)].map((_, i) => {
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

      {/* Title - Clear neon style */}
      <h1
        className="absolute top-[12%] text-6xl md:text-9xl font-black text-center z-20 px-4"
        style={{
          color: KPOP_COLORS.neonPink,
          fontFamily: "'Noto Sans KR', 'Nunito', sans-serif",
          letterSpacing: '-0.02em',
          textShadow: `0 0 8px ${KPOP_COLORS.neonPink}66, 0 0 16px ${KPOP_COLORS.neonPink}44`,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        }}
      >
        <span lang="ko" className="korean-text">이름이 뭐예요?</span>
      </h1>

      {/* Subtitle - Clear neon style */}
      <p className="absolute top-[22%] text-2xl md:text-3xl font-black text-center z-20 px-4"
        style={{
          color: KPOP_COLORS.neonBlue,
          fontFamily: "'Nunito', sans-serif",
          textShadow: `0 0 8px ${KPOP_COLORS.neonBlue}66, 0 0 16px ${KPOP_COLORS.neonBlue}44`,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        }}>
        What's your name?
      </p>

      {/* Input card - Enhanced Neon K-pop design */}
      <div
        ref={inputCardRef}
        className="relative z-20 w-[90vw] max-w-3xl rounded-3xl p-10 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary}88 0%, ${KPOP_COLORS.darkBgTertiary}88 100%)`,
          border: `3px solid ${KPOP_COLORS.neonPurple}`,
          boxShadow: `
            0 0 30px ${KPOP_COLORS.neonPurple}66,
            0 0 60px ${KPOP_COLORS.neonPurple}44,
            inset 0 0 30px ${KPOP_COLORS.neonPink}22,
            0 0 100px ${KPOP_COLORS.neonCyan}22
          `,
          backdropFilter: 'blur(2px)', // Minimale blur voor duidelijkheid
        }}
      >
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              // Automatisch hoofdletters en behoud blauwe kleur
              const upperValue = e.target.value.toUpperCase();
              setName(upperValue);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="여기에 입력하세요..."
            maxLength={20}
            className="w-full text-center text-5xl md:text-7xl font-display font-black bg-transparent border-none outline-none"
            style={{
              color: KPOP_COLORS.neonBlue,
              caretColor: KPOP_COLORS.neonPink,
              textShadow: `0 0 4px ${KPOP_COLORS.neonBlue}, 0 0 8px ${KPOP_COLORS.neonBlue}88`,
              fontWeight: 900,
              fontFamily: "'Orbitron', sans-serif",
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              letterSpacing: '0.05em',
            }}
            autoFocus
          />

          {/* Enhanced animated underline with pulse - Verminderde glow */}
          <div
            className="absolute bottom-0 left-1/2 h-2 rounded-full transition-all duration-300"
            style={{
              width: name ? '100%' : '70%',
              transform: 'translateX(-50%)',
              background: `linear-gradient(90deg, ${KPOP_COLORS.neonPink} 0%, ${KPOP_COLORS.neonPurple} 50%, ${KPOP_COLORS.neonCyan} 100%)`,
              boxShadow: `
                0 0 8px ${KPOP_COLORS.neonPink}44,
                0 0 12px ${KPOP_COLORS.neonPurple}33
              `,
              animation: name ? 'glow-pulse-subtle 2s ease-in-out infinite' : 'none',
            }}
          />
        </div>

        {/* Character count - Clear neon style */}
        {name.length > 0 && (
          <div 
            className="mt-4 text-center text-sm font-display font-bold"
            style={{ 
              color: KPOP_COLORS.neonCyan,
              textShadow: `0 0 6px ${KPOP_COLORS.neonCyan}88`,
              fontFamily: "'Orbitron', sans-serif",
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
            }}
          >
            {name.length} / 20
          </div>
        )}
      </div>

      {/* Submit button - zelfde stijl als start button met glowing effect */}
      {name.trim() && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 group confirm-button-glow disabled:opacity-50 disabled:cursor-not-allowed"
          title={isSubmitting ? '잠깐만요...' : '계속하기'}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            width: '120px',
            height: '120px',
          }}
        >
          <NeonIconButton
            type="correct"
            onClick={handleSubmit}
            size="lg"
            color="cyan"
            title="Continue"
            style={{ width: '120px', height: '120px' }}
          />
        </button>
      )}


      {/* Helper text */}
      {!name.trim() && !showCatMessage && (
        <div
          className="absolute bottom-24 text-lg md:text-xl font-display font-medium text-center px-4 z-20 flex items-center justify-center gap-3"
          style={{ 
            color: KPOP_COLORS.neonCyan,
            textShadow: `0 0 6px ${KPOP_COLORS.neonCyan}88`,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
          }}
        >
          <img src="/icon_star_alone-removebg-preview.png" alt="" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
          Typ jouw naam om te beginnen
          <img src="/icon_star_alone-removebg-preview.png" alt="" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
        </div>
      )}

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse-glow {
            0%, 100% {
              filter: drop-shadow(0 0 20px ${KPOP_COLORS.neonPink}) 
                      drop-shadow(0 0 40px ${KPOP_COLORS.neonPurple}) 
                      drop-shadow(0 0 60px ${KPOP_COLORS.neonBlue});
            }
            50% {
              filter: drop-shadow(0 0 30px ${KPOP_COLORS.neonPink}) 
                      drop-shadow(0 0 60px ${KPOP_COLORS.neonPurple}) 
                      drop-shadow(0 0 90px ${KPOP_COLORS.neonBlue})
                      drop-shadow(0 0 120px ${KPOP_COLORS.neonCyan});
            }
          }
          
          @keyframes glow-pulse-subtle {
            0%, 100% {
              box-shadow: 
                0 0 8px ${KPOP_COLORS.neonPink}44,
                0 0 12px ${KPOP_COLORS.neonPurple}33;
            }
            50% {
              box-shadow: 
                0 0 10px ${KPOP_COLORS.neonPink}55,
                0 0 15px ${KPOP_COLORS.neonPurple}44;
            }
          }
          
          .confirm-button-glow img {
            filter: drop-shadow(0 0 20px ${KPOP_COLORS.neonPink}) 
                    drop-shadow(0 0 40px ${KPOP_COLORS.neonPurple}) 
                    drop-shadow(0 0 60px ${KPOP_COLORS.neonBlue});
            transition: filter 0.3s ease;
          }
          
          .confirm-button-glow:hover:not(:disabled) img {
            filter: drop-shadow(0 0 30px ${KPOP_COLORS.neonPink}) 
                    drop-shadow(0 0 60px ${KPOP_COLORS.neonPurple}) 
                    drop-shadow(0 0 90px ${KPOP_COLORS.neonBlue})
                    drop-shadow(0 0 120px ${KPOP_COLORS.neonCyan});
            animation: pulse-glow 1.5s ease-in-out infinite;
          }
          
          .confirm-button-glow:active:not(:disabled) img {
            filter: drop-shadow(0 0 40px ${KPOP_COLORS.neonPink}) 
                    drop-shadow(0 0 80px ${KPOP_COLORS.neonPurple}) 
                    drop-shadow(0 0 120px ${KPOP_COLORS.neonBlue})
                    drop-shadow(0 0 160px ${KPOP_COLORS.neonCyan});
          }
          
          /* Neon glowing input text */
          input[type="text"] {
            color: ${KPOP_COLORS.neonBlue} !important;
            -webkit-text-fill-color: ${KPOP_COLORS.neonBlue} !important;
          }
          
          input[type="text"]::placeholder {
            color: rgba(135, 206, 235, 0.5) !important;
            -webkit-text-fill-color: rgba(135, 206, 235, 0.5) !important;
            background: none !important;
            -webkit-background-clip: unset !important;
            background-clip: unset !important;
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
        `}
      </style>
    </div>
  );
}