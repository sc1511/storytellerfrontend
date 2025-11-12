import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';

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

export default function NotFoundPage() {
  const navigate = useNavigate();
  const currentProfile = useProfileStore((state) => state.currentProfile);

  const handleGoHome = () => {
    if (currentProfile) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${KPOP_COLORS.darkBg} 0%, ${KPOP_COLORS.darkBgSecondary} 50%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
      }}
    >
      {/* Background particles / Stars */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(40)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: ['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF', '#FFD700'][i % 5],
              boxShadow: `0 0 ${4 + Math.random() * 6}px ${['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF', '#FFD700'][i % 5]}`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4" style={{ maxWidth: '600px' }}>
        {/* 404 Number */}
        <div
          className="text-9xl md:text-[12rem] font-black mb-4"
          style={{
            background: `linear-gradient(135deg, ${KPOP_COLORS.neonPink} 0%, ${KPOP_COLORS.neonPurple} 50%, ${KPOP_COLORS.neonCyan} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: `0 0 40px ${KPOP_COLORS.neonPink}66`,
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '0.1em',
            lineHeight: 1,
          }}
        >
          404
        </div>

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-black mb-4"
          style={{
            color: KPOP_COLORS.neonCyan,
            fontFamily: "'Orbitron', sans-serif",
            textShadow: `0 0 20px ${KPOP_COLORS.neonCyan}, 0 0 40px ${KPOP_COLORS.neonCyan}66`,
            letterSpacing: '0.1em',
          }}
        >
          Pagina niet gevonden
        </h1>

        {/* Description */}
        <p
          className="text-lg md:text-xl mb-8"
          style={{
            color: KPOP_COLORS.neonBlue,
            fontFamily: "'Poppins', sans-serif",
            opacity: 0.9,
          }}
        >
          Oeps! Deze pagina bestaat niet. Laten we teruggaan naar waar je vandaan kwam.
        </p>

        {/* Button */}
        <button
          onClick={handleGoHome}
          className="px-8 py-4 rounded-3xl font-black text-lg transition-all hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
            border: `3px solid ${KPOP_COLORS.neonPink}`,
            boxShadow: `0 0 20px ${KPOP_COLORS.neonPink}66, 0 0 40px ${KPOP_COLORS.neonPink}44`,
            color: KPOP_COLORS.neonPink,
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            letterSpacing: '0.1em',
            textShadow: `0 0 8px ${KPOP_COLORS.neonPink}, 0 0 16px ${KPOP_COLORS.neonPink}66`,
            minWidth: 'auto',
            minHeight: 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 30px ${KPOP_COLORS.neonPink}, 0 0 60px ${KPOP_COLORS.neonPink}66`;
            e.currentTarget.style.textShadow = `0 0 12px ${KPOP_COLORS.neonPink}, 0 0 24px ${KPOP_COLORS.neonPink}66`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 0 20px ${KPOP_COLORS.neonPink}66, 0 0 40px ${KPOP_COLORS.neonPink}44`;
            e.currentTarget.style.textShadow = `0 0 8px ${KPOP_COLORS.neonPink}, 0 0 16px ${KPOP_COLORS.neonPink}66`;
          }}
        >
          TERUG NAAR HOME
        </button>
      </div>
    </div>
  );
}

