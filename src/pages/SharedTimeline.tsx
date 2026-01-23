import { useState, useEffect, useMemo } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { APP_NAME } from '@/lib/constants'
import { Footer } from '@/components/layout'
import CategoryIcon, { getCategoryLabel } from '@/components/ui/CategoryIcon'
import type { ShareableTimeline, ShareableProposal } from '@/types'
import { Timestamp } from 'firebase/firestore'

interface SharedTimelinePageProps {
  token: string
  onNavigate: (screen: string) => void
}

type TimelineStatus = 'loading' | 'valid' | 'not-found' | 'expired' | 'error'

interface DayGroup {
  date: Date
  dateKey: string
  proposals: ShareableProposal[]
}

function formatDateRange(startDate: Timestamp, endDate: Timestamp): string {
  const start = startDate.toDate()
  const end = endDate.toDate()
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} - ${endStr}`
}

function formatDayHeader(date: Date): { dayOfWeek: string; fullDate: string } {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
  const fullDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return { dayOfWeek, fullDate }
}

export default function SharedTimelinePage({ token, onNavigate }: SharedTimelinePageProps) {
  const [status, setStatus] = useState<TimelineStatus>('loading')
  const [timeline, setTimeline] = useState<ShareableTimeline | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch the shared timeline
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const timelineRef = doc(db, 'sharedTimelines', token)
        const timelineDoc = await getDoc(timelineRef)

        if (!timelineDoc.exists()) {
          setStatus('not-found')
          return
        }

        const data = timelineDoc.data() as ShareableTimeline

        // Check if expired
        if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
          setStatus('expired')
          return
        }

        setTimeline(data)
        setStatus('valid')
      } catch (err) {
        console.error('Error fetching shared timeline:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to load timeline')
      }
    }

    if (token) {
      fetchTimeline()
    }
  }, [token])

  // Group proposals by day
  const dayGroups = useMemo<DayGroup[]>(() => {
    if (!timeline) return []

    const groups = new Map<string, { date: Date; proposals: ShareableProposal[] }>()

    timeline.proposals.forEach((proposal) => {
      if (!proposal.scheduledDate) return

      const date = proposal.scheduledDate.toDate()
      const dateKey = date.toISOString().split('T')[0]

      if (!groups.has(dateKey)) {
        groups.set(dateKey, { date, proposals: [] })
      }
      groups.get(dateKey)!.proposals.push(proposal)
    })

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, { date, proposals }]) => ({
        dateKey,
        date,
        proposals: proposals.sort((a, b) => {
          const timeA = a.scheduledTime || '99:99'
          const timeB = b.scheduledTime || '99:99'
          return timeA.localeCompare(timeB)
        }),
      }))
  }, [timeline])

  // Render content based on status
  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary-700/70">Loading timeline...</p>
        </div>
      )
    }

    if (status === 'not-found') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100 mb-2">
            Timeline Not Found
          </h2>
          <p className="text-primary-700/70 mb-6">
            This shared timeline link is invalid or has been removed.
          </p>
          <button onClick={() => onNavigate('home')} className="btn-primary">
            Go to Home
          </button>
        </div>
      )
    }

    if (status === 'expired') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100 mb-2">
            Timeline Expired
          </h2>
          <p className="text-primary-700/70 mb-6">
            This shared timeline link has expired.
          </p>
          <button onClick={() => onNavigate('home')} className="btn-primary">
            Go to Home
          </button>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-primary-700/70 mb-6">
            {error || 'An error occurred. Please try again.'}
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      )
    }

    // Valid timeline
    return (
      <div>
        {/* Trip header */}
        <div className="text-center mb-8 pb-6 border-b border-cream-400 dark:border-surface-dark-border">
          <h1 className="text-2xl font-bold text-primary-700 dark:text-cream-100 mb-2">
            {timeline?.tripName}
          </h1>
          <p className="text-primary-700/70 dark:text-cream-400 mb-1">
            {timeline?.destination}
          </p>
          {timeline && (
            <p className="text-sm text-primary-700/60 dark:text-cream-500">
              {formatDateRange(timeline.startDate, timeline.endDate)}
            </p>
          )}
        </div>

        {/* Timeline */}
        {dayGroups.length === 0 ? (
          <div className="text-center py-8 text-primary-700/60 dark:text-cream-500">
            No scheduled items in this timeline
          </div>
        ) : (
          <div className="space-y-8">
            {dayGroups.map(({ dateKey, date, proposals }) => {
              const { dayOfWeek, fullDate } = formatDayHeader(date)
              return (
                <div key={dateKey}>
                  {/* Day header */}
                  <div className="mb-4 pb-2 border-b-2 border-cream-400 dark:border-surface-dark-border">
                    <h2 className="font-semibold text-primary-700 dark:text-cream-100">
                      {dayOfWeek}
                    </h2>
                    <p className="text-sm text-primary-700/60 dark:text-cream-400">
                      {fullDate}
                    </p>
                  </div>

                  {/* Day items */}
                  <div className="space-y-3 ml-4">
                    {proposals.map((proposal) => {
                      const details = proposal.details as Record<string, string>
                      return (
                        <div
                          key={proposal.id}
                          className="flex gap-4 p-4 bg-cream-100 dark:bg-surface-dark-elevated rounded-xl"
                        >
                          {/* Time */}
                          <div className="w-16 flex-shrink-0 text-center">
                            <span className="text-sm font-medium text-primary-700 dark:text-cream-100">
                              {proposal.scheduledTime || '--:--'}
                            </span>
                          </div>

                          {/* Connector */}
                          <div className="flex flex-col items-center">
                            <CategoryIcon category={proposal.category} size="md" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-primary-700/50 dark:text-cream-500 uppercase mb-1">
                              {getCategoryLabel(proposal.category)}
                            </div>
                            <h4 className="font-medium text-primary-700 dark:text-cream-100">
                              {proposal.title}
                            </h4>
                            {details.location && (
                              <p className="text-sm text-primary-700/60 dark:text-cream-400 mt-1 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {details.location}
                              </p>
                            )}
                            {proposal.description && (
                              <p className="text-sm text-primary-700/60 dark:text-cream-400 mt-1">
                                {proposal.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
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
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="card p-6 sm:p-8">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
