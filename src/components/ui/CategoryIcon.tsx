import type { Proposal } from '@/types'

interface CategoryIconProps {
  category: Proposal['category']
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const categoryConfig: Record<Proposal['category'], { icon: React.ReactNode; bgColor: string; textColor: string }> = {
  flights: {
    icon: (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    bgColor: 'bg-info-100 dark:bg-info-900',
    textColor: 'text-info-600 dark:text-info-400',
  },
  hotels: {
    icon: (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    bgColor: 'bg-primary-100 dark:bg-primary-900',
    textColor: 'text-primary-600 dark:text-primary-400',
  },
  activities: {
    icon: (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-warning-100 dark:bg-warning-900',
    textColor: 'text-warning-600 dark:text-warning-400',
  },
  restaurants: {
    icon: (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    bgColor: 'bg-error-100 dark:bg-error-900',
    textColor: 'text-error-600 dark:text-error-400',
  },
  transportation: {
    icon: (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 7h8m-8 4h4m5 4v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2m14-4V7a4 4 0 00-4-4H9a4 4 0 00-4 4v4h14zm-2 0a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    bgColor: 'bg-success-100 dark:bg-success-900',
    textColor: 'text-success-600 dark:text-success-400',
  },
  tasks: {
    icon: (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    bgColor: 'bg-secondary-100 dark:bg-secondary-800',
    textColor: 'text-secondary-600 dark:text-secondary-400',
  },
}

export default function CategoryIcon({ category, size = 'md', className = '' }: CategoryIconProps) {
  const config = categoryConfig[category]

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  }

  return (
    <div
      className={`rounded-xl flex items-center justify-center
                  ${sizeClasses[size]} ${config.bgColor} ${config.textColor} ${className}`}
    >
      {config.icon}
    </div>
  )
}

export function getCategoryLabel(category: Proposal['category']): string {
  const labels: Record<Proposal['category'], string> = {
    flights: 'Flight',
    hotels: 'Hotel',
    activities: 'Activity',
    restaurants: 'Restaurant',
    transportation: 'Transport',
    tasks: 'Task',
  }
  return labels[category]
}
