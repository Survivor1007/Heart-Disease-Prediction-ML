import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={twMerge(
          clsx(
            'w-full px-3.5 py-2 rounded-lg border text-sm transition-all duration-150 appearance-none',
            'bg-slate-50/50 dark:bg-slate-900/90 text-slate-900 dark:text-white',
            'border-slate-300 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400',
            'focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-400/20 focus:outline-none cursor-pointer',
            error && 'border-rose-500 focus:border-rose-500',
            className
          )
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
};
