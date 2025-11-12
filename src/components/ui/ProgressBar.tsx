import { cn } from '../../lib/utils'
import { animateProgressBar } from '../../lib/animations'
import { useEffect, useRef } from 'react'

interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  showPercentage?: boolean
  className?: string
}

function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (barRef.current) {
      animateProgressBar(barRef.current, progress)
    }
  }, [progress])

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-soft-black">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export { ProgressBar }

