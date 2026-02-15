# TripBi - Project State

> **Last Updated:** February 14, 2026
> This is a living document. Update it at the end of each session.

---

## Current State

- **Version:** 0.1.0 (build 43)
- **Live at:** https://tripbi-dev.web.app
- **Branch:** main
- **All MVP features complete** — see CLAUDE.md for full list

### Latest Session (Feb 14, 2026)

**What was done:**
- Streamlined build/deploy scripts in `package.json`
- `npm run deploy` now deploys to tripbi-dev (default)
- `npm run build` targets tripbi-prod (production)
- Added `npm run check` (TypeScript + ESLint), `deploy:rules`, `deploy:functions`
- Rewrote `docs/guides/DAILY_WORKFLOW.md` as a focused build & deploy reference
- Updated CLAUDE.md commands section to match

### Previous Session (Jan 24, 2026)

**What was done:**
- SplitBi integration fully functional (email-based user ID matching)
- Email invites via Cloud Functions + Resend
- Profile page redesigned with Pi-inspired layout
- Privacy Policy & Terms of Service pages
- Dependabot vulnerabilities fixed (tar package)
- Firestore indexes created, RESEND_API_KEY configured

---

## What's Next

### Priority 1: Admin/Member Role System

The data model already supports roles (`role: 'admin' | 'member'` in TripMember), but nothing is enforced yet. Trip creator is set as admin, invited members as member — roles are stored but ignored.

**Implementation plan:**

1. **Permission helpers** — Create `src/utils/permissions.ts`
   ```typescript
   isAdmin(trip, userId)
   canEditTrip(trip, userId)
   canManageMembers(trip, userId)
   canDeleteProposal(trip, proposal, userId)
   canLeaveTrip(trip, userId)
   ```

2. **UI enforcement** — Apply checks in existing components
   - `TripSettingsModal.tsx` — admin-only edit/delete
   - `ExpenseTracker.tsx` — admin-only enable/unlink SplitBi
   - `ProposalCard.tsx` — admin-only "Mark as Decided"
   - Proposal delete: own proposals for members, any for admins

3. **Member management UI** — New component in TripSettingsModal
   - List members with role badges
   - Admin actions: promote, demote, remove member
   - Member actions: leave trip

4. **Firestore security rules** — Server-side enforcement
   - Only admins can update trip settings
   - Only admins can delete trips
   - Members can delete own proposals, admins can delete any

**Permission matrix:**

| Action | Admin | Member |
|--------|-------|--------|
| Edit/delete trip | Yes | No |
| Enable/unlink expenses | Yes | No |
| Invite members | Yes | No |
| Manage member roles | Yes | No |
| Remove members | Yes | No |
| Mark proposal as decided | Yes | No |
| Delete any proposal | Yes | No |
| Create proposals | Yes | Yes |
| Vote/comment | Yes | Yes |
| Delete own proposal | Yes | Yes |
| Mark bookings | Yes | Yes |
| Leave trip | No* | Yes |

*Admin must transfer admin role before leaving.

**Files to create:**
- `src/utils/permissions.ts`
- `src/components/MemberList.tsx` or similar

**Files to modify:**
- `src/components/modals/TripSettingsModal.tsx`
- `src/features/splitbi/ExpenseTracker.tsx`
- `src/features/proposals/ProposalCard.tsx`
- `src/features/proposals/ProposalList.tsx`
- `firestore.rules`

### Priority 2: Production Environment

- Create `tripbi-prod` Firebase project with real credentials
- Fill in `.env.production` with real keys
- Configure custom domain (tripbi.app)
- Set up GitHub Secrets for CI/CD prod deploys

### Priority 3: Remaining Features

| Feature | Complexity | Notes |
|---------|------------|-------|
| Leave trip | Low | Depends on admin/member roles |
| Push notifications | Medium | Firebase Cloud Messaging |
| Trip cover image upload | Low | Firebase Storage already set up |
| Edit profile | Low | Change display name, photo |

---

## Quick Start

```bash
cd C:\Repos\personal_gsujit\github_jisujit_tektekgo\tripbi
npm run dev                   # Local dev server
npm run check                 # Verify before deploying
npm run deploy                # Deploy to tripbi-dev.web.app
```

**Key files for next task (admin roles):**
- Types: `src/types/index.ts` — TripMember already has `role` field
- Trip settings: `src/components/modals/TripSettingsModal.tsx`
- Expense tracker: `src/features/splitbi/ExpenseTracker.tsx`
- Security rules: `firestore.rules`
