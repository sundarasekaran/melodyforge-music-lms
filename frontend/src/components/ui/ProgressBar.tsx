import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  color?: 'indigo' | 'gold' | 'emerald' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = false,
  color = 'indigo',
  size = 'md',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorStyles = {
    indigo: 'bg-indigo-600',
    gold: 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-sm shadow-amber-500/20',
    emerald: 'bg-emerald-500',
    gradient: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-bold text-slate-200">{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-950/80 rounded-full overflow-hidden border border-slate-800/80 ${sizeStyles[size]}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${colorStyles[color]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
