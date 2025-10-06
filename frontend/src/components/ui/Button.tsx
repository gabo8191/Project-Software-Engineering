import React from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
      outline:
        'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      link: 'text-primary-600 underline-offset-4 hover:underline p-0',
    };

    const sizeClasses = {
      sm: 'text-sm px-3 py-2 rounded-lg',
      md: 'text-base px-4 py-2 rounded-xl',
      lg: 'text-lg px-5 py-3 rounded-xl',
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={cn(
          'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50',
          variantClasses[variant],
          variant !== 'link' && sizeClasses[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-60 cursor-not-allowed',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            iconPosition === 'left' && icon
          )}
          <span>{children}</span>
          {!isLoading && iconPosition === 'right' && icon}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;