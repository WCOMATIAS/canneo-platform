'use client';

import clsx from 'clsx';
import { Icon } from './Icon';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'primary';
}

const variantStyles = {
  default: {
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  success: {
    iconBg: 'bg-success-50',
    iconColor: 'text-success-500',
  },
  warning: {
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning-500',
  },
  primary: {
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-500',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className={clsx('p-3 rounded-xl', styles.iconBg)}>
          <Icon name={icon} size="lg" className={styles.iconColor} />
        </div>
        {trend && (
          <div
            className={clsx(
              'flex items-center gap-1 text-sm font-medium',
              trend.value >= 0 ? 'text-success-500' : 'text-error-500'
            )}
          >
            <Icon name={trend.value >= 0 ? 'trending_up' : 'trending_down'} size="sm" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {trend && <p className="text-xs text-gray-400 mt-1">{trend.label}</p>}
      </div>
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={clsx('card', className)}>{children}</div>;
}

interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, action }: CardHeaderProps) {
  return (
    <div className="card-header">
      <h3 className="card-title">{title}</h3>
      {action}
    </div>
  );
}
