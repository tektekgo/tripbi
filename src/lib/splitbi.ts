/**
 * SplitBi API Client for TripBi
 *
 * Provides methods to interact with the SplitBi REST API
 * for expense tracking integration.
 */

// =============================================================================
// Configuration
// =============================================================================

const SPLITBI_API_BASE_URL =
  import.meta.env.VITE_SPLITBI_API_URL || 'https://us-central1-splitbi-dev.cloudfunctions.net/api'
const SPLITBI_API_KEY = import.meta.env.VITE_SPLITBI_API_KEY || ''

// =============================================================================
// Types (matching SplitBi API types)
// =============================================================================

export interface SplitBiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export interface MemberBalanceInfo {
  userId: string
  email: string
  displayName: string
  balance: number // Positive = owed money, Negative = owes money
  totalPaid: number
  totalOwed: number
}

export interface SimplifiedDebtInfo {
  from: string // User ID who owes
  to: string // User ID who is owed
  amount: number
}

export interface ExpenseSplitInfo {
  userId: string
  amount: number
}

export interface ExpenseInfo {
  id: string
  description: string
  amount: number
  currency: string
  category: string
  paidBy: string
  paidByName: string
  expenseDate: string
  splitMethod: string
  splits: ExpenseSplitInfo[]
  createdAt: string
}

export interface GroupSummary {
  group: {
    id: string
    name: string
    currency: string
    memberCount: number
    externalId?: string
    externalSource?: string
  }
  totalSpent: number
  expenseCount: number
  memberBalances: MemberBalanceInfo[]
  simplifiedDebts: SimplifiedDebtInfo[]
  lastUpdated: string
}

export interface MemberInfo {
  email: string
  displayName?: string
}

export interface CreateGroupRequest {
  name: string
  currency: string
  creatorEmail: string
  members: MemberInfo[]
  externalId?: string
  externalSource?: string
}

export interface CreateGroupResult {
  groupId: string
  groupName: string
  currency: string
  memberCount: number
  createdAt: string
}

// =============================================================================
// API Client
// =============================================================================

class SplitBiApiError extends Error {
  code: string
  details?: Record<string, unknown>

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'SplitBiApiError'
    this.code = code
    this.details = details
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!SPLITBI_API_KEY) {
    throw new SplitBiApiError(
      'CONFIG_ERROR',
      'SplitBi API key not configured. Set VITE_SPLITBI_API_KEY environment variable.'
    )
  }

  const url = `${SPLITBI_API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SPLITBI_API_KEY}`,
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!data.success) {
    throw new SplitBiApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'An unknown error occurred',
      data.error?.details
    )
  }

  return data.data as T
}

// =============================================================================
// Public API Methods
// =============================================================================

export const splitbiApi = {
  /**
   * Check if SplitBi integration is configured
   */
  isConfigured(): boolean {
    return !!SPLITBI_API_KEY
  },

  /**
   * Create a new expense group linked to a TripBi trip
   */
  async createGroup(request: CreateGroupRequest): Promise<CreateGroupResult> {
    return apiRequest<CreateGroupResult>('/v1/groups', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        externalSource: 'tripbi',
      }),
    })
  },

  /**
   * Get group summary including balances and debts
   */
  async getGroupSummary(groupId: string): Promise<GroupSummary> {
    return apiRequest<GroupSummary>(`/v1/groups/${groupId}/summary`)
  },

  /**
   * Get expenses for a group (paginated)
   */
  async getGroupExpenses(
    groupId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<{ expenses: ExpenseInfo[]; hasMore: boolean; nextCursor?: string }> {
    const params = new URLSearchParams()
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.cursor) params.set('cursor', options.cursor)

    const queryString = params.toString()
    const endpoint = `/v1/groups/${groupId}/expenses${queryString ? `?${queryString}` : ''}`

    const result = await apiRequest<{
      expenses: ExpenseInfo[]
      pagination: { hasMore: boolean; nextCursor?: string; total?: number }
    }>(endpoint)

    return {
      expenses: result.expenses,
      hasMore: result.pagination.hasMore,
      nextCursor: result.pagination.nextCursor,
    }
  },

  /**
   * Add members to an existing group
   */
  async addMembers(
    groupId: string,
    members: MemberInfo[]
  ): Promise<{ addedCount: number; skippedCount: number; newMemberCount: number }> {
    return apiRequest(`/v1/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ members }),
    })
  },

  /**
   * Check if a group exists
   */
  async checkGroupExists(groupId: string): Promise<boolean> {
    const result = await apiRequest<{ exists: boolean }>(`/v1/groups/${groupId}/exists`)
    return result.exists
  },

  /**
   * Find a group by external ID (trip ID)
   */
  async findGroupByTripId(tripId: string): Promise<{ found: boolean; groupId?: string; groupName?: string }> {
    return apiRequest(`/v1/groups/by-external/${tripId}?source=tripbi`)
  },

  /**
   * Delete/archive a group
   */
  async deleteGroup(groupId: string): Promise<{ archived: boolean; groupId: string }> {
    return apiRequest(`/v1/groups/${groupId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Send invite emails to group members
   */
  async sendInvites(
    groupId: string,
    inviterName: string,
    inviterEmail: string,
    memberEmails?: string[]
  ): Promise<{ sentCount: number; skippedCount: number; failedCount: number }> {
    return apiRequest(`/v1/groups/${groupId}/invite`, {
      method: 'POST',
      body: JSON.stringify({
        inviterName,
        inviterEmail,
        memberEmails,
      }),
    })
  },
}

export default splitbiApi
