/**
 * Page Component
 * Een pagina die kan omslaan met 3D GSAP animatie
 * Gebaseerd op rich_story_app_vision.md
 */

import { forwardRef, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface PageProps {
  children: ReactNode
  className?: string
  side: 'left' | 'right'
  texture?: boolean // Paper texture effect
}

export const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ children, className, side, texture = true }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full h-full',
          'bg-gradient-to-br from-warm-white via-white to-warm-white',
          'shadow-lg',
          texture && 'before:absolute before:inset-0 before:opacity-10',
          texture &&
            "before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]",
          'overflow-hidden',
          className
        )}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
      >
        <div className="relative z-10 w-full h-full p-4 md:p-6 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    )
  }
)

Page.displayName = 'Page'

