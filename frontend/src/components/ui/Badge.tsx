import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'amber' | 'indigo' | 'emerald' | 'rose' | 'slate' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-bold tracking-tight rounded-full select-none';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const variantStyles = {
    default: 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60',
    gold: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10',
    indigo: 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700/80',
    outline: 'bg-transparent text-slate-300 border border-slate-700',
  };

  const dotColors = {
    default: 'bg-indigo-400',
    gold: 'bg-amber-400',
    amber: 'bg-amber-400',
    indigo: 'bg-indigo-400',
    emerald: 'bg-emerald-400',
    rose: 'bg-rose-400',
    slate: 'bg-slate-400',
    outline: 'bg-slate-400',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {children}
    </span>
  );
};
