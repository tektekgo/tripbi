# TripBi Features Reference

**Version:** 0.1.0
**Last Updated:** January 24, 2026

This document describes all implemented features in TripBi as of the current release.

---

## Table of Contents

1. [Trip Management](#1-trip-management)
2. [Proposals System](#2-proposals-system)
3. [Voting & Comments](#3-voting--comments)
4. [Personal Reactions](#4-personal-reactions)
5. [Booking Tracker](#5-booking-tracker)
6. [Timeline View](#6-timeline-view)
7. [Member Invites](#7-member-invites)
8. [Timezone Support](#8-timezone-support)
9. [Trip Status & Filtering](#9-trip-status--filtering)
10. [Trip Settings](#10-trip-settings)
11. [Timeline Export & Sharing](#11-timeline-export--sharing)
12. [Profile Page](#12-profile-page)
13. [Expense Tracking (SplitBi)](#13-expense-tracking-splitbi)

---

## 1. Trip Management

### Create a Trip
- **Name**: Give your trip a memorable name
- **Destination**: Where you're going
- **Description**: Optional details about the trip
- **Dates**: Start and end dates for the trip

### Trip Dashboard
- View all trips you're a member of
- See trip status (Planning, Active, Completed)
- Quick access to trip details
- Member avatars shown on trip cards

### Trip Detail View
Three-tab layout:
- **Proposals**: View and create proposals for the trip
- **Bookings**: Track who has booked what
- **Timeline**: See the finalized itinerary

---

## 2. Proposals System

### What is a Proposal?
A proposal is any suggestion for the trip - flights, hotels, activities, etc. Group members can propose ideas, and the group decides together.

### Proposal Categories

| Category | Icon | Use For |
|----------|------|---------|
| **Flights** | Plane | Flight options, airline preferences |
| **Hotels** | Building | Accommodation options |
| **Activities** | Sparkles | Tours, attractions, experiences |
| **Restaurants** | Fork & Knife | Dining reservations, food experiences |
| **Transport** | Car | Rental cars, trains, transfers |
| **Other** | Dots | Anything else |

### Proposal Status Flow

```
PROPOSED → DISCUSSING → DECIDED
```

- **Proposed**: Initial suggestion, awaiting group input
- **Discussing**: Active voting and comments happening
- **Decided**: Final decision made, appears on timeline

### Proposal Details
- **Title**: What you're proposing
- **Description**: Details about the option
- **Scheduled Date/Time**: When this would happen
- **Category-specific fields**: Links, prices, etc.

---

## 3. Voting & Comments

### Group Voting (Visible to Everyone)
Vote on proposals to help the group decide:

| Vote | Meaning |
|------|---------|
| **Yes** (thumbs up) | I'm in favor of this option |
| **No** (thumbs down) | I don't prefer this option |
| **Pass** | No strong opinion |

**Visibility**: Everyone in the group can see who voted and how they voted. This promotes transparency and helps reach group consensus.

### Voting Progress
- See vote counts (Yes/No) on proposal cards
- Percentage shows how many members have voted
- Full breakdown visible in proposal detail

### Comments
- Add comments to discuss proposals
- See who said what and when
- Thread-based discussion per proposal

---

## 4. Personal Reactions

### What Are Personal Reactions?

Personal reactions let you privately track your interest level in proposals **without influencing the group vote**.

| Reaction | Icon | Meaning |
|----------|------|---------|
| **Interested** | 👍 | I'd like to do this |
| **Maybe** | 🤔 | I'm on the fence |
| **Not for me** | 👎 | I'd rather skip this |

### Privacy

**Your reactions are completely private:**
- Only YOU can see your reactions
- Other group members CANNOT see what you selected
- Reactions do NOT affect the group vote counts
- Use this to remember your personal preferences

### Why Use Personal Reactions?

- **Track your thoughts**: Remember which proposals appeal to you
- **No social pressure**: Express true preferences without influencing others
- **Personal planning**: Know what you're excited about vs. what you'd skip

### How to Use
1. Look for the "Your interest" section at the bottom of each proposal card
2. Tap one of the three emoji buttons
3. Your selection is saved instantly
4. Tap again to remove your reaction

---

## 5. Booking Tracker

### Personal Bookings ("My Bookings" Tab)

Track your own booking status:
- See which decided activities you need to book
- Mark items as booked with confirmation details
- Upload proof (screenshot/PDF) if needed
- Add notes (e.g., "Booked for 2 people")

### Group Booking Status

See how the whole group is doing:
- View booking status for each decided activity
- See who has booked and who hasn't
- Confirmation numbers visible to organizers
- Helps ensure no one forgets to book

### Booking Form Fields
- **Confirmation Number**: Optional reference number
- **Proof Upload**: Screenshot or PDF of confirmation
- **Booked For**: How many people you booked for
- **Notes**: Any additional details

---

## 6. Timeline View

### Auto-Generated Itinerary

The timeline automatically shows all **decided** proposals in chronological order:
- Organized by day
- Shows scheduled times
- Color-coded by category
- Category icons for quick scanning

### Day-by-Day View

```
DAY 1 - Thu, Jan 30
  10:00 AM  ✈️ Flight to Paris
  3:00 PM   🏨 Hotel Check-in
  7:00 PM   🍽️ Welcome Dinner

DAY 2 - Fri, Jan 31
  9:00 AM   🎟️ Louvre Museum Tour
  1:00 PM   🍽️ Lunch at Café
```

### Timezone Display
- Times shown in destination timezone
- Optional home timezone display
- Clear timezone abbreviations (PST, CET, etc.)

---

## 7. Member Invites

### Two Ways to Invite

**Option A: Email Invite**
1. Enter the person's email address
2. They receive an email with a link
3. They sign in and automatically join the trip

**Option B: Shareable Link**
1. Click "Generate Link"
2. Copy the link
3. Share via any channel (WhatsApp, text, etc.)
4. Anyone with the link can join after signing in

### Invitation Status
- **Pending**: Invitation sent, not yet accepted
- **Accepted**: Person has joined the trip
- **Expired**: Link/invite no longer valid

---

## 8. Timezone Support

### Destination Timezone
- Set the destination timezone for your trip
- All times displayed in local destination time

### Dual Timezone Display
- See times in destination timezone
- Optionally show your home timezone too
- Helpful when coordinating across time zones

### Timezone Format
- Standard abbreviations (PST, EST, CET, JST, etc.)
- Clear offset indicators (+5:30, -8:00)
- Automatic daylight saving adjustments

---

## 9. Trip Status & Filtering

### Trip Status Badges

| Status | Color | Meaning |
|--------|-------|---------|
| **Planning** | Blue | Trip is being planned |
| **Active** | Green | Trip is currently happening |
| **Completed** | Gray | Trip has ended |

### Proposal Day Filter

Filter proposals by day:
- **All Days**: Show all proposals
- **Unscheduled**: Proposals without a date
- **Day 1, Day 2, etc.**: Show proposals for specific trip days

### Date Display
- Proposals show day of week + date (e.g., "Thu, Jan 30")
- Clear visual separation between days in timeline

---

## 10. Trip Settings

### Accessing Trip Settings
- Click the gear icon in the trip header
- Only visible to trip members

### Edit Trip Details
- **Name**: Change the trip name
- **Destination**: Update the destination
- **Description**: Add or modify description
- **Dates**: Adjust start and end dates
- **Status**: Change between Planning, Active, Completed

### Timezone Settings
- **Home Timezone**: Set your home timezone
- **Destination Timezone**: Set the destination timezone
- **Show Home Time**: Toggle to display home time alongside destination time
- **Time Difference**: Automatically calculated and displayed

### Delete Trip
- Only the trip creator (admin) can delete
- Requires confirmation
- Deletes all associated proposals, bookings, and invitations
- **Warning**: This action cannot be undone

---

## 11. Timeline Export & Sharing

### Export to PDF
1. Go to the Timeline tab in your trip
2. Click the "Export" button
3. Preview your itinerary
4. Click "Download PDF" to save

**PDF includes:**
- Trip name, destination, and dates
- Day-by-day schedule
- Times, categories, and descriptions
- Location details for each item

### Share Timeline Link
Create a public, read-only link anyone can view without signing in:

1. Click "Export" on the Timeline tab
2. Click "Generate Shareable Link"
3. Copy and share the link

**Shareable link features:**
- No sign-in required to view
- Read-only (viewers cannot edit)
- Shows trip name, destination, dates
- Displays the full timeline with all decided items

---

## 12. Profile Page

### Accessing Profile
- Click "Profile" button in the header
- Available when signed in

### Profile Information
- **Avatar**: Your Google profile picture
- **Name**: Your display name
- **Email**: Your email address (verified)
- **Sign-in Method**: Shows Google authentication

### Actions
- **My Trips**: Navigate to your trips list
- **Sign Out**: Log out of TripBi

**Note**: Profile is currently read-only. Editing profile details is not yet available.

---

## 13. Expense Tracking (SplitBi)

### What is SplitBi Integration?

TripBi integrates with **SplitBi** to provide expense tracking for your trip. Track shared expenses, see who owes whom, and keep everyone's balances clear.

### Enabling Expense Tracking

1. Go to your trip's detail page
2. Click the **Expenses** tab
3. Click **"Enable Expense Tracking"**
4. A SplitBi expense group is automatically created with all trip members

### After Enabling

**Optional: Notify Members**
- After enabling, you'll see a prompt: "Notify members via email?"
- Click **"Send Email Invites"** to email all trip members an invite to SplitBi
- Click **"Skip for now"** if members will access SplitBi on their own

**Adding Expenses**
- Click the prominent **"Add Expenses in SplitBi"** button
- This opens SplitBi where you can add and manage expenses
- Expenses are automatically synced back to TripBi

### Expense Summary View

The Expenses tab shows:

| Section | Description |
|---------|-------------|
| **Total Spent** | Sum of all group expenses |
| **Member Balances** | Each member's balance (positive = owed money, negative = owes money) |
| **Simplified Debts** | Who should pay whom to settle up |
| **Recent Expenses** | List of recent expense entries |

### Syncing New Members

If new members join your trip after expense tracking is enabled:
1. Click **"Sync New Members"** button
2. New trip members are automatically added to the SplitBi group
3. They can then add and view expenses

### How It Works

- Uses **email addresses** to identify members across apps
- Sign into SplitBi with the **same email** you use in TripBi
- Your expenses and balances will be linked automatically

### Privacy & Access

- Only trip members can view the expense summary
- Detailed expense management happens in SplitBi
- Each member has full access to the shared expense group

---

## Feature Summary Table

| Feature | Status | Privacy |
|---------|--------|---------|
| Trip Creation | ✅ | Group visible |
| Member Invites | ✅ | Group visible |
| Proposals | ✅ | Group visible |
| Group Voting | ✅ | **Group visible** - everyone sees votes |
| Comments | ✅ | Group visible |
| Personal Reactions | ✅ | **Private** - only you see |
| Booking Tracker | ✅ | Group visible |
| Timeline | ✅ | Group visible |
| Timezone Support | ✅ | Group setting |
| Day Filter | ✅ | Personal filter |
| Trip Status | ✅ | Group visible |
| Trip Settings | ✅ | Group visible (delete: admin only) |
| Timeline Export | ✅ | Personal download |
| Shareable Timeline | ✅ | **Public** - anyone with link |
| Profile Page | ✅ | **Private** - only you see |
| Expense Tracking | ✅ | Group visible (via SplitBi) |

---

## Coming Soon

- Push notifications
- Leave trip (for non-admin members)
- Member role management (admin/member permissions)
- Trip cover image upload
- Edit profile (change display name, photo)

---

## Feedback

Found a bug or have a feature request?
Report issues at: https://github.com/anthropics/claude-code/issues
