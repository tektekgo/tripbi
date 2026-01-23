import { useState, useMemo } from 'react'
import type { Trip, Proposal, Booking } from '@/types'
import type { Screen } from '@/App'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME } from '@/lib/constants'
import { AvatarGroup } from '@/components/ui/Avatar'
import { Footer } from '@/components/layout'
import { Timestamp } from 'firebase/firestore'
import { ProposalList } from '@/features/proposals'
import { TripBookingStatus } from '@/features/bookings'
import { TimelineView, TimelineExport } from '@/features/timeline'

type TripTab = 'proposals' | 'bookings' | 'timeline'

interface TripDetailPageProps {
  trip: Trip
  proposals: Proposal[]
  bookings: Booking[]
  onNavigate: (screen: Screen) => void
  onBack: () => void
  onCreateProposal: () => void
  onProposalClick: (proposalId: string) => void
  onInviteMembers?: () => void
  onMarkBooked?: (proposalId: string) => void
  onOpenSettings?: () => void
}

function formatDateRange(startDate: Timestamp, endDate: Timestamp): string {
  const start = startDate.toDate()
  const end = endDate.toDate()

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const endDay = end.getDate()
  const year = start.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
}

export default function TripDetailPage({
  trip,
  proposals,
  bookings,
  onNavigate,
  onBack,
  onCreateProposal,
  onProposalClick,
  onInviteMembers,
  onMarkBooked,
  onOpenSettings,
}: TripDetailPageProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TripTab>('proposals')
  const [showExport, setShowExport] = useState(false)

  // Derived data
  const decidedProposals = useMemo(() => {
    return proposals.filter(p => p.status === 'decided')
  }, [proposals])

  const memberUsers = trip.memberDetails.map(m => ({
    photoURL: null,
    displayName: m.displayName || m.email,
  }))

  const tabs: { id: TripTab; label: string; count?: number }[] = [
    { id: 'proposals', label: 'Proposals', count: proposals.length },
    { id: 'bookings', label: 'Bookings', count: bookings.length },
    { id: 'timeline', label: 'Timeline' },
  ]

  return (
    <div className="min-h-screen bg-cream-200 flex flex-col">
      {/* Header */}
      <header className="bg-cream-100 border-b border-cream-400 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-cream-600 hover:text-primary-700 hover:bg-cream-200 rounded-full transition-colors"
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary-700/80 hidden sm:block">
              {user?.displayName || user?.email}
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

      {/* Trip info banner */}
      <div className="bg-cream-100 border-b border-cream-400 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-700 dark:text-cream-100">
                {trip.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-primary-700/70">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {trip.destination}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDateRange(trip.startDate, trip.endDate)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AvatarGroup users={memberUsers} max={5} size="md" />
              <span className="text-sm text-primary-700/60">
                {trip.members.length} {trip.members.length === 1 ? 'member' : 'members'}
              </span>
              {onInviteMembers && (
                <button
                  onClick={onInviteMembers}
                  className="btn-outline btn-sm"
                  title="Invite members"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Invite
                </button>
              )}
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="p-2 text-primary-700/60 hover:text-primary-700 hover:bg-cream-200 rounded-full transition-colors"
                  title="Trip settings"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-cream-100 border-b border-cream-400 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <nav className="flex gap-1 -mb-px" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-700'
                    : 'border-transparent text-primary-700/60 hover:text-primary-600 hover:border-cream-400'
                  }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs
                    ${activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-cream-300 text-cream-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Proposals Tab */}
          {activeTab === 'proposals' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-primary-700">
                  Trip Proposals
                </h2>
                <button onClick={onCreateProposal} className="btn-primary btn-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Proposal
                </button>
              </div>

              <ProposalList
                proposals={proposals}
                memberCount={trip.members.length}
                onProposalClick={onProposalClick}
                onCreateProposal={onCreateProposal}
              />
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-lg font-semibold text-primary-700 mb-6">
                Booking Status
              </h2>
              <TripBookingStatus
                decidedProposals={decidedProposals}
                bookings={bookings}
                members={trip.memberDetails}
                onMarkBooked={onMarkBooked || (() => {})}
              />
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-primary-700">
                  Trip Timeline
                </h2>
                <button
                  onClick={() => setShowExport(true)}
                  className="btn-outline btn-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              </div>
              <TimelineView
                proposals={proposals}
                onProposalClick={onProposalClick}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Export Modal */}
      {showExport && (
        <TimelineExport
          trip={trip}
          proposals={proposals}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
