import { useState, useEffect } from 'react'
import { doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import Modal from '@/components/ui/Modal'
import TimezoneSelector from '@/components/ui/TimezoneSelector'
import {
  suggestTimezoneForCity,
  getTimezoneOffset,
  formatTimezoneOffset,
  getDefaultTimezoneSettings,
} from '@/utils/timezone'
import type { Trip, TripTimezoneSettings } from '@/types'

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

  // Timezone settings state
  const defaultSettings = getDefaultTimezoneSettings()
  const [homeTimezone, setHomeTimezone] = useState(
    trip.timezoneSettings?.homeTimezone || defaultSettings.homeTimezone
  )
  const [destinationTimezone, setDestinationTimezone] = useState(
    trip.timezoneSettings?.destinationTimezone || defaultSettings.destinationTimezone
  )
  const [showHomeTime, setShowHomeTime] = useState(
    trip.timezoneSettings?.showHomeTime ?? defaultSettings.showHomeTime
  )

  // UI state
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = trip.createdBy === user?.uid

  // Calculate timezone offset for display
  const timezoneOffset = getTimezoneOffset(homeTimezone, destinationTimezone)
  const offsetDisplay = formatTimezoneOffset(timezoneOffset)

  // Auto-suggest destination timezone when destination changes (only if not already set)
  useEffect(() => {
    if (!trip.timezoneSettings?.destinationTimezone && destination) {
      const suggested = suggestTimezoneForCity(destination)
      if (suggested) {
        setDestinationTimezone(suggested)
      }
    }
  }, [destination, trip.timezoneSettings?.destinationTimezone])

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
      const timezoneSettings: TripTimezoneSettings = {
        homeTimezone,
        destinationTimezone,
        showHomeTime,
      }

      await updateDoc(doc(db, 'trips', trip.id), {
        name: name.trim(),
        destination: destination.trim(),
        description: description.trim() || null,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        status,
        timezoneSettings,
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

        {/* Timezone Settings */}
        <div className="pt-4 border-t border-cream-300">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-primary-700">Timezone Settings</h3>
          </div>

          {/* Home Timezone */}
          <div className="mb-4">
            <TimezoneSelector
              value={homeTimezone}
              onChange={setHomeTimezone}
              label="Your Home Timezone"
              placeholder="Select your home timezone..."
              showCurrentTime={true}
              detectLocalButton={true}
            />
            <p className="mt-1 text-xs text-primary-700/50">
              Where you're traveling from
            </p>
          </div>

          {/* Destination Timezone */}
          <div className="mb-4">
            <TimezoneSelector
              value={destinationTimezone}
              onChange={setDestinationTimezone}
              label="Destination Timezone"
              placeholder="Select destination timezone..."
              showCurrentTime={true}
            />
            <p className="mt-1 text-xs text-primary-700/50">
              The timezone at your destination ({destination || 'your destination'})
            </p>
          </div>

          {/* Time Difference Display */}
          {homeTimezone !== destinationTimezone && (
            <div className="mb-4 p-3 bg-primary-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="text-sm text-primary-700">Time difference</span>
                </div>
                <span className="font-semibold text-primary-700">{offsetDisplay}</span>
              </div>
            </div>
          )}

          {/* Show Home Time Toggle */}
          <label className="flex items-center justify-between p-3 bg-cream-200 rounded-xl cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-primary-700">Show home time</div>
                <div className="text-xs text-primary-700/60">
                  Display home time alongside destination time
                </div>
              </div>
            </div>
            <div className={`relative w-11 h-6 transition-colors rounded-full
              ${showHomeTime ? 'bg-primary-500' : 'bg-cream-400'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                ${showHomeTime ? 'translate-x-5' : 'translate-x-0'}`}
              />
              <input
                type="checkbox"
                checked={showHomeTime}
                onChange={(e) => setShowHomeTime(e.target.checked)}
                className="sr-only"
              />
            </div>
          </label>
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
