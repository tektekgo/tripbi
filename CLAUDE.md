# TripBi - Project Context for Claude

## Project Status

**Last Updated:** January 22, 2026

### Current State - MVP Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Phase 1: Trip Management** | ✅ Complete | Create trips, view list, trip detail with tabs |
| **Phase 2: Proposals System** | ✅ Complete | 6 categories, create/view proposals |
| **Phase 3: Voting & Comments** | ✅ Complete | Vote Yes/No/Pass, add comments |
| **Phase 4: Booking Tracker** | ✅ Complete | Mark as booked, view group status |
| **Phase 5: Timeline View** | ✅ Complete | Auto-generated from decided proposals |
| **Phase 6: Member Invites** | ✅ Complete | Email + shareable link both work |
| **Splitbi Integration** | 🔲 Not Started | Optional, future |

### Infrastructure Status

| Item | Status | Notes |
|------|--------|-------|
| Firebase project (tripbi-dev) | ✅ | Auth, Firestore, Storage configured |
| Firestore security rules | ✅ | Deployed for trips/proposals/bookings/invitations |
| Firestore indexes | ✅ | trips (members + createdAt), proposals (tripId + createdAt) |
| State-based routing | ✅ | Like SplitBi pattern |
| Pi-inspired UI | ✅ | Warm cream (#F5F0E8), forest green (#2D5A4A) |
| Cloud Functions | ✅ | sendInviteEmail function built |
| Email service (Resend) | ✅ | Integrated via Cloud Functions |
| Production environment | 🔲 | tripbi-prod not created yet |
| Custom domain | 🔲 | tripbi.app registered, not configured |

---

## What's Been Built

### Components Created

**UI Components** (`src/components/ui/`)
- `Modal.tsx` - Reusable modal with dialog element
- `Avatar.tsx` - User avatar with initials fallback + AvatarGroup
- `EmptyState.tsx` - Empty state placeholder
- `CategoryIcon.tsx` - Icons for 6 proposal categories

**Modals** (`src/components/modals/`)
- `CreateTripModal.tsx` - Trip creation form
- `CreateProposalModal.tsx` - Category selector + details form
- `ProposalDetailModal.tsx` - Full proposal view with voting/comments
- `InviteMemberModal.tsx` - Email invites + shareable link

**Trip Features** (`src/features/trips/`)
- `TripCard.tsx` - Trip card with cover, dates, members
- `TripList.tsx` - Grid of trip cards

**Proposal Features** (`src/features/proposals/`)
- `StatusBadge.tsx` - Proposed/Discussing/Decided badges
- `CategorySelector.tsx` - 6-category grid selector
- `ProposalCard.tsx` - Proposal summary card
- `ProposalList.tsx` - List with filters
- `CommentItem.tsx` - Single comment display
- `CommentForm.tsx` - Add comment input
- `CommentList.tsx` - Comments section

**Voting Features** (`src/features/voting/`)
- `VoteButtons.tsx` - Yes/No/Pass buttons
- `VoteResults.tsx` - Progress bar + voter list

**Booking Features** (`src/features/bookings/`)
- `BookingCard.tsx` - Individual booking display
- `BookingForm.tsx` - Mark as booked form
- `MyBookings.tsx` - Personal bookings view
- `TripBookingStatus.tsx` - Group booking dashboard

**Timeline Features** (`src/features/timeline/`)
- `TimelineItem.tsx` - Single timeline entry
- `TimelineDay.tsx` - Day grouping
- `TimelineView.tsx` - Full timeline with day groups

**Pages** (`src/pages/`)
- `Home.tsx` - Landing (logged out) / Dashboard (logged in)
- `Trips.tsx` - Trip list page
- `TripDetail.tsx` - Trip workspace with 3 tabs
- `AcceptInvite.tsx` - Invitation acceptance flow

**Cloud Functions** (`functions/src/`)
- `index.ts` - sendInviteEmail function (Resend integration)

### Data Model (Firestore)

```
trips/{tripId}
  - name, destination, description
  - startDate, endDate
  - createdBy, createdAt, updatedAt
  - members: string[] (UIDs for array-contains query)
  - memberDetails: TripMember[]
  - status: 'planning' | 'active' | 'completed'
  - splitbiGroupId? (optional)

proposals/{proposalId}
  - tripId, category, status, title, description
  - details: Record<string, unknown>
  - createdBy, createdAt, updatedAt
  - scheduledDate?, scheduledTime?
  - votes: Vote[]
  - comments: Comment[]

bookings/{bookingId}
  - tripId, proposalId, userId
  - status: 'pending' | 'confirmed'
  - confirmationNumber?, proofUrl?, notes?
  - bookedForCount, bookedAt?, createdAt

invitations/{invitationId}
  - tripId, tripName, email?, token
  - status: 'pending' | 'accepted' | 'expired'
  - createdBy, createdAt, expiresAt
  - acceptedBy?, acceptedAt?
```

---

## What Needs To Be Built

### Future Features

- Splitbi integration toggle
- Export timeline to PDF
- Push notifications
- Profile/settings page
- Trip settings (edit, delete, leave)
- Member role management (admin/member)
- Trip cover image upload

---

## Quick Reference

### Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:5173)
npm run build                  # Production build
npm run lint                   # ESLint
npx tsc --noEmit              # Type check

# Firebase Hosting & Firestore
npx firebase deploy --only firestore:rules    # Deploy security rules
npx firebase deploy --only firestore:indexes  # Deploy indexes
npx firebase deploy --only hosting            # Deploy app
npx firebase emulators:start                  # Local emulators

# Cloud Functions
cd functions && npm run build                 # Build functions
npx firebase deploy --only functions          # Deploy functions

# Set Resend API Key (required for email invites)
npx firebase functions:secrets:set RESEND_API_KEY
```

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app with state management, routing, modals |
| `src/types/index.ts` | TypeScript types for Trip, Proposal, Booking, etc. |
| `firestore.rules` | Security rules for all collections |
| `firestore.indexes.json` | Required composite indexes |
| `tailwind.config.js` | Design system colors |
| `src/styles/index.css` | Component classes (btn-primary, card, etc.) |

### Design System

**Colors (Pi-inspired, NOT original teal)**
- Background: `cream-200` (#F5F0E8) - warm cream
- Primary: `primary-500` (#2D5A4A) - forest green
- Primary text: `primary-700` (#1D4739)
- Cards: `cream-300` (#EDE5D8)

**Component Classes**
- `btn-primary` - Forest green pill button
- `btn-outline` - Outline pill button
- `card` - Cream card with rounded corners
- `input` - Pill-shaped input
- `input-rounded` - Rounded input (for textarea)

---

## Architecture Notes

### State Management Pattern (from SplitBi)

```typescript
// App.tsx structure
const [activeScreen, setActiveScreen] = useState<Screen>('home')
const [activeTripId, setActiveTripId] = useState<string | null>(null)
const [trips, setTrips] = useState<Trip[]>([])
const [proposals, setProposals] = useState<Proposal[]>([])
const [bookings, setBookings] = useState<Booking[]>([])

// Modal state
const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false)
const [isCreateProposalModalOpen, setIsCreateProposalModalOpen] = useState(false)
const [viewingProposalId, setViewingProposalId] = useState<string | null>(null)

// Derived state with useMemo
const activeTrip = useMemo(() => trips.find(t => t.id === activeTripId), [...])
const activeProposals = useMemo(() => proposals.filter(p => p.tripId === activeTripId), [...])
```

### Screen Types

```typescript
type Screen = 'home' | 'dashboard' | 'trips' | 'trip-detail' | 'profile' | 'create' | 'invite'
```

### Invite Flow

1. Trip member clicks "Invite" button → InviteMemberModal opens
2. **Option A (email):** Enter email → Creates invitation in Firestore → Cloud Function sends email
3. **Option B (link):** Click "Generate Link" → Creates invitation → Copy link to share
4. Invitee opens link → AcceptInvite page → Sign in with Google → Join trip

---

## Environment Setup

### Deployment Steps (for email invites)

1. **Set up Resend API Key as Firebase Secret:**
   ```bash
   npx firebase functions:secrets:set RESEND_API_KEY
   # Enter your Resend API key when prompted
   ```

2. **Deploy Cloud Functions:**
   ```bash
   cd functions && npm run build
   npx firebase deploy --only functions
   ```

3. **Deploy Firestore rules (if not already deployed):**
   ```bash
   npx firebase deploy --only firestore:rules
   ```

4. **Deploy the app:**
   ```bash
   npm run build
   npx firebase deploy --only hosting
   ```

### Resend Email Configuration

The email function sends from `invite@mail.tripbi.app`. Domain setup:
- Subdomain: `mail.tripbi.app` verified in Resend
- DNS records: DKIM, SPF, MX configured per Resend instructions
- Region: us-east-1 (North Virginia)

**Note:** The shareable link option works without email - users can copy the link and share via any channel.

### Firebase Project: tripbi-dev

```
API Key: AIzaSyBVYLF0vAqMachzcZQUwHo3V6AYH4aA0lU
Auth Domain: tripbi-dev.firebaseapp.com
Project ID: tripbi-dev
Storage Bucket: tripbi-dev.firebasestorage.app
```

---

## Related Documentation

- `docs/product/TripBi_Product_Spec-v01-12182025.md` - Full product spec
- `docs/architecture/DESIGN_SYSTEM.md` - Design system details
- `docs/integrations/SPLITBI_API_SPEC.md` - Splitbi API contract
- `docs/guides/` - Various guides
