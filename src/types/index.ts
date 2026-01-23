import { Timestamp } from 'firebase/firestore'

// Re-export all types from feature-specific files
// These will be created as features are built

// Base types used across the app

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface TripMember {
  userId: string
  email: string
  displayName: string | null
  role: 'admin' | 'member'
  joinedAt: Timestamp
}

export interface Trip {
  id: string
  name: string
  destination: string
  description?: string
  startDate: Timestamp
  endDate: Timestamp
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  members: string[] // Array of user IDs
  memberDetails: TripMember[]
  status: 'planning' | 'active' | 'completed'
  splitbiGroupId?: string // Optional Splitbi integration
  coverImageUrl?: string
}

export interface Proposal {
  id: string
  tripId: string
  category: 'flights' | 'hotels' | 'activities' | 'restaurants' | 'transportation' | 'tasks'
  status: 'proposed' | 'discussing' | 'decided'
  title: string
  description: string
  details: Record<string, unknown> // Category-specific details
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  votingDeadline?: Timestamp
  scheduledDate?: Timestamp
  scheduledTime?: string
  votes: Vote[]
  comments: Comment[]
  reactions?: Reaction[] // Personal reactions (private to each user)
}

export interface Vote {
  userId: string
  vote: 'yes' | 'no' | 'abstain'
  timestamp: Timestamp
}

// Personal reaction (private to each user, not visible to group)
export interface Reaction {
  userId: string
  reaction: 'interested' | 'maybe' | 'not_interested'
  timestamp: Timestamp
}

export interface Comment {
  id: string
  userId: string
  text: string
  timestamp: Timestamp
  editedAt?: Timestamp
}

export interface Booking {
  id: string
  tripId: string
  proposalId: string
  userId: string
  status: 'pending' | 'confirmed'
  confirmationNumber?: string
  proofUrl?: string // Firebase Storage URL
  notes?: string
  bookedForCount: number // Number of people this booking covers
  bookedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface TimelineItem {
  proposalId: string
  date: Timestamp
  time?: string
  title: string
  category: Proposal['category']
  details: Record<string, unknown>
}

export interface Timeline {
  tripId: string
  items: TimelineItem[]
  generatedAt: Timestamp
}

// Invitation types
export interface Invitation {
  id: string
  tripId: string
  tripName: string
  email?: string // Optional - not set for link-only invites
  token: string // Unique token for the invite link
  status: 'pending' | 'accepted' | 'expired'
  createdBy: string
  createdAt: Timestamp
  expiresAt: Timestamp
  acceptedBy?: string
  acceptedAt?: Timestamp
}

// Shareable Timeline types
export interface ShareableTimeline {
  id: string
  tripId: string
  tripName: string
  destination: string
  startDate: Timestamp
  endDate: Timestamp
  token: string
  createdBy: string
  createdAt: Timestamp
  expiresAt?: Timestamp // Optional - null means no expiry
  proposals: ShareableProposal[]
}

export interface ShareableProposal {
  id: string
  category: Proposal['category']
  title: string
  description: string
  scheduledDate?: Timestamp
  scheduledTime?: string
  details: Record<string, unknown>
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
