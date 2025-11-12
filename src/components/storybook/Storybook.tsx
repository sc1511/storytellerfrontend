/**
 * Storybook Component
 * Container voor het magische boek met twee pagina's
 * Gebaseerd op rich_story_app_vision.md
 */

import { ReactNode, useRef } from 'react'
import { Page } from './Page'
import { usePageTurn } from '../../hooks/usePageTurn'
import { cn } from '../../lib/utils'

interface StorybookProps {
  leftPage: ReactNode
  rightPage: ReactNode
  className?: string
  onPageTurn?: () => void
}

export function Storybook({
  leftPage,
  rightPage,
  className,
  onPageTurn,
}: StorybookProps) {
  // Note: page refs are passed from parent component
  // We use the Page components directly for the refs

  return (
    <div
      className={cn(
        'relative w-full max-w-6xl mx-auto',
        'bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900',
        'rounded-lg shadow-2xl',
        'p-2 md:p-4',
        'h-full flex flex-col',
        className
      )}
      style={{
        perspective: '2000px',
      }}
    >
      {/* Book Spine Shadow */}
      <div className="absolute inset-y-0 left-1/2 w-1 bg-black/20 transform -translate-x-1/2" />

      {/* Book Pages Container */}
      <div className="relative flex gap-2 md:gap-4 flex-1 min-h-0">
        {/* Left Page */}
        <div className="flex-1 h-full">
          <Page side="left" texture className="h-full">{leftPage}</Page>
        </div>

        {/* Right Page */}
        <div className="flex-1 h-full">
          <Page side="right" texture className="h-full">{rightPage}</Page>
        </div>
      </div>
    </div>
  )
}

