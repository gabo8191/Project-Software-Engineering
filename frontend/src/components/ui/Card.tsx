import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'low' | 'medium' | 'high';
  compact?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation = 'medium', compact = false, children, ...props }, ref) => {
    const elevationClasses = {
      flat: 'border border-gray-200',
      low: 'shadow-sm border border-gray-100',
      medium: 'shadow-apple border border-gray-100',
      high: 'shadow-apple-md border border-gray-100',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-2xl overflow-hidden animate-fade-in', 
          elevationClasses[elevation],
          compact ? 'p-4' : 'p-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;