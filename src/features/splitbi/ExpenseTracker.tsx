/**
 * ExpenseTracker - Main expense tracking component for a trip
 *
 * Shows expense summary, balances, who owes who, and recent expenses.
 * Handles enabling/disabling SplitBi integration for a trip.
 */

import { useState } from 'react'
import type { Trip, TripMember } from '@/types'
import { useSplitBi } from '@/hooks/useSplitBi'
import EmptyState from '@/components/ui/EmptyState'
import ExpenseSummary from './ExpenseSummary'
import ExpenseList from './ExpenseList'

interface ExpenseTrackerProps {
  trip: Trip
  members: TripMember[]
  onGroupLinked?: (groupId: string) => void
}

// Currency options for expense group creation
const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
]

export default function ExpenseTracker({ trip, members, onGroupLinked }: ExpenseTrackerProps) {
  const {
    isConfigured,
    isLoading,
    error,
    summary,
    expenses,
    createExpenseGroup,
    fetchExpenses,
    syncMembers,
    unlinkExpenseGroup,
    clearError,
  } = useSplitBi(trip)

  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [showExpenses, setShowExpenses] = useState(false)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)

  // Not configured state
  if (!isConfigured) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="Expense tracking not configured"
        description="SplitBi integration is not set up for this environment."
      />
    )
  }

  // No linked group - show enable option
  if (!trip.splitbiGroupId) {
    return (
      <div className="card text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-primary-700 mb-2">
          Track Trip Expenses
        </h3>
        <p className="text-primary-700/70 mb-6 max-w-md mx-auto">
          Enable expense tracking to split costs with your group. See who paid what,
          who owes who, and settle up easily.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">
            {error}
            <button onClick={clearError} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="currency" className="text-sm text-primary-700/70">
              Currency:
            </label>
            <select
              id="currency"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="input py-2 px-3 text-sm"
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={async () => {
              const groupId = await createExpenseGroup(trip, selectedCurrency)
              if (groupId && onGroupLinked) {
                onGroupLinked(groupId)
              }
            }}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Enable Expense Tracking
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-xs text-primary-700/50">
          Powered by SplitBi
        </p>
      </div>
    )
  }

  // Has linked group - show expense data
  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-error-600 hover:text-error-800 underline text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary section */}
      <ExpenseSummary
        summary={summary}
        isLoading={isLoading}
        members={members}
        currency={summary?.group.currency || 'USD'}
      />

      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (!showExpenses) {
              fetchExpenses(10)
            }
            setShowExpenses(!showExpenses)
          }}
          className="btn-outline btn-sm"
        >
          {showExpenses ? 'Hide' : 'Show'} Recent Expenses
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => syncMembers(trip)}
            disabled={isLoading}
            className="btn-outline btn-sm"
            title="Sync trip members to expense group"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Members
          </button>

          <button
            onClick={() => setShowUnlinkConfirm(true)}
            className="text-sm text-error-600 hover:text-error-700 hover:underline"
          >
            Unlink
          </button>
        </div>
      </div>

      {/* Expenses list (expandable) */}
      {showExpenses && (
        <ExpenseList
          expenses={expenses}
          isLoading={isLoading}
          members={members}
          currency={summary?.group.currency || 'USD'}
        />
      )}

      {/* Link to SplitBi */}
      <div className="text-center">
        <a
          href={`https://splitbi-dev.web.app/groups/${trip.splitbiGroupId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-500 hover:text-primary-600 hover:underline inline-flex items-center gap-1"
        >
          Open in SplitBi
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Unlink confirmation modal */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-cream-100 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-primary-700 mb-2">
              Unlink Expense Tracking?
            </h3>
            <p className="text-sm text-primary-700/70 mb-4">
              This will remove the connection to SplitBi. Your expense data will still exist
              in SplitBi, but won't be shown here.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnlinkConfirm(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await unlinkExpenseGroup()
                  setShowUnlinkConfirm(false)
                }}
                disabled={isLoading}
                className="btn-primary flex-1 !bg-error-600 hover:!bg-error-700"
              >
                {isLoading ? 'Unlinking...' : 'Unlink'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
