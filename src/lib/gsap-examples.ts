/**
 * GSAP Usage Examples voor Storytelling App
 * Praktische voorbeelden van alle GSAP kernfuncties
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

/**
 * VOORBEELD 1: gsap.to() - Personage laten lopen
 */
export function animateCharacterWalk(element: HTMLElement, distance: number) {
  return gsap.to(element, {
    x: distance, // Verplaats naar rechts
    duration: 2,
    ease: 'power2.inOut',
  })
}

/**
 * VOORBEELD 2: gsap.from() - Personage in beeld laten verschijnen
 */
export function animateCharacterEntrance(element: HTMLElement) {
  return gsap.from(element, {
    x: -200, // Start buiten beeld
    opacity: 0,
    duration: 1,
    ease: 'back.out(1.7)',
  })
}

/**
 * VOORBEELD 3: gsap.fromTo() - Volledige controle
 */
export function animateCharacterMove(element: HTMLElement, fromX: number, toX: number) {
  return gsap.fromTo(
    element,
    { x: fromX, opacity: 0 }, // Begin staat
    { x: toX, opacity: 1, duration: 1.5 } // Eind staat
  )
}

/**
 * VOORBEELD 4: gsap.timeline() - Gesynchroniseerde story sequence
 */
export function animateStorySequence(
  character: HTMLElement,
  text: HTMLElement,
  choiceCards: HTMLElement[]
) {
  const tl = gsap.timeline()

  // Stap 1: Character komt binnen
  tl.from(character, { x: -200, opacity: 0, duration: 1 })

  // Stap 2: Text verschijnt (0.5s na character)
  tl.from(text, { y: 50, opacity: 0, duration: 0.8 }, '-=0.5')

  // Stap 3: Choice cards verschijnen met stagger
  tl.from(choiceCards, {
    y: 50,
    opacity: 0,
    duration: 0.5,
    stagger: 0.2, // 0.2s tussen elke card
  }, '-=0.3')

  return tl
}

/**
 * VOORBEELD 5: gsap.set() - Begin positie instellen
 */
export function setupCharacterStartPosition(element: HTMLElement, x: number, y: number) {
  gsap.set(element, {
    x,
    y,
    opacity: 0, // Start onzichtbaar
  })
}

/**
 * VOORBEELD 6-12: Eigenschappen animeren
 */
export function animateProperties(element: HTMLElement) {
  // x en y (performanter dan left/top)
  gsap.to(element, { x: 100, y: 50, duration: 1 })

  // opacity (fade in/out)
  gsap.to(element, { opacity: 0.5, duration: 0.5 })

  // scale (vergroten/verkleinen)
  gsap.to(element, { scale: 1.5, duration: 0.5 })

  // rotation (roteren)
  gsap.to(element, { rotation: 360, duration: 2 })

  // duration (duur van animatie)
  gsap.to(element, { x: 100, duration: 2 }) // 2 seconden

  // ease (versnelling)
  gsap.to(element, { x: 100, ease: 'power2.inOut' }) // Soepel
  gsap.to(element, { x: 100, ease: 'bounce.out' }) // Bounce effect
  gsap.to(element, { x: 100, ease: 'elastic.out(1, 0.3)' }) // Elastic

  // stagger (meerdere elementen met vertraging)
  gsap.to('.choice-card', {
    y: -20,
    opacity: 1,
    stagger: 0.1, // 0.1s tussen elk element
  })

  // autoAlpha (combineert opacity + visibility)
  gsap.to(element, { autoAlpha: 0 }) // opacity: 0 + visibility: hidden
}

/**
 * VOORBEELD 14: ScrollTrigger - Story scrolling
 */
export function setupStoryScrollAnimation(storyElements: HTMLElement[]) {
  if (!ScrollTrigger) return

  storyElements.forEach((element, index) => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%', // Start animatie wanneer element 80% van viewport bereikt
        end: 'top 20%',
        toggleActions: 'play none none reverse',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    })
  })
}

/**
 * VOORBEELD 18: TextPlugin - Type tekst effect
 */
export function typeStoryText(element: HTMLElement, text: string) {
  if (!TextPlugin) {
    // Fallback: set text directly
    element.textContent = text
    return
  }

  return gsap.to(element, {
    duration: text.length * 0.05, // 50ms per character
    text: {
      value: text,
      delimiter: '',
    },
    ease: 'none',
  })
}

/**
 * VOORBEELD: Stagger voor choice cards
 */
export function staggerChoiceCards(cards: HTMLElement[]) {
  return gsap.from(cards, {
    y: 50,
    opacity: 0,
    scale: 0.8,
    duration: 0.5,
    stagger: 0.15, // 0.15s tussen elke card
    ease: 'back.out(1.7)',
  })
}

/**
 * VOORBEELD: Complexe storytelling timeline
 */
export function createInteractiveStorySequence(
  elements: {
    character: HTMLElement
    text: HTMLElement
    choices: HTMLElement[]
    background: HTMLElement
  }
) {
  const tl = gsap.timeline()

  // Background fade in
  tl.to(elements.background, { opacity: 1, duration: 1 })

  // Character enters
  tl.from(elements.character, {
    x: -300,
    opacity: 0,
    scale: 0.5,
    rotation: -15,
    duration: 1.2,
    ease: 'back.out(1.7)',
  }, '-=0.5')

  // Text appears
  tl.from(elements.text, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
  }, '-=0.3')

  // Choices appear with stagger
  tl.from(elements.choices, {
    y: 100,
    opacity: 0,
    scale: 0.8,
    duration: 0.6,
    stagger: 0.2,
    ease: 'elastic.out(1, 0.5)',
  }, '-=0.2')

  return tl
}

