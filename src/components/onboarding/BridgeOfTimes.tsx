import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { NeonIconButton } from '../ui/NeonIconButton';

// Rolling Korean letters background component - Alleen onderste horizontale scrolling
const RollingKoreanBackground = () => {
  const marqueeRef2 = useRef<HTMLDivElement>(null)

  const koreanWords = ['나이', '시간', '마법', '별', '우주', '여행', '모험', '성장']

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
            duration: 30,
            ease: 'none',
            repeat: -1,
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
  ivory: '#FFFEF7',
  warmBeige: '#F5E6D3',
};

// Cat messages array voor leeftijd sectie - roteert bij elke klik
const CAT_AGE_MESSAGES = [
  "Oké, tijd voor cijfers. Hoe oud is de legende vandaag?",
  "Leeftijd, a.u.b. Katten houden van orde in chaos.",
  "Wees eerlijk, ik hou van cijfers. En snacks.",
  "Hmm... interessant. Jij ziet eruit als iemand met verhalen.",
  "Ik heb een knop voor elke leeftijd. Magie, hé?",
  "Ik moet dit weten. Anders crasht m'n glitterdatabase.",
  "Even checken... jij hoort bij de cool club, welke knop is dat?",
  "Elke leeftijd heeft stijl. Toon mij de jouwe.",
  "Klik gewoon wat klopt. Ik oordeel niet (behalve over mode).",
  "Zeg het met trots. Of zachtjes. Of met jazz-handen.",
  "Welke leeftijd hoort bij die blik? Klik en ik weet genoeg.",
  "Ik verzamel leeftijden. Niet creepy, gewoon professioneel.",
  "Even tellen... nee, zeg jij het maar. Ik ben beter in miauwen.",
  "Elke leeftijd is perfect. Echt waar. Behalve die van mij, ik tel niet.",
  "Geen wiskunde hier. Gewoon klikken. Zo simpel is het.",
  "Zeg je leeftijd en we doen alsof het een geheime code is.",
  "Ik doe niks met je leeftijd... behalve stoer kijken, misschien.",
  "Klaar? Kies maar. Elke knop leidt naar avontuur.",
];

const ageSteps = [
  {
    age: '6-8',
    label: 'Avonturenboek',
    description: 'Dapper & Moedig',
    color: KPOP_COLORS.neonPurple,
    gradient: [KPOP_COLORS.neonPurple, KPOP_COLORS.neonPink],
    tagline: 'Spannende verhalen!',
    icon: '/icon_heart-removebg-preview.png',
  },
  {
    age: '8-10',
    label: 'Wijsheidsboek',
    description: 'Mysterisch & Slim',
    color: KPOP_COLORS.neonBlue,
    gradient: [KPOP_COLORS.neonBlue, KPOP_COLORS.neonCyan],
    tagline: 'Magische mysteries!',
    icon: '/icon_star_moon-removebg-preview.png',
  },
  {
    age: '10-12',
    label: 'Epos',
    description: 'Krachtig & Legendarisch',
    color: KPOP_COLORS.neonCyan,
    gradient: [KPOP_COLORS.neonCyan, KPOP_COLORS.neonBlue],
    tagline: 'Voor echte helden!',
    icon: '/icon_star2-removebg-preview.png',
  },
];

interface TheFloatingStaircaseProps {
  onAgeSelect: (age: string) => void;
  onBack?: () => void;
  currentAge?: string; // Huidige leeftijd van profiel (als die bestaat)
}

export function BridgeOfTimes({ onAgeSelect, onBack }: TheFloatingStaircaseProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showCatMessage, setShowCatMessage] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>(new Array(ageSteps.length).fill(null));
  const catMessageRef = useRef<HTMLDivElement>(null);
  const animationsInitialized = useRef(false);

  useEffect(() => {
    // Only initialize animations once
    if (animationsInitialized.current) return;
    
    // Wait for refs to be set
    const timeoutId = setTimeout(() => {
      const validCards = cardRefs.current.filter((card, i) => card !== null && i < ageSteps.length);
      
      if (validCards.length < ageSteps.length) {
        // Retry once if not all cards are ready
        const retryTimeout = setTimeout(() => {
          const retryCards = cardRefs.current.filter((card, i) => card !== null && i < ageSteps.length);
          if (retryCards.length === ageSteps.length) {
            startAnimations(retryCards);
            animationsInitialized.current = true;
          }
        }, 200);
        return () => clearTimeout(retryTimeout);
      }
      
      startAnimations(validCards);
      animationsInitialized.current = true;
    }, 100);
    
    const startAnimations = (cards: (HTMLDivElement | null)[]) => {
      const validCards = cards.filter(card => card !== null) as HTMLDivElement[];
      
      const tl = gsap.timeline({
        // Disable floating animations for better performance
      });
      
      // Ensure all cards are visible immediately
      validCards.forEach(card => {
        gsap.set(card, { 
          opacity: 1, 
          visibility: 'visible',
          display: 'block',
          y: 0,
          scale: 1
        });
      });
      
      // Minimal animation - just fade in quickly
      tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .to(validCards, {
          opacity: 1,
          stagger: 0.05,
          duration: 0.2,
          ease: 'power2.out',
        }, '-=0.2');
    };
    
    return () => {
      clearTimeout(timeoutId);
      // Clean up floating animations
      cardRefs.current.forEach(card => {
        if (card && (card as any).floatAnimation) {
          (card as any).floatAnimation.kill();
          delete (card as any).floatAnimation;
        }
      });
    };
  }, []);

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
          const nextIndex = (currentMessageIndex + 1) % CAT_AGE_MESSAGES.length
          setCurrentMessageIndex(nextIndex)
          setShowCatMessage(true)
        }
      });
    } else {
      // Eerste keer klikken - toon eerste bericht
      const nextIndex = (currentMessageIndex + 1) % CAT_AGE_MESSAGES.length
      setCurrentMessageIndex(nextIndex)
      setShowCatMessage(true)
    }
  };

  const handleCardSelect = (age: string, index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Filter out null/undefined refs and ensure we only have valid cards
    const validCards = cardRefs.current.filter((card, i) => card !== null && i < ageSteps.length);
    const selectedCard = validCards[index];
    const otherCards = validCards.filter((_, i) => i !== index && i < ageSteps.length);

    if (!selectedCard) {
      setIsAnimating(false);
      return;
    }

    const tl = gsap.timeline({ 
      onComplete: () => {
        setIsAnimating(false);
        onAgeSelect(age);
      }
    });

    // Only animate if we have other cards
    if (otherCards.length > 0) {
      tl.to(otherCards, { 
        opacity: 0, 
        scale: 0.7, 
        y: 50, 
        duration: 0.5, 
        ease: 'power2.in', 
        stagger: 0.05 
      });
    }
    
    tl.to(selectedCard, {
        scale: 1.2,
        y: -30,
        duration: 0.6,
        ease: 'back.out(1.2)'
    }, otherCards.length > 0 ? '<' : '>')
      .to(selectedCard, { 
        scale: 0, 
        opacity: 0, 
        rotation: 360, 
        duration: 0.8, 
        ease: 'power3.in' 
      }, '+=0.2')
      .to(containerRef.current, { opacity: 0, duration: 0.4 }, '-=0.3');
  };

  return (
    <div
      ref={containerRef}
      className="h-screen relative overflow-x-visible overflow-y-hidden w-full flex flex-col items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${KPOP_COLORS.darkBg} 0%, ${KPOP_COLORS.darkBgSecondary} 50%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
        paddingTop: '8vh',
        paddingBottom: '8vh',
        height: '100vh',
        width: '100%',
        maxWidth: '100vw',
        minWidth: '900px',
        overflowX: 'visible',
        overflowY: 'hidden',
      }}
    >
      {/* Static Korean letters background - like StoryGeneratorPage */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(30)].map((_, i) => {
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

      {/* Rolling Korean Background - Alleen onderste horizontale scrolling */}
      <RollingKoreanBackground />

      {/* Cat GIF - Links onderaan, tegen de rand van het scherm */}
      <button
        onClick={handleCatClick}
        className="absolute left-0 bottom-0 w-auto h-[18vh] max-h-[180px] object-contain cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 group"
        style={{
          zIndex: 2,
          background: 'transparent',
          border: 'none',
          padding: 0,
          transform: 'translateY(0)',
        }}
        title="Klik voor een bericht!"
      >
        <img
          src="/cat-normal-unscreen.gif"
          alt=""
          className="w-full h-full object-contain transition-all duration-300"
          style={{
            filter: 'drop-shadow(0 0 15px rgba(255, 16, 240, 0.5))',
          }}
        />
      </button>
      
      {/* Cat Message - Neon Bordje - Rechts van de kat */}
      {showCatMessage && (
        <div
          ref={catMessageRef}
          className="absolute left-[calc(18vh+80px)] bottom-[calc(2vh+20px)] z-50 px-6 py-4 rounded-3xl shadow-2xl"
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
              {CAT_AGE_MESSAGES[currentMessageIndex]}
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

      {/* Background particles / Stars - Reageren op hover */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(60)].map((_, i) => {
          const starColor = ['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF', '#FFD700'][i % 5];
          return (
            <div
              key={`star-${i}`}
              className={`absolute rounded-full star-particle ${hoveredIndex !== null ? 'star-hover' : ''}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 5}px`,
                height: `${1 + Math.random() * 5}px`,
                background: starColor,
                boxShadow: `0 0 ${3 + Math.random() * 8}px ${starColor}`,
                animation: `neon-flicker ${2 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          );
        })}
      </div>

      {/* Title - Neon glow style */}
      <h1
        className="absolute top-[3%] text-3xl md:text-5xl font-black text-center z-20 px-4 glow-text"
        style={{
          color: KPOP_COLORS.neonPink,
          fontFamily: "'Noto Sans KR', 'Nunito', sans-serif",
          letterSpacing: '-0.02em'
        }}
      >
        <span lang="ko" className="korean-text">나이는 몇 살?</span>
      </h1>

      {/* Subtitle - Neon glow */}
      <p className="absolute top-[8%] text-lg md:text-xl font-black text-center z-20 px-4 glow-text"
        style={{
          color: KPOP_COLORS.neonBlue,
          fontFamily: "'Nunito', sans-serif",
        }}>
        Choose your age
      </p>

      {/* Age selection cards - Alle 3 altijd zichtbaar - ook op mobiel - ALTIJD 3 kolommen op desktop */}
      <div 
        className="relative z-20" 
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))',
          gap: '2rem',
          overflow: 'visible', 
          width: '100%',
          maxWidth: '1400px',
          marginTop: 'calc(12vh - 20px)',
          marginBottom: '2vh',
          padding: '0 2rem',
          flexShrink: 0,
          justifyContent: 'center',
          alignItems: 'stretch',
          minWidth: '800px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {ageSteps.map((step, index) => {
          return (
            <div
              key={`age-card-${step.age}-${index}`}
              ref={el => { 
                // Only update if ref actually changed
                if (cardRefs.current[index] !== el) {
                  cardRefs.current[index] = el;
                }
              }}
              onClick={() => handleCardSelect(step.age, index)}
              className="relative cursor-pointer"
              style={{
                minWidth: '200px',
                width: '100%',
                maxWidth: '100%',
                flexShrink: 0,
                display: 'grid', // Use grid instead of block for better layout
                visibility: 'visible',
                opacity: 1,
                position: 'relative',
                gridColumn: `span 1 / span 1`, // Explicitly set grid column
                zIndex: 10 + index, // Ensure proper stacking
              }}
              onMouseEnter={() => {
                setHoveredIndex(index);
                const card = cardRefs.current[index];
                if (card && (card as any).floatAnimation) {
                  // Kill huidige floating animatie
                  (card as any).floatAnimation.kill();
                  // Reset transform properties
                  gsap.set(card, { clearProps: 'transform' });
                  // Animate naar hover positie - gebruik timeline voor betere controle
                  gsap.to(card, {
                    scale: 1.05,
                    y: -12,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: true
                  });
                }
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                const card = cardRefs.current[index];
                if (card) {
                  // Animate terug naar normale positie
                  gsap.to(card, {
                    scale: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: true,
                    onComplete: () => {
                      // Wacht even voordat we floating herstarten
                      setTimeout(() => {
                        if (card) {
                          // Reset transform
                          gsap.set(card, { clearProps: 'transform' });
                          // Herstart floating animatie vanaf y: 0
                          const floatAnimation = gsap.to(card, {
                            y: -8,
                            duration: 2.5 + index * 0.2,
                            repeat: -1,
                            yoyo: true,
                            ease: 'sine.inOut'
                          });
                          (card as any).floatAnimation = floatAnimation;
                        }
                      }, 100);
                    }
                  });
                }
              }}
            >
              {/* Card */}
              <div
                className="relative rounded-2xl md:rounded-3xl p-3 md:p-4 overflow-visible"
                style={{
                  minHeight: '240px',
                  maxHeight: '280px',
                  height: '100%',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                  border: `2px solid ${step.color}`,
                  boxShadow: hoveredIndex === index
                    ? `
                      0 0 20px ${step.color},
                      0 0 40px ${step.color}66,
                      inset 0 0 20px ${step.color}33
                    `
                    : `
                      0 0 10px ${step.color}44,
                      inset 0 0 10px ${step.color}22
                    `
                }}
              >
                {/* Neon glow highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent pointer-events-none" />

                <div className="relative h-full flex flex-col items-center justify-between text-center" style={{ gap: '0.5rem' }}>
                  {/* Icon */}
                  <div className="w-16 h-16 md:w-20 md:h-20 mb-2 flex-shrink-0">
                    <img
                      src={step.icon}
                      alt={step.label}
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center px-2 md:px-3" style={{ minHeight: 0, flexShrink: 1, width: '100%', overflow: 'visible' }}>
                    <h2 
                      className="text-sm md:text-base font-black mb-1"
                      style={{
                        color: '#FFFFFF',
                        fontFamily: "'Poppins', sans-serif",
                        textShadow: `
                          2px 2px 4px rgba(0, 0, 0, 0.8),
                          0 0 8px ${step.color}66,
                          0 0 12px ${step.color}44
                        `,
                        letterSpacing: '0.02em',
                        lineHeight: '1.3',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                        textAlign: 'center',
                        width: '100%',
                        overflow: 'visible',
                        whiteSpace: 'normal'
                      }}>
                      {step.label}
                    </h2>
                    <p className="text-xs md:text-sm font-bold mb-0.5"
                      style={{
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontFamily: "'Poppins', sans-serif",
                        textShadow: `
                          1px 1px 2px rgba(0, 0, 0, 0.8),
                          0 0 6px ${step.color}55
                        `,
                        lineHeight: '1.2',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                      {step.description}
                    </p>
                    <p className="text-[10px] md:text-xs font-medium"
                      style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontFamily: "'Poppins', sans-serif",
                        textShadow: `
                          1px 1px 2px rgba(0, 0, 0, 0.8),
                          0 0 4px ${step.color}44
                        `,
                        lineHeight: '1.2',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                      {step.tagline}
                    </p>
                  </div>

                  {/* Age badge - Neon style, geen witte achtergrond */}
                  <div
                    className="px-6 py-3 rounded-full mt-2 flex-shrink-0"
                    style={{
                      background: 'transparent',
                      border: `3px solid ${step.color}`,
                      boxShadow: `
                        0 0 20px ${step.color}66,
                        0 0 40px ${step.color}44,
                        0 0 60px ${step.color}22
                      `,
                      fontFamily: "'Poppins', sans-serif",
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content',
                      position: 'relative',
                      zIndex: 10
                    }}
                  >
                    <span style={{ 
                      fontSize: '2.5em', 
                      fontWeight: 900,
                      fontFamily: "'Poppins', sans-serif",
                      display: 'inline-block',
                      lineHeight: '1.2',
                      letterSpacing: '0.15em',
                      color: step.color,
                      textShadow: `
                        0 0 15px ${step.color},
                        0 0 30px ${step.color}88,
                        0 0 45px ${step.color}66,
                        0 0 60px ${step.color}44
                      `
                    }}>{step.age}</span>
                    <span style={{
                      fontSize: '1.2em',
                      fontWeight: 700,
                      marginLeft: '0.4em',
                      fontFamily: "'Poppins', sans-serif",
                      letterSpacing: '0.1em',
                      color: step.color,
                      textShadow: `
                        0 0 10px ${step.color}88,
                        0 0 20px ${step.color}66,
                        0 0 30px ${step.color}44
                      `
                    }}>jaar</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>


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

      {/* Helper text */}
      {!showCatMessage && (
        <div
          className="absolute bottom-[calc(20vh+20px)] text-base md:text-lg font-display font-medium text-center px-4 z-20 flex items-center justify-center gap-3 glow-text"
          style={{ color: KPOP_COLORS.neonCyan }}
        >
          <img src="/icon_star_alone-removebg-preview.png" alt="" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
          Kies het niveau dat bij je past
          <img src="/icon_star_alone-removebg-preview.png" alt="" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
        </div>
      )}

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
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
          
          /* Star particles hover effect - Feller en sneller bij hover op cards */
          .star-particle {
            transition: all 0.3s ease;
          }
          
          .star-hover {
            animation-duration: ${1 + Math.random() * 2}s !important;
            box-shadow: 0 0 ${8 + Math.random() * 12}px currentColor, 0 0 ${15 + Math.random() * 20}px currentColor !important;
            transform: scale(${1.2 + Math.random() * 0.3});
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
        `}
      </style>
    </div>
  );
}
