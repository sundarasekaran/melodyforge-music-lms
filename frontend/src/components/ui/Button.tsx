import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  leftIcon,
  rightIcon,
  loading = false,
  isLoading,
  disabled,
  className = '',
  ...props
}) => {
  const isButtonLoading = loading || isLoading || false;
  const effectiveLeftIcon = leftIcon || (iconPosition === 'left' ? icon : null);
  const effectiveRightIcon = rightIcon || (iconPosition === 'right' ? icon : null);
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 focus-visible:outline-indigo-500',
    amber: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 focus-visible:outline-amber-400',
    secondary: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-100 border border-slate-700/80 focus-visible:outline-slate-400',
    outline: 'bg-transparent hover:bg-slate-800/60 active:bg-slate-800 text-slate-200 border border-slate-700 focus-visible:outline-slate-400',
    ghost: 'bg-transparent hover:bg-slate-800/60 active:bg-slate-800 text-slate-300 hover:text-white focus-visible:outline-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-lg shadow-rose-600/20 focus-visible:outline-rose-500',
  };

  return (
    <button
      disabled={disabled || isButtonLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isButtonLoading ? (
        <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="animate-spin" />
      ) : (
        <>
          {effectiveLeftIcon && <span className="shrink-0">{effectiveLeftIcon}</span>}
          {children && <span>{children}</span>}
          {effectiveRightIcon && <span className="shrink-0">{effectiveRightIcon}</span>}
        </>
      )}
    </button>
  );
};
