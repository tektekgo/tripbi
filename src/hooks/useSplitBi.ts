/**
 * SplitBi Integration Hook
 *
 * Provides expense tracking functionality for a trip.
 * Handles creating groups, fetching summaries, and syncing members.
 */

import { useState, useCallback, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import splitbiApi, { GroupSummary, ExpenseInfo } from '../lib/splitbi'
import { Trip } from '../types'

interface UseSplitBiResult {
  // State
  isConfigured: boolean
  isLoading: boolean
  error: string | null
  summary: GroupSummary | null
  expenses: ExpenseInfo[]

  // Actions
  createExpenseGroup: (trip: Trip, currency?: string) => Promise<string | null>
  fetchSummary: () => Promise<void>
  fetchExpenses: (limit?: number) => Promise<void>
  syncMembers: (trip: Trip) => Promise<void>
  unlinkExpenseGroup: () => Promise<void>
  clearError: () => void
}

export function useSplitBi(trip: Trip | null): UseSplitBiResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<GroupSummary | null>(null)
  const [expenses, setExpenses] = useState<ExpenseInfo[]>([])

  const isConfigured = splitbiApi.isConfigured()
  const groupId = trip?.splitbiGroupId

  // Clear error
  const clearError = useCallback(() => setError(null), [])

  // Fetch summary when trip has a linked group
  const fetchSummary = useCallback(async () => {
    if (!groupId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await splitbiApi.getGroupSummary(groupId)
      setSummary(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch expense summary'
      setError(message)
      console.error('SplitBi fetchSummary error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  // Fetch expenses
  const fetchExpenses = useCallback(
    async (limit = 20) => {
      if (!groupId) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await splitbiApi.getGroupExpenses(groupId, { limit })
        setExpenses(data.expenses)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch expenses'
        setError(message)
        console.error('SplitBi fetchExpenses error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [groupId]
  )

  // Create expense group for trip
  const createExpenseGroup = useCallback(
    async (tripToLink: Trip, currency = 'USD'): Promise<string | null> => {
      if (!isConfigured) {
        setError('SplitBi integration is not configured')
        return null
      }

      if (tripToLink.splitbiGroupId) {
        setError('Trip already has an expense group linked')
        return tripToLink.splitbiGroupId
      }

      setIsLoading(true)
      setError(null)

      try {
        // Get creator email from memberDetails
        const creator = tripToLink.memberDetails.find(m => m.userId === tripToLink.createdBy)
        if (!creator?.email) {
          setError('Creator email not found')
          return null
        }

        // Build members array with emails and display names
        const members = tripToLink.memberDetails.map(m => ({
          email: m.email,
          displayName: m.displayName || undefined,
        }))

        const result = await splitbiApi.createGroup({
          name: `${tripToLink.name} Expenses`,
          currency,
          creatorEmail: creator.email,
          members,
          externalId: tripToLink.id,
          externalSource: 'tripbi',
        })

        // Update trip with the new group ID
        const tripRef = doc(db, 'trips', tripToLink.id)
        await updateDoc(tripRef, {
          splitbiGroupId: result.groupId,
        })

        return result.groupId
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create expense group'
        setError(message)
        console.error('SplitBi createExpenseGroup error:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [isConfigured]
  )

  // Sync members from trip to SplitBi group
  const syncMembers = useCallback(
    async (tripToSync: Trip) => {
      if (!groupId) {
        setError('No expense group linked to this trip')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Build members array with emails and display names
        const members = tripToSync.memberDetails.map(m => ({
          email: m.email,
          displayName: m.displayName || undefined,
        }))

        await splitbiApi.addMembers(groupId, members)
        // Refresh summary to show updated member count
        await fetchSummary()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to sync members'
        setError(message)
        console.error('SplitBi syncMembers error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [groupId, fetchSummary]
  )

  // Unlink expense group from trip
  const unlinkExpenseGroup = useCallback(async () => {
    if (!trip) return

    setIsLoading(true)
    setError(null)

    try {
      // Just remove the link, don't delete the SplitBi group
      const tripRef = doc(db, 'trips', trip.id)
      await updateDoc(tripRef, {
        splitbiGroupId: null,
      })

      setSummary(null)
      setExpenses([])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unlink expense group'
      setError(message)
      console.error('SplitBi unlinkExpenseGroup error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [trip])

  // Auto-fetch summary when group ID is available
  useEffect(() => {
    if (groupId && isConfigured) {
      fetchSummary()
    } else {
      setSummary(null)
      setExpenses([])
    }
  }, [groupId, isConfigured, fetchSummary])

  return {
    isConfigured,
    isLoading,
    error,
    summary,
    expenses,
    createExpenseGroup,
    fetchSummary,
    fetchExpenses,
    syncMembers,
    unlinkExpenseGroup,
    clearError,
  }
}

export default useSplitBi
