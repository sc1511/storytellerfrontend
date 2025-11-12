/**
 * LottiePlayer Component
 * Speelt Lottie animaties af voor story visualisaties
 * Gebaseerd op rich_story_app_vision.md
 */

import { useEffect, useRef } from 'react'
import Lottie from 'lottie-react'
import type { AnimationItem } from 'lottie-web'

interface LottiePlayerProps {
  animationData?: object | null
  autoplay?: boolean
  loop?: boolean
  className?: string
  onComplete?: () => void
}

export function LottiePlayer({
  animationData,
  autoplay = true,
  loop = false,
  className = '',
  onComplete,
}: LottiePlayerProps) {
  const animationRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (animationRef.current && onComplete) {
      const animation = animationRef.current

      const handleComplete = () => {
        if (!loop && onComplete) {
          onComplete()
        }
      }

      animation.addEventListener('complete', handleComplete)

      return () => {
        animation.removeEventListener('complete', handleComplete)
      }
    }
  }, [loop, onComplete])

  if (!animationData) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-gray-400 text-4xl">🎬</div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Lottie
        lottieRef={(instance) => {
          animationRef.current = instance
        }}
        animationData={animationData}
        autoplay={autoplay}
        loop={loop}
        className="w-full h-full"
      />
    </div>
  )
}

