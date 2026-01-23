import type { Trip } from '@/types'
import type { Screen } from '@/App'
import { TripList } from '@/features/trips'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME } from '@/lib/constants'
import { Footer } from '@/components/layout'

interface TripsPageProps {
  trips: Trip[]
  loading: boolean
  onNavigate: (screen: Screen) => void
  onTripClick: (tripId: string) => void
  onCreateTrip: () => void
}

export default function TripsPage({
  trips,
  loading,
  onNavigate,
  onTripClick,
  onCreateTrip,
}: TripsPageProps) {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-cream-200 flex flex-col">
      {/* Header */}
      <header className="bg-cream-100 border-b border-cream-400 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/TripBi-svg-notext.svg"
              alt={APP_NAME}
              className="h-11 w-auto"
            />
            <span className="text-xl font-semibold text-primary-700">
              Trip<span className="text-primary-500">Bi</span>
            </span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-700/80 hidden sm:block">
              {user?.displayName || user?.email}
            </span>
            <button onClick={signOut} className="btn-outline btn-sm">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-primary-700 dark:text-cream-100">
                My Trips
              </h1>
              <p className="text-primary-700/70 mt-1">
                {trips.length === 0
                  ? 'Create your first trip to get started'
                  : `${trips.length} ${trips.length === 1 ? 'trip' : 'trips'}`}
              </p>
            </div>
            <button onClick={onCreateTrip} className="btn-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Trip
            </button>
          </div>

          {/* Trip list */}
          <TripList
            trips={trips}
            onTripClick={onTripClick}
            onCreateTrip={onCreateTrip}
            loading={loading}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
