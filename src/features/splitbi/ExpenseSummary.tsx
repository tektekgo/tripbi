/**
 * ExpenseSummary - Shows expense totals, member balances, and who owes who
 */

import type { TripMember } from '@/types'
import type { GroupSummary } from '@/lib/splitbi'
import Avatar from '@/components/ui/Avatar'

interface ExpenseSummaryProps {
  summary: GroupSummary | null
  isLoading: boolean
  members: TripMember[]
  currency: string
}

// Format currency amount
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Get member name from ID
function getMemberName(userId: string, members: TripMember[]): string {
  const member = members.find(m => m.userId === userId)
  return member?.displayName || member?.email?.split('@')[0] || 'Unknown'
}

export default function ExpenseSummary({ summary, isLoading, members, currency }: ExpenseSummaryProps) {
  if (isLoading && !summary) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-cream-300 rounded w-1/3 mb-4" />
        <div className="h-12 bg-cream-300 rounded w-1/2 mb-6" />
        <div className="space-y-3">
          <div className="h-4 bg-cream-300 rounded w-full" />
          <div className="h-4 bg-cream-300 rounded w-3/4" />
          <div className="h-4 bg-cream-300 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="card text-center py-6">
        <p className="text-primary-700/60">No expense data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total spent card */}
      <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-cream-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cream-100/80 text-sm">Total Trip Expenses</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(summary.totalSpent, currency)}
            </p>
            <p className="text-cream-100/60 text-sm mt-1">
              {summary.expenseCount} expense{summary.expenseCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-cream-100/20 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Member balances */}
      <div className="card">
        <h3 className="font-semibold text-primary-700 mb-4">Member Balances</h3>

        {summary.memberBalances.length === 0 ? (
          <p className="text-primary-700/60 text-sm">No balance data yet</p>
        ) : (
          <div className="space-y-3">
            {summary.memberBalances.map((member) => {
              const isPositive = member.balance > 0
              const isNegative = member.balance < 0
              const isSettled = member.balance === 0

              return (
                <div key={member.userId} className="flex items-center gap-3">
                  <Avatar name={getMemberName(member.userId, members)} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-700">
                      {getMemberName(member.userId, members)}
                    </p>
                    <p className="text-xs text-primary-700/60">
                      Paid {formatCurrency(member.totalPaid, currency)}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    isPositive ? 'text-success-600' :
                    isNegative ? 'text-error-600' :
                    'text-primary-700/60'
                  }`}>
                    {isSettled ? (
                      'Settled'
                    ) : isPositive ? (
                      `+${formatCurrency(member.balance, currency)}`
                    ) : (
                      formatCurrency(member.balance, currency)
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Who owes who (simplified debts) */}
      {summary.simplifiedDebts.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-primary-700 mb-4">Who Owes Who</h3>

          <div className="space-y-3">
            {summary.simplifiedDebts.map((debt, index) => (
              <div
                key={`${debt.from}-${debt.to}-${index}`}
                className="flex items-center gap-3 p-3 bg-cream-200 rounded-lg"
              >
                <Avatar name={getMemberName(debt.from, members)} size="sm" />
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-primary-700">
                    {getMemberName(debt.from, members)}
                  </span>
                  <svg className="w-4 h-4 text-primary-700/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="text-sm font-medium text-primary-700">
                    {getMemberName(debt.to, members)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-error-600">
                  {formatCurrency(debt.amount, currency)}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-primary-700/50 text-center">
            These are simplified settlements to minimize transactions
          </p>
        </div>
      )}

      {/* All settled message */}
      {summary.simplifiedDebts.length === 0 && summary.expenseCount > 0 && (
        <div className="card bg-success-50 border border-success-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-success-700">All Settled Up!</p>
              <p className="text-sm text-success-600/80">Everyone is even</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
