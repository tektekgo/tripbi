import type { Vote } from '@/types'

interface VoteButtonsProps {
  currentUserVote: Vote['vote'] | null
  onVote: (vote: Vote['vote']) => void
  disabled?: boolean
  loading?: boolean
}

export default function VoteButtons({ currentUserVote, onVote, disabled, loading }: VoteButtonsProps) {
  const voteOptions: { value: Vote['vote']; label: string; icon: React.ReactNode; activeClass: string }[] = [
    {
      value: 'yes',
      label: 'Yes',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ),
      activeClass: 'bg-success-100 border-success-500 text-success-700 dark:bg-success-900 dark:text-success-300',
    },
    {
      value: 'no',
      label: 'No',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      ),
      activeClass: 'bg-error-100 border-error-500 text-error-700 dark:bg-error-900 dark:text-error-300',
    },
    {
      value: 'abstain',
      label: 'Pass',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
      activeClass: 'bg-cream-300 border-cream-500 text-cream-700 dark:bg-surface-dark-muted dark:text-cream-400',
    },
  ]

  return (
    <div className="flex gap-2">
      {voteOptions.map((option) => {
        const isActive = currentUserVote === option.value
        return (
          <button
            key={option.value}
            onClick={() => onVote(option.value)}
            disabled={disabled || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium text-sm transition-all
              ${isActive
                ? option.activeClass
                : 'border-cream-400 text-primary-700/70 hover:border-cream-500 hover:bg-cream-200 dark:border-surface-dark-border dark:text-cream-400 dark:hover:bg-surface-dark-muted'
              }
              ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {loading && isActive ? (
              <span className="spinner-sm"></span>
            ) : (
              option.icon
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
