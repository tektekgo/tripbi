import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { useAuth } from '@/contexts/AuthContext'
import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type { Booking, Proposal } from '@/types'
import CategoryIcon from '@/components/ui/CategoryIcon'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  proposal: Proposal | null
  tripId: string
  existingBooking?: Booking | null
}

export default function BookingModal({
  isOpen,
  onClose,
  proposal,
  tripId,
  existingBooking,
}: BookingModalProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<Booking['status']>(existingBooking?.status || 'pending')
  const [confirmationNumber, setConfirmationNumber] = useState(existingBooking?.confirmationNumber || '')
  const [notes, setNotes] = useState(existingBooking?.notes || '')
  const [bookedForCount, setBookedForCount] = useState(existingBooking?.bookedForCount || 1)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setStatus(existingBooking?.status || 'pending')
    setConfirmationNumber(existingBooking?.confirmationNumber || '')
    setNotes(existingBooking?.notes || '')
    setBookedForCount(existingBooking?.bookedForCount || 1)
    setProofFile(null)
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError('Only images (JPG, PNG, WebP) and PDFs are allowed')
        return
      }
      setProofFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !proposal) return

    setLoading(true)
    setError('')

    try {
      let proofUrl = existingBooking?.proofUrl

      // Upload proof file if provided
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `bookings/${tripId}/${proposal.id}/${user.uid}-${Date.now()}.${fileExt}`
        const storageRef = ref(storage, fileName)

        await uploadBytes(storageRef, proofFile)
        proofUrl = await getDownloadURL(storageRef)
      }

      const now = Timestamp.now()
      const bookingId = existingBooking?.id || `${tripId}-${proposal.id}-${user.uid}`

      const bookingData: Omit<Booking, 'id'> = {
        tripId,
        proposalId: proposal.id,
        userId: user.uid,
        status,
        confirmationNumber: confirmationNumber.trim() || undefined,
        proofUrl,
        notes: notes.trim() || undefined,
        bookedForCount,
        bookedAt: status === 'confirmed' ? now : undefined,
        createdAt: existingBooking?.createdAt || now,
        updatedAt: now,
      }

      if (existingBooking) {
        await updateDoc(doc(db, 'bookings', bookingId), bookingData)
      } else {
        await setDoc(doc(db, 'bookings', bookingId), { ...bookingData, id: bookingId })
      }

      handleClose()
    } catch (err) {
      console.error('Error saving booking:', err)
      setError('Failed to save booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!proposal) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={existingBooking ? 'Update Booking' : 'Mark as Booked'}
      size="md"
    >
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
              <p className="text-sm text-primary-700/60 dark:text-cream-400">
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
                  : 'border-cream-300 text-primary-700/70 hover:border-cream-400 dark:border-surface-dark-border dark:text-cream-400'
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
                  : 'border-cream-300 text-primary-700/70 hover:border-cream-400 dark:border-surface-dark-border dark:text-cream-400'
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
            Confirmation Number <span className="text-primary-700/60 font-normal">(optional)</span>
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

        {/* Proof Upload */}
        <div>
          <label className="label">
            Upload Proof <span className="text-primary-700/60 font-normal">(optional)</span>
          </label>
          <div className="mt-1">
            {existingBooking?.proofUrl && !proofFile && (
              <div className="mb-2 p-3 bg-cream-200 dark:bg-surface-dark-muted rounded-lg">
                <a
                  href={existingBooking.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  View current proof
                </a>
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-cream-400 dark:border-surface-dark-border rounded-xl cursor-pointer hover:bg-cream-200 dark:hover:bg-surface-dark-muted transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {proofFile ? (
                  <>
                    <svg className="w-8 h-8 mb-2 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-primary-700 dark:text-cream-100 font-medium">{proofFile.name}</p>
                    <p className="text-xs text-primary-700/60 dark:text-cream-400">Click to change</p>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-2 text-primary-700/50 dark:text-cream-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-primary-700/70 dark:text-cream-400">
                      <span className="font-medium text-primary-600 dark:text-primary-400">Click to upload</span> confirmation
                    </p>
                    <p className="text-xs text-primary-700/50 dark:text-cream-500">PNG, JPG, PDF up to 5MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="label">
            Notes <span className="text-primary-700/60 font-normal">(optional)</span>
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
            onClick={handleClose}
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
    </Modal>
  )
}
