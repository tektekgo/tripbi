import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { useAuth } from '@/contexts/AuthContext'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Trip, TripMember } from '@/types'

interface CreateTripModalProps {
  isOpen: boolean
  onClose: () => void
  onTripCreated: (tripId: string) => void
}

export default function CreateTripModal({ isOpen, onClose, onTripCreated }: CreateTripModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setName('')
    setDestination('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validation
    if (!name.trim()) {
      setError('Trip name is required')
      return
    }
    if (!destination.trim()) {
      setError('Destination is required')
      return
    }
    if (!startDate || !endDate) {
      setError('Start and end dates are required')
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('End date must be after start date')
      return
    }

    setLoading(true)
    setError('')

    try {
      const now = Timestamp.now()
      const memberDetail: TripMember = {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName,
        role: 'admin',
        joinedAt: now,
      }

      const tripData: Omit<Trip, 'id'> = {
        name: name.trim(),
        destination: destination.trim(),
        description: description.trim() || undefined,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
        members: [user.uid],
        memberDetails: [memberDetail],
        status: 'planning',
      }

      const docRef = await addDoc(collection(db, 'trips'), tripData)
      resetForm()
      onTripCreated(docRef.id)
    } catch (err) {
      console.error('Error creating trip:', err)
      setError('Failed to create trip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create a Trip" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-error-100 text-error-700 rounded-xl text-sm dark:bg-error-900 dark:text-error-300">
            {error}
          </div>
        )}

        {/* Trip Name */}
        <div>
          <label htmlFor="tripName" className="label">
            Trip Name *
          </label>
          <input
            type="text"
            id="tripName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Paris Summer 2025"
            className="input"
            disabled={loading}
          />
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="destination" className="label">
            Destination *
          </label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Paris, France"
            className="input"
            disabled={loading}
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="label">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="label">
              End Date *
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="input"
              disabled={loading}
            />
          </div>
        </div>

        {/* Description (optional) */}
        <div>
          <label htmlFor="description" className="label">
            Description <span className="text-primary-700/60 font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any notes about the trip..."
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
                Creating...
              </>
            ) : (
              'Create Trip'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
