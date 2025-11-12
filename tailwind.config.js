/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Kids-friendly color palette (5-7 years: Warm & Bright)
        'sunshine-yellow': '#FFD93D',
        'sky-blue': '#6BCF7F',
        'fresh-green': '#4ECDC4',
        'cherry-red': '#FF6B6B',
        'playful-purple': '#C490E4',
        'coral-orange': '#FFA07A',
        'warm-white': '#FFF9F0',
        'soft-black': '#2D3436',
        
        // Sophisticated palette (8-10 years)
        'trust-blue': '#4A90E2',
        'cool-teal': '#50C9CE',
        'royal-purple': '#9B59B6',
        'achievement-gold': '#F39C12',
        'energy-orange': '#E67E22',
        'cool-white': '#F8F9FA',
        'true-black': '#212529',
        
        // System colors (for shadcn/ui compatibility)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#6BCF7F', // Sky Blue as primary
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#C490E4', // Playful Purple
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FFD93D', // Sunshine Yellow
          foreground: '#2D3436',
        },
        destructive: {
          DEFAULT: '#FF6B6B', // Cherry Red
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#6B7280',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#2D3436',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#2D3436',
        },
        // K-pop Dark Theme colors
        'dark-bg': '#0a0a1a',
        'dark-bg-secondary': '#1a1a2e',
        'dark-bg-tertiary': '#16213e',
        // Neon colors
        'neon-pink': '#FF10F0',
        'neon-blue': '#00F0FF',
        'neon-purple': '#B026FF',
        'neon-cyan': '#00FFFF',
        'neon-magenta': '#FF00FF',
      },
      fontFamily: {
        sans: ['Poppins', 'Gyahegi', 'Comfortaa', 'Nunito Sans', 'Quicksand', 'system-ui', 'sans-serif'],
        display: ['Gyahegi', 'Fredoka One', 'Baloo 2', 'cursive'],
        orbitron: ['Orbitron', 'sans-serif'],
        dyslexia: ['OpenDyslexic', 'Comic Sans MS', 'sans-serif'],
      },
      fontSize: {
        'story-xs': '16px',
        'story-sm': '18px',
        'story-base': '20px',
        'story-lg': '22px',
        'story-xl': '24px',
      },
      spacing: {
        'touch': '176px', // 4x WCAG minimum (44px) for kids
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

