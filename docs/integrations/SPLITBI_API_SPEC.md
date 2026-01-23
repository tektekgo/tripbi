# Splitbi API Specification for TripBi Integration

> **Version:** 1.0
> **Date:** 2026-01-18
> **Status:** Ready for Implementation

---

## Overview

This document specifies the API endpoints that need to be built in **Splitbi** to support integration with **TripBi**. TripBi will call these endpoints via Firebase Cloud Functions to create expense groups and fetch summaries.

---

## Authentication

### Method: API Key

All requests from TripBi will include an API key in the Authorization header.

```
Authorization: Bearer SPLITBI_API_KEY
```

### Setup Required in Splitbi

1. Generate a static API key for TripBi
2. Store the key securely (Firebase environment or Secret Manager)
3. Create middleware to validate the key on incoming requests
4. Reject requests with invalid/missing keys with `401 Unauthorized`

### Example Middleware (Cloud Functions)

```typescript
const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const apiKey = authHeader.split('Bearer ')[1];
  const validKey = process.env.TRIPBI_API_KEY;

  if (apiKey !== validKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
};
```

---

## Endpoints

### 1. Create Expense Group

Creates a new expense group in Splitbi linked to a TripBi trip.

#### Request

```
POST /api/tripbi/groups
Content-Type: application/json
Authorization: Bearer SPLITBI_API_KEY
```

#### Request Body

```json
{
  "name": "Paris Trip 2025 - Expenses",
  "tripId": "abc123",
  "tripName": "Paris Trip 2025",
  "createdBy": {
    "odEmail": "user@example.com",
    "displayName": "John Doe"
  },
  "members": [
    {
      "email": "user@example.com",
      "displayName": "John Doe"
    },
    {
      "email": "jane@example.com",
      "displayName": "Jane Smith"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name for the expense group |
| `tripId` | string | Yes | TripBi trip ID (for reference/linking) |
| `tripName` | string | Yes | Human-readable trip name |
| `createdBy.email` | string | Yes | Email of the trip creator |
| `createdBy.displayName` | string | No | Display name of creator |
| `members` | array | Yes | Array of member objects |
| `members[].email` | string | Yes | Member's email address |
| `members[].displayName` | string | No | Member's display name |

#### Success Response

```
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "success": true,
  "data": {
    "groupId": "splitbi_group_xyz789",
    "groupName": "Paris Trip 2025 - Expenses",
    "createdAt": "2025-06-15T10:30:00Z",
    "memberCount": 2,
    "inviteLink": "https://splitbi.app/join/xyz789"
  }
}
```

#### Error Responses

```json
// 400 Bad Request - Missing required fields
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: name"
  }
}

// 401 Unauthorized - Invalid API key
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key"
  }
}

// 409 Conflict - Group already exists for this trip
{
  "success": false,
  "error": {
    "code": "GROUP_EXISTS",
    "message": "A group already exists for this trip",
    "existingGroupId": "splitbi_group_abc123"
  }
}

// 500 Internal Server Error
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to create group"
  }
}
```

#### Implementation Notes

1. Check if a group already exists for the given `tripId`
2. Create the group in Splitbi's Firestore
3. Add all members to the group (create placeholder accounts if they don't exist)
4. Store `tripId` in the group document for back-reference
5. Return the Splitbi group ID

---

### 2. Get Group Summary

Retrieves expense summary for a Splitbi group.

#### Request

```
GET /api/tripbi/groups/{groupId}/summary
Authorization: Bearer SPLITBI_API_KEY
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `groupId` | string | Splitbi group ID |

#### Success Response

```
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "data": {
    "groupId": "splitbi_group_xyz789",
    "groupName": "Paris Trip 2025 - Expenses",
    "tripId": "abc123",
    "currency": "USD",
    "totalExpenses": 1250.50,
    "expenseCount": 15,
    "memberBalances": [
      {
        "email": "john@example.com",
        "displayName": "John Doe",
        "balance": 125.25,
        "paid": 500.00,
        "owes": 374.75,
        "isSettled": false
      },
      {
        "email": "jane@example.com",
        "displayName": "Jane Smith",
        "balance": -125.25,
        "paid": 250.00,
        "owes": 375.25,
        "isSettled": false
      }
    ],
    "lastExpenseDate": "2025-06-20T14:30:00Z",
    "lastUpdated": "2025-06-20T14:30:00Z"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `totalExpenses` | number | Sum of all expenses in the group |
| `expenseCount` | number | Number of expense entries |
| `memberBalances[].balance` | number | Positive = owed money, Negative = owes money |
| `memberBalances[].paid` | number | Total amount this member has paid |
| `memberBalances[].owes` | number | Total amount this member owes |
| `memberBalances[].isSettled` | boolean | Whether this member has settled up |

#### Error Responses

```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "GROUP_NOT_FOUND",
    "message": "Group not found"
  }
}
```

---

### 3. Add Member to Group

Adds a new member to an existing Splitbi group (for late joiners to a trip).

#### Request

```
POST /api/tripbi/groups/{groupId}/members
Content-Type: application/json
Authorization: Bearer SPLITBI_API_KEY
```

#### Request Body

```json
{
  "email": "newmember@example.com",
  "displayName": "New Member"
}
```

#### Success Response

```
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "success": true,
  "data": {
    "added": true,
    "email": "newmember@example.com",
    "inviteLink": "https://splitbi.app/join/xyz789"
  }
}
```

#### Error Responses

```json
// 409 Conflict - Member already in group
{
  "success": false,
  "error": {
    "code": "MEMBER_EXISTS",
    "message": "Member is already in this group"
  }
}
```

---

### 4. Check Group Exists

Verifies if a Splitbi group exists (for error handling in TripBi).

#### Request

```
GET /api/tripbi/groups/{groupId}/exists
Authorization: Bearer SPLITBI_API_KEY
```

#### Success Response

```
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "data": {
    "exists": true,
    "groupId": "splitbi_group_xyz789",
    "groupName": "Paris Trip 2025 - Expenses"
  }
}
```

---

### 5. Delete Group (Optional)

Deletes a Splitbi group when a TripBi trip is deleted.

#### Request

```
DELETE /api/tripbi/groups/{groupId}
Authorization: Bearer SPLITBI_API_KEY
```

#### Success Response

```
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "groupId": "splitbi_group_xyz789"
  }
}
```

#### Notes

- Consider soft-delete (mark as archived) instead of hard delete
- Users may want to keep expense history even if trip is deleted

---

## CORS Configuration

Splitbi needs to allow requests from TripBi Cloud Functions. Since these are server-to-server calls, CORS may not be needed, but if using HTTP functions:

```typescript
const corsOptions = {
  origin: [
    'https://tripbi.app',
    'https://tripbi-dev.web.app',
    'http://localhost:5173' // for development
  ],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## Data Storage in Splitbi

### Suggested Schema Addition

Add to Splitbi group documents:

```typescript
interface SplitbiGroup {
  // ... existing fields ...

  // TripBi integration fields
  tripbiIntegration?: {
    tripId: string;          // TripBi trip ID
    tripName: string;        // Trip name at time of linking
    linkedAt: Timestamp;     // When integration was enabled
    linkedBy: string;        // Email of user who linked
  };
}
```

### Index Requirements

Create a Firestore index for querying by tripId:

```
Collection: groups
Field: tripbiIntegration.tripId (Ascending)
```

---

## Rate Limiting (Recommended)

Implement basic rate limiting to prevent abuse:

| Endpoint | Limit |
|----------|-------|
| POST /groups | 10 requests/minute per API key |
| GET /groups/{id}/summary | 60 requests/minute per API key |
| Others | 30 requests/minute per API key |

---

## Testing

### Test API Key

Create a separate test API key for development:

```
TRIPBI_API_KEY_DEV=test_key_for_development
TRIPBI_API_KEY_PROD=secure_production_key
```

### Test Endpoints

Before TripBi integration, test with curl:

```bash
# Create group
curl -X POST https://your-splitbi-functions-url/api/tripbi/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "name": "Test Trip Expenses",
    "tripId": "test123",
    "tripName": "Test Trip",
    "createdBy": {"email": "test@example.com"},
    "members": [{"email": "test@example.com"}]
  }'

# Get summary
curl -X GET https://your-splitbi-functions-url/api/tripbi/groups/GROUP_ID/summary \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Implementation Checklist for Splitbi

- [ ] Generate API key for TripBi
- [ ] Create API key validation middleware
- [ ] Implement `POST /api/tripbi/groups` endpoint
- [ ] Implement `GET /api/tripbi/groups/{id}/summary` endpoint
- [ ] Implement `POST /api/tripbi/groups/{id}/members` endpoint
- [ ] Implement `GET /api/tripbi/groups/{id}/exists` endpoint
- [ ] (Optional) Implement `DELETE /api/tripbi/groups/{id}` endpoint
- [ ] Add `tripbiIntegration` field to group schema
- [ ] Create Firestore index for tripId queries
- [ ] Test endpoints with curl
- [ ] Deploy to Splitbi production
- [ ] Share API key securely with TripBi

---

## Questions?

If anything is unclear or needs adjustment, update this spec before implementation to keep both projects aligned.
