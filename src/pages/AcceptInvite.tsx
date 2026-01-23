import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  query,
  collection,
  where,
  getDocs,
  limit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { APP_NAME } from '@/lib/constants'
import { Footer } from '@/components/layout'
import type { Invitation, TripMember } from '@/types'

interface AcceptInvitePageProps {
  token: string
  onNavigate: (screen: string, tripId?: string) => void
}

type InviteStatus = 'loading' | 'valid' | 'expired' | 'already-member' | 'not-found' | 'error' | 'accepted'

export default function AcceptInvitePage({ token, onNavigate }: AcceptInvitePageProps) {
  const { user, signInWithGoogle, loading: authLoading } = useAuth()
  const [status, setStatus] = useState<InviteStatus>('loading')
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)

  // Find and validate the invitation
  useEffect(() => {
    const findInvitation = async () => {
      try {
        // Query for invitation with this token
        // We need to search by token field since we don't have the full ID
        const invitationsRef = collection(db, 'invitations')
        const q = query(invitationsRef, where('token', '==', token), limit(1))
        const snapshot = await getDocs(q)

        if (snapshot.empty) {
          setStatus('not-found')
          return
        }

        const inviteDoc = snapshot.docs[0]
        const inviteData = { ...inviteDoc.data(), id: inviteDoc.id } as Invitation

        // Check if expired
        if (inviteData.expiresAt.toDate() < new Date()) {
          setStatus('expired')
          return
        }

        // Check if already accepted
        if (inviteData.status === 'accepted') {
          setStatus('expired')
          return
        }

        setInvitation(inviteData)
        setStatus('valid')
      } catch (err) {
        console.error('Error finding invitation:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to load invitation')
      }
    }

    if (token) {
      findInvitation()
    }
  }, [token])

  // Check if user is already a member when they sign in
  useEffect(() => {
    const checkMembership = async () => {
      if (!user || !invitation) return

      try {
        const tripRef = doc(db, 'trips', invitation.tripId)
        const tripDoc = await getDoc(tripRef)

        if (tripDoc.exists()) {
          const tripData = tripDoc.data()
          if (tripData.members?.includes(user.uid)) {
            setStatus('already-member')
          }
        }
      } catch (err) {
        console.error('Error checking membership:', err)
      }
    }

    checkMembership()
  }, [user, invitation])

  // Accept the invitation
  const handleAccept = async () => {
    if (!user || !invitation) return

    setAccepting(true)
    setError(null)

    try {
      const tripRef = doc(db, 'trips', invitation.tripId)
      const tripDoc = await getDoc(tripRef)

      if (!tripDoc.exists()) {
        setError('Trip no longer exists')
        return
      }

      // Check if already a member
      const tripData = tripDoc.data()
      if (tripData.members?.includes(user.uid)) {
        setStatus('already-member')
        return
      }

      // Add user to trip
      const newMember: TripMember = {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName,
        role: 'member',
        joinedAt: Timestamp.now(),
      }

      await updateDoc(tripRef, {
        members: arrayUnion(user.uid),
        memberDetails: arrayUnion(newMember),
        updatedAt: Timestamp.now(),
      })

      // Mark invitation as accepted
      const inviteRef = doc(db, 'invitations', invitation.id)
      await updateDoc(inviteRef, {
        status: 'accepted',
        acceptedBy: user.uid,
        acceptedAt: Timestamp.now(),
      })

      setStatus('accepted')

      // Navigate to trip after a brief delay
      setTimeout(() => {
        onNavigate('trip-detail', invitation.tripId)
      }, 2000)
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError(err instanceof Error ? err.message : 'Failed to join trip')
    } finally {
      setAccepting(false)
    }
  }

  // Handle sign in
  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error('Sign in error:', err)
      setError('Failed to sign in. Please try again.')
    }
  }

  // Render based on status
  const renderContent = () => {
    if (status === 'loading' || authLoading) {
      return (
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary-700/70 dark:text-cream-400">Loading invitation...</p>
        </div>
      )
    }

    if (status === 'not-found') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100 mb-2">
            Invitation Not Found
          </h2>
          <p className="text-primary-700/70 dark:text-cream-400 mb-6">
            This invitation link is invalid or has already been used.
          </p>
          <button onClick={() => onNavigate('home')} className="btn-primary">
            Go to Home
          </button>
        </div>
      )
    }

    if (status === 'expired') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100 mb-2">
            Invitation Expired
          </h2>
          <p className="text-primary-700/70 dark:text-cream-400 mb-6">
            This invitation has expired. Please ask the trip organizer for a new invite.
          </p>
          <button onClick={() => onNavigate('home')} className="btn-primary">
            Go to Home
          </button>
        </div>
      )
    }

    if (status === 'already-member') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100 mb-2">
            Already a Member
          </h2>
          <p className="text-primary-700/70 dark:text-cream-400 mb-6">
            You're already a member of <span className="font-medium">{invitation?.tripName}</span>!
          </p>
          <button onClick={() => onNavigate('trip-detail', invitation?.tripId)} className="btn-primary">
            Go to Trip
          </button>
        </div>
      )
    }

    if (status === 'accepted') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100 mb-2">
            Welcome to the Trip!
          </h2>
          <p className="text-primary-700/70 dark:text-cream-400 mb-6">
            You've joined <span className="font-medium">{invitation?.tripName}</span>. Redirecting...
          </p>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-primary-700/70 dark:text-cream-400 mb-6">
            {error || 'An error occurred. Please try again.'}
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      )
    }

    // Valid invitation
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100 mb-2">
          You're Invited!
        </h2>
        <p className="text-primary-700/70 dark:text-cream-400 mb-6">
          You've been invited to join <span className="font-medium text-primary-700 dark:text-cream-100">{invitation?.tripName}</span>
        </p>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        {!user ? (
          <div className="space-y-3">
            <p className="text-sm text-primary-700/70 dark:text-cream-400">
              Sign in to join this trip
            </p>
            <button onClick={handleSignIn} className="btn-primary w-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        ) : (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="btn-primary w-full"
          >
            {accepting ? 'Joining...' : 'Join Trip'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-200 flex flex-col">
      {/* Header */}
      <header className="bg-cream-100 border-b border-cream-400 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-center">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/TripBi-svg-notext.svg"
              alt={APP_NAME}
              className="h-9 w-auto"
            />
            <span className="text-lg font-semibold text-primary-700">
              Trip<span className="text-primary-500">Bi</span>
            </span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
