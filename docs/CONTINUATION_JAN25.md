# TripBi Continuation Document - January 25, 2026

## Session Summary (January 24, 2026)

### Completed Today

| Feature | Status | Notes |
|---------|--------|-------|
| SplitBi Integration | ✅ Complete | Email-based user identification, expense tracking UI |
| Email Invites | ✅ Complete | Optional email invites after enabling expense tracking |
| Firestore Index | ✅ Fixed | expenses collection (groupId + expenseDate) |
| RESEND_API_KEY | ✅ Configured | Set in SplitBi Firebase secrets |
| Profile Page Redesign | ✅ Complete | Pi-inspired layout with menu items |
| Privacy Policy | ✅ Complete | /privacy.html with TripBi content |
| Terms of Service | ✅ Complete | /terms.html with TripBi content |
| Dependabot Vulnerabilities | ✅ Fixed | tar@7.5.6 via npm override |
| Documentation | ✅ Updated | CLAUDE.md, FEATURES.md, SPLITBI_API_SPEC.md |

### Current Deployments
- **TripBi:** https://tripbi-dev.web.app (build 42)
- **SplitBi API:** https://us-central1-splitbi-dev.cloudfunctions.net/api

---

## Next Priority: Admin/Member Role System

### Current State
The data model already supports roles:
```typescript
interface TripMember {
  userId: string
  email: string
  displayName: string | null
  role: 'admin' | 'member'  // ← Already exists!
  joinedAt: Timestamp
}
```

**Current behavior:** Trip creator is set as admin, but roles aren't enforced anywhere in the UI.

### Proposed Admin Permissions

| Action | Admin | Member | Notes |
|--------|-------|--------|-------|
| Edit trip details | ✅ | ❌ | Name, dates, destination, description |
| Delete trip | ✅ | ❌ | Only admins can delete |
| Enable expense tracking | ✅ | ❌ | Links to SplitBi |
| Unlink expense group | ✅ | ❌ | Remove SplitBi connection |
| Send expense email invites | ✅ | ❌ | Notify members via email |
| Manage members | ✅ | ❌ | Invite, remove, promote to admin |
| Promote member to admin | ✅ | ❌ | Grant admin rights |
| Demote admin to member | ✅ | ❌ | Must have ≥1 admin remaining |
| Remove member from trip | ✅ | ❌ | Cannot remove self if only admin |
| Create proposals | ✅ | ✅ | Everyone can propose |
| Vote on proposals | ✅ | ✅ | Everyone can vote |
| Comment on proposals | ✅ | ✅ | Everyone can comment |
| Mark proposal as decided | ✅ | ❌ | Finalizes voting |
| Delete any proposal | ✅ | ❌ | Admin can clean up |
| Delete own proposal | ✅ | ✅ | Members can delete their own |
| Mark bookings | ✅ | ✅ | Everyone can mark bookings |
| View expense summary | ✅ | ✅ | Everyone can see expenses |
| Leave trip | ❌* | ✅ | *Admin must transfer first |

### Implementation Plan

#### Phase 1: Permission Helper Functions
Create `src/utils/permissions.ts`:
```typescript
export function isAdmin(trip: Trip, userId: string): boolean
export function canEditTrip(trip: Trip, userId: string): boolean
export function canManageMembers(trip: Trip, userId: string): boolean
export function canManageExpenses(trip: Trip, userId: string): boolean
export function canDeleteProposal(trip: Trip, proposal: Proposal, userId: string): boolean
export function canLeaveTrip(trip: Trip, userId: string): boolean
```

#### Phase 2: UI Updates

**Trip Settings Modal** (`TripSettingsModal.tsx`):
- Show admin-only sections conditionally
- Add "Manage Members" section for admins
- Member list with role badges and actions

**Member Management UI** (new component):
```
┌─────────────────────────────────────────┐
│ Members                          [Invite]│
├─────────────────────────────────────────┤
│ 👤 John Doe (you)           Admin    ⋮  │
│ 👤 Jane Smith               Member   ⋮  │
│ 👤 Bob Wilson               Admin    ⋮  │
└─────────────────────────────────────────┘

Menu (⋮) options:
- For members: "Make Admin", "Remove from Trip"
- For admins: "Remove Admin Role", "Remove from Trip"
- For self: "Leave Trip" (if member) or disabled (if only admin)
```

**Expense Tracker** (`ExpenseTracker.tsx`):
- Hide "Enable Expense Tracking" for non-admins
- Show "Ask an admin to enable" message instead
- Hide "Unlink" option for non-admins

**Proposal Actions**:
- Hide "Mark as Decided" for non-admins
- Show delete button only for own proposals OR if admin

#### Phase 3: Firestore Security Rules
Update `firestore.rules` to enforce permissions server-side:
```javascript
// Only admins can update trip settings
allow update: if isAdmin(resource, request.auth.uid)
              && onlyUpdatingAllowedFields();

// Only admins can delete trips
allow delete: if isAdmin(resource, request.auth.uid);

// Members can delete own proposals, admins can delete any
allow delete: if resource.data.createdBy == request.auth.uid
              || isAdmin(getTrip(resource.data.tripId), request.auth.uid);
```

#### Phase 4: Member Management Functions
```typescript
// In a new hook or service
async function promoteToAdmin(tripId: string, userId: string): Promise<void>
async function demoteToMember(tripId: string, userId: string): Promise<void>
async function removeMember(tripId: string, userId: string): Promise<void>
async function leaveTrip(tripId: string): Promise<void>
```

---

## Other Pending Features

### High Priority
| Feature | Complexity | Notes |
|---------|------------|-------|
| Admin/Member Roles | Medium | Detailed above |
| Leave Trip | Low | For non-admin members |
| Production Environment | Medium | tripbi-prod Firebase project |

### Medium Priority
| Feature | Complexity | Notes |
|---------|------------|-------|
| Push Notifications | Medium | Firebase Cloud Messaging |
| Trip Cover Image Upload | Low | Firebase Storage |
| Edit Profile | Low | Change display name |

### Low Priority / Future
| Feature | Complexity | Notes |
|---------|------------|-------|
| Custom Domain | Low | tripbi.app DNS setup |
| iOS App | High | Capacitor build |
| Offline Support | High | Service worker + IndexedDB |

---

## Files to Modify/Create

### New Files
| File | Purpose |
|------|---------|
| `src/utils/permissions.ts` | Permission helper functions |
| `src/components/MemberList.tsx` | Member list with role management |
| `src/components/modals/ManageMembersModal.tsx` | Full member management UI |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/modals/TripSettingsModal.tsx` | Add admin checks, member management |
| `src/features/splitbi/ExpenseTracker.tsx` | Admin-only enable/unlink |
| `src/features/proposals/ProposalCard.tsx` | Admin-only "Mark Decided" |
| `src/features/proposals/ProposalList.tsx` | Delete button visibility |
| `firestore.rules` | Server-side permission enforcement |

---

## Quick Start Tomorrow

### 1. Start Development
```bash
cd C:\Repos\personal_gsujit\github_jisujit_tektekgo\tripbi
npm run dev
```

### 2. First Task: Create Permission Utilities
Create `src/utils/permissions.ts` with helper functions.

### 3. Test with Current Data
- Trip creator should already have `role: 'admin'`
- Invited members should have `role: 'member'`
- Verify in Firebase Console → Firestore → trips → [tripId] → memberDetails

### 4. Implement UI Changes
Start with TripSettingsModal since it already has some admin-only features.

---

## Context for Claude

When continuing this session, you can reference:
- This document: `docs/CONTINUATION_JAN25.md`
- Types: `src/types/index.ts` (TripMember has role field)
- Current permissions: None enforced in UI yet
- Trip Settings: `src/components/modals/TripSettingsModal.tsx`
- Expense Tracker: `src/features/splitbi/ExpenseTracker.tsx`

Key insight: The data model is ready, we just need to:
1. Create permission utilities
2. Apply permission checks in UI components
3. Update Firestore security rules
4. Add member management UI

---

## Session Notes

- SplitBi uses email-based identification (not Firebase UIDs)
- Resend API key is configured for email invites
- Profile page redesigned with Pi-inspired layout
- Privacy/Terms pages are static HTML in /public
