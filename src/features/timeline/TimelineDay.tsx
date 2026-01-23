import type { Proposal } from '@/types'
import TimelineItem from './TimelineItem'

interface TimelineDayProps {
  date: Date
  proposals: Proposal[]
  onProposalClick?: (proposalId: string) => void
}

function formatDayHeader(date: Date): { dayOfWeek: string; fullDate: string } {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
  const fullDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return { dayOfWeek, fullDate }
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export default function TimelineDay({ date, proposals, onProposalClick }: TimelineDayProps) {
  const { dayOfWeek, fullDate } = formatDayHeader(date)
  const today = isToday(date)

  // Sort proposals by time
  const sortedProposals = [...proposals].sort((a, b) => {
    const timeA = a.scheduledTime || '99:99'
    const timeB = b.scheduledTime || '99:99'
    return timeA.localeCompare(timeB)
  })

  return (
    <div className="mb-8">
      {/* Day header */}
      <div className={`flex items-center gap-3 mb-4 pb-2 border-b-2
        ${today ? 'border-primary-500' : 'border-cream-400 dark:border-surface-dark-border'}`}
      >
        {today && (
          <span className="px-2 py-0.5 bg-primary-500 text-cream-100 text-xs font-medium rounded-full">
            Today
          </span>
        )}
        <div>
          <h3 className={`font-semibold ${today ? 'text-primary-700 dark:text-primary-400' : 'text-primary-700 dark:text-cream-100'}`}>
            {dayOfWeek}
          </h3>
          <p className="text-sm text-primary-700/60 dark:text-cream-400">
            {fullDate}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 ml-4">
        {sortedProposals.map((proposal, index) => (
          <div key={proposal.id} className="relative">
            <TimelineItem
              proposal={proposal}
              onClick={onProposalClick ? () => onProposalClick(proposal.id) : undefined}
            />
            {/* Hide connector on last item */}
            {index === sortedProposals.length - 1 && (
              <div className="absolute left-[4.5rem] top-14 bottom-0 w-0.5 bg-cream-100 dark:bg-surface-dark" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
