import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  unit?: string;
  warning?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  unit,
  warning,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {label}
          </label>
          {unit && <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{unit}</span>}
        </div>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2 rounded-lg border text-sm transition-all duration-150',
              'bg-slate-50/50 dark:bg-slate-900/90 text-slate-900 dark:text-white',
              'border-slate-300 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400',
              'focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-400/20 focus:outline-none',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              warning && !error && 'border-amber-400 focus:border-amber-400 focus:ring-amber-400/20',
              className
            )
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{error}</p>}
      {warning && !error && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{warning}</p>}
      {helperText && !error && !warning && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
};
