import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  emoji?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  selected?: boolean;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ emoji, imageUrl, size = 'md', selected = false, className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-16 h-16 text-2xl',
      md: 'w-24 h-24 text-4xl',
      lg: 'w-32 h-32 text-5xl',
      xl: 'w-40 h-40 text-6xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100',
          'border-4 transition-all',
          selected
            ? 'border-blue-500 scale-110 shadow-lg'
            : 'border-gray-200 hover:scale-105 cursor-pointer',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{emoji || '👤'}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };

