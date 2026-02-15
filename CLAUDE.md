# TripBi - Project Context for Claude

## Project Status

**Last Updated:** February 14, 2026

### Current State - MVP Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Phase 1: Trip Management** | ✅ Complete | Create trips, view list, trip detail with tabs |
| **Phase 2: Proposals System** | ✅ Complete | 6 categories, create/view proposals |
| **Phase 3: Voting & Comments** | ✅ Complete | Vote Yes/No/Pass, add comments |
| **Phase 4: Booking Tracker** | ✅ Complete | Mark as booked, view group status |
| **Phase 5: Timeline View** | ✅ Complete | Auto-generated from decided proposals |
| **Phase 6: Member Invites** | ✅ Complete | Email + shareable link both work |
| **Personal Reactions** | ✅ Complete | Private interest tracking (Interested/Maybe/Not for me) |
| **Trip Status** | ✅ Complete | Planning/Active/Completed badges |
| **Day Filter** | ✅ Complete | Filter proposals by trip day |
| **Timezone Support** | ✅ Complete | Destination + home timezone display |
| **Trip Settings** | ✅ Complete | Edit trip details, delete trip (admin only) |
| **Timeline Export** | ✅ Complete | PDF download + shareable public link |
| **Profile Page** | ✅ Complete | View user info, sign out (read-only) |
| **SplitBi Integration** | ✅ Complete | Expense tracking via SplitBi API (Expenses tab) |

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
- `TimeDisplay.tsx` - Dual-timezone time display (full + compact)
- `TimezoneSelector.tsx` - Searchable timezone dropdown

**Utilities** (`src/utils/`)
- `timezone.ts` - Timezone utilities, city mappings, offset calculations

**Modals** (`src/components/modals/`)
- `CreateTripModal.tsx` - Trip creation form
- `CreateProposalModal.tsx` - Category selector + details form
- `ProposalDetailModal.tsx` - Full proposal view with voting/comments
- `InviteMemberModal.tsx` - Email invites + shareable link
- `BookingModal.tsx` - Mark proposal as booked
- `TripSettingsModal.tsx` - Edit/delete trip, timezone settings

**Trip Features** (`src/features/trips/`)
- `TripCard.tsx` - Trip card with cover, dates, members
- `TripList.tsx` - Grid of trip cards

**Proposal Features** (`src/features/proposals/`)
- `StatusBadge.tsx` - Proposed/Discussing/Decided badges
- `CategorySelector.tsx` - 6-category grid selector
- `ProposalCard.tsx` - Proposal summary card with personal reactions
- `ProposalList.tsx` - List with status and day filters
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
- `TimelineExport.tsx` - PDF export + shareable link generation

**SplitBi Integration** (`src/features/splitbi/`)
- `ExpenseTracker.tsx` - Main expense tracking UI with enable/sync/summary
- `ExpenseSummary.tsx` - Group balance summary and simplified debts
- `ExpenseList.tsx` - Recent expenses list

**SplitBi Hooks & API** (`src/hooks/`, `src/lib/`)
- `useSplitBi.ts` - Hook for SplitBi API operations (create group, fetch summary, sync members, send invites)
- `splitbi.ts` - SplitBi REST API client (email-based identification)

**Pages** (`src/pages/`)
- `Home.tsx` - Landing (logged out) / Dashboard (logged in)
- `Trips.tsx` - Trip list page
- `TripDetail.tsx` - Trip workspace with 3 tabs
- `AcceptInvite.tsx` - Invitation acceptance flow
- `Profile.tsx` - User profile page (read-only)
- `SharedTimeline.tsx` - Public timeline view (no auth required)

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
  - reactions?: Reaction[] (private interest: interested/maybe/not_interested)

trips/{tripId} (additional fields)
  - timezoneSettings?: { destinationTimezone, homeTimezone?, showHomeTimezone }

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

sharedTimelines/{token}
  - id, tripId, tripName, destination
  - startDate, endDate
  - token, createdBy, createdAt
  - expiresAt? (optional expiration)
  - proposals: ShareableProposal[] (snapshot of decided proposals)
```

---

## What Needs To Be Built

### Future Features

- Push notifications
- Leave trip (for non-admin members)
- Member role management (admin/member permissions)
- Trip cover image upload
- Edit profile (change display name, photo)
- Production environment (tripbi-prod)
- Custom domain setup (tripbi.app)

---

## Quick Reference

### Commands

```bash
# Local Development
npm run dev                    # Start dev server (localhost:5173)
npm run check                  # TypeScript + ESLint (pre-deploy check)
npm run lint                   # ESLint only
npm run test                   # Run unit tests (vitest)
npm run test:run              # Run tests once (CI mode)

# Deploy (use these — they handle build mode + Firebase project automatically)
npm run deploy                 # Build + deploy to tripbi-dev (testing)
npm run deploy:prod            # Build + deploy to tripbi-prod (production)
npm run deploy:rules           # Deploy Firestore rules + indexes to dev
npm run deploy:functions       # Build + deploy Cloud Functions to dev

# Build only (without deploying)
npm run build                  # Production build (uses .env.production)
npm run build:dev              # Dev build (uses .env.development)
```

### Daily Developer Workflow

```
LOCAL DEV  ──►  DEV (testing)  ──►  PROD (live)
npm run dev     npm run deploy      npm run deploy:prod
localhost:5173  tripbi-dev.web.app  tripbi.app
```

1. **Work locally:** `npm run dev`
2. **Check before deploy:** `npm run check`
3. **Deploy to dev for testing:** `npm run deploy`
4. **Deploy to production:** `npm run deploy:prod` *(when tripbi-prod is set up)*

**See `docs/guides/DAILY_WORKFLOW.md` for full details on how env vars and build modes work.**

### Environment Files

| File | Purpose | Used By |
|------|---------|---------|
| `.env.development` | tripbi-dev Firebase config | `npm run dev`, `npm run deploy` |
| `.env.production` | tripbi-prod Firebase config | `npm run build`, `npm run deploy:prod` |
| `.env.example` | Template for required variables | Reference only |

**Note:** `.env.development` contains real API keys for tripbi-dev. `.env.production` has placeholders until tripbi-prod is set up.

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
type Screen = 'home' | 'dashboard' | 'trips' | 'trip-detail' | 'profile' | 'create' | 'invite' | 'shared-timeline'
```

### Invite Flow

1. Trip member clicks "Invite" button → InviteMemberModal opens
2. **Option A (email):** Enter email → Creates invitation in Firestore → Cloud Function sends email
3. **Option B (link):** Click "Generate Link" → Creates invitation → Copy link to share
4. Invitee opens link → AcceptInvite page → Sign in with Google → Join trip

### SplitBi Integration

TripBi integrates with SplitBi for expense tracking. Key details:

**Architecture:**
- Uses email addresses as the common identifier (Firebase UIDs differ between projects)
- TripBi calls SplitBi's REST API (`/api/v1/*`) with API key authentication
- SplitBi creates placeholder users for emails that don't have accounts yet

**Flow:**
1. User clicks "Enable Expense Tracking" on Expenses tab
2. TripBi calls SplitBi API to create a group with trip members' emails
3. SplitBi returns `groupId`, stored in trip's `splitbiGroupId` field
4. User optionally sends email invites to notify members
5. Members add expenses in SplitBi app (same email = auto-access)
6. TripBi fetches and displays expense summary from SplitBi

**API Endpoints Used:**
- `POST /v1/groups` - Create expense group
- `GET /v1/groups/:id/summary` - Get balances and debts
- `GET /v1/groups/:id/expenses` - Get recent expenses
- `POST /v1/groups/:id/members` - Sync new trip members
- `POST /v1/groups/:id/invite` - Send email invites

**Environment Variables:**
```
VITE_SPLITBI_API_URL=https://us-central1-splitbi-dev.cloudfunctions.net/api
VITE_SPLITBI_API_KEY=<api-key-for-tripbi>
```

---

## Environment Setup

### Initial Setup (One-time)

1. **Install dependencies:**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. **Set up Resend API Key as Firebase Secret:**
   ```bash
   npx firebase functions:secrets:set RESEND_API_KEY
   # Enter your Resend API key when prompted
   ```

3. **Deploy Cloud Functions:**
   ```bash
   cd functions && npm run build
   npx firebase deploy --only functions
   ```

4. **Deploy Firestore rules and indexes:**
   ```bash
   npx firebase deploy --only firestore:rules
   npx firebase deploy --only firestore:indexes
   ```

### Regular Deployment

**For tripbi-dev (development):**
```bash
npm run deploy:dev
```

**For tripbi-prod (production):** *(when ready)*
```bash
npm run deploy:prod
```

### Resend Email Configuration

The email function sends from `invite@mail.tripbi.app`. Domain setup:
- Subdomain: `mail.tripbi.app` verified in Resend
- DNS records: DKIM, SPF, MX configured per Resend instructions
- Region: us-east-1 (North Virginia)

**Note:** The shareable link option works without email - users can copy the link and share via any channel.

### Firebase Projects

| Environment | Project ID | Hosting URL | Config File |
|-------------|------------|-------------|-------------|
| Development | tripbi-dev | tripbi-dev.web.app | `.env.development` |
| Production | tripbi-prod | tripbi.app | `.env.production` |

**Note:** API keys and secrets are stored in `.env.*` files (not committed to git). See `.env.example` for required variables.

---

## Related Documentation

- `docs/FEATURES.md` - **All implemented features reference** (user-facing)
- `docs/product/TripBi_Product_Spec-v01-12182025.md` - Original product spec
- `docs/architecture/DESIGN_SYSTEM.md` - Design system details
- `docs/integrations/SPLITBI_API_SPEC.md` - Splitbi API contract
- `docs/guides/` - Various guides
