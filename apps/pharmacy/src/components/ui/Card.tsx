'use client';

import clsx from 'clsx';
import { Icon } from './Icon';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-100', paddingStyles[padding], className)}>
      {children}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    label: string;
  };
  link?: {
    href: string;
    label: string;
  };
}

export function StatsCard({ title, value, icon, iconColor = 'text-primary-500', iconBgColor = 'bg-primary-50', trend, link }: StatsCardProps) {
  return (
    <Card padding="none">
      <div className="p-5">
        <div className="flex items-center">
          <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', iconBgColor)}>
            <Icon name={icon} className={iconColor} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center">
            <Icon
              name={trend.value >= 0 ? 'trending_up' : 'trending_down'}
              size="sm"
              className={trend.value >= 0 ? 'text-success-500' : 'text-error-500'}
            />
            <span className={clsx('text-sm ml-1', trend.value >= 0 ? 'text-success-600' : 'text-error-600')}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">{trend.label}</span>
          </div>
        )}
      </div>
      {link && (
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
          <a href={link.href} className="text-sm font-medium text-primary-600 hover:text-primary-500">
            {link.label}
          </a>
        </div>
      )}
    </Card>
  );
}
