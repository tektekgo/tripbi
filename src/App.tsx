import { useState, useEffect, useMemo, useCallback } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Trip, Proposal, Booking } from '@/types'

// Components
import ErrorBoundary from '@/components/ErrorBoundary'

// Pages
import Home from '@/pages/Home'
import TripsPage from '@/pages/Trips'
import TripDetailPage from '@/pages/TripDetail'
import AcceptInvitePage from '@/pages/AcceptInvite'
import SharedTimelinePage from '@/pages/SharedTimeline'
import ProfilePage from '@/pages/Profile'

// Modals
import CreateTripModal from '@/components/modals/CreateTripModal'
import CreateProposalModal from '@/components/modals/CreateProposalModal'
import ProposalDetailModal from '@/components/modals/ProposalDetailModal'
import InviteMemberModal from '@/components/modals/InviteMemberModal'
import BookingModal from '@/components/modals/BookingModal'
import TripSettingsModal from '@/components/modals/TripSettingsModal'

// State-based routing - similar to SplitBi
export type Screen = 'home' | 'dashboard' | 'trips' | 'trip-detail' | 'profile' | 'create' | 'invite' | 'shared-timeline'

function AppContent() {
  const { user } = useAuth()

  // Navigation state
  const [activeScreen, setActiveScreen] = useState<Screen>('home')
  const [activeTripId, setActiveTripId] = useState<string | null>(null)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [timelineToken, setTimelineToken] = useState<string | null>(null)

  // Data state
  const [trips, setTrips] = useState<Trip[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)

  // Modal state
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false)
  const [isCreateProposalModalOpen, setIsCreateProposalModalOpen] = useState(false)
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isTripSettingsModalOpen, setIsTripSettingsModalOpen] = useState(false)
  const [viewingProposalId, setViewingProposalId] = useState<string | null>(null)
  const [bookingProposalId, setBookingProposalId] = useState<string | null>(null)

  // Check URL for special tokens on mount and URL changes
  useEffect(() => {
    const checkSpecialUrls = () => {
      const path = window.location.pathname

      // Check for invite URL
      const inviteMatch = path.match(/^\/invite\/([a-zA-Z0-9]+)$/)
      if (inviteMatch) {
        setInviteToken(inviteMatch[1])
        setTimelineToken(null)
        setActiveScreen('invite')
        return
      }

      // Check for shared timeline URL
      const timelineMatch = path.match(/^\/timeline\/([a-zA-Z0-9]+)$/)
      if (timelineMatch) {
        setTimelineToken(timelineMatch[1])
        setInviteToken(null)
        setActiveScreen('shared-timeline')
        return
      }
    }

    checkSpecialUrls()

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', checkSpecialUrls)
    return () => window.removeEventListener('popstate', checkSpecialUrls)
  }, [])

  // Get viewing proposal
  const viewingProposal = useMemo(() => {
    if (!viewingProposalId) return null
    return proposals.find(p => p.id === viewingProposalId) || null
  }, [proposals, viewingProposalId])

  // Get proposal for booking modal
  const bookingProposal = useMemo(() => {
    if (!bookingProposalId) return null
    return proposals.find(p => p.id === bookingProposalId) || null
  }, [proposals, bookingProposalId])

  // Get existing booking for the current user and proposal
  const existingBookingForProposal = useMemo(() => {
    if (!bookingProposalId || !user) return null
    return bookings.find(b => b.proposalId === bookingProposalId && b.userId === user.uid) || null
  }, [bookings, bookingProposalId, user])

  // Derived state
  const activeTrip = useMemo(() => {
    return trips.find(t => t.id === activeTripId) || null
  }, [trips, activeTripId])

  const activeProposals = useMemo(() => {
    if (!activeTripId) return []
    return proposals.filter(p => p.tripId === activeTripId)
  }, [proposals, activeTripId])

  const activeBookings = useMemo(() => {
    if (!activeTripId) return []
    return bookings.filter(b => b.tripId === activeTripId)
  }, [bookings, activeTripId])

  // Navigation helpers
  const goHome = useCallback(() => {
    setActiveScreen('home')
    setActiveTripId(null)
  }, [])

  const goToTrips = useCallback(() => {
    setActiveScreen('trips')
    setActiveTripId(null)
  }, [])

  const goToTripDetail = useCallback((tripId: string) => {
    setActiveTripId(tripId)
    setActiveScreen('trip-detail')
    // Update URL without invite token
    window.history.pushState({}, '', '/')
  }, [])

  // Handle navigation from invite page
  const handleInviteNavigate = useCallback((screen: string, tripId?: string) => {
    setInviteToken(null)
    window.history.pushState({}, '', '/')
    if (screen === 'trip-detail' && tripId) {
      goToTripDetail(tripId)
    } else {
      setActiveScreen('home')
    }
  }, [goToTripDetail])

  // Handle navigation from shared timeline page
  const handleTimelineNavigate = useCallback((screen: string) => {
    setTimelineToken(null)
    window.history.pushState({}, '', '/')
    setActiveScreen(screen === 'home' ? 'home' : 'home')
  }, [])

  // Handle navigation from Home
  const handleNavigate = useCallback((screen: Screen) => {
    if (screen === 'create') {
      setIsCreateTripModalOpen(true)
    } else if (screen === 'trips') {
      goToTrips()
    } else {
      setActiveScreen(screen)
    }
  }, [goToTrips])

  // Handle trip creation
  const handleTripCreated = useCallback((tripId: string) => {
    setIsCreateTripModalOpen(false)
    goToTripDetail(tripId)
  }, [goToTripDetail])

  // Handle mark as booked
  const handleMarkBooked = useCallback((proposalId: string) => {
    setBookingProposalId(proposalId)
    setIsBookingModalOpen(true)
  }, [])

  // Fetch trips when user is logged in
  useEffect(() => {
    if (!user) {
      setTrips([])
      setProposals([])
      setBookings([])
      setTripsLoading(false)
      return
    }

    setTripsLoading(true)

    // Subscribe to trips where user is a member
    const tripsQuery = query(
      collection(db, 'trips'),
      where('members', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      tripsQuery,
      (snapshot) => {
        const tripsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Trip[]
        setTrips(tripsData)
        setTripsLoading(false)
      },
      (error) => {
        console.error('Error fetching trips:', error)
        setTripsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // Fetch proposals and bookings when a trip is selected
  useEffect(() => {
    if (!user || !activeTripId) {
      setProposals([])
      setBookings([])
      return
    }

    // Subscribe to proposals for this trip
    const proposalsQuery = query(
      collection(db, 'proposals'),
      where('tripId', '==', activeTripId),
      orderBy('createdAt', 'desc')
    )

    const unsubProposals = onSnapshot(
      proposalsQuery,
      (snapshot) => {
        const proposalsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Proposal[]
        setProposals(proposalsData)
      },
      (error) => {
        console.error('Error fetching proposals:', error)
      }
    )

    // Subscribe to bookings for this trip
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('tripId', '==', activeTripId)
    )

    const unsubBookings = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Booking[]
        setBookings(bookingsData)
      },
      (error) => {
        console.error('Error fetching bookings:', error)
      }
    )

    return () => {
      unsubProposals()
      unsubBookings()
    }
  }, [user, activeTripId])

  return (
    <div className="min-h-screen bg-cream-200">
      {/* Home/Landing - handles both logged-in and logged-out states */}
      {(activeScreen === 'home' || activeScreen === 'dashboard') && (
        <Home onNavigate={handleNavigate} />
      )}

      {/* Trips list */}
      {activeScreen === 'trips' && (
        <TripsPage
          trips={trips}
          loading={tripsLoading}
          onNavigate={setActiveScreen}
          onTripClick={goToTripDetail}
          onCreateTrip={() => setIsCreateTripModalOpen(true)}
        />
      )}

      {/* Trip detail */}
      {activeScreen === 'trip-detail' && activeTrip && (
        <TripDetailPage
          trip={activeTrip}
          proposals={activeProposals}
          bookings={activeBookings}
          onNavigate={setActiveScreen}
          onBack={goToTrips}
          onCreateProposal={() => setIsCreateProposalModalOpen(true)}
          onProposalClick={(proposalId) => setViewingProposalId(proposalId)}
          onInviteMembers={() => setIsInviteMemberModalOpen(true)}
          onMarkBooked={handleMarkBooked}
          onOpenSettings={() => setIsTripSettingsModalOpen(true)}
        />
      )}

      {/* Accept invitation page */}
      {activeScreen === 'invite' && inviteToken && (
        <AcceptInvitePage
          token={inviteToken}
          onNavigate={handleInviteNavigate}
        />
      )}

      {/* Shared timeline page (public, no auth required) */}
      {activeScreen === 'shared-timeline' && timelineToken && (
        <SharedTimelinePage
          token={timelineToken}
          onNavigate={handleTimelineNavigate}
        />
      )}

      {/* Profile page */}
      {activeScreen === 'profile' && (
        <ProfilePage
          onNavigate={setActiveScreen}
          onBack={goHome}
          tripCount={trips.length}
        />
      )}

      {/* Modals */}
      <CreateTripModal
        isOpen={isCreateTripModalOpen}
        onClose={() => setIsCreateTripModalOpen(false)}
        onTripCreated={handleTripCreated}
      />

      {/* Create Proposal Modal */}
      {activeTripId && (
        <CreateProposalModal
          isOpen={isCreateProposalModalOpen}
          onClose={() => setIsCreateProposalModalOpen(false)}
          tripId={activeTripId}
          onProposalCreated={(proposalId) => {
            setIsCreateProposalModalOpen(false)
            setViewingProposalId(proposalId)
          }}
          timezoneSettings={activeTrip?.timezoneSettings}
        />
      )}

      {/* Proposal Detail Modal */}
      {activeTrip && (
        <ProposalDetailModal
          isOpen={viewingProposalId !== null}
          onClose={() => setViewingProposalId(null)}
          proposal={viewingProposal}
          tripMembers={activeTrip.memberDetails}
        />
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteMemberModalOpen}
        onClose={() => setIsInviteMemberModalOpen(false)}
        trip={activeTrip}
      />

      {/* Booking Modal */}
      {activeTripId && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setBookingProposalId(null)
          }}
          proposal={bookingProposal}
          tripId={activeTripId}
          existingBooking={existingBookingForProposal}
        />
      )}

      {/* Trip Settings Modal */}
      {activeTrip && (
        <TripSettingsModal
          isOpen={isTripSettingsModalOpen}
          onClose={() => setIsTripSettingsModalOpen(false)}
          trip={activeTrip}
          onTripDeleted={goToTrips}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
