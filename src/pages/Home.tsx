import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import { Footer } from '@/components/layout'
import type { Screen } from '@/App'

interface HomeProps {
  onNavigate: (screen: Screen) => void
}

// Google icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

export default function Home({ onNavigate }: HomeProps) {
  const { user, loading, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-200 flex items-center justify-center">
        <div className="spinner-lg text-primary-500"></div>
      </div>
    )
  }

  // Logged out view - Pi style minimal
  if (!user) {
    return (
      <div className="min-h-screen bg-cream-200 flex flex-col">
        {/* Main content - centered */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Logo */}
          <img
            src="/TripBi-svg-notext.svg"
            alt={APP_NAME}
            className="h-28 w-auto mb-10 sm:h-36"
          />

          {/* Title */}
          <h1 className="text-5xl font-bold tracking-tight text-primary-700 sm:text-6xl mb-4">
            Trip<span className="text-primary-500">Bi</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl text-primary-600 text-center max-w-md mb-2">
            {APP_TAGLINE}
          </p>
          <p className="text-primary-700/70 text-center max-w-sm mb-12">
            Turn scattered group travel chaos into a single source of truth.
          </p>

          {/* Sign in section */}
          <div className="w-full max-w-xs space-y-4">
            <p className="text-center text-primary-700/80 text-sm mb-6">
              Create an account or sign in to start planning.
            </p>

            {/* Google Sign In - Pi style */}
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-6 py-4
                         bg-cream-100 border border-cream-500 rounded-full
                         text-primary-700 font-medium
                         hover:bg-cream-50 active:bg-cream-200
                         transition-colors duration-200"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-cream-400"></div>
              <span className="text-primary-700/60 text-sm">or</span>
              <div className="flex-1 h-px bg-cream-400"></div>
            </div>

            {/* Email option - placeholder for future */}
            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-4
                         bg-cream-100 border border-cream-500 rounded-full
                         text-primary-700 font-medium
                         hover:bg-cream-50 active:bg-cream-200
                         transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Use email address
            </button>
          </div>
        </main>

        {/* Footer */}
        <Footer minimal />
      </div>
    )
  }

  // Logged in view - Dashboard style
  return (
    <div className="min-h-screen bg-cream-200 flex flex-col">
      {/* Header */}
      <header className="bg-cream-100 border-b border-cream-400 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/TripBi-svg-notext.svg"
              alt={APP_NAME}
              className="h-11 w-auto"
            />
            <span className="text-xl font-semibold text-primary-700">
              Trip<span className="text-primary-500">Bi</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-700/80 hidden sm:block">
              {user.displayName || user.email}
            </span>
            <button
              onClick={() => onNavigate('profile')}
              className="btn-outline btn-sm"
            >
              Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-primary-700 sm:text-4xl mb-2">
              Welcome back, {user.displayName?.split(' ')[0] || 'traveler'}!
            </h1>
            <p className="text-primary-700/70">
              Ready to plan your next adventure?
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => onNavigate('create')}
              className="btn-primary btn-lg px-10"
            >
              Create a Trip
            </button>
            <button
              onClick={() => onNavigate('trips')}
              className="btn-outline btn-lg px-10"
            >
              Join a Trip
            </button>
          </div>

          {/* Feature cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="card text-center p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-primary-700 text-lg">
                Propose & Decide
              </h3>
              <p className="mt-2 text-sm text-primary-700/70">
                Suggest ideas, vote together, and lock in decisions.
              </p>
            </div>

            <div className="card text-center p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-primary-700 text-lg">
                Track Bookings
              </h3>
              <p className="mt-2 text-sm text-primary-700/70">
                See who booked what. No more confusion.
              </p>
            </div>

            <div className="card text-center p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-primary-700 text-lg">
                Timeline View
              </h3>
              <p className="mt-2 text-sm text-primary-700/70">
                Auto-generated itinerary from your decisions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
