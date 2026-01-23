// App constants
export const APP_NAME = 'TripBi'
export const APP_TAGLINE = 'Plan together. Travel together.'
export const APP_URL = import.meta.env.VITE_APP_URL || 'https://tripbi.app'

// Limits
export const MAX_TRIP_MEMBERS = 15
export const MAX_PROPOSALS_PER_TRIP = 100
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// Proposal categories
export const PROPOSAL_CATEGORIES = [
  { id: 'flights', label: 'Flights', icon: '✈️' },
  { id: 'hotels', label: 'Hotels', icon: '🏨' },
  { id: 'activities', label: 'Activities', icon: '🎟️' },
  { id: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { id: 'transportation', label: 'Transportation', icon: '🚗' },
  { id: 'tasks', label: 'Tasks', icon: '📋' },
] as const

// Proposal statuses
export const PROPOSAL_STATUSES = {
  PROPOSED: 'proposed',
  DISCUSSING: 'discussing',
  DECIDED: 'decided',
} as const

// Trip statuses
export const TRIP_STATUSES = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const

// Booking statuses
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
} as const

// Vote types
export const VOTE_TYPES = {
  YES: 'yes',
  NO: 'no',
  ABSTAIN: 'abstain',
} as const

// Member roles
export const MEMBER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const
