import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME } from '@/lib/constants'
import { Footer } from '@/components/layout'
import Avatar from '@/components/ui/Avatar'
import type { Screen } from '@/App'

interface ProfilePageProps {
  onNavigate: (screen: Screen) => void
  onBack: () => void
}

export default function ProfilePage({ onNavigate, onBack }: ProfilePageProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    onNavigate('home')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-200 flex items-center justify-center">
        <div className="spinner-lg text-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-200 flex flex-col">
      {/* Header */}
      <header className="bg-cream-100 border-b border-cream-400 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-primary-700/70 hover:text-primary-700 hover:bg-cream-200 rounded-full transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {/* Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/TripBi-svg-notext.svg"
                alt={APP_NAME}
                className="h-9 w-auto"
              />
              <span className="text-lg font-semibold text-primary-700 hidden sm:block">
                Trip<span className="text-primary-500">Bi</span>
              </span>
            </button>
          </div>
          <h1 className="text-lg font-semibold text-primary-700">
            Profile
          </h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          {/* Profile Card */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar
                src={user.photoURL}
                name={user.displayName || user.email || 'User'}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100 truncate">
                  {user.displayName || 'User'}
                </h2>
                <p className="text-sm text-primary-700/70 dark:text-cream-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-t border-cream-400 dark:border-surface-dark-border">
                <div>
                  <p className="text-sm font-medium text-primary-700 dark:text-cream-100">
                    Email
                  </p>
                  <p className="text-sm text-primary-700/70 dark:text-cream-400">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-success-600 dark:text-success-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-cream-400 dark:border-surface-dark-border">
                <div>
                  <p className="text-sm font-medium text-primary-700 dark:text-cream-100">
                    Sign-in Method
                  </p>
                  <p className="text-sm text-primary-700/70 dark:text-cream-400">
                    Google
                  </p>
                </div>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('trips')}
              className="btn-outline w-full justify-between"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                My Trips
              </span>
              <svg className="w-5 h-5 text-primary-700/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={handleSignOut}
              className="btn-outline w-full justify-center text-error-600 border-error-300 hover:bg-error-50 hover:border-error-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>

          {/* App info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-primary-700/50 dark:text-cream-500">
              TripBi - Group Trip Planning Made Simple
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
