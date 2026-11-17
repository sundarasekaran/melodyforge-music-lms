import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200';

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantStyles = {
    default: 'bg-slate-900/90 border border-slate-800 shadow-xl',
    elevated: 'bg-slate-900 border border-slate-700/60 shadow-2xl shadow-black/40',
    glass: 'bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-xl',
    interactive: 'bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 hover:shadow-2xl cursor-pointer active:scale-[0.99]',
  };

  return (
    <div className={`${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`pb-4 border-b border-slate-800/80 mb-4 flex items-center justify-between gap-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-bold text-slate-100 tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-slate-400 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`pt-4 border-t border-slate-800/80 mt-6 flex items-center justify-between gap-3 ${className}`} {...props}>
    {children}
  </div>
);
