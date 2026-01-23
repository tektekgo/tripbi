import { useState } from 'react'
import type { Booking, Proposal } from '@/types'
import CategoryIcon from '@/components/ui/CategoryIcon'

interface BookingFormProps {
  proposal: Proposal
  existingBooking?: Booking | null
  onSubmit: (data: {
    status: Booking['status']
    confirmationNumber?: string
    notes?: string
    bookedForCount: number
  }) => Promise<void>
  onCancel: () => void
}

export default function BookingForm({
  proposal,
  existingBooking,
  onSubmit,
  onCancel,
}: BookingFormProps) {
  const [status, setStatus] = useState<Booking['status']>(existingBooking?.status || 'pending')
  const [confirmationNumber, setConfirmationNumber] = useState(existingBooking?.confirmationNumber || '')
  const [notes, setNotes] = useState(existingBooking?.notes || '')
  const [bookedForCount, setBookedForCount] = useState(existingBooking?.bookedForCount || 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onSubmit({
        status,
        confirmationNumber: confirmationNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        bookedForCount,
      })
    } catch (err) {
      console.error('Error saving booking:', err)
      setError('Failed to save booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-error-100 text-error-700 rounded-xl text-sm dark:bg-error-900 dark:text-error-300">
          {error}
        </div>
      )}

      {/* Proposal info */}
      <div className="flex items-center gap-3 p-4 bg-cream-200 dark:bg-surface-dark-muted rounded-xl">
        <CategoryIcon category={proposal.category} size="md" />
        <div>
          <h4 className="font-medium text-primary-700 dark:text-cream-100">
            {proposal.title}
          </h4>
          {proposal.scheduledDate && (
            <p className="text-sm text-cream-600 dark:text-cream-500">
              {proposal.scheduledDate.toDate().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              {proposal.scheduledTime && ` at ${proposal.scheduledTime}`}
            </p>
          )}
        </div>
      </div>

      {/* Booking Status */}
      <div>
        <label className="label">Booking Status</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStatus('pending')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all
              ${status === 'pending'
                ? 'border-warning-500 bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300'
                : 'border-cream-300 text-cream-700 hover:border-cream-400 dark:border-surface-dark-border dark:text-cream-400'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending
            </div>
          </button>
          <button
            type="button"
            onClick={() => setStatus('confirmed')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all
              ${status === 'confirmed'
                ? 'border-success-500 bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                : 'border-cream-300 text-cream-700 hover:border-cream-400 dark:border-surface-dark-border dark:text-cream-400'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirmed
            </div>
          </button>
        </div>
      </div>

      {/* Number of people */}
      <div>
        <label htmlFor="bookedForCount" className="label">
          Booked for how many people?
        </label>
        <input
          type="number"
          id="bookedForCount"
          value={bookedForCount}
          onChange={(e) => setBookedForCount(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          className="input w-32"
          disabled={loading}
        />
      </div>

      {/* Confirmation Number */}
      <div>
        <label htmlFor="confirmationNumber" className="label">
          Confirmation Number <span className="text-cream-600 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          id="confirmationNumber"
          value={confirmationNumber}
          onChange={(e) => setConfirmationNumber(e.target.value)}
          placeholder="e.g., ABC123"
          className="input"
          disabled={loading}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label">
          Notes <span className="text-cream-600 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes about your booking..."
          rows={3}
          className="input-rounded resize-none"
          disabled={loading}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline flex-1"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-sm"></span>
              Saving...
            </>
          ) : existingBooking ? (
            'Update Booking'
          ) : (
            'Save Booking'
          )}
        </button>
      </div>
    </form>
  )
}
