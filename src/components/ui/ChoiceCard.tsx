import { Card } from './Card'
import { cn } from '../../lib/utils'
import { animateChoiceSelect } from '../../lib/animations'
import { useRef } from 'react'

interface ChoiceCardProps {
  label: string // A, B, or C
  description: string
  imageUrl?: string
  color?: 'blue' | 'green' | 'yellow' // Color coding: A=blauw, B=groen, C=geel
  onClick?: () => void
  className?: string
  disabled?: boolean
}

const colorClasses = {
  blue: 'border-sky-blue hover:border-sky-blue bg-sky-blue/5',
  green: 'border-fresh-green hover:border-fresh-green bg-fresh-green/5',
  yellow: 'border-sunshine-yellow hover:border-sunshine-yellow bg-sunshine-yellow/5',
}

function ChoiceCard({
  label,
  description,
  imageUrl,
  color = 'blue',
  onClick,
  className,
  disabled = false,
}: ChoiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    if (disabled || !cardRef.current) return
    
    // GSAP animation voor choice selection
    animateChoiceSelect(cardRef.current)
    onClick?.()
  }

  return (
    <Card
      ref={cardRef}
      variant="choice"
      size="choice"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative',
        colorClasses[color],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Label Badge */}
      <div className="absolute top-4 left-4 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
        {label}
      </div>

      {/* Visual Representation */}
      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={description}
            className="w-full h-full object-cover"
          />
        ) : (
                <img src="/icon_star_alone-removebg-preview.png" alt="Choice" className="w-16 h-16 object-contain opacity-40" />
        )}
      </div>

      {/* Description */}
      <p className="text-base font-medium text-soft-black text-center leading-relaxed">
        {description}
      </p>
    </Card>
  )
}

export { ChoiceCard }

