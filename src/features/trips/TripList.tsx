import type { Trip } from '@/types'
import TripCard from './TripCard'
import EmptyState from '@/components/ui/EmptyState'

interface TripListProps {
  trips: Trip[]
  onTripClick: (tripId: string) => void
  onCreateTrip: () => void
  loading?: boolean
}

export default function TripList({ trips, onTripClick, onCreateTrip, loading }: TripListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner-lg text-primary-500"></div>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="No trips yet"
        description="Create your first trip to start planning your next adventure with friends and family."
        action={{
          label: 'Create a Trip',
          onClick: onCreateTrip,
        }}
      />
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onClick={() => onTripClick(trip.id)}
        />
      ))}
    </div>
  )
}
