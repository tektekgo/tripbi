import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { useAuth } from '@/contexts/AuthContext'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Proposal } from '@/types'
import { CategorySelector } from '@/features/proposals'
import { getCategoryLabel } from '@/components/ui/CategoryIcon'

interface CreateProposalModalProps {
  isOpen: boolean
  onClose: () => void
  tripId: string
  onProposalCreated: (proposalId: string) => void
}

export default function CreateProposalModal({
  isOpen,
  onClose,
  tripId,
  onProposalCreated,
}: CreateProposalModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'category' | 'details'>('category')
  const [category, setCategory] = useState<Proposal['category'] | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  // Category-specific fields
  const [link, setLink] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setStep('category')
    setCategory(null)
    setTitle('')
    setDescription('')
    setScheduledDate('')
    setScheduledTime('')
    setLink('')
    setPrice('')
    setLocation('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleCategorySelect = (cat: Proposal['category']) => {
    setCategory(cat)
    setStep('details')
  }

  const handleBack = () => {
    setStep('category')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !category) return

    // Validation
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const now = Timestamp.now()

      // Build category-specific details
      const details: Record<string, unknown> = {}
      if (link) details.link = link
      if (price) details.price = price
      if (location) details.location = location

      const proposalData: Omit<Proposal, 'id'> = {
        tripId,
        category,
        status: 'proposed',
        title: title.trim(),
        description: description.trim(),
        details,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
        votes: [],
        comments: [],
        ...(scheduledDate && {
          scheduledDate: Timestamp.fromDate(new Date(scheduledDate)),
        }),
        ...(scheduledTime && { scheduledTime }),
      }

      const docRef = await addDoc(collection(db, 'proposals'), proposalData)
      resetForm()
      onProposalCreated(docRef.id)
    } catch (err) {
      console.error('Error creating proposal:', err)
      setError('Failed to create proposal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryPlaceholders = () => {
    switch (category) {
      case 'flights':
        return {
          title: 'e.g., Flight to Paris - June 15',
          description: 'Add flight details, airline, departure time...',
          link: 'Link to booking site or flight details',
          price: 'e.g., $450 per person',
          location: 'e.g., JFK → CDG',
        }
      case 'hotels':
        return {
          title: 'e.g., Hotel Le Marais',
          description: 'Add hotel details, amenities, location...',
          link: 'Link to hotel or booking site',
          price: 'e.g., $200/night',
          location: 'e.g., Le Marais, Paris',
        }
      case 'activities':
        return {
          title: 'e.g., Louvre Museum Tour',
          description: 'Add activity details, duration, what to expect...',
          link: 'Link to tickets or booking',
          price: 'e.g., €45 per person',
          location: 'e.g., Louvre Museum, Paris',
        }
      case 'restaurants':
        return {
          title: 'e.g., Dinner at Le Comptoir',
          description: 'Add restaurant details, cuisine type, dress code...',
          link: 'Link to restaurant or reservation',
          price: 'e.g., €50-80 per person',
          location: 'e.g., Saint-Germain, Paris',
        }
      case 'transportation':
        return {
          title: 'e.g., Train to Versailles',
          description: 'Add transportation details...',
          link: 'Link to booking or schedule',
          price: 'e.g., €15 round trip',
          location: 'e.g., Paris → Versailles',
        }
      case 'tasks':
        return {
          title: 'e.g., Book airport transfer',
          description: 'Add task details, who should do it...',
          link: 'Relevant link',
          price: 'Estimated cost if applicable',
          location: 'N/A',
        }
      default:
        return {
          title: 'Enter title',
          description: 'Enter description',
          link: 'Add a link',
          price: 'Add price',
          location: 'Add location',
        }
    }
  }

  const placeholders = getCategoryPlaceholders()

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'category' ? 'Add Proposal' : `New ${category ? getCategoryLabel(category) : ''}`}
      size="md"
    >
      {/* Step 1: Category Selection */}
      {step === 'category' && (
        <div>
          <p className="text-primary-700/70 dark:text-cream-400 mb-6">
            What type of item are you proposing?
          </p>
          <CategorySelector
            value={category}
            onChange={handleCategorySelect}
            disabled={loading}
          />
        </div>
      )}

      {/* Step 2: Details Form */}
      {step === 'details' && category && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-error-100 text-error-700 rounded-xl text-sm dark:bg-error-900 dark:text-error-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="proposalTitle" className="label">
              Title *
            </label>
            <input
              type="text"
              id="proposalTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={placeholders.title}
              className="input"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="proposalDescription" className="label">
              Description <span className="text-primary-700/60 font-normal">(optional)</span>
            </label>
            <textarea
              id="proposalDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={placeholders.description}
              rows={3}
              className="input-rounded resize-none"
              disabled={loading}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="proposalDate" className="label">
                Date <span className="text-primary-700/60 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                id="proposalDate"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="input"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="proposalTime" className="label">
                Time <span className="text-primary-700/60 font-normal">(optional)</span>
              </label>
              <input
                type="time"
                id="proposalTime"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="input"
                disabled={loading}
              />
            </div>
          </div>

          {/* Category-specific fields */}
          {category !== 'tasks' && (
            <div>
              <label htmlFor="proposalLocation" className="label">
                Location <span className="text-primary-700/60 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="proposalLocation"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={placeholders.location}
                className="input"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label htmlFor="proposalLink" className="label">
              Link <span className="text-primary-700/60 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              id="proposalLink"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={placeholders.link}
              className="input"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="proposalPrice" className="label">
              Price <span className="text-primary-700/60 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              id="proposalPrice"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={placeholders.price}
              className="input"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="btn-outline flex-1"
              disabled={loading}
            >
              Back
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
                'Add Proposal'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
