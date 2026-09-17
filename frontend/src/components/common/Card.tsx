import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'bordered';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  const base = 'rounded-xl transition-all duration-200';

  const variants = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm',
    elevated: 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800/60 shadow-lg',
    bordered: 'border-2 border-slate-200 dark:border-slate-800 bg-transparent',
  };

  const hover = hoverEffect ? 'hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:shadow-md transition-all' : '';

  return (
    <div className={twMerge(clsx(base, variants[variant], hover, className))} {...props}>
      {children}
    </div>
  );
};
