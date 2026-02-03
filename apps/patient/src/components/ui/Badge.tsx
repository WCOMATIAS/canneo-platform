'use client';

import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'primary' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  primary: 'badge-primary',
  gray: 'bg-gray-100 text-gray-600',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ children, variant = 'gray', size = 'sm', className }: BadgeProps) {
  return (
    <span className={clsx('badge', variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  );
}
