import { gsap } from 'gsap'

/**
 * GSAP Animation Utilities voor Storytelling App
 * Gebaseerd op UI_PATTERNS_KIDS_STORYTELLING.md
 */

// Animation durations (volgens UI patterns)
export const DURATION = {
  MICRO: 0.15, // 150-200ms voor button taps
  SHORT: 0.3, // 300-400ms voor card flips
  MEDIUM: 0.4, // 400-500ms voor page transitions
  LONG: 0.5, // 500ms voor complexe sequences
} as const

// Easing functions
export const EASE = {
  IN_OUT: 'power2.inOut',
  OUT: 'power2.out',
  IN: 'power2.in',
  ELASTIC: 'elastic.out(1, 0.3)',
  BOUNCE: 'bounce.out',
} as const

/**
 * Button Tap Animation
 * Scale: 1.0 → 0.95 → 1.05 → 1.0
 * Duration: 200ms
 */
export function animateButtonTap(element: HTMLElement | string) {
  return gsap.to(element, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: EASE.IN_OUT,
  })
}

/**
 * Success Feedback Animation
 * Scale + bounce + glow effect
 */
export function animateSuccess(element: HTMLElement | string) {
  const tl = gsap.timeline()
  
  tl.to(element, {
    scale: 1.1,
    duration: 0.2,
    ease: EASE.BOUNCE,
  })
  .to(element, {
    scale: 1,
    duration: 0.3,
    ease: EASE.OUT,
  })
  
  return tl
}

/**
 * Card Flip Animation
 * Playful card flip voor story cards
 */
export function animateCardFlip(element: HTMLElement | string) {
  return gsap.to(element, {
    rotationY: 360,
    duration: DURATION.SHORT,
    ease: EASE.IN_OUT,
  })
}

/**
 * Card Hover Lift Effect
 * Scale 1.0 → 1.05, shadow dieper
 */
export function animateCardHover(element: HTMLElement | string) {
  return gsap.to(element, {
    scale: 1.05,
    y: -8,
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    duration: DURATION.SHORT,
    ease: EASE.OUT,
  })
}

/**
 * Card Hover Out
 */
export function animateCardHoverOut(element: HTMLElement | string) {
  return gsap.to(element, {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    duration: DURATION.SHORT,
    ease: EASE.OUT,
  })
}

/**
 * Page Transition: Slide Out Left + Fade
 * Returns a Promise for chaining
 */
export function animatePageOut(element: HTMLElement | string): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(element, {
      x: '-100%',
      opacity: 0,
      duration: DURATION.MEDIUM,
      ease: EASE.IN,
      onComplete: () => resolve(),
    })
  })
}

/**
 * Page Transition: Slide In Right + Fade
 */
export function animatePageIn(element: HTMLElement | string) {
  return gsap.fromTo(
    element,
    {
      x: '100%',
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      duration: DURATION.MEDIUM,
      ease: EASE.OUT,
    }
  )
}

/**
 * Choice Card Selection Animation
 * Glow border + scale + sparkles effect
 */
export function animateChoiceSelect(element: HTMLElement | string) {
  const tl = gsap.timeline()
  
  tl.to(element, {
    scale: 1.08,
    duration: 0.15,
    ease: EASE.OUT,
  })
  .to(element, {
    scale: 1.0,
    duration: 0.2,
    ease: EASE.IN_OUT,
  })
  
  return tl
}

/**
 * Modal Open Animation
 * Scale + fade
 */
export function animateModalOpen(element: HTMLElement | string) {
  return gsap.fromTo(
    element,
    {
      scale: 0.8,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      duration: DURATION.SHORT,
      ease: EASE.OUT,
    }
  )
}

/**
 * Modal Close Animation
 */
export function animateModalClose(element: HTMLElement | string) {
  return gsap.to(element, {
    scale: 0.8,
    opacity: 0,
    duration: DURATION.SHORT,
    ease: EASE.IN,
  })
}

/**
 * Loading Spinner Animation
 * Playful rotation voor loading states
 */
export function animateLoadingSpinner(element: HTMLElement | string) {
  return gsap.to(element, {
    rotation: 360,
    duration: 1,
    repeat: -1,
    ease: 'none',
  })
}

/**
 * Progress Bar Animation
 * Smooth fill voor story progress
 */
export function animateProgressBar(
  element: HTMLElement | string,
  progress: number // 0-100
) {
  return gsap.to(element, {
    width: `${progress}%`,
    duration: 0.5,
    ease: EASE.OUT,
  })
}

/**
 * Confetti Burst Animation
 * Celebration effect voor achievements
 */
export function animateConfettiBurst(element: HTMLElement | string) {
  const tl = gsap.timeline()
  
  // Create multiple particles
  for (let i = 0; i < 20; i++) {
    tl.to(element, {
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
      rotation: Math.random() * 360,
      opacity: 0,
      duration: 1,
      ease: EASE.OUT,
      delay: Math.random() * 0.3,
    }, 0)
  }
  
  return tl
}

/**
 * Story Segment Fade In
 * Voor story text appearance
 */
export function animateStoryFadeIn(element: HTMLElement | string) {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration: DURATION.MEDIUM,
      ease: EASE.OUT,
    }
  )
}

/**
 * Character Entrance Animation
 * Voor character appearances in stories
 */
export function animateCharacterEntrance(element: HTMLElement | string) {
  return gsap.fromTo(
    element,
    {
      scale: 0,
      rotation: -180,
      opacity: 0,
    },
    {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 0.6,
      ease: EASE.ELASTIC,
    }
  )
}

/**
 * Shake Animation (voor errors)
 * Gentle shake voor error feedback
 */
export function animateShake(element: HTMLElement | string) {
  return gsap.to(element, {
    x: [0, -10, 10, -10, 10, 0],
    duration: 0.4,
    ease: EASE.IN_OUT,
  })
}

/**
 * Storytelling Sequence Timeline
 * Complexe, gesynchroniseerde animatie voor story sequences
 */
export function createStoryTimeline() {
  return gsap.timeline({
    defaults: {
      ease: EASE.OUT,
    },
  })
}

// GSAP Register Plugin voor extra features (indien nodig)
// gsap.registerPlugin(ScrollTrigger, TextPlugin, etc.)

export default {
  animateButtonTap,
  animateSuccess,
  animateCardFlip,
  animateCardHover,
  animateCardHoverOut,
  animatePageOut,
  animatePageIn,
  animateChoiceSelect,
  animateModalOpen,
  animateModalClose,
  animateLoadingSpinner,
  animateProgressBar,
  animateConfettiBurst,
  animateStoryFadeIn,
  animateCharacterEntrance,
  animateShake,
  createStoryTimeline,
  DURATION,
  EASE,
}

