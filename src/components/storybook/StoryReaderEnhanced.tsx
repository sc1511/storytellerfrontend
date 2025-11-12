/**
 * StoryReaderEnhanced Component
 * Enhanced story reader met Storybook, Lottie, en ambient animations
 * Gebaseerd op rich_story_app_vision.md
 */

import { useState, useEffect, useRef } from 'react'
import { Storybook } from './Storybook'
import { LottiePlayer } from './LottiePlayer'
import { CustomCursor } from './CustomCursor'
import { Button } from '../ui/Button'
import { ChoiceCard } from '../ui/ChoiceCard'
import { ProgressBar } from '../ui/ProgressBar'
import { createAmbientBackground } from '../../lib/ambient-animations'
import { createConfettiBurst, createStarExplosion } from '../../lib/reward-animations'
import { animateCharacterEntrance } from '../../lib/animations'
import { gsap } from 'gsap'
import type { StorySegment } from '../../types'

interface StoryReaderEnhancedProps {
  currentSegment: StorySegment
  nextSegments?: StorySegment[]
  onChoiceSelect: (choice: { label: string; description: string }) => void
  onNextSegment?: () => void
  onPreviousSegment?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
  progress?: number
}

export function StoryReaderEnhanced({
  currentSegment,
  nextSegments = [],
  onChoiceSelect,
  onNextSegment,
  onPreviousSegment,
  canGoNext = false,
  canGoPrevious = false,
  progress = 0,
}: StoryReaderEnhancedProps) {
  const [showLottie, setShowLottie] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const characterRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const choicesRef = useRef<HTMLDivElement>(null)

  // Setup ambient background animations
  useEffect(() => {
    if (containerRef.current) {
      // Create ambient background based on setting (from metadata)
      // This is a placeholder - you'll need to pass setting from props
      createAmbientBackground(containerRef.current, 'forest')
    }
  }, [])

  // Character entrance animation
  useEffect(() => {
    if (characterRef.current) {
      animateCharacterEntrance(characterRef.current)
    }
  }, [currentSegment])

  // Text reveal animation
  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )
    }
  }, [currentSegment.story_text])

  // Choice cards reveal
  useEffect(() => {
    if (choicesRef.current && currentSegment.next_choices.length > 0) {
      const cards = choicesRef.current.querySelectorAll('.choice-card')
      gsap.from(cards, {
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        delay: 0.5,
      })
    }
  }, [currentSegment.next_choices])

  const handleChoice = (choice: { label: string; description: string }) => {
    // Reward animation
    if (containerRef.current) {
      createConfettiBurst(containerRef.current)
      createStarExplosion(containerRef.current)
    }

    // Hide Lottie after animation
    setTimeout(() => {
      setShowLottie(false)
    }, 1000)

    onChoiceSelect(choice)
  }

  // Left page content (current segment)
  const leftPageContent = (
    <div ref={containerRef} className="h-full flex flex-col">
      {/* Character illustration area */}
      <div ref={characterRef} className="flex-1 flex items-center justify-center mb-4">
        {showLottie && currentSegment.animationFile && (
          <LottiePlayer
            animationData={currentSegment.animationFile}
            autoplay
            loop={false}
            className="w-full h-64"
          />
        )}
        {!currentSegment.animationFile && (
          <div className="text-8xl">🎭</div>
        )}
      </div>

      {/* Story text */}
      <div ref={textRef} className="story-text text-lg md:text-xl leading-relaxed mb-6">
        {currentSegment.story_text}
      </div>

      {/* Progress */}
      <ProgressBar progress={progress} label="Verhaal voortgang" />
    </div>
  )

  // Right page content (choices or next segment preview)
  const rightPageContent = (
    <div className="h-full flex flex-col items-center justify-center">
      {currentSegment.next_choices.length > 0 ? (
        <>
          <h3 className="text-2xl font-bold mb-6 text-center">Wat doe je nu?</h3>
          <div ref={choicesRef} className="space-y-4 w-full">
            {currentSegment.next_choices.map((choice, index) => (
              <ChoiceCard
                key={index}
                label={choice.label}
                description={choice.description}
                color={index === 0 ? 'blue' : index === 1 ? 'green' : 'yellow'}
                onClick={() => handleChoice(choice)}
                className="choice-card"
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">Verhaal voltooid!</h3>
          <p className="text-gray-600">Wat een avontuur!</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      <CustomCursor enabled={true} />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-8">
        <Storybook
          leftPage={leftPageContent}
          rightPage={rightPageContent}
          onPageTurn={onNextSegment}
        />

        {/* Navigation buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="secondary"
            onClick={onPreviousSegment}
            disabled={!canGoPrevious}
          >
            ← Vorige
          </Button>
          <Button
            variant="primary"
            onClick={onNextSegment}
            disabled={!canGoNext}
          >
            Volgende →
          </Button>
        </div>
      </div>
    </>
  )
}

