import type { Booking, Proposal, TripMember } from '@/types'
import CategoryIcon from '@/components/ui/CategoryIcon'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'

interface TripBookingStatusProps {
  decidedProposals: Proposal[]
  bookings: Booking[]
  members: TripMember[]
  onMarkBooked: (proposalId: string) => void
}

export default function TripBookingStatus({
  decidedProposals,
  bookings,
  members,
  onMarkBooked,
}: TripBookingStatusProps) {
  // Get member name
  const getMemberName = (userId: string) => {
    const member = members.find(m => m.userId === userId)
    return member?.displayName || member?.email?.split('@')[0] || 'Unknown'
  }

  // Get bookings for a proposal
  const getProposalBookings = (proposalId: string) => {
    return bookings.filter(b => b.proposalId === proposalId)
  }

  if (decidedProposals.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="No decided proposals yet"
        description="Once proposals are marked as decided, track who has booked what here."
      />
    )
  }

  return (
    <div className="space-y-6">
      {decidedProposals.map((proposal) => {
        const proposalBookings = getProposalBookings(proposal.id)
        const bookedMemberIds = new Set(proposalBookings.map(b => b.userId))
        const confirmedCount = proposalBookings.filter(b => b.status === 'confirmed').length
        const pendingCount = proposalBookings.filter(b => b.status === 'pending').length
        const notBookedMembers = members.filter(m => !bookedMemberIds.has(m.userId))

        return (
          <div key={proposal.id} className="card">
            {/* Proposal header */}
            <div className="flex items-start gap-3 mb-4">
              <CategoryIcon category={proposal.category} size="md" />
              <div className="flex-1">
                <h3 className="font-medium text-primary-700 dark:text-cream-100">
                  {proposal.title}
                </h3>
                {proposal.scheduledDate && (
                  <p className="text-sm text-primary-700/60 dark:text-cream-400">
                    {proposal.scheduledDate.toDate().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {proposal.scheduledTime && ` at ${proposal.scheduledTime}`}
                  </p>
                )}
              </div>
              <div className="text-sm text-primary-700/60 dark:text-cream-400">
                {confirmedCount + pendingCount}/{members.length} booked
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-cream-300 dark:bg-surface-dark-muted rounded-full overflow-hidden mb-4">
              {members.length > 0 && (
                <div className="h-full flex">
                  {confirmedCount > 0 && (
                    <div
                      className="bg-success-500 h-full"
                      style={{ width: `${(confirmedCount / members.length) * 100}%` }}
                    />
                  )}
                  {pendingCount > 0 && (
                    <div
                      className="bg-warning-500 h-full"
                      style={{ width: `${(pendingCount / members.length) * 100}%` }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Member status list */}
            <div className="space-y-2">
              {/* Confirmed */}
              {proposalBookings
                .filter(b => b.status === 'confirmed')
                .map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 py-2">
                    <Avatar name={getMemberName(booking.userId)} size="sm" />
                    <span className="flex-1 text-sm text-primary-700/70 dark:text-cream-400">
                      {getMemberName(booking.userId)}
                    </span>
                    <div className="flex items-center gap-1.5 text-success-600 dark:text-success-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium">Confirmed</span>
                    </div>
                  </div>
                ))}

              {/* Pending */}
              {proposalBookings
                .filter(b => b.status === 'pending')
                .map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 py-2">
                    <Avatar name={getMemberName(booking.userId)} size="sm" />
                    <span className="flex-1 text-sm text-primary-700/70 dark:text-cream-400">
                      {getMemberName(booking.userId)}
                    </span>
                    <div className="flex items-center gap-1.5 text-warning-600 dark:text-warning-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium">Pending</span>
                    </div>
                  </div>
                ))}

              {/* Not booked */}
              {notBookedMembers.map((member) => (
                <div key={member.userId} className="flex items-center gap-3 py-2">
                  <Avatar name={getMemberName(member.userId)} size="sm" />
                  <span className="flex-1 text-sm text-primary-700/50">
                    {getMemberName(member.userId)}
                  </span>
                  <span className="text-xs text-primary-700/50">Not booked</span>
                </div>
              ))}
            </div>

            {/* Mark as booked button (for current user if not booked) */}
            {notBookedMembers.length > 0 && (
              <button
                onClick={() => onMarkBooked(proposal.id)}
                className="mt-4 btn-outline btn-sm w-full"
              >
                Mark as Booked
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
