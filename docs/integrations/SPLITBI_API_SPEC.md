# SplitBi API Specification for TripBi Integration

> **Version:** 2.0
> **Date:** 2026-01-24
> **Status:** ✅ Implemented and Deployed

---

## Overview

TripBi integrates with SplitBi's REST API to provide expense tracking for trips. The integration uses **email addresses** as the common identifier between the two Firebase projects.

**Base URL:** `https://us-central1-splitbi-dev.cloudfunctions.net/api`

---

## Authentication

### Method: API Key (Bearer Token)

All requests from TripBi include an API key in the Authorization header:

```
Authorization: Bearer TRIPBI_API_KEY_DEV
```

### TripBi Configuration

Environment variables in TripBi:
```
VITE_SPLITBI_API_URL=https://us-central1-splitbi-dev.cloudfunctions.net/api
VITE_SPLITBI_API_KEY=<api-key>
```

---

## Key Design Decision: Email-Based Identification

Since TripBi and SplitBi are separate Firebase projects, user IDs (UIDs) differ between them. The integration uses **email addresses** as the common identifier:

1. TripBi sends member emails when creating/syncing groups
2. SplitBi looks up users by email
3. If no user exists, SplitBi creates a **placeholder user** with `authType: 'simulated'`
4. When users sign into SplitBi with the same email, they automatically have access

---

## Endpoints

### 1. Create Expense Group

Creates a new expense group in SplitBi linked to a TripBi trip.

#### Request

```
POST /v1/groups
Content-Type: application/json
Authorization: Bearer <API_KEY>
```

#### Request Body

```json
{
  "name": "Paris Trip 2025 Expenses",
  "currency": "USD",
  "creatorEmail": "john@example.com",
  "members": [
    { "email": "john@example.com", "displayName": "John Doe" },
    { "email": "jane@example.com", "displayName": "Jane Smith" }
  ],
  "externalId": "tripbi_trip_abc123",
  "externalSource": "tripbi"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name for the expense group |
| `currency` | string | Yes | Currency code (USD, EUR, etc.) |
| `creatorEmail` | string | Yes | Email of the group creator |
| `members` | array | Yes | Array of member objects |
| `members[].email` | string | Yes | Member's email address |
| `members[].displayName` | string | No | Member's display name |
| `externalId` | string | No | TripBi trip ID for linking |
| `externalSource` | string | No | Always "tripbi" |

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "groupId": "xyz789",
    "groupName": "Paris Trip 2025 Expenses",
    "currency": "USD",
    "memberCount": 2,
    "createdAt": "2026-01-24T10:30:00Z"
  }
}
```

---

### 2. Get Group Summary

Retrieves expense summary including balances and simplified debts.

#### Request

```
GET /v1/groups/{groupId}/summary
Authorization: Bearer <API_KEY>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "group": {
      "id": "xyz789",
      "name": "Paris Trip 2025 Expenses",
      "currency": "USD",
      "memberCount": 2,
      "externalId": "tripbi_trip_abc123",
      "externalSource": "tripbi"
    },
    "totalSpent": 1250.50,
    "expenseCount": 15,
    "memberBalances": [
      {
        "userId": "user123",
        "email": "john@example.com",
        "displayName": "John Doe",
        "balance": 125.25,
        "totalPaid": 500.00,
        "totalOwed": 374.75
      },
      {
        "userId": "user456",
        "email": "jane@example.com",
        "displayName": "Jane Smith",
        "balance": -125.25,
        "totalPaid": 250.00,
        "totalOwed": 375.25
      }
    ],
    "simplifiedDebts": [
      {
        "from": "user456",
        "to": "user123",
        "amount": 125.25
      }
    ],
    "lastUpdated": "2026-01-24T14:30:00Z"
  }
}
```

| Field | Description |
|-------|-------------|
| `totalSpent` | Sum of all expenses in the group |
| `memberBalances[].balance` | Positive = owed money, Negative = owes money |
| `simplifiedDebts` | Optimized list of who pays whom |

---

### 3. Get Group Expenses

Retrieves recent expenses (paginated).

#### Request

```
GET /v1/groups/{groupId}/expenses?limit=20&cursor=<cursor>
Authorization: Bearer <API_KEY>
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Max items to return (1-100) |
| `cursor` | string | - | Pagination cursor |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "exp123",
        "description": "Dinner at Le Petit",
        "amount": 120.50,
        "currency": "USD",
        "category": "Food",
        "paidBy": "user123",
        "paidByName": "John Doe",
        "expenseDate": "2026-01-20",
        "splitMethod": "equal",
        "splits": [
          { "userId": "user123", "amount": 60.25 },
          { "userId": "user456", "amount": 60.25 }
        ],
        "createdAt": "2026-01-20T19:30:00Z"
      }
    ],
    "pagination": {
      "hasMore": true,
      "nextCursor": "exp122"
    }
  }
}
```

---

### 4. Add Members to Group

Adds new members to an existing group (for late joiners).

#### Request

```
POST /v1/groups/{groupId}/members
Content-Type: application/json
Authorization: Bearer <API_KEY>
```

#### Request Body

```json
{
  "members": [
    { "email": "newmember@example.com", "displayName": "New Member" }
  ]
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "addedCount": 1,
    "skippedCount": 0,
    "newMemberCount": 3
  }
}
```

---

### 5. Send Invite Emails

Sends email invitations to group members via Resend.

#### Request

```
POST /v1/groups/{groupId}/invite
Content-Type: application/json
Authorization: Bearer <API_KEY>
```

#### Request Body

```json
{
  "inviterName": "John Doe",
  "inviterEmail": "john@example.com",
  "memberEmails": ["jane@example.com"]  // Optional - sends to all if omitted
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sentCount": 1,
    "skippedCount": 0,
    "failedCount": 0
  }
}
```

**Note:** Requires `RESEND_API_KEY` to be configured in SplitBi. If not configured, returns an error.

---

### 6. Check Group Exists

Verifies if a group exists.

#### Request

```
GET /v1/groups/{groupId}/exists
Authorization: Bearer <API_KEY>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "exists": true,
    "groupId": "xyz789",
    "groupName": "Paris Trip 2025 Expenses"
  }
}
```

---

### 7. Find Group by External ID

Finds a group by its TripBi trip ID.

#### Request

```
GET /v1/groups/by-external/{tripId}?source=tripbi
Authorization: Bearer <API_KEY>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "found": true,
    "groupId": "xyz789",
    "groupName": "Paris Trip 2025 Expenses"
  }
}
```

---

### 8. Delete Group (Archive)

Soft-deletes (archives) a group.

#### Request

```
DELETE /v1/groups/{groupId}
Authorization: Bearer <API_KEY>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "archived": true,
    "groupId": "xyz789"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `MISSING_FIELDS` | 400 | Required fields not provided |
| `INVALID_EMAIL` | 400 | Email format is invalid |
| `INVALID_CURRENCY` | 400 | Currency code not supported |
| `GROUP_NOT_FOUND` | 404 | Group does not exist |
| `INTERNAL_ERROR` | 500 | Server error |

---

## TripBi Client Implementation

### Files

| File | Purpose |
|------|---------|
| `src/lib/splitbi.ts` | API client with typed methods |
| `src/hooks/useSplitBi.ts` | React hook for SplitBi operations |

### Usage Example

```typescript
import { useSplitBi } from '../hooks/useSplitBi'

function ExpenseTracker({ trip }) {
  const {
    isConfigured,
    isLoading,
    error,
    summary,
    createExpenseGroup,
    fetchSummary,
    syncMembers,
    sendInviteEmails,
  } = useSplitBi(trip)

  const handleEnable = async () => {
    const groupId = await createExpenseGroup(trip, 'USD')
    if (groupId) {
      // Group created successfully
    }
  }

  // ...
}
```

---

## Implementation Checklist

- [x] Generate API key for TripBi (`TRIPBI_API_KEY_DEV`)
- [x] Create API key validation middleware
- [x] Implement `POST /v1/groups` endpoint
- [x] Implement `GET /v1/groups/{id}/summary` endpoint
- [x] Implement `GET /v1/groups/{id}/expenses` endpoint
- [x] Implement `POST /v1/groups/{id}/members` endpoint
- [x] Implement `POST /v1/groups/{id}/invite` endpoint
- [x] Implement `GET /v1/groups/{id}/exists` endpoint
- [x] Implement `DELETE /v1/groups/{id}` endpoint
- [x] Implement `GET /v1/groups/by-external/{id}` endpoint
- [x] Add `externalIntegration` field to group schema
- [x] Email-based user identification
- [x] TripBi client library (`src/lib/splitbi.ts`)
- [x] TripBi React hook (`src/hooks/useSplitBi.ts`)
- [x] ExpenseTracker UI component
- [ ] Configure `RESEND_API_KEY` for email invites (optional)
- [ ] Production API key setup

---

## Remaining Setup

### Email Invites (Optional)

To enable email invites, set the Resend API key in SplitBi:

```bash
cd SplitBi
npx firebase functions:secrets:set RESEND_API_KEY
```

Without this, the "Send Email Invites" button will show an error, but users can still access SplitBi by signing in with the same email.
