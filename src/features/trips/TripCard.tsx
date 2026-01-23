import type { Trip } from '@/types'
import { AvatarGroup } from '@/components/ui/Avatar'
import { Timestamp } from 'firebase/firestore'

interface TripCardProps {
  trip: Trip
  onClick: () => void
}

function formatDateRange(startDate: Timestamp, endDate: Timestamp): string {
  const start = startDate.toDate()
  const end = endDate.toDate()

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const endDay = end.getDate()
  const year = start.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
}

function getTripStatusBadge(status: Trip['status']) {
  const config = {
    planning: { label: 'Planning', className: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300' },
    active: { label: 'Active', className: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300' },
    completed: { label: 'Completed', className: 'bg-cream-400 text-cream-700 dark:bg-surface-dark-muted dark:text-cream-400' },
  }
  return config[status]
}

export default function TripCard({ trip, onClick }: TripCardProps) {
  const statusBadge = getTripStatusBadge(trip.status)
  const memberUsers = trip.memberDetails.map(m => ({
    photoURL: null,
    displayName: m.displayName || m.email,
  }))

  return (
    <div
      onClick={onClick}
      className="card-interactive cursor-pointer border-l-4 border-l-primary-500"
    >
      {/* Header row with status and members */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
        <div className="flex items-center gap-2">
          <AvatarGroup users={memberUsers} max={3} size="sm" />
          <span className="text-xs text-primary-700/60 dark:text-cream-400">
            {trip.members.length}
          </span>
        </div>
      </div>

      {/* Trip name */}
      <h3 className="text-lg font-semibold text-primary-700 dark:text-cream-100 line-clamp-1 mb-2">
        {trip.name}
      </h3>

      {/* Destination and dates in a compact row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-primary-700/70 dark:text-cream-400">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{trip.destination}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>
      </div>
    </div>
  )
}
