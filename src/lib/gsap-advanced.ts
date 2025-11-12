/**
 * Advanced GSAP Animations voor Storytelling App
 * Gebruikt alle GSAP plugins voor complexe storytelling animaties
 * 
 * Kernfuncties:
 * 1. gsap.to() - Animeer naar nieuwe staat
 * 2. gsap.from() - Animeer van opgegeven staat
 * 3. gsap.fromTo() - Volledige controle
 * 4. gsap.timeline() - Gesynchroniseerde sequences
 * 5. gsap.set() - Direct properties instellen
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

// Premium plugins (only if Club GreenSock membership)
// These will be undefined if not available
let Draggable: any
let Flip: any
let MotionPathPlugin: any
let Observer: any

/**
 * 1. gsap.to() - Animeer naar nieuwe staat
 */
export function animateTo(element: HTMLElement | string, props: gsap.TweenVars) {
  return gsap.to(element, props)
}

/**
 * 2. gsap.from() - Animeer van opgegeven staat naar huidige
 */
export function animateFrom(element: HTMLElement | string, props: gsap.TweenVars) {
  return gsap.from(element, props)
}

/**
 * 3. gsap.fromTo() - Volledige controle over begin- en eindstaat
 */
export function animateFromTo(
  element: HTMLElement | string,
  fromProps: gsap.TweenVars,
  toProps: gsap.TweenVars
) {
  return gsap.fromTo(element, fromProps, toProps)
}

/**
 * 4. gsap.timeline() - Gesynchroniseerde animatie sequences
 */
export function createTimeline(vars?: gsap.TimelineVars) {
  return gsap.timeline(vars)
}

/**
 * 5. gsap.set() - Direct properties instellen zonder animatie
 */
export function setProperties(element: HTMLElement | string, props: gsap.TweenVars) {
  return gsap.set(element, props)
}

/**
 * Stagger Animation - Animeer meerdere elementen met vertraging
 */
export function staggerAnimation(
  elements: HTMLElement[] | string,
  props: gsap.TweenVars,
  staggerValue: number = 0.1
) {
  return gsap.to(elements, {
    ...props,
    stagger: staggerValue,
  })
}

/**
 * ScrollTrigger Animation - Koppel animatie aan scroll positie
 * 14. ScrollTrigger: Perfect voor story scrolling
 */
export function createScrollTrigger(
  trigger: string | HTMLElement,
  animation: gsap.core.Tween | gsap.core.Timeline,
  options?: ScrollTrigger.Vars
) {
  if (!ScrollTrigger) {
    console.warn('ScrollTrigger not available')
    return null
  }
  
  return ScrollTrigger.create({
    trigger,
    animation,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
    ...options,
  })
}

/**
 * Draggable Element - Maak elementen sleepbaar
 * 15. Draggable: Voor drag-and-drop in story builder
 * Note: Requires Club GreenSock membership
 */
export function makeDraggable(
  element: HTMLElement | string,
  options?: any
) {
  if (!Draggable) {
    console.warn('Draggable plugin not available (requires Club GreenSock membership)')
    return null
  }
  
  return Draggable.create(element, {
    type: 'x,y',
    bounds: window,
    inertia: true,
    ...options,
  })
}

/**
 * Flip Animation - Naadloze layout transitions
 * 16. Flip: Voor soepele UI-transities
 * Note: Requires Club GreenSock membership
 */
export function createFlipAnimation(
  elements: HTMLElement[],
  options?: any
) {
  if (!Flip) {
    console.warn('Flip plugin not available (requires Club GreenSock membership)')
    return null
  }
  
  const state = Flip.getState(elements)
  return {
    animate: (vars?: gsap.TweenVars) => {
      return Flip.from(state, {
        duration: 0.5,
        ease: 'power2.inOut',
        ...vars,
      })
    },
    state,
  }
}

/**
 * Motion Path - Animeer langs SVG pad
 * 17. MotionPathPlugin: Voor complexe karakterbewegingen
 * Note: Requires Club GreenSock membership
 */
export function animateAlongPath(
  element: HTMLElement | string,
  path: string | SVGPathElement,
  vars?: gsap.TweenVars
) {
  if (!MotionPathPlugin) {
    console.warn('MotionPathPlugin not available (requires Club GreenSock membership)')
    // Fallback: simple linear animation
    return gsap.to(element, {
      x: 100,
      y: 100,
      ...vars,
    })
  }
  
  return gsap.to(element, {
    motionPath: {
      path,
      alignOrigin: [0.5, 0.5],
    },
    ...vars,
  })
}

/**
 * Text Typing Animation - Type tekst alsof het wordt getypt
 * 18. TextPlugin: Voor dialogen en verhaaltekst
 */
export function typeText(
  element: HTMLElement | string,
  text: string,
  vars?: gsap.TweenVars
) {
  if (!TextPlugin) {
    console.warn('TextPlugin not available')
    // Fallback: set text directly
    if (typeof element === 'string') {
      const el = document.querySelector(element) as HTMLElement
      if (el) el.textContent = text
    } else {
      element.textContent = text
    }
    return gsap.set(element, vars || {})
  }
  
  return gsap.to(element, {
    duration: text.length * 0.05, // 50ms per character
    text: text,
    ease: 'none',
    ...vars,
  })
}

/**
 * Observer - Reageer op user interacties
 * 20. Observer: Cross-browser user interacties
 * Note: Requires Club GreenSock membership
 */
export function createObserver(
  element: HTMLElement | string,
  callback: (self: any) => void,
  options?: any
) {
  if (!Observer) {
    console.warn('Observer plugin not available (requires Club GreenSock membership)')
    // Fallback: use native event listeners
    const el = typeof element === 'string' 
      ? document.querySelector(element) 
      : element
    if (el) {
      el.addEventListener('scroll', () => callback({} as any))
      el.addEventListener('pointerdown', () => callback({} as any))
      el.addEventListener('touchstart', () => callback({} as any))
    }
    return null
  }
  
  return Observer.create({
    target: element,
    type: 'scroll,pointer,touch',
    onChange: callback,
    ...options,
  })
}

/**
 * Character Entrance - Complexe karakter animatie
 */
export function animateCharacterEntrance(
  element: HTMLElement | string,
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left'
) {
  const directions = {
    left: { x: -200, y: 0 },
    right: { x: 200, y: 0 },
    top: { x: 0, y: -200 },
    bottom: { x: 0, y: 200 },
  }

  return gsap.fromTo(
    element,
    {
      ...directions[direction],
      opacity: 0,
      scale: 0.8,
      rotation: direction === 'left' ? -10 : direction === 'right' ? 10 : 0,
    },
    {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.8,
      ease: 'back.out(1.7)',
    }
  )
}

/**
 * Story Sequence Timeline - Complexe storytelling sequence
 */
export function createStorySequence(
  elements: Array<{ element: HTMLElement | string; animation: gsap.TweenVars }>,
  options?: gsap.TimelineVars
) {
  const tl = gsap.timeline(options)

  elements.forEach(({ element, animation }) => {
    tl.to(element, animation, '<0.2') // Start 0.2s na vorige animatie
  })

  return tl
}

/**
 * Scroll Reveal - Reveal elementen tijdens scrollen
 * 12. Stagger + ScrollTrigger: Voor story scrolling effects
 */
export function scrollReveal(
  elements: HTMLElement[] | string,
  options?: ScrollTrigger.Vars
) {
  if (!ScrollTrigger) {
    // Fallback zonder ScrollTrigger
    return gsap.from(elements, {
      y: 50,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.1,
    })
  }
  
  return gsap.from(elements, {
    scrollTrigger: {
      trigger: elements,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      ...options,
    },
    y: 50,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.1,
  })
}

