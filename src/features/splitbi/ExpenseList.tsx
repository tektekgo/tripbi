/**
 * ExpenseList - Shows recent expenses from SplitBi
 */

import type { ReactNode } from 'react'
import type { TripMember } from '@/types'
import type { ExpenseInfo } from '@/lib/splitbi'
import Avatar from '@/components/ui/Avatar'

interface ExpenseListProps {
  expenses: ExpenseInfo[]
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

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// Category icons
const categoryIcons: Record<string, ReactNode> = {
  food: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  transport: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  accommodation: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  activities: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  shopping: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  other: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

function getCategoryIcon(category: string): ReactNode {
  return categoryIcons[category.toLowerCase()] || categoryIcons.other
}

export default function ExpenseList({ expenses, isLoading, members, currency }: ExpenseListProps) {
  if (isLoading && expenses.length === 0) {
    return (
      <div className="card animate-pulse">
        <div className="h-5 bg-cream-300 rounded w-1/4 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cream-300 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-cream-300 rounded w-3/4 mb-2" />
                <div className="h-3 bg-cream-300 rounded w-1/2" />
              </div>
              <div className="h-5 bg-cream-300 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="card text-center py-6">
        <svg className="w-12 h-12 mx-auto text-primary-700/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-primary-700/60 text-sm">No expenses recorded yet</p>
        <p className="text-primary-700/40 text-xs mt-1">Add expenses in SplitBi to see them here</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-primary-700 mb-4">Recent Expenses</h3>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center gap-3 p-3 bg-cream-200 rounded-lg"
          >
            {/* Category icon */}
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              {getCategoryIcon(expense.category)}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-700 truncate">
                {expense.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-primary-700/60">
                <span className="flex items-center gap-1">
                  <Avatar name={getMemberName(expense.paidBy, members)} size="sm" />
                  {expense.paidByName || getMemberName(expense.paidBy, members)}
                </span>
                <span>•</span>
                <span>{formatDate(expense.expenseDate)}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-sm font-semibold text-primary-700">
              {formatCurrency(expense.amount, currency)}
            </div>
          </div>
        ))}
      </div>

      {expenses.length >= 10 && (
        <p className="mt-4 text-xs text-primary-700/50 text-center">
          View all expenses in SplitBi
        </p>
      )}
    </div>
  )
}
