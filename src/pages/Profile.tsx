import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'
import type { Screen } from '@/App'

interface ProfilePageProps {
  onNavigate: (screen: Screen) => void
  onBack: () => void
  tripCount?: number
}

export default function ProfilePage({ onNavigate, onBack, tripCount = 0 }: ProfilePageProps) {
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

  // Generate a fun message based on trip count
  const getFunMessage = () => {
    if (tripCount === 0) return "Ready to plan your first adventure!"
    if (tripCount === 1) return "You've planned 1 trip together!"
    if (tripCount < 5) return `You've planned ${tripCount} trips together!`
    if (tripCount < 10) return `Wow! ${tripCount} trips and counting!`
    return `Amazing! ${tripCount} adventures planned!`
  }

  return (
    <div className="min-h-screen bg-cream-200 flex flex-col">
      {/* Header - Pi style: simple with back arrow and centered title */}
      <header className="bg-cream-200 safe-top">
        <div className="relative flex h-14 items-center justify-center px-4">
          <button
            onClick={onBack}
            className="absolute left-4 p-2 -ml-2 text-primary-700 hover:text-primary-800 transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-medium text-primary-700">
            Profile
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-8">
        {/* Account Section - Pi style card */}
        <div className="mt-6 mb-8">
          {/* User Info */}
          <div className="flex flex-col items-center text-center mb-8">
            <Avatar
              src={user.photoURL}
              name={user.displayName || user.email || 'User'}
              size="xl"
            />
            <h2 className="mt-4 text-xl font-semibold text-primary-700">
              {user.displayName || 'Traveler'}
            </h2>
            <p className="mt-1 text-sm text-primary-700/60">
              {user.email}
            </p>
          </div>

          {/* Fun stat message - Pi style */}
          <div className="text-center mb-8">
            <p className="text-2xl font-serif text-primary-700 leading-relaxed">
              {getFunMessage()}
            </p>
          </div>

          {/* Sign out button - Pi style */}
          <button
            onClick={handleSignOut}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-4 px-6 rounded-full transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Menu List - Pi style */}
        <div className="space-y-1">
          {/* My Trips */}
          <button
            onClick={() => onNavigate('trips')}
            className="w-full flex items-center justify-between py-4 px-1 text-primary-700 hover:bg-cream-300/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5 text-primary-700/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              <span className="font-medium">My Trips</span>
            </div>
            <svg className="w-5 h-5 text-primary-700/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Account Info */}
          <button
            className="w-full flex items-center justify-between py-4 px-1 text-primary-700 hover:bg-cream-300/50 rounded-lg transition-colors"
            onClick={() => {/* Future: account settings */}}
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5 text-primary-700/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="font-medium">Account</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary-700/50">Google</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
          </button>

          {/* Divider */}
          <div className="my-4 border-t border-cream-400/50" />

          {/* Share TripBi */}
          <button
            className="w-full flex items-center justify-between py-4 px-1 text-primary-700 hover:bg-cream-300/50 rounded-lg transition-colors"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: APP_NAME,
                  text: 'Plan group trips together with TripBi!',
                  url: window.location.origin,
                })
              }
            }}
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5 text-primary-700/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              <span className="font-medium">Share {APP_NAME} with others</span>
            </div>
          </button>

          {/* Divider */}
          <div className="my-4 border-t border-cream-400/50" />

          {/* Privacy Policy */}
          <a
            href="https://tripbi.app/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between py-4 px-1 text-primary-700 hover:bg-cream-300/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5 text-primary-700/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="font-medium">Privacy policy</span>
            </div>
            <svg className="w-5 h-5 text-primary-700/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Terms of Service */}
          <a
            href="https://tripbi.app/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between py-4 px-1 text-primary-700 hover:bg-cream-300/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5 text-primary-700/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="font-medium">Terms of service</span>
            </div>
            <svg className="w-5 h-5 text-primary-700/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* App info footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-primary-700/40">
            {APP_NAME} v0.1.0
          </p>
        </div>
      </main>
    </div>
  )
}
