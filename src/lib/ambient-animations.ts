/**
 * Ambient Animations
 * Subtiele, oneindige achtergrond animaties voor scènes
 * Gebaseerd op rich_story_app_vision.md
 */

import { gsap } from 'gsap'

/**
 * Wiggling Trees - Subtiele boom animatie
 */
export function animateWigglingTrees(element: HTMLElement | string) {
  return gsap.to(element, {
    rotation: 2,
    duration: 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })
}

/**
 * Twinkling Stars - Fonkelende sterren
 */
export function animateTwinklingStars(elements: HTMLElement[] | string) {
  return gsap.to(elements, {
    opacity: 0.3,
    scale: 0.8,
    duration: 1.5,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    stagger: {
      amount: 2,
      from: 'random',
    },
  })
}

/**
 * Floating Clouds - Drijvende wolken
 */
export function animateFloatingClouds(element: HTMLElement | string) {
  return gsap.to(element, {
    x: '+=100',
    duration: 20,
    ease: 'none',
    repeat: -1,
    yoyo: true,
  })
}

/**
 * Gentle Waves - Zachte golven
 */
export function animateGentleWaves(element: HTMLElement | string) {
  return gsap.to(element, {
    y: '+=20',
    duration: 3,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })
}

/**
 * Ambient Background based on setting
 */
export function createAmbientBackground(
  container: HTMLElement,
  setting: string
) {
  const settings: Record<string, () => void> = {
    forest: () => {
      const trees = container.querySelectorAll('.tree')
      if (trees.length > 0) {
        animateWigglingTrees(trees as NodeListOf<HTMLElement>)
      }
    },
    space: () => {
      const stars = container.querySelectorAll('.star')
      if (stars.length > 0) {
        animateTwinklingStars(stars as NodeListOf<HTMLElement>)
      }
    },
    ocean: () => {
      const waves = container.querySelector('.waves')
      if (waves) {
        animateGentleWaves(waves as HTMLElement)
      }
    },
    city: () => {
      const clouds = container.querySelector('.clouds')
      if (clouds) {
        animateFloatingClouds(clouds as HTMLElement)
      }
    },
  }

  const animation = settings[setting.toLowerCase()]
  if (animation) {
    animation()
  }
}

