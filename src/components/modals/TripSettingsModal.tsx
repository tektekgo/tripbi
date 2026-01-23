import { useState } from 'react'
import { doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import Modal from '@/components/ui/Modal'
import type { Trip } from '@/types'

interface TripSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip
  onTripDeleted?: () => void
}

type TripStatus = 'planning' | 'active' | 'completed'

const statusOptions: { value: TripStatus; label: string; description: string }[] = [
  { value: 'planning', label: 'Planning', description: 'Trip is being planned' },
  { value: 'active', label: 'Active', description: 'Trip is currently happening' },
  { value: 'completed', label: 'Completed', description: 'Trip has ended' },
]

export default function TripSettingsModal({
  isOpen,
  onClose,
  trip,
  onTripDeleted,
}: TripSettingsModalProps) {
  const { user } = useAuth()

  // Form state
  const [name, setName] = useState(trip.name)
  const [destination, setDestination] = useState(trip.destination)
  const [description, setDescription] = useState(trip.description || '')
  const [startDate, setStartDate] = useState(
    trip.startDate.toDate().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(
    trip.endDate.toDate().toISOString().split('T')[0]
  )
  const [status, setStatus] = useState<TripStatus>(trip.status)

  // UI state
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = trip.createdBy === user?.uid

  const handleSave = async () => {
    if (!name.trim() || !destination.trim()) {
      setError('Name and destination are required')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateDoc(doc(db, 'trips', trip.id), {
        name: name.trim(),
        destination: destination.trim(),
        description: description.trim() || null,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        status,
        updatedAt: Timestamp.now(),
      })
      onClose()
    } catch (err) {
      console.error('Error updating trip:', err)
      setError('Failed to update trip. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!isAdmin) return

    setDeleting(true)
    setError(null)

    try {
      await deleteDoc(doc(db, 'trips', trip.id))
      onClose()
      onTripDeleted?.()
    } catch (err) {
      console.error('Error deleting trip:', err)
      setError('Failed to delete trip. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trip Settings">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-700">
            {error}
          </div>
        )}

        {/* Trip Name */}
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">
            Trip Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
            placeholder="e.g., Japan Adventure 2025"
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">
            Destination *
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="input w-full"
            placeholder="e.g., Tokyo, Japan"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full h-20 resize-none"
            placeholder="Optional description..."
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Trip Status
          </label>
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                  ${status === option.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-cream-400 hover:border-cream-500 hover:bg-cream-100'
                  }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={status === option.value}
                  onChange={(e) => setStatus(e.target.value as TripStatus)}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-primary-700">{option.label}</div>
                  <div className="text-xs text-primary-700/60">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-cream-400">
          <button
            onClick={onClose}
            className="btn-outline flex-1"
            disabled={saving || deleting}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1"
            disabled={saving || deleting}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Delete Section - Only for admin */}
        {isAdmin && (
          <div className="pt-4 border-t border-cream-400">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full btn-outline text-error-600 border-error-300 hover:bg-error-50 hover:border-error-400"
                disabled={saving}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Trip
              </button>
            ) : (
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-700 mb-3">
                  Are you sure you want to delete this trip? This will also delete all proposals, bookings, and invitations. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn-outline btn-sm flex-1"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn-sm flex-1 bg-error-600 text-white hover:bg-error-700"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
