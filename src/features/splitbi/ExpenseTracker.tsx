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
  const [syncSuccess, setSyncSuccess] = useState(false)

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

  // No linked group - show enable option with impactful design
  if (!trip.splitbiGroupId) {
    return (
      <div className="space-y-6">
        {/* Hero card */}
        <div className="card bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-cream-100 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-cream-100/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Split Trip Expenses</h2>
              <p className="text-cream-100/80 text-sm leading-relaxed">
                Track shared expenses, see who paid what, and settle up easily.
                No more spreadsheets or awkward money conversations.
              </p>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-primary-700 mb-1">Track Expenses</h3>
            <p className="text-xs text-primary-700/60">Log who paid for what during the trip</p>
          </div>

          <div className="card p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-warning-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h3 className="font-semibold text-primary-700 mb-1">See Balances</h3>
            <p className="text-xs text-primary-700/60">Know exactly who owes whom</p>
          </div>

          <div className="card p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-primary-700 mb-1">Settle Up</h3>
            <p className="text-xs text-primary-700/60">Simplified payments at trip end</p>
          </div>
        </div>

        {/* Enable form */}
        <div className="card p-6">
          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-error-600 hover:text-error-800 font-medium">
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <label htmlFor="currency" className="text-sm font-medium text-primary-700">
                Currency:
              </label>
              <select
                id="currency"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="input py-2.5 px-4 text-sm min-w-[180px]"
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
              className="btn-primary px-8 py-3 text-base font-semibold"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Setting up...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Enable Expense Tracking
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-primary-700/50 text-center">
            All trip members will be added to the expense group automatically
          </p>
        </div>
      </div>
    )
  }

  // Has linked group - show expense data
  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
          <button onClick={clearError} className="text-error-600 hover:text-error-800 font-medium text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Success banner for sync */}
      {syncSuccess && (
        <div className="p-4 bg-success-50 border border-success-200 rounded-xl text-success-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">Members synced successfully!</span>
          </div>
          <button onClick={() => setSyncSuccess(false)} className="text-success-600 hover:text-success-800 font-medium text-sm">
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
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            onClick={() => {
              if (!showExpenses) {
                fetchExpenses(10)
              }
              setShowExpenses(!showExpenses)
            }}
            className="btn-outline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {showExpenses ? 'Hide Recent Expenses' : 'Show Recent Expenses'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await syncMembers(trip)
                setSyncSuccess(true)
                setTimeout(() => setSyncSuccess(false), 3000)
              }}
              disabled={isLoading}
              className="btn-outline text-sm"
              title="Add any new trip members to the expense group"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Sync New Members
            </button>

            <button
              onClick={() => setShowUnlinkConfirm(true)}
              className="text-sm text-error-600 hover:text-error-700 hover:bg-error-50 px-3 py-2 rounded-full transition-colors"
            >
              Unlink
            </button>
          </div>
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
      <div className="card p-4 bg-cream-100 border border-cream-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-700">Add expenses in SplitBi</p>
              <p className="text-xs text-primary-700/60">Full expense management with receipts and categories</p>
            </div>
          </div>
          <a
            href={`https://splitbi-dev.web.app/groups/${trip.splitbiGroupId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-sm"
          >
            Open SplitBi
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Unlink confirmation modal */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-cream-100 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-error-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary-700 text-center mb-2">
              Unlink Expense Tracking?
            </h3>
            <p className="text-sm text-primary-700/70 text-center mb-6">
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
                className="flex-1 py-2.5 px-4 rounded-full font-medium text-cream-100 bg-error-600 hover:bg-error-700 transition-colors disabled:opacity-50"
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
