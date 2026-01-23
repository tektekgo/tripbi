import { useMemo } from 'react'
import type { Proposal, TripTimezoneSettings } from '@/types'
import TimelineDay from './TimelineDay'
import EmptyState from '@/components/ui/EmptyState'

interface TimelineViewProps {
  proposals: Proposal[]
  onProposalClick?: (proposalId: string) => void
  onExport?: () => void
  timezoneSettings?: TripTimezoneSettings
}

interface DayGroup {
  date: Date
  dateKey: string
  proposals: Proposal[]
}

export default function TimelineView({ proposals, onProposalClick, onExport, timezoneSettings }: TimelineViewProps) {
  // Filter to decided proposals with scheduled dates
  const timelineProposals = useMemo(() => {
    return proposals.filter(p => p.status === 'decided' && p.scheduledDate)
  }, [proposals])

  // Group by day
  const dayGroups = useMemo<DayGroup[]>(() => {
    const groups = new Map<string, { date: Date; proposals: Proposal[] }>()

    timelineProposals.forEach((proposal) => {
      if (!proposal.scheduledDate) return

      const date = proposal.scheduledDate.toDate()
      const dateKey = date.toISOString().split('T')[0]

      if (!groups.has(dateKey)) {
        groups.set(dateKey, { date, proposals: [] })
      }
      groups.get(dateKey)!.proposals.push(proposal)
    })

    // Sort by date
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, { date, proposals }]) => ({
        dateKey,
        date,
        proposals,
      }))
  }, [timelineProposals])

  if (timelineProposals.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        title="Timeline is empty"
        description="Decided proposals with scheduled dates will automatically appear here in chronological order."
      />
    )
  }

  return (
    <div>
      {/* Header with export button */}
      {onExport && (
        <div className="flex justify-end mb-6">
          <button onClick={onExport} className="btn-outline btn-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      )}

      {/* Timeline days */}
      <div>
        {dayGroups.map(({ dateKey, date, proposals }) => (
          <TimelineDay
            key={dateKey}
            date={date}
            proposals={proposals}
            onProposalClick={onProposalClick}
            timezoneSettings={timezoneSettings}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 pt-6 border-t border-cream-400 dark:border-surface-dark-border">
        <div className="flex items-center justify-between text-sm text-primary-700/60 dark:text-cream-400">
          <span>{timelineProposals.length} items in timeline</span>
          <span>{dayGroups.length} days</span>
        </div>
      </div>
    </div>
  )
}
