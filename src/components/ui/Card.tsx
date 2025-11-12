import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { animateCardHover, animateCardHoverOut } from "../../lib/animations"

const cardVariants = cva(
  "rounded-xl transition-all duration-300 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-white shadow-md hover:shadow-lg",
        story: "bg-white shadow-md hover:shadow-xl min-w-[200px]",
        choice: "bg-white border-2 border-gray-200 hover:border-primary",
      },
      size: {
        default: "p-4",
        story: "p-0 overflow-hidden",
        choice: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  onHover?: () => void
  onHoverOut?: () => void
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, onHover, onHoverOut, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const cardRef = React.useRef<HTMLDivElement>(null)
    
    React.useImperativeHandle(ref, () => cardRef.current as HTMLDivElement, [])
    
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (cardRef.current && variant === 'story') {
        animateCardHover(cardRef.current)
      }
      onHover?.()
      onMouseEnter?.(e)
    }
    
    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (cardRef.current && variant === 'story') {
        animateCardHoverOut(cardRef.current)
      }
      onHoverOut?.()
      onMouseLeave?.(e)
    }
    
    return (
      <div
        ref={cardRef}
        className={cn(cardVariants({ variant, size, className }))}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card, cardVariants }

