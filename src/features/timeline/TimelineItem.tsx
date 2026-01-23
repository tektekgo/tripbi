import type { Proposal } from '@/types'
import CategoryIcon from '@/components/ui/CategoryIcon'

interface TimelineItemProps {
  proposal: Proposal
  onClick?: () => void
}

export default function TimelineItem({ proposal, onClick }: TimelineItemProps) {
  const details = proposal.details as Record<string, string>

  return (
    <div
      onClick={onClick}
      className={`flex gap-4 p-4 bg-cream-100 dark:bg-surface-dark-elevated rounded-xl
        ${onClick ? 'cursor-pointer hover:bg-cream-200 dark:hover:bg-surface-dark-muted transition-colors' : ''}`}
    >
      {/* Time */}
      <div className="w-16 flex-shrink-0 text-center">
        {proposal.scheduledTime ? (
          <span className="text-sm font-medium text-primary-700 dark:text-cream-100">
            {proposal.scheduledTime}
          </span>
        ) : (
          <span className="text-sm text-primary-700/50">--:--</span>
        )}
      </div>

      {/* Connector line */}
      <div className="flex flex-col items-center">
        <CategoryIcon category={proposal.category} size="md" />
        <div className="flex-1 w-0.5 bg-cream-400 dark:bg-surface-dark-border mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        <h4 className="font-medium text-primary-700 dark:text-cream-100">
          {proposal.title}
        </h4>

        {details.location && (
          <p className="text-sm text-primary-700/60 dark:text-cream-400 mt-1 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {details.location}
          </p>
        )}

        {proposal.description && (
          <p className="text-sm text-primary-700/60 dark:text-cream-400 mt-1 line-clamp-2">
            {proposal.description}
          </p>
        )}
      </div>
    </div>
  )
}
