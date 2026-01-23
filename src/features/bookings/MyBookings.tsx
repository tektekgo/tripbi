import type { Booking, Proposal } from '@/types'
import BookingCard from './BookingCard'
import EmptyState from '@/components/ui/EmptyState'

interface MyBookingsProps {
  bookings: Booking[]
  proposals: Proposal[]
  onEditBooking: (bookingId: string) => void
}

export default function MyBookings({ bookings, proposals, onEditBooking }: MyBookingsProps) {
  // Group bookings by status
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const pendingBookings = bookings.filter(b => b.status === 'pending')

  // Get proposal for a booking
  const getProposal = (proposalId: string) => proposals.find(p => p.id === proposalId)

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="No bookings yet"
        description="Once proposals are decided, you can track your bookings here."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success-500" />
          <span className="text-cream-700 dark:text-cream-400">
            {confirmedBookings.length} confirmed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning-500" />
          <span className="text-cream-700 dark:text-cream-400">
            {pendingBookings.length} pending
          </span>
        </div>
      </div>

      {/* Confirmed Bookings */}
      {confirmedBookings.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-success-700 dark:text-success-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Confirmed Bookings
          </h3>
          <div className="space-y-3">
            {confirmedBookings.map((booking) => {
              const proposal = getProposal(booking.proposalId)
              if (!proposal) return null
              return (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  proposal={proposal}
                  onEdit={() => onEditBooking(booking.id)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Pending Bookings */}
      {pendingBookings.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-warning-700 dark:text-warning-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pending Bookings
          </h3>
          <div className="space-y-3">
            {pendingBookings.map((booking) => {
              const proposal = getProposal(booking.proposalId)
              if (!proposal) return null
              return (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  proposal={proposal}
                  onEdit={() => onEditBooking(booking.id)}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
