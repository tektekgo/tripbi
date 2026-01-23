import type { Proposal } from '@/types'

interface StatusBadgeProps {
  status: Proposal['status']
  size?: 'sm' | 'md'
}

const statusConfig: Record<Proposal['status'], { label: string; className: string }> = {
  proposed: {
    label: 'Proposed',
    className: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300',
  },
  discussing: {
    label: 'Discussing',
    className: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
  },
  decided: {
    label: 'Decided',
    className: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
  },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${config.className}`}>
      {config.label}
    </span>
  )
}
