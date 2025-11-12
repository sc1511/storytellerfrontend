/**
 * Reward Animations
 * Confetti, stars, en andere beloningsanimaties
 * Gebaseerd op rich_story_app_vision.md
 */

import { gsap } from 'gsap'

/**
 * Confetti Burst
 */
export function createConfettiBurst(container: HTMLElement) {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181']
  const particles = 50

  for (let i = 0; i < particles; i++) {
    const particle = document.createElement('div')
    particle.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      left: ${container.offsetWidth / 2}px;
      top: ${container.offsetHeight / 2}px;
    `
    container.appendChild(particle)

    const angle = (i / particles) * Math.PI * 2
    const distance = 200 + Math.random() * 100

    gsap.to(particle, {
      x: `+=${Math.cos(angle) * distance}`,
      y: `+=${Math.sin(angle) * distance}`,
      opacity: 0,
      scale: 0,
      rotation: 360,
      duration: 1.5,
      delay: i * 0.02,
      ease: 'power2.out',
      onComplete: () => {
        particle.remove()
      },
    })
  }
}

/**
 * Star Explosion
 */
export function createStarExplosion(container: HTMLElement) {
  const stars = 20

  for (let i = 0; i < stars; i++) {
    const star = document.createElement('div')
    star.innerHTML = '⭐'
    star.style.cssText = `
      position: absolute;
      font-size: 24px;
      pointer-events: none;
      left: ${container.offsetWidth / 2}px;
      top: ${container.offsetHeight / 2}px;
    `
    container.appendChild(star)

    const angle = (i / stars) * Math.PI * 2
    const distance = 150 + Math.random() * 50

    gsap.fromTo(
      star,
      {
        scale: 0,
        opacity: 1,
        rotation: 0,
      },
      {
        x: `+=${Math.cos(angle) * distance}`,
        y: `+=${Math.sin(angle) * distance}`,
        scale: 1.5,
        opacity: 0,
        rotation: 360,
        duration: 1.2,
        delay: i * 0.03,
        ease: 'back.out(1.7)',
        onComplete: () => {
          star.remove()
        },
      }
    )
  }
}

/**
 * Success Pulse
 */
export function createSuccessPulse(element: HTMLElement) {
  const tl = gsap.timeline()

  tl.to(element, {
    scale: 1.2,
    duration: 0.3,
    ease: 'power2.out',
  })
    .to(element, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.in',
    })
    .to(
      element,
      {
        boxShadow: '0 0 30px rgba(76, 175, 80, 0.6)',
        duration: 0.5,
      },
      '<'
    )
    .to(
      element,
      {
        boxShadow: '0 0 0px rgba(76, 175, 80, 0)',
        duration: 0.5,
      },
      '>-0.3'
    )

  return tl
}

