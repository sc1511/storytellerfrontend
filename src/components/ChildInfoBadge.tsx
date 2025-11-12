import { useProfileStore } from '../store/profileStore';
import { useNavigate } from 'react-router-dom';

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

/**
 * Component to display child name and ID on every page
 * Only shows if profile exists and has name
 * Includes logout button for multiple children on same device
 */
export function ChildInfoBadge() {
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const { deleteProfile } = useProfileStore();
  const navigate = useNavigate();

  // Use displayName (chosen by child) or name (from parent) as fallback
  const displayName = currentProfile?.displayName || currentProfile?.name;
  
  if (!currentProfile || !displayName) {
    return null;
  }

  // Get short ID (first 8 characters)
  const shortId = currentProfile.id.substring(0, 8).toUpperCase();

  const handleLogout = () => {
    if (window.confirm('Weet je zeker dat je wilt uitloggen?')) {
      deleteProfile(currentProfile.id);
      navigate('/login');
    }
  };

  return (
    <div
      className="fixed top-2 right-4 z-50"
      style={{
        background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
        border: `1px solid ${KPOP_COLORS.neonCyan}66`,
        borderRadius: '4px',
        padding: '4px 8px',
        boxShadow: `0 0 4px ${KPOP_COLORS.neonCyan}33`,
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '2px',
        width: 'fit-content',
      }}
    >
      <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: KPOP_COLORS.neonCyan, fontFamily: "'Poppins', sans-serif", lineHeight: '1.1', margin: 0, padding: 0 }}>
        {displayName}
      </div>
      <div style={{ fontSize: '0.6rem', color: KPOP_COLORS.neonBlue, fontFamily: "'Orbitron', monospace", opacity: 0.7, lineHeight: '1.1', margin: 0, padding: 0 }}>
        ID: {shortId}
      </div>
      <button
        onClick={handleLogout}
        className="transition-all hover:opacity-100 active:opacity-80"
        style={{
          background: 'transparent',
          color: KPOP_COLORS.neonBlue,
          opacity: 0.7,
          padding: '2px 6px',
          margin: 0,
          border: `1px solid ${KPOP_COLORS.neonBlue}33`,
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '0.6rem',
          lineHeight: '1.1',
          fontFamily: "'Poppins', sans-serif",
          whiteSpace: 'nowrap',
          minWidth: 'auto',
          minHeight: 'auto',
          width: 'auto',
          height: 'auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.borderColor = KPOP_COLORS.neonBlue;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7';
          e.currentTarget.style.borderColor = `${KPOP_COLORS.neonBlue}33`;
        }}
      >
        Uitloggen
      </button>
    </div>
  );
}

