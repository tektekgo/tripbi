import type { Booking, Proposal } from '@/types'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { Timestamp } from 'firebase/firestore'

interface BookingCardProps {
  booking: Booking
  proposal: Proposal
  userName?: string
  onEdit?: () => void
  showUser?: boolean
}

function formatDate(timestamp: Timestamp | undefined): string {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function BookingCard({
  booking,
  proposal,
  userName,
  onEdit,
  showUser = false,
}: BookingCardProps) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: (
        <svg className="w-4 h-4 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      className: 'text-warning-700 dark:text-warning-400',
    },
    confirmed: {
      label: 'Confirmed',
      icon: (
        <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      className: 'text-success-700 dark:text-success-400',
    },
  }

  const status = statusConfig[booking.status]

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <CategoryIcon category={proposal.category} size="md" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-medium text-primary-700 dark:text-cream-100 line-clamp-1">
            {proposal.title}
          </h4>

          {/* User name (if showing) */}
          {showUser && userName && (
            <p className="text-sm text-primary-700/60 dark:text-cream-400">
              {userName}
            </p>
          )}

          {/* Date if scheduled */}
          {proposal.scheduledDate && (
            <p className="text-sm text-primary-700/60 dark:text-cream-400 mt-1">
              {formatDate(proposal.scheduledDate)}
              {proposal.scheduledTime && ` at ${proposal.scheduledTime}`}
            </p>
          )}

          {/* Booking details */}
          <div className="flex items-center gap-4 mt-2">
            {/* Status */}
            <div className={`flex items-center gap-1.5 text-sm ${status.className}`}>
              {status.icon}
              <span>{status.label}</span>
            </div>

            {/* Booked for count */}
            {booking.bookedForCount > 1 && (
              <span className="text-sm text-primary-700/60 dark:text-cream-400">
                For {booking.bookedForCount} people
              </span>
            )}
          </div>

          {/* Confirmation number */}
          {booking.confirmationNumber && (
            <div className="mt-2 text-sm text-primary-700/60 dark:text-cream-400">
              <span className="font-medium">Confirmation:</span> {booking.confirmationNumber}
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <p className="mt-2 text-sm text-primary-700/60 dark:text-cream-400 line-clamp-2">
              {booking.notes}
            </p>
          )}

          {/* Proof link */}
          {booking.proofUrl && (
            <a
              href={booking.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              View proof
            </a>
          )}
        </div>

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-primary-700/50 hover:text-primary-600 hover:bg-cream-200 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
