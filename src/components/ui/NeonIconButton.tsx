import React from 'react';
import { gsap } from 'gsap';

const KPOP_COLORS = {
  neonPink: '#FF10F0',
  neonBlue: '#00F0FF',
  neonPurple: '#B026FF',
  neonCyan: '#00FFFF',
  neonYellow: '#FFD700',
  neonOrange: '#FF6B35',
  darkBg: '#0a0a1a',
  darkBgSecondary: '#1a1a2e',
  darkBgTertiary: '#16213e',
};

type IconType = 'start' | 'play' | 'star' | 'close' | 'plus' | 'correct' | 'heart' | 'star2' | 'starMoon' | 'back';

interface NeonIconButtonProps {
  type: IconType;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'pink' | 'blue' | 'purple' | 'cyan' | 'yellow' | 'multi';
  className?: string;
  title?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const getIconSVG = (type: IconType, color: string): string => {
  const strokeWidth = 2;
  const fill = 'none';
  
  switch (type) {
    case 'start':
      // Play triangle icon
      return `
        <svg viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      `;
    case 'play':
      // Play icon - triangle
      return `
        <svg viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      `;
    case 'star':
      // Star icon
      return `
        <svg viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      `;
    case 'close':
      // Close/X icon
      return `
        <svg viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      `;
    case 'plus':
      // Plus icon
      return `
        <svg viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      `;
    case 'correct':
      // Checkmark icon
      return `
        <svg viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
    case 'heart':
      // Heart icon
      return `
        <svg viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      `;
    case 'star2':
      // Star variant
      return `
        <svg viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      `;
    case 'starMoon':
      // Star with moon (combined)
      return `
        <svg viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      `;
    case 'back':
      // Back arrow (left arrow)
      return `
        <svg viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
      `;
    default:
      return '';
  }
};

const getSize = (size: 'sm' | 'md' | 'lg' | 'xl'): string => {
  switch (size) {
    case 'sm': return 'w-4 h-4';
    case 'md': return 'w-6 h-6';
    case 'lg': return 'w-8 h-8';
    case 'xl': return 'w-12 h-12';
    default: return 'w-6 h-6';
  }
};

const getColorValue = (color: 'pink' | 'blue' | 'purple' | 'cyan' | 'yellow' | 'multi'): string => {
  switch (color) {
    case 'pink': return KPOP_COLORS.neonPink;
    case 'blue': return KPOP_COLORS.neonBlue;
    case 'purple': return KPOP_COLORS.neonPurple;
    case 'cyan': return KPOP_COLORS.neonCyan;
    case 'yellow': return KPOP_COLORS.neonYellow;
    case 'multi': return KPOP_COLORS.neonPink; // Default for multi, will use gradient
    default: return KPOP_COLORS.neonPink;
  }
};

export const NeonIconButton: React.FC<NeonIconButtonProps> = ({
  type,
  onClick,
  size = 'md',
  color = 'pink',
  className = '',
  title,
  disabled = false,
  style = {},
}) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const iconColor = getColorValue(color);
  const isMulti = color === 'multi';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !buttonRef.current) return;
    
    // Pulse animation
    gsap.to(buttonRef.current, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });
    
    onClick?.(e);
  };

  const handleMouseEnter = () => {
    if (disabled || !buttonRef.current) return;
    gsap.to(buttonRef.current, {
      scale: 1.1,
      duration: 0.2,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (disabled || !buttonRef.current) return;
    gsap.to(buttonRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.inOut',
    });
  };

  const getGlowStyle = () => {
    if (isMulti) {
      return {
        boxShadow: `
          0 0 20px ${KPOP_COLORS.neonPink}88,
          0 0 40px ${KPOP_COLORS.neonPurple}66,
          0 0 60px ${KPOP_COLORS.neonBlue}44,
          0 0 80px ${KPOP_COLORS.neonCyan}22
        `,
      };
    }
    return {
      boxShadow: `
        0 0 15px ${iconColor}88,
        0 0 30px ${iconColor}66,
        0 0 45px ${iconColor}44
      `,
    };
  };

  const getBorderStyle = () => {
    if (isMulti) {
      return {
        border: `2px solid transparent`,
        background: `linear-gradient(${KPOP_COLORS.darkBgSecondary}, ${KPOP_COLORS.darkBgSecondary}) padding-box,
                    linear-gradient(135deg, ${KPOP_COLORS.neonPink}, ${KPOP_COLORS.neonPurple}, ${KPOP_COLORS.neonBlue}, ${KPOP_COLORS.neonCyan}) border-box`,
        backgroundClip: 'padding-box, border-box',
      };
    }
    return {
      border: `2px solid ${iconColor}44`,
    };
  };

  // Bepaal de grootte - inline style heeft altijd voorrang
  const finalSize = style?.width && style?.height 
    ? { width: style.width, height: style.height }
    : size === 'sm' ? { width: '16px', height: '16px' }
    : size === 'md' ? { width: '24px', height: '24px' }
    : size === 'lg' ? { width: '32px', height: '32px' }
    : { width: '48px', height: '48px' }; // xl

  // Verwijder width en height uit style object als die er zijn, zodat we ze kunnen overschrijven
  const { width, height, ...restStyle } = style || {};

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      title={title}
      className={`relative inline-flex items-center justify-center rounded-lg transition-all duration-300 ${className}`}
      style={{
        width: finalSize.width,
        height: finalSize.height,
        minWidth: finalSize.width,
        minHeight: finalSize.height,
        maxWidth: finalSize.width,
        maxHeight: finalSize.height,
        background: isMulti 
          ? KPOP_COLORS.darkBgSecondary 
          : 'transparent',
        ...getBorderStyle(),
        ...getGlowStyle(),
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...restStyle,
      }}
    >
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: isMulti
            ? `radial-gradient(circle, ${KPOP_COLORS.neonPink}20 0%, ${KPOP_COLORS.neonPurple}15 30%, ${KPOP_COLORS.neonBlue}10 60%, transparent 100%)`
            : `radial-gradient(circle, ${iconColor}20 0%, transparent 70%)`,
          opacity: 0.6,
          animation: 'glow-pulse 2s ease-in-out infinite',
        }}
      />
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: isMulti
              ? getIconSVG(type, KPOP_COLORS.neonCyan) // Use cyan for multi-color
              : getIconSVG(type, iconColor),
          }}
          style={{
            filter: isMulti
              ? `drop-shadow(0 0 8px ${KPOP_COLORS.neonPink}88) drop-shadow(0 0 16px ${KPOP_COLORS.neonPurple}66) drop-shadow(0 0 24px ${KPOP_COLORS.neonCyan}44)`
              : `drop-shadow(0 0 8px ${iconColor}88) drop-shadow(0 0 16px ${iconColor}66)`,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </div>
    </button>
  );
};

