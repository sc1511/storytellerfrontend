import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { gsap } from "gsap"

// K-pop Neon Color Palette
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

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-semibold text-lg transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-transparent border-2 text-white",
        secondary: "bg-transparent border-2 text-white",
        accent: "bg-transparent border-2 text-white",
        destructive: "bg-transparent border-2 text-white",
        outline: "bg-transparent border-2 text-white",
        ghost: "bg-transparent border-2 text-white",
        neon: "bg-transparent border-2 text-white",
        neonPink: "bg-transparent border-2 text-white",
        neonBlue: "bg-transparent border-2 text-white",
        neonPurple: "bg-transparent border-2 text-white",
        neonCyan: "bg-transparent border-2 text-white",
      },
      size: {
        default: "h-12 px-8 py-6",
        sm: "h-10 px-6 py-4",
        lg: "h-14 px-10 py-8",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "neon",
      size: "default",
    },
  }
)

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"]
export type ButtonSize = VariantProps<typeof buttonVariants>["size"]

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'neon', size, asChild = false, onClick, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const internalRef = React.useRef<HTMLButtonElement>(null)
    const glowRef = React.useRef<HTMLDivElement>(null)
    
    React.useImperativeHandle(ref, () => internalRef.current as HTMLButtonElement, [])
    
    // Get neon color based on variant
    const getNeonColor = () => {
      switch (variant) {
        case 'neonPink':
          return { primary: KPOP_COLORS.neonPink, secondary: KPOP_COLORS.neonPurple, glow: KPOP_COLORS.neonPink };
        case 'neonBlue':
          return { primary: KPOP_COLORS.neonBlue, secondary: KPOP_COLORS.neonCyan, glow: KPOP_COLORS.neonBlue };
        case 'neonPurple':
          return { primary: KPOP_COLORS.neonPurple, secondary: KPOP_COLORS.neonPink, glow: KPOP_COLORS.neonPurple };
        case 'neonCyan':
          return { primary: KPOP_COLORS.neonCyan, secondary: KPOP_COLORS.neonBlue, glow: KPOP_COLORS.neonCyan };
        case 'accent':
          return { primary: KPOP_COLORS.neonOrange, secondary: KPOP_COLORS.neonYellow, glow: KPOP_COLORS.neonOrange };
        default:
          // Multi-color gradient like the microphone icon
          return { primary: KPOP_COLORS.neonPink, secondary: KPOP_COLORS.neonBlue, glow: 'multi' };
      }
    }
    
    const colors = getNeonColor()
    const isMultiColor = colors.glow === 'multi'
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || !internalRef.current) return
      
      // Neon pulse effect on click
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          scale: 1.3,
          opacity: 0.8,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        })
      }
      
      // Physics-based bounce effect
      gsap.to(internalRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      })
      // Spring back
      gsap.to(internalRef.current, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'back.out(1.7)',
      })
      
      onClick?.(e)
    }

    const handleMouseEnter = () => {
      if (disabled || !internalRef.current) return
      gsap.to(internalRef.current, {
        scale: 1.05,
        y: -2,
        duration: 0.2,
        ease: 'power2.out',
      })
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.6,
          duration: 0.2,
          ease: 'power2.out',
        })
      }
    }

    const handleMouseLeave = () => {
      if (disabled || !internalRef.current) return
      gsap.to(internalRef.current, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.inOut',
      })
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.4,
          duration: 0.3,
          ease: 'power2.inOut',
        })
      }
    }
    
    // Multi-color glow styles
    const getGlowStyle = () => {
      if (isMultiColor) {
        return {
          background: `radial-gradient(circle, ${KPOP_COLORS.neonPink}40 0%, ${KPOP_COLORS.neonPurple}30 30%, ${KPOP_COLORS.neonBlue}20 60%, transparent 100%)`,
          boxShadow: `
            0 0 20px ${KPOP_COLORS.neonPink}66,
            0 0 40px ${KPOP_COLORS.neonPurple}44,
            0 0 60px ${KPOP_COLORS.neonBlue}33,
            0 0 80px ${KPOP_COLORS.neonCyan}22
          `,
        }
      }
      return {
        background: `radial-gradient(circle, ${colors.primary}40 0%, ${colors.secondary}20 50%, transparent 100%)`,
        boxShadow: `
          0 0 20px ${colors.primary}66,
          0 0 40px ${colors.secondary}44,
          0 0 60px ${colors.glow}33
        `,
      }
    }
    
    const getBorderStyle = () => {
      if (isMultiColor) {
        return {
          border: `2px solid transparent`,
          background: `linear-gradient(${KPOP_COLORS.darkBgSecondary}, ${KPOP_COLORS.darkBgSecondary}) padding-box,
                      linear-gradient(135deg, ${KPOP_COLORS.neonPink}, ${KPOP_COLORS.neonPurple}, ${KPOP_COLORS.neonBlue}, ${KPOP_COLORS.neonCyan}) border-box`,
          backgroundClip: 'padding-box, border-box',
        }
      }
      return {
        border: `2px solid ${colors.primary}`,
        boxShadow: `
          0 0 10px ${colors.primary}88,
          0 0 20px ${colors.secondary}66,
          inset 0 0 10px ${colors.primary}22
        `,
      }
    }
    
    // For multi-color, wrap in a container with gradient border
    if (isMultiColor) {
      return (
        <div
          className="inline-block relative"
          style={{
            background: `linear-gradient(135deg, ${KPOP_COLORS.neonPink}, ${KPOP_COLORS.neonPurple}, ${KPOP_COLORS.neonBlue}, ${KPOP_COLORS.neonCyan})`,
            padding: '2px',
            borderRadius: '0.75rem',
            boxShadow: `
              0 0 20px ${KPOP_COLORS.neonPink}66,
              0 0 40px ${KPOP_COLORS.neonPurple}44,
              0 0 60px ${KPOP_COLORS.neonBlue}33
            `,
          }}
        >
          <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={internalRef}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            style={{
              background: KPOP_COLORS.darkBgSecondary,
              border: 'none',
              color: '#ffffff',
              textShadow: `
                0 0 10px ${KPOP_COLORS.neonPink}88,
                0 0 20px ${KPOP_COLORS.neonPurple}66,
                0 0 30px ${KPOP_COLORS.neonCyan}44
              `,
              position: 'relative',
            }}
            {...props}
          >
            {/* Multi-color glow background layer */}
            <div
              ref={glowRef}
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{
                ...getGlowStyle(),
                opacity: 0.4,
                zIndex: -1,
                transition: 'opacity 0.3s ease',
              }}
            />
            
            {/* Content */}
            <span className="relative z-10" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>
              {children}
            </span>
          </Comp>
        </div>
      )
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={internalRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        style={{
          ...getBorderStyle(),
          color: colors.primary,
          textShadow: `
            0 0 10px ${colors.primary}88,
            0 0 20px ${colors.secondary}66,
            0 0 30px ${colors.glow}44
          `,
          position: 'relative',
        }}
        {...props}
      >
        {/* Single-color glow background layer */}
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            ...getGlowStyle(),
            opacity: 0.4,
            zIndex: -1,
            transition: 'opacity 0.3s ease',
          }}
        />
        
        {/* Content */}
        <span className="relative z-10" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>
          {children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

