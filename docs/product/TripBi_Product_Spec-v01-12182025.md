# TripBi Product Specification
**Version:** 1.0  
**Date:** December 18, 2024  
**Status:** Ready for Implementation

---

## Executive Summary

**TripBi** is a group trip planning and coordination platform that eliminates travel planning chaos by providing a single source of truth for proposals, decisions, bookings, and timelines - with seamless expense tracking via Splitbi integration.

**Core Value Proposition:**  
"Turn scattered group travel chaos into a single source of truth - where decisions are visible, nothing gets lost, and everyone stays aligned."

---

## Product Overview

### What Problem Does TripBi Solve?

**Before TripBi:**
- Group text chains with 50+ unread messages
- "Wait, did we decide on Friday or Saturday?"
- Lost booking confirmations
- No idea who's responsible for what
- Expenses tracked in separate app/spreadsheet
- Chaos across WhatsApp, email, Slack, texts

**After TripBi:**
- Single place to see: what's proposed, what's being discussed, what's locked in
- Timeline shows final plan clearly
- Everyone knows their responsibilities
- Booking status visible to entire group
- Optional: expenses auto-track in Splitbi

### Target Users

**Primary:** Groups of friends/family (4-15 people) planning trips together

**Use Cases:**
- Friend groups planning annual vacation
- Family reunion coordination
- Bachelor/bachelorette party planning
- Work team offsite organization
- Multi-family travel coordination

---

## Core Features (MVP)

### 1. Trip Management

**Trip Creation:**
- Name, destination, rough dates
- Trip creator becomes admin
- Unique workspace created

**Member Invitation:**
- Invite via email or shareable link
- Invited users create account or sign in
- Member list visible to all participants

**Permissions:**
- Admin: Can edit trip details, remove members
- Members: Can propose, vote, comment, update booking status

---

### 2. Proposal & Decision System

**The Core Workflow:**
```
PROPOSED → DISCUSSING → DECIDED
```

**Three States Explained:**

**PROPOSED**
- Someone suggests an idea
- Visible to all group members
- Awaiting group input

**DISCUSSING**
- Active voting/comments happening
- Group is evaluating the option
- Status visible: vote counts, comments

**DECIDED**
- Voting closed, decision made
- Item moves to timeline
- Booking tracking begins

**Proposal Categories:**

1. **Dates & Duration**
   - Propose date ranges
   - Vote on options
   - Lock in final dates

2. **Logistics**
   - Flights (links, times, confirmation numbers)
   - Hotels/Accommodation
   - Rental Cars
   - Transportation (trains, buses, etc.)

3. **Activities & Events**
   - Restaurants
   - Attractions
   - Tours (Viator, GetYourGuide, etc.)
   - Free time blocks

4. **Shared Responsibilities**
   - Who's bringing what
   - Who's cooking when
   - Task assignments

---

### 3. Voting & Polling System

**Built-in Poll Types:**
- **Simple vote:** Thumbs up/down
- **Multiple choice:** Select from options
- **Ranking:** Order preferences
- **Custom polls:** User-defined questions

**Voting Features:**
- Real-time vote count updates
- See who voted what (transparency)
- Voting deadline (optional)
- Auto-close when threshold met

**Comments:**
- Thread-based discussions per proposal
- @mentions to notify specific members
- Edit/delete own comments

---

### 4. Booking Tracker

**Individual Booking Flow:**

1. Activity moves to "Decided" status
2. Each person sees "Mark as booked" button
3. User confirms booking with:
   - Confirmation number (optional)
   - Upload proof - screenshot/PDF (optional)
   - Notes (e.g., "Booked for 2 people")

**Two Dashboards:**

**Personal View: "My Bookings"**
```
✅ CONFIRMED BOOKINGS
   🎟️ Louvre Museum Tour
      📅 June 15, 2pm
      🎫 Viator #ABC123
      💰 €45 (paid)

⏳ PENDING BOOKINGS
   ⚠️ Eiffel Tower Tickets
      Book by May 1
      [Book now link]

📊 Summary: 2 confirmed, 1 pending
```

**Group View: "Trip Status Dashboard"**
```
🎟️ Louvre Museum Tour - June 15, 2pm
   ✅ Sarah (Confirmed - Viator #ABC123)
   ✅ Mike (Confirmed - uploaded screenshot)
   ✅ John (Confirmed)
   ⏳ Emma (Not yet booked)
   ⏳ Lisa (Not yet booked)
   
   Status: 3/5 booked
   [Send reminder to pending members]
```

**Booking Status Features:**
- Real-time status updates
- Reminder notifications for unbooked items
- Booking deadline tracker
- Confirmation document upload/storage

---

### 5. Timeline View

**Auto-Generated Timeline:**
- Shows only "Decided" items
- Chronological order
- Day-by-day breakdown
- Color-coded by category

**Timeline Display:**
```
📅 SATURDAY, JUNE 15
   09:00 - Hotel Checkout
   10:30 - ✈️ Flight to Paris (Air France #1234)
   14:00 - 🏨 Hotel Check-in (Le Marais)
   16:00 - 🎟️ Louvre Museum Tour
   19:00 - 🍽️ Dinner at Le Comptoir

📅 SUNDAY, JUNE 16
   10:00 - 🚶 Walking Tour - Montmartre
   13:00 - 🍽️ Lunch (Sarah's pick)
   19:00 - 🚤 Seine River Cruise
```

**Export Options:**
- PDF download (printable)
- Shareable link (read-only)
- Copy to clipboard (text format)

---

### 6. Splitbi Integration

**Optional Connection:**
- Trip creator toggles: "Track expenses in Splitbi?"
- If enabled:
  - Creates linked Splitbi group (same trip name + "-expenses")
  - Invites all trip members to Splitbi
  - Displays expense summary in TripBi

**Integration Features:**

**In TripBi:**
- View total group expenses
- See individual balances
- Link to open Splitbi app
- "Add expense" quick action

**In Splitbi:**
- Linked trip context visible
- Expenses tagged with trip name
- Members can add expenses from either app

**Technical Flow:**
1. User enables Splitbi in TripBi
2. TripBi calls Splitbi API: `POST /api/groups/create`
3. Splitbi returns group ID
4. TripBi stores `splitbiGroupId` in trip document
5. TripBi displays expense summary via: `GET /api/groups/{id}/summary`

---

## User Flows

### Primary Flow: Creating & Planning Trip

1. **User creates trip**
   - Enters: name, destination, rough dates
   - Becomes trip admin

2. **Invite friends**
   - Enter emails or share link
   - Friends receive invitation

3. **Friends join**
   - Create account or sign in
   - Access trip workspace

4. **Propose ideas**
   - Someone adds flight option
   - Others add hotel suggestions
   - Activities proposed

5. **Vote & discuss**
   - Members vote on proposals
   - Comment with preferences
   - Proposals move to "Discussing"

6. **Finalize decisions**
   - Admin (or auto-threshold) closes votes
   - Winning options move to "Decided"
   - Timeline auto-updates

7. **Book & track**
   - Members book their portions
   - Mark as booked in app
   - Upload confirmations

8. **Review timeline**
   - Final plan visible to all
   - Export for offline reference

9. **Track expenses (optional)**
   - Enable Splitbi integration
   - Log shared costs
   - Settle up after trip

---

## Technical Architecture

### Tech Stack

**Frontend:**
- React 19.2.0
- TypeScript 5.8.2
- Vite 6.2.8
- Tailwind CSS (styling)

**Backend:**
- Firebase Firestore (NoSQL database)
- Firebase Authentication
- Firebase Cloud Functions
- Firebase Storage (file uploads)
- Firebase Hosting

**Mobile:**
- Capacitor (wrap PWA for app stores)
- Deploy to Google Play & Apple App Store

**Integrations:**
- Resend (email service via mail.tripbi.app)
- Splitbi API (custom Cloud Functions)

---

### Architecture Decisions

**Separate Firebase Project:**
- TripBi has its own Firebase project
- Independent from Splitbi
- Allows standalone operation

**Standalone Authentication:**
- Users sign up for TripBi independently
- Optional linking to Splitbi account
- Auth flow: email/password + Google Sign-in

**Loosely Coupled Integration:**
- TripBi ↔ Splitbi communicate via API
- No shared database
- Clean separation of concerns

---

### Data Model (Conceptual)

**Collections:**

```
trips/
  {tripId}/
    name: string
    destination: string
    startDate: timestamp
    endDate: timestamp
    createdBy: userId
    createdAt: timestamp
    members: userId[]
    splitbiGroupId: string (optional)
    status: 'planning' | 'active' | 'completed'

proposals/
  {proposalId}/
    tripId: string
    category: 'flights' | 'hotels' | 'activities' | 'tasks'
    status: 'proposed' | 'discussing' | 'decided'
    title: string
    description: string
    details: object (varies by category)
    createdBy: userId
    createdAt: timestamp
    votingDeadline: timestamp (optional)
    votes: [
      { userId, vote: 'yes' | 'no', timestamp }
    ]
    comments: [
      { userId, text, timestamp }
    ]

bookings/
  {bookingId}/
    tripId: string
    proposalId: string (links to decided activity)
    userId: string
    status: 'confirmed' | 'pending'
    confirmationNumber: string (optional)
    proofUrl: string (optional - Firebase Storage link)
    notes: string
    bookingDate: timestamp
    bookedForCount: number (e.g., "booked for 2 people")

timeline/
  {tripId}/
    items: [
      {
        proposalId: string
        date: timestamp
        time: string
        title: string
        category: string
        details: object
      }
    ]
    generatedAt: timestamp
```

---

## Phase 2 Features (Post-MVP)

**Not included in initial launch:**

### Email & Automation
- Forward booking confirmations to auto-populate
- OCR scanning of screenshots for confirmation extraction
- Smart deadline reminders
- Price tracking alerts

### Communication
- Real-time push notifications
- In-app chat/commenting
- WhatsApp/Slack sync (read-only view)

### Export & Integration
- Calendar export (iCal format)
- Email confirmation parsing
- Two-way Splitbi sync (see trip context in Splitbi)

### Mobile Enhancements
- Offline mode
- Native push notifications
- Home screen widgets
- Camera integration for quick uploads

---

## Success Metrics

**MVP Success Indicators:**

**Adoption:**
- 100+ trips created in first 3 months
- Average 6+ members per trip
- 50%+ trips enable Splitbi integration

**Engagement:**
- Average 10+ proposals per trip
- 80%+ members vote on proposals
- 60%+ members mark bookings as confirmed

**Retention:**
- 40%+ users create second trip
- 30%+ users return within 6 months

**Quality:**
- <5% booking tracking confusion
- <10% support requests per active trip
- 4+ star average rating in app stores

---

## Competitive Landscape

**Direct Competitors:**
- TripIt (itinerary consolidation, no group planning)
- Wanderlog (maps + itinerary, limited group features)
- Troupe (group travel planning, no expense tracking)

**Indirect Competitors:**
- Google Docs/Sheets (unstructured planning)
- WhatsApp/Slack (communication only)
- Splitwise (expenses only, no trip planning)

**TripBi Differentiators:**
1. **Proposal → Decision workflow** (unique structure)
2. **Booking accountability tracking** (who booked what)
3. **Native Splitbi integration** (one-click expense setup)
4. **Timeline auto-generation** (no manual entry)
5. **Product family** (Splitbi users get familiar experience)

---

## Brand & Positioning

### Brand Identity

**Name:** TripBi  
**Domain:** tripbi.app  
**Tagline:** "Plan together. Travel together."

**Brand Family:**
```
Splitbi  →  Split expenses fairly
TripBi   →  Plan trips together

Together: The Bi Suite for group travel
```

**Visual Identity:**
- Clean, modern, mobile-first
- Emphasize collaboration (group imagery)
- Travel-inspired but not cliché
- Consistent with Splitbi design language

### Positioning Statement

"TripBi is a group trip planning platform for friends and families who want to coordinate travel without the chaos. Unlike itinerary apps or communication tools, TripBi provides structured decision-making, booking accountability, and optional expense tracking - all in one place."

**For:** Groups planning trips together  
**Who:** Are tired of scattered discussions and lost confirmations  
**TripBi is:** A coordination platform  
**That:** Tracks proposals, facilitates decisions, and monitors booking status  
**Unlike:** TripIt or Google Docs  
**TripBi:** Provides structure, transparency, and integrated expense tracking

---

## Go-to-Market Strategy

### Launch Approach

**Phase 1: Friends & Family (Months 1-2)**
- Soft launch to existing Splitbi users
- Invite-only beta
- Focus on feedback and iteration

**Phase 2: Public Beta (Months 3-4)**
- Open signup
- App store submission
- Basic marketing (Product Hunt, travel subreddits)

**Phase 3: Growth (Months 5-6)**
- Splitbi cross-promotion
- Content marketing (travel planning tips)
- Partnership exploration (travel bloggers)

### Pricing Strategy (Future)

**MVP:** Free for all users (build adoption)

**Future Tiers:**
- **Free:** 3 active trips, basic features
- **Pro ($5/month):** Unlimited trips, priority support, advanced exports
- **Team ($15/month):** 10+ members, admin controls, branded exports

---

## Development Timeline

**Estimated: 7-11 weeks full-time**

### Weeks 1-2: Foundation
- Firebase project setup
- Authentication system
- Basic UI scaffolding
- Database schema implementation

### Weeks 3-4: Core Features
- Trip creation & invitations
- Proposal management (CRUD)
- Basic timeline view

### Weeks 5-6: Collaboration
- Voting system
- Comments/discussions
- Status transitions (proposed → discussing → decided)

### Weeks 7-8: Booking & Integration
- Booking tracker (personal + group views)
- Splitbi API bridge
- File upload for confirmations

### Weeks 9-10: Polish & Mobile
- Timeline export (PDF/shareable link)
- Mobile app packaging (Capacitor)
- Testing & bug fixes

### Week 11: Launch Prep
- App store submissions
- Landing page
- Documentation

---

## Risk Assessment

### Technical Risks

**Risk:** Real-time collaboration complexity  
**Mitigation:** Firebase handles real-time listeners well; leverage existing patterns from Splitbi

**Risk:** Splitbi API integration bugs  
**Mitigation:** You control both sides; can iterate quickly; build API incrementally

**Risk:** Mobile performance issues  
**Mitigation:** Start web-first; optimize before mobile packaging; use Capacitor best practices

### Product Risks

**Risk:** Users don't understand 3-state workflow  
**Mitigation:** Clear onboarding; tooltips; example trip template

**Risk:** Booking tracking feels too manual  
**Mitigation:** Make optional fields truly optional; emphasize group visibility benefit; add email parsing in Phase 2

**Risk:** Too complex compared to "just use WhatsApp"  
**Mitigation:** Focus on pain points (lost messages, no timeline); show value quickly; keep UI simple

### Market Risks

**Risk:** Splitbi has no brand recognition yet  
**Mitigation:** TripBi works standalone; integration is optional feature; focus on core value prop

**Risk:** Low adoption in competitive space  
**Mitigation:** Free MVP; viral mechanics (invite friends); solve real pain points; integrate with Splitbi for expansion

---

## Next Steps

### Immediate Actions
1. ✅ Register tripbi.app domain
2. Purchase tripbi.com (redirect)
3. Secure social handles (@tripbi)

### Before Building
1. Complete prerequisites (see Prerequisites_Checklist.md)
2. Set up Firebase project
3. Create GitHub repository
4. Initialize Cursor workspace

### When Ready to Build
1. Start implementation chat
2. Begin with data model & Firestore schema
3. Set up project structure (React + TypeScript + Vite)
4. Build features iteratively (follow development timeline)

---

## Appendix: Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Product Scope** | Group trip planning (not TripIt clone) | More defensible, unique value prop |
| **Architecture** | Separate Firebase project | Allows standalone operation, cleaner separation |
| **Authentication** | Standalone with linking | TripBi works independently, optional Splitbi connection |
| **Platform** | Web-first, mobile via Capacitor | Faster iteration, known tech stack |
| **Development Tool** | Cursor Pro + Claude architecture | AI-assisted speed, maintain control |
| **Name** | TripBi.app | Product family with Splitbi, unique brand |
| **MVP Timeline** | 7-11 weeks | Realistic for known stack, focused scope |
| **Booking Tracker** | Manual confirmation + optional upload | Works with all booking platforms, feasible for MVP |
| **Email Parsing** | Phase 2 | High complexity, not essential for MVP validation |

---

## Contact & Support

**For implementation questions:**
- Reference this specification in Claude chat
- Use conversation search to find this Incubator discussion
- Upload this document to new implementation chat

**Project Status:** Ready for Implementation  
**Last Updated:** December 18, 2024  
**Version:** 1.0
