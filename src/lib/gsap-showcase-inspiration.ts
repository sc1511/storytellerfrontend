/**
 * GSAP Showcase Inspiration voor Storytelling App
 * Gebaseerd op beste praktijken van GSAP showcase sites
 * 
 * Relevante showcase technieken:
 * 1. Scroll-triggered story reveals (zoals BMSG FES'25)
 * 2. Smooth page transitions (zoals SIRUP OWARI DIARY)
 * 3. Interactive card animations (zoals Pantheon Media Group)
 * 4. Timeline-based storytelling sequences
 * 5. Character entrance animations
 * 6. Choice card reveal with stagger
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

/**
 * SHOWCASE 1: Smooth Story Card Reveal (zoals Pantheon Media Group)
 * Cards verschijnen met een elegante stagger animatie
 */
export function revealStoryCards(cards: HTMLElement[] | string) {
  return gsap.from(cards, {
    y: 100,
    opacity: 0,
    scale: 0.8,
    rotation: -5,
    duration: 0.8,
    stagger: {
      amount: 0.6, // Totale tijd verdeeld over alle cards
      from: 'start',
    },
    ease: 'power3.out',
    scrollTrigger: {
      trigger: cards,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  })
}

/**
 * SHOWCASE 2: Smooth Page Transition (zoals SIRUP OWARI DIARY)
 * Vloeiende overgang tussen story segments
 */
export function smoothPageTransition(
  currentPage: HTMLElement,
  nextPage: HTMLElement,
  direction: 'forward' | 'backward' = 'forward'
) {
  const tl = gsap.timeline()
  
  const exitX = direction === 'forward' ? -100 : 100
  const enterX = direction === 'forward' ? 100 : -100

  // Exit current page
  tl.to(currentPage, {
    x: exitX,
    opacity: 0,
    scale: 0.95,
    duration: 0.5,
    ease: 'power2.in',
  })

  // Enter next page
  tl.fromTo(
    nextPage,
    {
      x: enterX,
      opacity: 0,
      scale: 0.95,
    },
    {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'power3.out',
    },
    '-=0.3' // Overlap met vorige animatie
  )

  return tl
}

/**
 * SHOWCASE 3: Scroll-Triggered Story Reveal (zoals BMSG FES'25)
 * Story text verschijnt terwijl gebruiker scrollt
 */
export function scrollStoryReveal(
  storyElements: Array<{
    element: HTMLElement
    text: string
    delay?: number
  }>
) {
  if (!ScrollTrigger) return

  storyElements.forEach(({ element, text, delay = 0 }) => {
    // Set initial state
    gsap.set(element, { opacity: 0, y: 50 })

    // Create scroll trigger
    ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        const tl = gsap.timeline({ delay })
        
        // Fade in element
        tl.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        })

        // Type text (if TextPlugin available)
        if (TextPlugin) {
          tl.to(element, {
            text: {
              value: text,
              delimiter: '',
            },
            duration: text.length * 0.03, // Sneller voor kids
            ease: 'none',
          }, '-=0.5')
        }
      },
    })
  })
}

/**
 * SHOWCASE 4: Interactive Choice Cards Reveal
 * Cards verschijnen met bounce effect en stagger
 */
export function revealChoiceCards(cards: HTMLElement[] | string) {
  return gsap.from(cards, {
    y: 150,
    opacity: 0,
    scale: 0.3,
    rotation: -15,
    duration: 0.9,
    stagger: {
      amount: 0.8,
      from: 'center', // Start van het midden
    },
    ease: 'back.out(1.7)',
  })
}

/**
 * SHOWCASE 5: Character Entrance (Dramatic)
 * Character verschijnt met impact voor storytelling
 */
export function dramaticCharacterEntrance(
  character: HTMLElement,
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left'
) {
  const directions = {
    left: { x: -500, y: 0, rotation: -30 },
    right: { x: 500, y: 0, rotation: 30 },
    top: { x: 0, y: -300, rotation: 0 },
    bottom: { x: 0, y: 300, rotation: 0 },
  }

  const tl = gsap.timeline()

  // Initial setup (off-screen)
  tl.set(character, {
    ...directions[direction],
    opacity: 0,
    scale: 0.5,
  })

  // Entrance
  tl.to(character, {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    rotation: 0,
    duration: 1.2,
    ease: 'power3.out',
  })

  // Bounce settle
  tl.to(character, {
    scale: 1.1,
    duration: 0.2,
    yoyo: true,
    repeat: 1,
    ease: 'power2.inOut',
  })

  return tl
}

/**
 * SHOWCASE 6: Parallax Background Effect
 * Background beweegt langzamer dan foreground voor diepte
 */
export function createParallaxEffect(
  background: HTMLElement,
  foreground: HTMLElement
) {
  if (!ScrollTrigger) return

  // Background beweegt langzamer
  gsap.to(background, {
    yPercent: -50, // 50% langzamer
    ease: 'none',
    scrollTrigger: {
      trigger: foreground,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true, // Smooth scroll
    },
  })

  // Foreground beweegt normaal
  gsap.to(foreground, {
    yPercent: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: foreground,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })
}

/**
 * SHOWCASE 7: Magnetic Button Effect
 * Button "volgt" cursor voor interactieve feel
 */
export function createMagneticButton(button: HTMLElement) {
  const moveButton = (e: MouseEvent) => {
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    gsap.to(button, {
      x: x * 0.3, // 30% magnetisch effect
      y: y * 0.3,
      duration: 0.5,
      ease: 'power2.out',
    })
  }

  const resetButton = () => {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    })
  }

  button.addEventListener('mousemove', moveButton)
  button.addEventListener('mouseleave', resetButton)

  return () => {
    button.removeEventListener('mousemove', moveButton)
    button.removeEventListener('mouseleave', resetButton)
  }
}

/**
 * SHOWCASE 8: Story Progress Indicator
 * Animated progress bar die vult tijdens scrollen
 */
export function animateStoryProgress(progressBar: HTMLElement) {
  if (!ScrollTrigger) return

  return gsap.to(progressBar, {
    width: '100%',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
    ease: 'none',
  })
}

/**
 * SHOWCASE 9: Split Text Reveal
 * Text verschijnt woord voor woord (typography animation)
 */
export function splitTextReveal(textElement: HTMLElement) {
  const text = textElement.textContent || ''
  const words = text.split(' ')

  // Clear original text
  textElement.textContent = ''

  // Create spans for each word
  words.forEach((word, i) => {
    const span = document.createElement('span')
    span.textContent = word + ' '
    span.style.opacity = '0'
    span.style.display = 'inline-block'
    textElement.appendChild(span)

    // Animate each word
    gsap.to(span, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay: i * 0.1, // Stagger
      ease: 'power2.out',
    })
  })
}

/**
 * SHOWCASE 10: Loading Sequence
 * Elegante loading animatie met meerdere stappen
 */
export function elegantLoadingSequence(
  elements: HTMLElement[],
  onComplete?: () => void
) {
  const tl = gsap.timeline({
    onComplete,
  })

  elements.forEach((element, i) => {
    tl.from(
      element,
      {
        scale: 0,
        opacity: 0,
        rotation: 180,
        duration: 0.6,
        ease: 'back.out(1.7)',
      },
      i * 0.1
    )
  })

  return tl
}

/**
 * SHOWCASE 11: Interactive Story Element Hover
 * Story elements reageren op hover met smooth animations
 */
export function createInteractiveStoryElement(
  element: HTMLElement,
  hoverScale: number = 1.1
) {
  const handleMouseEnter = () => {
    gsap.to(element, {
      scale: hoverScale,
      y: -10,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    gsap.to(element, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: 'power2.inOut',
    })
  }

  element.addEventListener('mouseenter', handleMouseEnter)
  element.addEventListener('mouseleave', handleMouseLeave)

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter)
    element.removeEventListener('mouseleave', handleMouseLeave)
  }
}

/**
 * SHOWCASE 12: Story Segment Timeline
 * Complexe storytelling sequence met meerdere elementen
 */
export function createStorySegmentTimeline(
  elements: {
    background: HTMLElement
    character: HTMLElement
    text: HTMLElement
    choices: HTMLElement[]
  }
) {
  const tl = gsap.timeline()

  // 1. Background fade in
  tl.from(elements.background, {
    opacity: 0,
    duration: 1,
    ease: 'power2.inOut',
  })

  // 2. Character enters (dramatic)
  tl.from(elements.character, {
    x: -400,
    opacity: 0,
    scale: 0.5,
    rotation: -20,
    duration: 1.2,
    ease: 'back.out(1.7)',
  }, '-=0.5')

  // 3. Text appears
  tl.from(elements.text, {
    y: 100,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, '-=0.3')

  // 4. Choices appear with stagger
  tl.from(elements.choices, {
    y: 150,
    opacity: 0,
    scale: 0.3,
    rotation: -15,
    duration: 0.9,
    stagger: 0.2,
    ease: 'back.out(1.7)',
  }, '-=0.2')

  return tl
}

/**
 * SHOWCASE 13: Smooth Scroll Snap
 * Smooth scrolling tussen story segments
 */
export function enableSmoothScrollSnap(
  container: HTMLElement,
  snapElements: HTMLElement[]
) {
  if (!ScrollTrigger) return

  gsap.to(snapElements, {
    scrollTrigger: {
      trigger: container,
      pin: true,
      snap: {
        snapTo: 1 / (snapElements.length - 1),
        duration: { min: 0.2, max: 0.6 },
        ease: 'power1.inOut',
      },
    },
  })
}

/**
 * SHOWCASE 14: Particle Effect on Choice
 * Particles verschijnen bij choice selection
 */
export function createChoiceParticles(
  container: HTMLElement,
  choiceCard: HTMLElement
) {
  const particles = 20
  const particleElements: HTMLElement[] = []

  // Create particles
  for (let i = 0; i < particles; i++) {
    const particle = document.createElement('div')
    particle.className = 'choice-particle'
    particle.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: var(--primary);
      border-radius: 50%;
      pointer-events: none;
    `
    container.appendChild(particle)
    particleElements.push(particle)
  }

  // Animate particles
  particleElements.forEach((particle, i) => {
    const angle = (i / particles) * Math.PI * 2
    const distance = 100 + Math.random() * 50

    gsap.fromTo(
      particle,
      {
        x: choiceCard.offsetLeft + choiceCard.offsetWidth / 2,
        y: choiceCard.offsetTop + choiceCard.offsetHeight / 2,
        opacity: 1,
        scale: 1,
      },
      {
        x: `+=${Math.cos(angle) * distance}`,
        y: `+=${Math.sin(angle) * distance}`,
        opacity: 0,
        scale: 0,
        duration: 1,
        delay: i * 0.02,
        ease: 'power2.out',
        onComplete: () => {
          particle.remove()
        },
      }
    )
  })
}

