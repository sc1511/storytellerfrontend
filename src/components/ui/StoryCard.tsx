import { Card } from './Card'
import { cn } from '../../lib/utils'
// Removed lucide-react import - using icon images instead

interface StoryCardProps {
  title: string
  rating?: number // 1-5
  ageRange?: string // e.g., "5-7 years"
  imageUrl?: string
  onClick?: () => void
  className?: string
}

export default function StoryCard({
  title,
  rating = 5,
  ageRange,
  imageUrl,
  onClick,
  className,
}: StoryCardProps) {
  return (
    <Card
      variant="story"
      size="story"
      onClick={onClick}
      className={cn('flex flex-col', className)}
      style={{ minWidth: '200px', width: '200px' }} // Min 200px voor touch (UI patterns)
    >
      {/* Book Cover Image */}
      <div className="w-full h-[280px] bg-gradient-to-br from-sky-blue to-playful-purple flex items-center justify-center relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <img src="/icon_star2-removebg-preview.png" alt="Book" className="w-24 h-24 object-contain opacity-80" />
        )}
      </div>

      {/* Story Info */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="text-lg font-bold text-soft-black line-clamp-2">
          {title}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'text-lg',
                  i < rating ? 'text-achievement-gold' : 'text-gray-300'
                )}
              >
                <img src="/icon_star_alone-removebg-preview.png" alt="Star" className="w-4 h-4 object-contain" />
              </span>
            ))}
            <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
          </div>
        )}

        {/* Age Badge */}
        {ageRange && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <img src="/icon_star2-removebg-preview.png" alt="Age" className="w-4 h-4 object-contain" />
            <span>{ageRange}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

