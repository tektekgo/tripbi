import { useRef, useState } from 'react'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { Proposal, Trip, ShareableProposal } from '@/types'
import CategoryIcon, { getCategoryLabel } from '@/components/ui/CategoryIcon'

interface TimelineExportProps {
  trip: Trip
  proposals: Proposal[]
  onClose: () => void
}

interface DayGroup {
  date: Date
  dateKey: string
  proposals: Proposal[]
}

// We'll use dynamic import for html2pdf to avoid SSR issues
async function generatePDF(element: HTMLElement, filename: string) {
  const html2pdf = (await import('html2pdf.js')).default

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  }

  return html2pdf().set(opt).from(element).save()
}

function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export default function TimelineExport({ trip, proposals, onClose }: TimelineExportProps) {
  const { user } = useAuth()
  const printRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [shareableLink, setShareableLink] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)

  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin

  // Filter to decided proposals with scheduled dates
  const timelineProposals = proposals.filter(p => p.status === 'decided' && p.scheduledDate)

  // Group by day
  const dayGroups: DayGroup[] = (() => {
    const groups = new Map<string, { date: Date; proposals: Proposal[] }>()

    timelineProposals.forEach((proposal) => {
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
  })()

  const handleExport = async () => {
    if (!printRef.current) return

    setExporting(true)
    try {
      const filename = `${trip.name.replace(/[^a-zA-Z0-9]/g, '-')}-itinerary.pdf`
      await generatePDF(printRef.current, filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setExporting(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateRange = () => {
    const start = trip.startDate.toDate()
    const end = trip.endDate.toDate()
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  // Generate shareable link
  const handleGenerateLink = async () => {
    if (!user) return

    setGeneratingLink(true)
    try {
      const token = generateToken()

      // Convert proposals to shareable format
      const shareableProposals: ShareableProposal[] = timelineProposals.map(p => ({
        id: p.id,
        category: p.category,
        title: p.title,
        description: p.description,
        scheduledDate: p.scheduledDate,
        scheduledTime: p.scheduledTime,
        details: p.details,
      }))

      // Store in Firestore
      await setDoc(doc(db, 'sharedTimelines', token), {
        id: token,
        tripId: trip.id,
        tripName: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        token,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        proposals: shareableProposals,
      })

      setShareableLink(`${appUrl}/timeline/${token}`)
    } catch (error) {
      console.error('Error generating shareable link:', error)
    } finally {
      setGeneratingLink(false)
    }
  }

  // Copy link to clipboard
  const handleCopyLink = async () => {
    if (!shareableLink) return

    try {
      await navigator.clipboard.writeText(shareableLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream-100 dark:bg-surface-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-cream-400 dark:border-surface-dark-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary-700 dark:text-cream-100">
            Export Timeline
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-primary-700/60 hover:text-primary-700 hover:bg-cream-200 rounded-full transition-colors dark:text-cream-400 dark:hover:text-cream-100 dark:hover:bg-surface-dark-muted"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto p-4">
          <div className="text-sm text-primary-700/60 dark:text-cream-400 mb-4">
            Preview of your itinerary:
          </div>

          {/* Printable content */}
          <div
            ref={printRef}
            className="bg-white p-8 rounded-lg shadow-sm"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {/* Trip header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {trip.name}
              </h1>
              <p className="text-gray-600 mb-1">
                {trip.destination}
              </p>
              <p className="text-sm text-gray-500">
                {formatDateRange()}
              </p>
            </div>

            {/* Timeline content */}
            {dayGroups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No scheduled items yet
              </div>
            ) : (
              <div className="space-y-6">
                {dayGroups.map(({ dateKey, date, proposals }) => (
                  <div key={dateKey}>
                    {/* Day header */}
                    <div className="mb-3 pb-2 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {formatDate(date)}
                      </h2>
                    </div>

                    {/* Day items */}
                    <div className="space-y-3 ml-4">
                      {proposals.map((proposal) => {
                        const details = proposal.details as Record<string, string>
                        return (
                          <div key={proposal.id} className="flex gap-4 py-2">
                            {/* Time */}
                            <div className="w-16 flex-shrink-0 text-right">
                              <span className="text-sm font-medium text-gray-700">
                                {proposal.scheduledTime || '--:--'}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 border-l-2 border-teal-500 pl-4">
                              <div className="flex items-center gap-2 mb-1">
                                <CategoryIcon category={proposal.category} size="sm" />
                                <span className="text-xs text-gray-500 uppercase">
                                  {getCategoryLabel(proposal.category)}
                                </span>
                              </div>
                              <h3 className="font-medium text-gray-900">
                                {proposal.title}
                              </h3>
                              {details.location && (
                                <p className="text-sm text-gray-600 mt-1">
                                  📍 {details.location}
                                </p>
                              )}
                              {proposal.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {proposal.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
              Generated by TripBi • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Shareable Link Section */}
        <div className="p-4 border-t border-cream-400 dark:border-surface-dark-border">
          <h3 className="text-sm font-medium text-primary-700 dark:text-cream-100 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Share Timeline
          </h3>
          <p className="text-xs text-primary-700/60 dark:text-cream-400 mb-3">
            Create a read-only link anyone can view without signing in.
          </p>

          {!shareableLink ? (
            <button
              onClick={handleGenerateLink}
              disabled={generatingLink || dayGroups.length === 0}
              className="btn-outline w-full"
            >
              {generatingLink ? 'Generating...' : 'Generate Shareable Link'}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="input flex-1 text-sm bg-cream-200 dark:bg-surface-dark-muted"
                />
                <button
                  onClick={handleCopyLink}
                  className={`btn-outline ${linkCopied ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700' : ''}`}
                >
                  {linkCopied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-cream-400 dark:border-surface-dark-border flex gap-3">
          <button
            onClick={onClose}
            className="btn-outline flex-1"
          >
            Close
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || dayGroups.length === 0}
            className="btn-primary flex-1"
          >
            {exporting ? (
              <>
                <span className="spinner-sm"></span>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
