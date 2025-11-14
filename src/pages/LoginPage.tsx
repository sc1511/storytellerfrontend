import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useProfileStore } from '../store/profileStore';
import { storyAPI } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// K-pop Dark Neon Color Palette - Minder fel roze
const KPOP_COLORS = {
  neonPink: '#D946EF', // Minder fel roze
  neonBlue: '#00F0FF',
  neonPurple: '#B026FF',
  neonCyan: '#00FFFF',
  neonMagenta: '#FF00FF',
  darkBg: '#0a0a1a',
  darkBgSecondary: '#1a1a2e',
  darkBgTertiary: '#16213e',
  neonYellow: '#FFD700',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { currentProfile, addProfile } = useProfileStore();
  const [verificationCode, setVerificationCode] = useState('');
  const [childName, setChildName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Als er al een profiel is, ga altijd naar home (kind kan daar kiezen)
  useEffect(() => {
    if (currentProfile) {
      navigate('/home', { replace: true });
    }
  }, [currentProfile, navigate]);

  // Animate on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  const handleLogin = async () => {
    if (!verificationCode.trim()) {
      setError('Voer een code in om in te loggen!');
      codeInputRef.current?.focus();
      return;
    }

    if (!childName.trim()) {
      setError('Voer je naam in om in te loggen!');
      nameInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Backend API call om profiel op te halen via code EN naam
      const childData = await storyAPI.loginWithCode(
        verificationCode.toUpperCase(),
        childName.trim()
      );

      // Parse avatar_customization from backend (can be string or object)
      let avatarCustomization = (childData as any).avatar_customization;
      if (typeof avatarCustomization === 'string') {
        try {
          avatarCustomization = JSON.parse(avatarCustomization);
        } catch (e) {
          console.warn('Failed to parse avatar_customization:', e);
          avatarCustomization = null;
        }
      }

      // Maak tijdelijk profiel aan met ID en originele naam (voor login validatie)
      const tempProfile = {
        id: childData.id,
        name: childData.name, // Originele naam van ouder - voor login validatie
        displayName: (childData as any).display_name || undefined, // Display name (als al ingesteld)
        age: childData.age || '', // Gebruik leeftijd van backend als beschikbaar
        avatar: '👤',
        avatarCustomization: avatarCustomization || undefined, // Gebruik avatar van backend als beschikbaar
        language: (childData.language || 'nl') as 'en' | 'nl',
        created_at: new Date().toISOString(),
        total_stories: 0,
      };

      addProfile(tempProfile);
      
      // Always go to home after login - child can choose to play (onboarding) or read stories (library)
      console.log('✅ Login successful, navigating to /home');
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Code of naam klopt niet. Vraag je ouder om hulp!');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Focus code input on mount
  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${KPOP_COLORS.darkBg} 0%, ${KPOP_COLORS.darkBgSecondary} 50%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
        minHeight: '100vh',
        maxHeight: '100vh',
      }}
    >
      {/* Animated background particles - Minder zichtbaar */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: [
                KPOP_COLORS.neonBlue,
                KPOP_COLORS.neonCyan,
                KPOP_COLORS.neonPurple,
              ][Math.floor(Math.random() * 3)],
              opacity: Math.random() * 0.3 + 0.1,
              boxShadow: `0 0 ${Math.random() * 5 + 3}px currentColor`,
              animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Title - Compact */}
      <div className="text-center mb-4 z-10">
        <h1
          className="text-4xl md:text-5xl font-black mb-2"
          style={{
            color: KPOP_COLORS.neonPink,
            fontFamily: "'Orbitron', sans-serif",
            textShadow: `
              0 0 10px ${KPOP_COLORS.neonPink}66,
              0 0 20px ${KPOP_COLORS.neonPink}44
            `,
            letterSpacing: '-0.02em',
          }}
        >
          Storyteller
        </h1>
        <p
          className="text-lg md:text-xl font-bold"
          style={{
            color: KPOP_COLORS.neonCyan,
            fontFamily: "'Nunito', sans-serif",
            textShadow: `0 0 10px ${KPOP_COLORS.neonCyan}44`,
          }}
        >
          Welkom terug!
        </p>
      </div>

      {/* Login Card - Compact, alles op 1 scherm */}
      <div
        className="w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10"
        style={{
          background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
          border: `3px solid ${KPOP_COLORS.neonBlue}`,
          boxShadow: `
            0 0 30px ${KPOP_COLORS.neonBlue}66,
            0 0 60px ${KPOP_COLORS.neonPurple}44,
            inset 0 0 20px ${KPOP_COLORS.neonBlue}22
          `,
        }}
      >
        <h2
          className="text-xl md:text-2xl font-black mb-4 text-center"
          style={{
            color: KPOP_COLORS.neonYellow,
            fontFamily: "'Orbitron', sans-serif",
            textShadow: `0 0 10px ${KPOP_COLORS.neonYellow}44`,
          }}
        >
          Voer je code en naam in
        </h2>

        {/* Code Input */}
        <div className="mb-3">
          <label
            className="block text-sm font-bold mb-2"
            style={{
              color: KPOP_COLORS.neonCyan,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Code
          </label>
          <input
            ref={codeInputRef}
            type="text"
            value={verificationCode}
            onChange={(e) => {
              setVerificationCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setError(null);
            }}
            placeholder="ABC123"
            maxLength={20}
            className="w-full px-4 py-3 rounded-2xl text-center text-xl font-black tracking-widest transition-all"
            style={{
              background: KPOP_COLORS.darkBg,
              border: `3px solid ${error ? KPOP_COLORS.neonMagenta : KPOP_COLORS.neonBlue}`,
              color: KPOP_COLORS.neonCyan,
              fontFamily: "'Orbitron', sans-serif",
              textTransform: 'uppercase',
              boxShadow: error
                ? `0 0 20px ${KPOP_COLORS.neonMagenta}66, inset 0 0 10px ${KPOP_COLORS.neonMagenta}22`
                : `0 0 15px ${KPOP_COLORS.neonBlue}44, inset 0 0 10px ${KPOP_COLORS.neonBlue}22`,
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading && verificationCode.trim()) {
                nameInputRef.current?.focus();
              }
            }}
            disabled={isLoading}
          />
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label
            className="block text-sm font-bold mb-2"
            style={{
              color: KPOP_COLORS.neonCyan,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Jouw naam
          </label>
          <input
            ref={nameInputRef}
            type="text"
            value={childName}
            onChange={(e) => {
              setChildName(e.target.value);
              setError(null);
            }}
            placeholder="Jouw naam"
            maxLength={50}
            className="w-full px-4 py-3 rounded-2xl text-center text-lg font-bold transition-all"
            style={{
              background: KPOP_COLORS.darkBg,
              border: `3px solid ${error ? KPOP_COLORS.neonMagenta : KPOP_COLORS.neonBlue}`,
              color: KPOP_COLORS.neonCyan,
              fontFamily: "'Nunito', sans-serif",
              boxShadow: error
                ? `0 0 20px ${KPOP_COLORS.neonMagenta}66, inset 0 0 10px ${KPOP_COLORS.neonMagenta}22`
                : `0 0 15px ${KPOP_COLORS.neonBlue}44, inset 0 0 10px ${KPOP_COLORS.neonBlue}22`,
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading && verificationCode.trim() && childName.trim()) {
                handleLogin();
              }
            }}
            disabled={isLoading}
          />
          {/* Placeholder styling - zwart */}
          <style>{`
            input::placeholder {
              color: #000000 !important;
              opacity: 0.5 !important;
            }
          `}</style>
          {error && (
            <p
              className="mt-2 text-sm text-center font-bold"
              style={{
                color: KPOP_COLORS.neonMagenta,
                textShadow: `0 0 8px ${KPOP_COLORS.neonMagenta}44`,
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Start Button - Geen "nieuw profiel maken" */}
        <button
          onClick={handleLogin}
          disabled={isLoading || !verificationCode.trim() || !childName.trim()}
          className="w-full py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${KPOP_COLORS.neonBlue} 0%, ${KPOP_COLORS.neonPurple} 100%)`,
            border: `3px solid ${KPOP_COLORS.neonBlue}`,
            color: '#FFFFFF',
            fontFamily: "'Orbitron', sans-serif",
            boxShadow: `
              0 0 20px ${KPOP_COLORS.neonBlue}66,
              0 0 40px ${KPOP_COLORS.neonPurple}44
            `,
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Laden...
            </span>
          ) : (
            'Start'
          )}
        </button>

        {/* Help Text - Compact */}
        <p
          className="mt-4 text-xs text-center font-medium"
          style={{
            color: KPOP_COLORS.neonCyan,
            opacity: 0.7,
            textShadow: `0 0 4px ${KPOP_COLORS.neonCyan}33`,
          }}
        >
          Vraag je ouder om de code
        </p>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-15px) translateX(5px);
          }
        }
      `}</style>
    </div>
  );
}
