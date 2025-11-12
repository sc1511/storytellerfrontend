import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { AvatarVideo } from '../components/avatar/AvatarVideo';
import { NeonIconButton } from '../components/ui/NeonIconButton';
import { useStoryStore } from '../store/storyStore';
import { useProfileStore } from '../store/profileStore';
import { storyAPI } from '../services/api';
import { detectAvatarId, avatarVideoMap } from '../lib/avatarVideos';
import type { StorySession } from '../types';

type Step = 'character' | 'setting' | 'object' | 'creation' | 'loading' | 'language';

interface Selections {
  character?: { id: string; label: string; nl: string };
  setting?: { id: string; label: string; nl: string };
  customWorldDescription?: string;
  object?: { id: string; label: string; nl: string };
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
  neonYellow: '#FFD700',
};

// Character options
const characters = [
  { id: 'knight', label: 'Ridder', emoji: '🛡️', nl: 'dappere ridder' },
  { id: 'cat', label: 'Kat', emoji: '🐱', nl: 'magische kat' },
  { id: 'astronaut', label: 'Astronaut', emoji: '🚀', nl: 'avontuurlijke astronaut' },
  { id: 'pirate', label: 'Piraat', emoji: '🏴‍☠️', nl: 'stoere piraat' },
  { id: 'wizard', label: 'Tovenaar', emoji: '🧙', nl: 'wijze tovenaar' },
  { id: 'dragon', label: 'Draak', emoji: '🐉', nl: 'vriendelijke draak' },
];

// Setting options
const settings = [
  { id: 'castle', label: 'Kasteel', emoji: '🏰', nl: 'magisch kasteel' },
  { id: 'forest', label: 'Bos', emoji: '🌲', nl: 'betoverd bos' },
  { id: 'space', label: 'Ruimte', emoji: '🌌', nl: 'verre ruimte' },
  { id: 'ocean', label: 'Oceaan', emoji: '🌊', nl: 'diepe oceaan' },
  { id: 'mountain', label: 'Berg', emoji: '⛰️', nl: 'hoge berg' },
  { id: 'city', label: 'Stad', emoji: '🏙️', nl: 'drukke stad' },
];

// Object options
const objects = [
  { id: 'sword', label: 'Zwaard', emoji: '⚔️', nl: 'gouden zwaard' },
  { id: 'ball', label: 'Bal', emoji: '⚽', nl: 'magische bal' },
  { id: 'map', label: 'Kaart', emoji: '🗺️', nl: 'geheime kaart' },
  { id: 'key', label: 'Sleutel', emoji: '🔑', nl: 'mysterieuze sleutel' },
  { id: 'book', label: 'Boek', emoji: '📖', nl: 'oud boek' },
  { id: 'compass', label: 'Kompas', emoji: '🧭', nl: 'glimmend kompas' },
];

// Avatar messages per stap - roteert bij elke klik
const AVATAR_MESSAGES = {
  'start': [
    "Kies eerst een karakter voor je verhaal!",
    "Wie wordt de hoofdpersoon? Klik op KARAKTER!",
    "Begin met het kiezen van een karakter.",
    "Eerst een karakter, dan de rest!",
    "Klik op KARAKTER om te beginnen.",
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
  "Alles klaar? Druk op PLAY en laat het avontuur beginnen!",
  "Let's gooo… druk op PLAY en de woorden rollen binnen!",
  "De fantasie-machine staat te trappelen — klik op PLAY!",
  "Hou je vast — zodra je op PLAY klikt, gaat het echt los!",
  "Klaar om te starten? Eén druk op PLAY en we gaan ervoor!",
]

};

export default function StoryGeneratorPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<Step | null>(null);
  const [selections, setSelections] = useState<Selections>({});
  const [customInputs, setCustomInputs] = useState({
    character: '',
    setting: '',
    object: '',
  });
  const [showAvatarMessage, setShowAvatarMessage] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showTalkingAvatar, setShowTalkingAvatar] = useState(false);
  const { currentProfile, updateProfile } = useProfileStore();
  const { isLoading, error, setLoading, setError, setCurrentSession } = useStoryStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const smokeRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const talkingMessageRef = useRef<HTMLDivElement>(null);

  // Redirect if no profile (ProtectedRoute should handle this, but keep as fallback)
  useEffect(() => {
    if (!currentProfile) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Check if avatar is set - if not, redirect to onboarding to complete it
    // Only redirect if we're actually on the generate page (not just passing through)
    const hasAvatar = currentProfile.avatarCustomization && 
                     typeof currentProfile.avatarCustomization === 'object' && 
                     Object.keys(currentProfile.avatarCustomization).length > 0;
    
    if (!hasAvatar) {
      console.log('No avatar found, redirecting to onboarding');
      navigate('/onboarding', { replace: true });
    }
  }, [currentProfile, navigate]);

  // Helper function to get current step for avatar messages
  const getCurrentStepForAvatar = (): 'start' | 'character' | 'setting' | 'object' | 'creation' => {
    if (activeStep && activeStep !== 'loading' && activeStep !== 'language') {
      if (activeStep === 'character' || activeStep === 'setting' || activeStep === 'object' || activeStep === 'creation') {
        return activeStep;
      }
    }
    if (selections.character && (selections.setting || selections.customWorldDescription) && selections.object) return 'creation';
    if (selections.character && (selections.setting || selections.customWorldDescription)) return 'object';
    if (selections.character) return 'setting';
    return 'start';
  };

  // Geen automatische boodschap - gebruiker moet zelf klikken

  // Animate options when they appear
  useEffect(() => {
    if (activeStep && optionsRef.current) {
      gsap.fromTo(optionsRef.current, 
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [activeStep]);

  // Animate talking avatar when it appears
  useEffect(() => {
    if (showTalkingAvatar) {
      const talkingAvatarContainer = document.querySelector('.talking-avatar-container');
      if (talkingAvatarContainer) {
        gsap.fromTo(talkingAvatarContainer, 
          { opacity: 0, scale: 0.8, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
        );
      }

      // Animate message bubble when it appears
      if (showAvatarMessage && talkingMessageRef.current) {
        gsap.fromTo(talkingMessageRef.current,
          { opacity: 0, scale: 0.8, y: 10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)', delay: 0.2 }
        );
      }

      // Auto-hide after 12 seconds (langer zodat kinderen kunnen lezen)
      const timer = setTimeout(() => {
        const container = document.querySelector('.talking-avatar-container');
        if (container) {
          gsap.to(container, {
            opacity: 0,
            scale: 0.8,
            y: 10,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
              setShowTalkingAvatar(false);
              setShowAvatarMessage(false);
            }
          });
        }
      }, 12000);

      return () => clearTimeout(timer);
    }
  }, [showTalkingAvatar, showAvatarMessage]);

  // Animate smoke effect
  useEffect(() => {
    if (smokeRef.current) {
      const smokeParticles = smokeRef.current?.querySelectorAll('.smoke-particle');
      smokeParticles?.forEach((particle, i) => {
        gsap.to(particle, {
          y: `random(-100, -200)`,
          x: `random(-50, 50)`,
          opacity: `random(0.3, 0.7)`,
          scale: `random(1, 1.5)`,
          duration: `random(3, 6)`,
          repeat: -1,
          ease: 'sine.inOut',
          delay: i * 0.2,
        });
      });
    }
  }, []);

  // Helper function to get emoji from option id
  const getEmojiForOption = (type: 'character' | 'setting' | 'object', id: string): string => {
    if (type === 'character') {
      const option = characters.find(c => c.id === id);
      return option?.emoji || '👤';
    }
    if (type === 'setting') {
      const option = settings.find(s => s.id === id);
      return option?.emoji || '🌍';
    }
    if (type === 'object') {
      const option = objects.find(o => o.id === id);
      return option?.emoji || '✨';
    }
    return '✨';
  };

  // Animate message when it appears
  useEffect(() => {
    if (showAvatarMessage && messageRef.current) {
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
      );

      // Auto-hide after 12 seconds (langer zodat kinderen kunnen lezen)
      const timer = setTimeout(() => {
        if (messageRef.current) {
          gsap.to(messageRef.current, {
            opacity: 0,
            scale: 0.8,
            y: -20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => setShowAvatarMessage(false)
          });
        }
      }, 12000);

      return () => clearTimeout(timer);
    }
  }, [showAvatarMessage, currentMessageIndex, activeStep]);

  // Check of avatar een talking variant heeft
  const hasTalkingVariant = () => {
    if (!currentProfile?.avatarCustomization) return false;
    const avatarId = detectAvatarId(currentProfile.avatarCustomization);
    if (!avatarId || !avatarVideoMap[avatarId]) return false;
    return !!avatarVideoMap[avatarId].talking;
  };

  const handleAvatarClick = () => {
    const currentStep = getCurrentStepForAvatar();
    const messages = AVATAR_MESSAGES[currentStep] || AVATAR_MESSAGES['start'];
    
    // Als avatar een talking variant heeft, toon die rechts onderaan
    if (hasTalkingVariant()) {
      setShowTalkingAvatar(true);
      const nextIndex = (currentMessageIndex + 1) % messages.length;
      setCurrentMessageIndex(nextIndex);
      setShowAvatarMessage(true);
    } else {
      // Oude gedrag: toon message bubble links boven
      if (showAvatarMessage && messageRef.current) {
        gsap.to(messageRef.current, {
          opacity: 0,
          scale: 0.8,
          y: -20,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            const nextIndex = (currentMessageIndex + 1) % messages.length;
            setCurrentMessageIndex(nextIndex);
            setShowAvatarMessage(true);
          }
        });
      } else {
        const nextIndex = (currentMessageIndex + 1) % messages.length;
        setCurrentMessageIndex(nextIndex);
        setShowAvatarMessage(true);
      }
    }
  };


  const handleGenerate = async () => {
    console.log('handleGenerate called', { 
      currentProfile: currentProfile ? { id: currentProfile.id, name: currentProfile.name } : null, 
      selections: {
        character: selections.character?.label,
        setting: selections.setting?.label || selections.customWorldDescription,
        object: selections.object?.label
      }
    });
    
    if (!currentProfile || !selections.character || !selections.object) {
      const missing = [];
      if (!currentProfile) missing.push('profiel');
      if (!selections.character) missing.push('karakter');
      if (!selections.object) missing.push('voorwerp');
      if (!selections.setting && !selections.customWorldDescription) missing.push('plaats');
      
      const errorMsg = `Je moet eerst een ${missing.join(', ')} selecteren voordat je een verhaal kunt maken.`;
      console.warn('Cannot generate: missing required fields', { missing });
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Starting story generation...');
      const settingDescription = selections.customWorldDescription || selections.setting?.nl || 'magische plek';

      // Use displayName for stories (chosen by child), fallback to name if not set
      const storyName = currentProfile.displayName || currentProfile.name || 'Kind';
      
      const response = await storyAPI.createStory({
        character: selections.character.nl,
        setting: settingDescription,
        object: selections.object.nl,
        childName: storyName,
        language: currentProfile.language,
        age: currentProfile.age,
      });

      console.log('📦 Creating session from response:', {
        session_id: response.session_id,
        story_length: response.story?.length || 0,
        has_story: !!response.story,
        next_choices_count: response.next_choices?.length || 0,
        has_metrics: !!response.metrics,
        has_comprehension_questions: !!response.comprehension_questions,
        comprehension_questions_count: response.comprehension_questions?.length || 0
      });

      const newSession: StorySession = {
        session_id: response.session_id,
        story_segments: [
          {
            sequence: response.story_sequence,
            story_text: response.story,
            next_choices: response.next_choices,
            comprehension_questions: response.comprehension_questions,
            metrics: response.metrics,
          },
        ],
        metadata: response.metadata,
        created_at: response.timestamp,
        completed: response.is_conclusion,
      };

      console.log('💾 Saving session to store:', {
        session_id: newSession.session_id,
        segments_count: newSession.story_segments.length,
        first_segment_story_length: newSession.story_segments[0]?.story_text?.length || 0,
        first_segment_has_comprehension_questions: !!newSession.story_segments[0]?.comprehension_questions,
        first_segment_comprehension_questions_count: newSession.story_segments[0]?.comprehension_questions?.length || 0,
        first_segment_comprehension_questions: newSession.story_segments[0]?.comprehension_questions
      });

      // Save session first - ensure it's saved to store
      setCurrentSession(newSession);
      
      // Small delay to ensure session is persisted in store before navigation
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify session is saved before navigating
      const savedSession = useStoryStore.getState().currentSession;
      console.log('✅ Session saved check:', {
        saved: !!savedSession,
        session_id_match: savedSession?.session_id === response.session_id,
        saved_session_id: savedSession?.session_id,
        expected_session_id: response.session_id
      });

      if (!savedSession || savedSession.session_id !== response.session_id) {
        console.warn('⚠️ Session not saved correctly, retrying...');
        setCurrentSession(newSession);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Navigate directly to story page
      console.log('🚀 Story generated successfully, navigating...', response.session_id);
      navigate(`/story/${response.session_id}`, { replace: false });
    } catch (error) {
      console.error('Error generating story:', error);
      
      let errorMessage = 'Er ging iets mis bij het maken van het verhaal';
      
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
          errorMessage = 'Kan niet verbinden met de server. Zorg ervoor dat de backend draait op http://localhost:3000';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Het verhaal duurt te lang om te genereren. Probeer het opnieuw.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterSelect = (char: typeof characters[0]) => {
    setSelections(s => ({...s, character: char}));
    // Modal blijft open zodat gebruiker kan zien dat het geselecteerd is
    // Gebruiker kan zelf modal sluiten
  };

  const handleSettingSelect = (setting: typeof settings[0]) => {
    setSelections(s => ({...s, setting, customWorldDescription: undefined}));
    // Modal blijft open zodat gebruiker kan zien dat het geselecteerd is
    // Gebruiker kan zelf modal sluiten
  };

  const handleObjectSelect = (obj: typeof objects[0]) => {
    setSelections(s => ({...s, object: obj}));
    // Modal blijft open zodat gebruiker kan zien dat het geselecteerd is
    // Gebruiker kan zelf modal sluiten
  };

  const handleCustomInput = (type: 'character' | 'setting' | 'object', value: string) => {
    if (!value.trim()) return;
    
    if (type === 'character') {
      setSelections(s => ({...s, character: { id: 'custom', label: value, nl: value } }));
    } else if (type === 'setting') {
      setSelections(s => ({...s, customWorldDescription: value, setting: undefined }));
    } else if (type === 'object') {
      setSelections(s => ({...s, object: { id: 'custom', label: value, nl: value } }));
    }
    
    setCustomInputs(prev => ({...prev, [type]: '' }));
    // Modal blijft open zodat gebruiker kan zien dat het geselecteerd is
    // Gebruiker kan zelf modal sluiten
  };

  const getOptionsForStep = () => {
    if (activeStep === 'character') return characters;
    if (activeStep === 'setting') return settings;
    if (activeStep === 'object') return objects;
    return [];
  };

  const getColorForStep = () => {
    if (activeStep === 'character') return KPOP_COLORS.neonPurple;
    if (activeStep === 'setting') return KPOP_COLORS.neonCyan;
    if (activeStep === 'object') return KPOP_COLORS.neonPink;
    if (activeStep === 'language') return KPOP_COLORS.neonPurple;
    return KPOP_COLORS.neonPurple; // Default
  };

  const handleLanguageSelect = (language: 'nl' | 'en') => {
    if (currentProfile) {
      updateProfile(currentProfile.id, { language });
      setActiveStep(null);
    }
  };

  if (!currentProfile) return null;

  const canGenerate = selections.character && selections.object && (selections.setting || selections.customWorldDescription);

  return (
    <div 
      ref={containerRef}
      className="story-generator-container h-screen relative overflow-x-hidden overflow-y-hidden" 
      style={{ 
        background: `linear-gradient(135deg, ${KPOP_COLORS.darkBg} 0%, ${KPOP_COLORS.darkBgSecondary} 50%, ${KPOP_COLORS.darkBgTertiary} 100%)` 
      }}
    >
      {/* Ambient background video */}
      <video
        src="/kidscreatingstorycatreading.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-10 pointer-events-none z-0"
        style={{ zIndex: 0 }}
      />
      
      {/* Korean Letters Background - Scattered and Glowing */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(20)].map((_, i) => {
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

      {/* Neon Geometric Shapes and Lines */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {/* Diagonal lines */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${100 + Math.random() * 200}px`,
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${[KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan][i % 4]}66, transparent)`,
              transform: `rotate(${-45 + Math.random() * 90}deg)`,
              boxShadow: `0 0 10px ${[KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan][i % 4]}44`,
              opacity: 0.3 + Math.random() * 0.3,
            }}
          />
        ))}
        
        {/* Geometric shapes */}
        {[...Array(12)].map((_, i) => {
          const colors = [KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan];
          const color = colors[i % colors.length];
          const size = 20 + Math.random() * 40;
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
                  0 0 15px ${color}66,
                  0 0 30px ${color}44,
                  inset 0 0 15px ${color}22
                `,
                opacity: 0.2 + Math.random() * 0.3,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* Background particles / Stars */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 4}px`,
              height: `${1 + Math.random() * 4}px`,
              background: ['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF', '#FFD700'][i % 5],
              boxShadow: `0 0 ${2 + Math.random() * 6}px ${['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF', '#FFD700'][i % 5]}`,
              animation: `neon-flicker ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col items-center justify-start p-4 md:p-6" style={{ zIndex: 10, paddingBottom: '1.5rem', marginBottom: 0, overflowX: 'hidden', overflowY: 'visible', paddingTop: '0.5rem' }}>
        
        {/* Back button - Links boven - Terug naar onboarding om profiel te bewerken */}
        <button
          onClick={() => navigate('/onboarding')}
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
            onClick={() => navigate('/onboarding')}
            size="lg"
            color="purple"
            title="Terug"
            style={{ width: '80px', height: '80px' }}
          />
        </button>
        
        {/* Title - Orbitron font zoals leeftijden */}
        <h1 className="text-3xl md:text-4xl font-black text-center mb-1 mt-0 glow-text" style={{
          color: KPOP_COLORS.neonCyan,
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1.75rem',
          fontWeight: 900,
          letterSpacing: '0.15em',
          textShadow: `0 0 10px ${KPOP_COLORS.neonCyan}, 0 0 20px ${KPOP_COLORS.neonCyan}66, 0 0 30px ${KPOP_COLORS.neonCyan}44`,
        }}>
          VERHALEN MAKEN
        </h1>
        <p className="text-sm md:text-base text-white/70 mb-2 text-center" style={{
          fontFamily: "'Poppins', sans-serif",
        }}>
          Creëer jouw eigen unieke verhaal
        </p>

        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-1" style={{ maxHeight: 'calc(100vh - 120px)', overflowX: 'hidden', overflowY: 'visible', minHeight: 0, width: '100%' }}>
          
          {/* LEFT COLUMN - Avatar */}
          <div className="flex flex-col items-center relative" style={{ overflow: 'visible', paddingBottom: '0.5rem', marginBottom: '0.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
            <div className="relative">
              {/* "Kan ik je helpen?" Bubble - Boven/naast avatar */}
              {!showAvatarMessage && (
                <div 
                  className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-2xl z-20"
                  style={{
                    background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                    border: `2px solid ${KPOP_COLORS.neonPink}`,
                    boxShadow: `
                      0 0 15px ${KPOP_COLORS.neonPink}66,
                      0 0 30px ${KPOP_COLORS.neonPurple}44,
                      inset 0 0 15px ${KPOP_COLORS.neonPink}22
                    `,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {/* Speech bubble tail */}
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                    style={{
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: `12px solid ${KPOP_COLORS.neonPink}`,
                      filter: `drop-shadow(0 0 8px ${KPOP_COLORS.neonPink}66)`,
                    }}
                  />
                  <p
                    className="text-sm font-bold glow-text text-center"
                    style={{
                      color: KPOP_COLORS.neonCyan,
                      fontFamily: "'Poppins', sans-serif",
                      textShadow: `0 0 8px ${KPOP_COLORS.neonCyan}, 0 0 16px ${KPOP_COLORS.neonCyan}66`,
                    }}
                  >
                    Kan ik je helpen?
                  </p>
                </div>
              )}

              <button
                onClick={handleAvatarClick}
                className="relative cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
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

                {/* Avatar - Avatar zelf groter gemaakt door padding te verkleinen */}
                <div 
                  ref={avatarRef}
                  className={`relative ${currentProfile?.avatarCustomization && (detectAvatarId(currentProfile.avatarCustomization) === 'stitch' || detectAvatarId(currentProfile.avatarCustomization) === 'spiderman') ? 'w-48 h-48 md:w-56 md:h-56' : 'w-40 h-40 md:w-48 md:h-48'} ${currentProfile?.avatarCustomization && (detectAvatarId(currentProfile.avatarCustomization) === 'stitch' || detectAvatarId(currentProfile.avatarCustomization) === 'spiderman') ? 'rounded-3xl' : 'rounded-full'} z-10`}
                  style={{
                    border: `4px solid ${KPOP_COLORS.neonYellow}`,
                    boxShadow: `0 0 30px ${KPOP_COLORS.neonYellow}66`,
                    filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
                    overflow: currentProfile?.avatarCustomization && detectAvatarId(currentProfile.avatarCustomization) === 'stitch' ? 'visible' : 'hidden',
                    padding: currentProfile?.avatarCustomization && detectAvatarId(currentProfile.avatarCustomization) === 'stitch' ? '2px' : '2px',
                  }}
                >
                  {currentProfile.avatarCustomization ? (
                    <div 
                      className={`w-full h-full ${detectAvatarId(currentProfile.avatarCustomization) === 'stitch' || detectAvatarId(currentProfile.avatarCustomization) === 'spiderman' ? 'rounded-3xl' : 'rounded-full'} overflow-visible`}
                      style={{
                        padding: detectAvatarId(currentProfile.avatarCustomization) === 'stitch' || detectAvatarId(currentProfile.avatarCustomization) === 'spiderman' ? '2%' : '0',
                      }}
                    >
                      <AvatarVideo
                        customization={currentProfile.avatarCustomization}
                        context="default"
                        autoplay
                        loop
                        muted
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-4xl">
                      {currentProfile.avatar || '👤'}
                    </div>
                  )}
                </div>
              </button>
            </div>

            <div className="mt-3 text-center w-full relative" style={{ minHeight: showAvatarMessage ? '200px' : 'auto', maxHeight: 'none', overflow: 'visible', paddingBottom: '0.5rem', marginBottom: '0.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
              <p className="text-base text-white/70 mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.1rem' }}>Klaar om een verhaal te maken!</p>
              
              {/* Avatar Message - Neon Bordje - Boven de input velden - Alleen bij klik - Groter - Alleen als avatar GEEN talking variant heeft */}
              {showAvatarMessage && !hasTalkingVariant() && (
                <div
                  ref={messageRef}
                  className="relative w-full px-6 py-4 rounded-xl shadow-2xl mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                    border: `3px solid ${KPOP_COLORS.neonPink}`,
                    boxShadow: `
                      0 0 20px ${KPOP_COLORS.neonPink}66,
                      0 0 40px ${KPOP_COLORS.neonPurple}44,
                      inset 0 0 20px ${KPOP_COLORS.neonPink}22
                    `,
                    cursor: 'pointer',
                    zIndex: 100,
                    maxHeight: '180px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                  }}
                  onClick={() => {
                    if (messageRef.current) {
                      gsap.to(messageRef.current, {
                        opacity: 0,
                        scale: 0.8,
                        y: -20,
                        duration: 0.3,
                        ease: 'power2.in',
                        onComplete: () => setShowAvatarMessage(false)
                      });
                    }
                  }}
                >
                  <p
                    className="text-lg font-bold glow-text text-left"
                    style={{
                      color: KPOP_COLORS.neonCyan,
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '1.25rem',
                      textShadow: `0 0 10px ${KPOP_COLORS.neonCyan}, 0 0 20px ${KPOP_COLORS.neonCyan}66`,
                      lineHeight: '1.5',
                      wordWrap: 'break-word',
                      whiteSpace: 'normal',
                    }}
                  >
                    {AVATAR_MESSAGES[getCurrentStepForAvatar()]?.[currentMessageIndex] || AVATAR_MESSAGES['start'][currentMessageIndex]}
                  </p>
                  
                  {/* Pulsing glow ring */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      border: `2px solid ${KPOP_COLORS.neonPurple}`,
                      opacity: 0.6,
                      animation: 'pulse-glow-border 2s ease-in-out infinite',
                    }}
                  />
                </div>
              )}
              
              {/* Naam, Leeftijd, Taal - Orbitron font voor leeftijd */}
              <div className="flex flex-col gap-2 mt-2" style={{ marginBottom: 0, paddingBottom: '0.5rem', overflow: 'visible' }}>
                {/* Naam - Eerst */}
                <div className="px-3 py-2 rounded-xl" style={{
                  background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                  border: `2px solid ${KPOP_COLORS.neonYellow}44`,
                }}>
                  <div className="text-sm text-white/70 mb-1" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.875rem' }}>Naam</div>
                  <div className="text-lg font-bold glow-text" style={{
                    color: KPOP_COLORS.neonYellow,
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '1.125rem',
                    textShadow: `0 0 10px ${KPOP_COLORS.neonYellow}66`,
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                  }}>{currentProfile.displayName || currentProfile.name || 'Kind'}</div>
                </div>
                
                {/* Leeftijd - Tweede */}
                <div className="px-3 py-2 rounded-xl" style={{
                  background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                  border: `2px solid ${KPOP_COLORS.neonCyan}44`,
                }}>
                  <div className="text-sm text-white/70 mb-1" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.875rem' }}>Leeftijd</div>
                  <div className="text-lg font-bold glow-text" style={{
                    color: KPOP_COLORS.neonCyan,
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textShadow: `0 0 10px ${KPOP_COLORS.neonCyan}, 0 0 20px ${KPOP_COLORS.neonCyan}66`,
                  }}>{currentProfile.age}</div>
                </div>
                
                {/* Taal - Derde - Klikbaar - Exact zelfde grootte als Leeftijd */}
                <button
                  onClick={() => setActiveStep('language')}
                  className="rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer px-3 py-2 w-full"
                  style={{
                    background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                    border: `2px solid ${KPOP_COLORS.neonPurple}44`,
                    display: 'block',
                    boxSizing: 'border-box',
                    margin: 0,
                    textAlign: 'center',
                    fontFamily: 'inherit',
                    minWidth: 'auto',
                    minHeight: 'auto',
                    width: '100%',
                  }}
                  title="Klik om taal te wijzigen"
                >
                  <div className="text-sm text-white/70 mb-1 text-center" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.875rem' }}>Taal</div>
                  <div className="text-lg font-bold glow-text text-center" style={{
                    color: KPOP_COLORS.neonPurple,
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '1.125rem',
                    textShadow: `0 0 10px ${KPOP_COLORS.neonPurple}66`,
                  }}>{currentProfile.language === 'nl' ? 'Nederlands' : 'English'}</div>
                </button>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - 3 Main Buttons */}
          <div className="flex flex-col gap-1.5 items-center">
            {/* KARAKTER Button - Orbitron font */}
            <button
              onClick={() => setActiveStep(activeStep === 'character' ? null : 'character')}
              className="w-full px-6 py-1 rounded-3xl font-black transition-all hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                border: `3px solid ${selections.character ? KPOP_COLORS.neonPurple : KPOP_COLORS.neonPurple}66`,
                boxShadow: selections.character 
                  ? `0 0 20px ${KPOP_COLORS.neonPurple}66, 0 0 40px ${KPOP_COLORS.neonPurple}44, inset 0 0 20px ${KPOP_COLORS.neonPurple}22`
                  : `0 0 10px ${KPOP_COLORS.neonPurple}44`,
                color: KPOP_COLORS.neonPurple,
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 900,
                letterSpacing: '0.15em',
                textShadow: `0 0 10px ${KPOP_COLORS.neonPurple}, 0 0 20px ${KPOP_COLORS.neonPurple}66`,
                lineHeight: '1.2',
              }}
            >
              KARAKTER
            </button>

            {/* PLAATS Button - Orbitron font */}
            <button
              onClick={() => selections.character && setActiveStep(activeStep === 'setting' ? null : 'setting')}
              disabled={!selections.character}
              className="w-full px-6 py-1 rounded-3xl font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                border: `3px solid ${(selections.setting || selections.customWorldDescription) ? KPOP_COLORS.neonCyan : KPOP_COLORS.neonCyan}66`,
                boxShadow: (selections.setting || selections.customWorldDescription)
                  ? `0 0 20px ${KPOP_COLORS.neonCyan}66, 0 0 40px ${KPOP_COLORS.neonCyan}44, inset 0 0 20px ${KPOP_COLORS.neonCyan}22`
                  : `0 0 10px ${KPOP_COLORS.neonCyan}44`,
                color: KPOP_COLORS.neonCyan,
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 900,
                letterSpacing: '0.15em',
                textShadow: `0 0 10px ${KPOP_COLORS.neonCyan}, 0 0 20px ${KPOP_COLORS.neonCyan}66`,
                lineHeight: '1.2',
              }}
            >
              PLAATS
            </button>

            {/* VOORWERP Button - Orbitron font */}
            <button
              onClick={() => (selections.setting || selections.customWorldDescription) && setActiveStep(activeStep === 'object' ? null : 'object')}
              disabled={!(selections.setting || selections.customWorldDescription)}
              className="w-full px-6 py-1 rounded-3xl font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                border: `3px solid ${selections.object ? KPOP_COLORS.neonPink : KPOP_COLORS.neonPink}66`,
                boxShadow: selections.object
                  ? `0 0 20px ${KPOP_COLORS.neonPink}66, 0 0 40px ${KPOP_COLORS.neonPink}44, inset 0 0 20px ${KPOP_COLORS.neonPink}22`
                  : `0 0 10px ${KPOP_COLORS.neonPink}44`,
                color: KPOP_COLORS.neonPink,
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 900,
                letterSpacing: '0.15em',
                textShadow: `0 0 10px ${KPOP_COLORS.neonPink}, 0 0 20px ${KPOP_COLORS.neonPink}66`,
                lineHeight: '1.2',
              }}
            >
              VOORWERP
            </button>
          </div>

          {/* RIGHT COLUMN - Preview Grid - Alleen tekst, niet klikbaar */}
          <div className="flex flex-col" style={{ overflow: 'hidden', minHeight: 0 }}>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 glow-text" style={{
              color: KPOP_COLORS.neonCyan,
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}>
              <NeonIconButton type="star" size="sm" color="cyan" style={{ width: '18px', height: '18px' }} />
              JOUW VERHAAL
            </h3>
            
            <div className="flex flex-col gap-1.5" style={{ overflow: 'hidden' }}>
              {/* Karakter - Klikbaar */}
              <button
                onClick={() => setActiveStep(activeStep === 'character' ? null : 'character')}
                className="rounded-xl p-2 min-h-[60px] flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                border: `2px solid ${selections.character ? KPOP_COLORS.neonPurple : KPOP_COLORS.neonPurple}44`,
                boxShadow: selections.character ? `0 0 15px ${KPOP_COLORS.neonPurple}44` : `0 0 5px ${KPOP_COLORS.neonPurple}22`,
                }}
              >
                {!selections.character ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <NeonIconButton type="plus" size="sm" color="purple" style={{ width: '16px', height: '16px' }} />
                    <div className="text-sm text-white/70" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.875rem' }}>Karakter</div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 relative">
                    <div className="text-2xl mb-1">{getEmojiForOption('character', selections.character.id)}</div>
                    <div className="text-sm text-white/70 mb-1" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.875rem' }}>Karakter</div>
                    <div className="text-sm text-white font-bold text-center glow-text" style={{
                      fontSize: '0.875rem',
                      color: KPOP_COLORS.neonPurple,
                      fontFamily: "'Poppins', sans-serif",
                    }}>{selections.character.label}</div>
                    {/* Rotating star icon */}
                    <div className="absolute top-1 right-1" style={{ animation: 'starRotateRight 2s linear infinite' }}>
                      <NeonIconButton type="star" size="sm" color="purple" style={{ width: '16px', height: '16px' }} />
                  </div>
              </div>
                )}
              </button>

              {/* Plaats - Klikbaar */}
              <button
                onClick={() => selections.character && setActiveStep(activeStep === 'setting' ? null : 'setting')}
                disabled={!selections.character}
                className="rounded-xl p-2 min-h-[60px] flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                border: `2px solid ${(selections.setting || selections.customWorldDescription) ? KPOP_COLORS.neonCyan : KPOP_COLORS.neonCyan}44`,
                boxShadow: (selections.setting || selections.customWorldDescription) ? `0 0 15px ${KPOP_COLORS.neonCyan}44` : `0 0 5px ${KPOP_COLORS.neonCyan}22`,
                }}
              >
                {!(selections.setting || selections.customWorldDescription) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <NeonIconButton type="plus" size="sm" color="cyan" style={{ width: '16px', height: '16px' }} />
                    <div className="text-sm text-white/70" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.875rem' }}>Plaats</div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 relative">
                    <div className="text-2xl mb-1">{selections.setting ? getEmojiForOption('setting', selections.setting.id) : '🌍'}</div>
                    <div className="text-sm text-white/70 mb-1" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.875rem' }}>Plaats</div>
                    <div className="text-sm text-white font-bold text-center glow-text" style={{
                      fontSize: '0.875rem',
                      color: KPOP_COLORS.neonCyan,
                      fontFamily: "'Poppins', sans-serif",
                    }}>{selections.setting?.label || selections.customWorldDescription}</div>
                    {/* Rotating star icon */}
                    <div className="absolute top-1 right-1" style={{ animation: 'starRotateRight 2s linear infinite' }}>
                      <NeonIconButton type="star" size="sm" color="cyan" style={{ width: '16px', height: '16px' }} />
                  </div>
              </div>
                )}
              </button>

              {/* Voorwerp - Klikbaar */}
              <button
                onClick={() => (selections.setting || selections.customWorldDescription) && setActiveStep(activeStep === 'object' ? null : 'object')}
                disabled={!(selections.setting || selections.customWorldDescription)}
                className="rounded-xl p-2 min-h-[60px] flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                border: `2px solid ${selections.object ? KPOP_COLORS.neonPink : KPOP_COLORS.neonPink}44`,
                boxShadow: selections.object ? `0 0 15px ${KPOP_COLORS.neonPink}44` : `0 0 5px ${KPOP_COLORS.neonPink}22`,
                }}
              >
                {!selections.object ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <NeonIconButton type="plus" size="sm" color="pink" style={{ width: '16px', height: '16px' }} />
                    <div className="text-sm text-white/70" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.875rem' }}>Voorwerp</div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 relative">
                    <div className="text-2xl mb-1">{getEmojiForOption('object', selections.object.id)}</div>
                    <div className="text-sm text-white/70 mb-1" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.875rem' }}>Voorwerp</div>
                    <div className="text-sm text-white font-bold text-center glow-text" style={{
                      fontSize: '0.875rem',
                      color: KPOP_COLORS.neonPink,
                      fontFamily: "'Poppins', sans-serif",
                    }}>{selections.object.label}</div>
                    {/* Rotating star icon */}
                    <div className="absolute top-1 right-1" style={{ animation: 'starRotateRight 2s linear infinite' }}>
                      <NeonIconButton type="star" size="sm" color="pink" style={{ width: '16px', height: '16px' }} />
                  </div>
              </div>
                )}
              </button>

              {/* Play Button */}
              {canGenerate && (
                <div className="flex justify-center mt-2">
                  <div
                    className="group"
                    style={{
                      width: '80px',
                      height: '80px',
                      perspective: '1000px',
                      pointerEvents: 'auto',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                        animation: 'playRotateRight 3s ease-in-out infinite',
                        pointerEvents: 'none',
                      }}
                    >
                      <NeonIconButton
                        type="play"
                        onClick={() => {
                          console.log('Play button clicked');
                          handleGenerate();
                        }}
                        size="xl"
                        color="multi"
                        title="Spelen"
                        style={{ width: '80px', height: '80px', pointerEvents: 'auto' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Talking Avatar - ONDER "JOUW VERHAAL" - Alleen voor avatars met talking variant */}
            {showTalkingAvatar && hasTalkingVariant() && currentProfile?.avatarCustomization && (
              <div className="talking-avatar-container flex flex-row items-center gap-3 mt-3 w-full" style={{ flexShrink: 0, overflow: 'visible', justifyContent: 'flex-start', zIndex: 1000, position: 'relative', visibility: 'visible', opacity: 1 }}>
                {/* Talking Avatar GIF - Transparant, zonder neon - Groter voor Stitch */}
                <div 
                  className="relative"
                  style={{
                    width: detectAvatarId(currentProfile.avatarCustomization) === 'stitch' ? '120px' : '80px',
                    height: detectAvatarId(currentProfile.avatarCustomization) === 'stitch' ? '120px' : '80px',
                    backgroundColor: 'transparent',
                    flexShrink: 0,
                  }}
                >
                  <AvatarVideo
                    customization={currentProfile.avatarCustomization}
                    context="talking"
                    autoplay
                    loop
                    muted
                    className="w-full h-full"
                  />
                </div>
                
                {/* Text Bubble - Rechts naast de talking avatar - Volledig zichtbaar */}
                {showAvatarMessage && (
                  <div
                    ref={talkingMessageRef}
                    className="relative px-4 py-2 rounded-xl shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                      border: `2px solid ${KPOP_COLORS.neonPink}44`,
                      boxShadow: `
                        0 0 15px ${KPOP_COLORS.neonPink}44,
                        0 0 30px ${KPOP_COLORS.neonPurple}33,
                        inset 0 0 15px ${KPOP_COLORS.neonPink}22
                      `,
                      cursor: 'pointer',
                      maxWidth: '300px',
                      minWidth: '150px',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      zIndex: 1001,
                      position: 'relative',
                      pointerEvents: 'auto',
                    }}
                    onClick={() => {
                      if (talkingMessageRef.current) {
                        gsap.to(talkingMessageRef.current, {
                          opacity: 0,
                          scale: 0.8,
                          y: -10,
                          duration: 0.3,
                          ease: 'power2.in',
                          onComplete: () => {
                            setShowAvatarMessage(false);
                            setShowTalkingAvatar(false);
                          }
                        });
                      }
                    }}
                  >
                    <p
                      className="text-sm font-bold text-left"
                      style={{
                        color: KPOP_COLORS.neonCyan,
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '0.875rem',
                        textShadow: `0 0 8px ${KPOP_COLORS.neonCyan}66`,
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                      }}
                    >
                      {AVATAR_MESSAGES[getCurrentStepForAvatar()]?.[currentMessageIndex] || AVATAR_MESSAGES['start'][currentMessageIndex]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Options Panel - Appears when button is clicked - KLEINER */}
        {activeStep && (
          <div 
            ref={optionsRef}
            className="absolute inset-0 flex items-center justify-center z-30 p-4"
            style={{
              background: 'rgba(10, 10, 26, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
            onClick={() => setActiveStep(null)}
          >
            <div 
              className="relative w-full max-w-xl rounded-2xl p-3"
              style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                border: `3px solid ${getColorForStep()}`,
                boxShadow: `0 0 30px ${getColorForStep()}66, 0 0 60px ${getColorForStep()}44`,
                maxHeight: 'calc(100vh - 2rem)',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button - Icon only - Groter en helemaal rechtsboven in de hoek, op de border */}
              <button
                onClick={() => setActiveStep(null)}
                className="absolute group transition-all hover:scale-110 active:scale-95 z-50"
                title="Sluiten"
                style={{
                  top: '4px',
                  right: '4px',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  width: '28px',
                  height: '28px',
                  minWidth: '28px',
                  minHeight: '28px',
                  maxWidth: '28px',
                  maxHeight: '28px',
                }}
              >
                <NeonIconButton
                  type="close"
                  size="md"
                  color={activeStep === 'character' ? 'purple' : activeStep === 'setting' ? 'cyan' : activeStep === 'object' ? 'pink' : 'blue'}
                  style={{
                    width: '28px',
                    height: '28px',
                    minWidth: '28px',
                    minHeight: '28px',
                    maxWidth: '28px',
                    maxHeight: '28px',
                  }}
                />
              </button>

              {/* Title - Orbitron font - Kleiner */}
              <h2 className="text-lg md:text-xl font-black text-center mb-2 glow-text" style={{
                color: getColorForStep(),
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '1.2rem',
                fontWeight: 900,
                letterSpacing: '0.1em',
                textShadow: `0 0 10px ${getColorForStep()}, 0 0 20px ${getColorForStep()}66`,
                flexShrink: 0,
              }}>
                {activeStep === 'character' && 'KIES JE KARAKTER'}
                {activeStep === 'setting' && 'KIES DE PLAATS'}
                {activeStep === 'object' && 'KIES EEN VOORWERP'}
                {activeStep === 'language' && 'KIES JE TAAL'}
              </h2>

              {/* Language Selection - Special case - Kleiner */}
              {activeStep === 'language' ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2" style={{ flex: 1 }}>
                  <button
                    onClick={() => handleLanguageSelect('nl')}
                    className="group transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <div
                      className="relative px-8 py-6 rounded-2xl shadow-2xl transition-transform duration-300 group-hover:translate-y-[-4px] group-active:translate-y-[2px] glow-border"
                      style={{
                        background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                        border: `2px solid ${currentProfile?.language === 'nl' ? KPOP_COLORS.neonPink : KPOP_COLORS.neonPink}44`,
                        boxShadow: currentProfile?.language === 'nl'
                          ? `0 0 20px ${KPOP_COLORS.neonPink}, 0 0 40px ${KPOP_COLORS.neonPink}66, inset 0 0 20px ${KPOP_COLORS.neonPink}33`
                          : `0 0 10px ${KPOP_COLORS.neonPink}44, inset 0 0 10px ${KPOP_COLORS.neonPink}22`,
                      }}
                    >
                      <div className="relative">
                        <div 
                          className="text-3xl md:text-4xl mb-1 font-black"
                          style={{ 
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '1.5em',
                            fontWeight: 900,
                            letterSpacing: '0.15em',
                            color: KPOP_COLORS.neonPink,
                            textShadow: `0 0 10px ${KPOP_COLORS.neonPink}, 0 0 20px ${KPOP_COLORS.neonPink}66`,
                          }}>
                          NL
                        </div>
                        <div 
                          className="text-sm md:text-base font-black glow-text"
                          style={{ 
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 700,
                            color: '#ffffff',
                            textShadow: `0 0 10px ${KPOP_COLORS.neonPink}66`,
                          }}>
                          Nederlands
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLanguageSelect('en')}
                    className="group transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <div
                      className="relative px-8 py-6 rounded-2xl shadow-2xl transition-transform duration-300 group-hover:translate-y-[-4px] group-active:translate-y-[2px] glow-border"
                      style={{
                        background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                        border: `2px solid ${currentProfile?.language === 'en' ? KPOP_COLORS.neonBlue : KPOP_COLORS.neonBlue}44`,
                        boxShadow: currentProfile?.language === 'en'
                          ? `0 0 20px ${KPOP_COLORS.neonBlue}, 0 0 40px ${KPOP_COLORS.neonBlue}66, inset 0 0 20px ${KPOP_COLORS.neonBlue}33`
                          : `0 0 10px ${KPOP_COLORS.neonBlue}44, inset 0 0 10px ${KPOP_COLORS.neonBlue}22`,
                      }}
                    >
                      <div className="relative">
                        <div 
                          className="text-3xl md:text-4xl mb-1 font-black"
                          style={{ 
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '1.5em',
                            fontWeight: 900,
                            letterSpacing: '0.15em',
                            color: KPOP_COLORS.neonBlue,
                            textShadow: `0 0 10px ${KPOP_COLORS.neonBlue}, 0 0 20px ${KPOP_COLORS.neonBlue}66`,
                          }}>
                          EN
                        </div>
                        <div 
                          className="text-sm md:text-base font-black glow-text"
                          style={{ 
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 700,
                            color: '#ffffff',
                            textShadow: `0 0 10px ${KPOP_COLORS.neonBlue}66`,
                          }}>
                          English
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                /* Options Grid - Compacter - Geen scroll */
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2" style={{ flex: 1, overflow: 'visible' }}>
                  {getOptionsForStep().map((option) => {
                  // Check of deze optie geselecteerd is
                  const isSelected = 
                    (activeStep === 'character' && selections.character?.id === option.id) ||
                    (activeStep === 'setting' && selections.setting?.id === option.id) ||
                    (activeStep === 'object' && selections.object?.id === option.id);
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (activeStep === 'character') handleCharacterSelect(option);
                        if (activeStep === 'setting') handleSettingSelect(option);
                        if (activeStep === 'object') handleObjectSelect(option);
                      }}
                      className="rounded-lg p-2 transition-all hover:scale-105 active:scale-95 relative"
                      style={{
                        background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                        border: isSelected 
                          ? `3px solid ${getColorForStep()}`
                          : `2px solid ${getColorForStep()}44`,
                        boxShadow: isSelected
                          ? `0 0 20px ${getColorForStep()}66, 0 0 40px ${getColorForStep()}44, inset 0 0 20px ${getColorForStep()}22`
                          : `0 0 10px ${getColorForStep()}22`,
                      }}
                    >
                      <div className="text-xl mb-0.5">{option.emoji}</div>
                      <div className="text-[10px] font-bold text-white leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{option.label}</div>
                    </button>
                  );
                })}
                </div>
              )}

              {/* Custom Input - Altijd zichtbaar onder opties - Niet voor language */}
              {activeStep && (activeStep === 'character' || activeStep === 'setting' || activeStep === 'object') && (
                <div className="mt-1 flex flex-col items-center justify-center relative" style={{ flexShrink: 0, minHeight: '120px' }}>
                  <div className="w-full relative mb-4">
                    <input
                      type="text"
                      value={customInputs[activeStep] || ''}
                      onChange={(e) => {
                        // Wanneer je begint te typen, wis de selectie
                        if (e.target.value.trim() && !customInputs[activeStep]) {
                          if (activeStep === 'character') setSelections(s => ({...s, character: undefined}));
                          if (activeStep === 'setting') setSelections(s => ({...s, setting: undefined, customWorldDescription: undefined}));
                          if (activeStep === 'object') setSelections(s => ({...s, object: undefined}));
                        }
                        setCustomInputs(prev => ({...prev, [activeStep]: e.target.value}));
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && customInputs[activeStep]?.trim()) {
                          handleCustomInput(activeStep, customInputs[activeStep].trim());
                        }
                      }}
                      placeholder={`Of typ je eigen ${activeStep === 'character' ? 'karakter' : activeStep === 'setting' ? 'plaats' : 'voorwerp'}...`}
                      className="w-full px-3 py-2 rounded-lg text-white placeholder-white/50 focus:outline-none"
                      style={{
                        background: `${KPOP_COLORS.darkBgSecondary}`,
                        border: `2px solid ${getColorForStep()}44`,
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '16px',
                        fontWeight: 700,
                        color: getColorForStep(),
                        textShadow: `0 0 8px ${getColorForStep()}, 0 0 16px ${getColorForStep()}66`,
                      }}
                    />
                  </div>
                  
                  {/* Plus button - Gecentreerd in het midden - Verschijnt wanneer er een selectie is OF wanneer er tekst in input staat */}
                  {((activeStep === 'character' && selections.character) ||
                    (activeStep === 'setting' && (selections.setting || selections.customWorldDescription)) ||
                    (activeStep === 'object' && selections.object) ||
                    (customInputs[activeStep]?.trim())) && (
                    <button
                      onClick={() => {
                        if (customInputs[activeStep]?.trim()) {
                          // Als er tekst in input staat, gebruik die
                          handleCustomInput(activeStep, customInputs[activeStep].trim());
                        }
                        // Sluit de modal na het toevoegen
                        setActiveStep(null);
                      }}
                      className="group transition-all hover:scale-110 active:scale-95"
                      title="Toevoegen"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        width: '40px',
                        height: '40px',
                        margin: '0 auto',
                      }}
                    >
                      <NeonIconButton
                        type="plus"
                        size="md"
                        color={activeStep === 'character' ? 'purple' : activeStep === 'setting' ? 'cyan' : activeStep === 'object' ? 'pink' : 'blue'}
                        style={{ width: '28px', height: '28px' }}
                      />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay with Video */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          {/* Background Video */}
          <video
            src="/kidsreadingtablet.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            style={{ zIndex: 1 }}
          />
          
          {/* Loading Content */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-6">
            {/* Spinner */}
            <div
              className="w-24 h-24 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"
              role="status"
              aria-label="Loading"
            >
              <span className="sr-only">Loading...</span>
            </div>
            
            {/* Text - Single instance */}
            <p 
              className="text-2xl font-bold text-white"
              style={{
                fontFamily: "'Comfortaa', sans-serif",
                textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(176, 38, 255, 0.5)',
                letterSpacing: '0.05em',
              }}
            >
              Je verhaal wordt tot leven gebracht...
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl max-w-md"
          style={{
            background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
            border: `3px solid ${KPOP_COLORS.neonPink}`,
            boxShadow: `0 0 20px ${KPOP_COLORS.neonPink}66, 0 0 40px ${KPOP_COLORS.neonPink}44`,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-red-400 transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
