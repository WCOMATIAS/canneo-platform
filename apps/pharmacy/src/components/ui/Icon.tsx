'use client';

import clsx from 'clsx';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  filled?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

export function Icon({ name, size = 'md', filled = false, className }: IconProps) {
  return (
    <span
      className={clsx(
        'material-symbols-outlined',
        sizeMap[size],
        filled && 'filled',
        className
      )}
    >
      {name}
    </span>
  );
}
