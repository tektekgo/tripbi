import type { Proposal } from '@/types'
import CategoryIcon, { getCategoryLabel } from '@/components/ui/CategoryIcon'
import StatusBadge from './StatusBadge'
import { Timestamp } from 'firebase/firestore'

interface ProposalCardProps {
  proposal: Proposal
  onClick: () => void
  memberCount: number
}

function formatDate(timestamp: Timestamp | undefined): string {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getVoteSummary(votes: Proposal['votes']): { yes: number; no: number; abstain: number } {
  return votes.reduce(
    (acc, vote) => {
      acc[vote.vote]++
      return acc
    },
    { yes: 0, no: 0, abstain: 0 }
  )
}

export default function ProposalCard({ proposal, onClick, memberCount }: ProposalCardProps) {
  const voteSummary = getVoteSummary(proposal.votes)
  const totalVotes = proposal.votes.length
  const votingProgress = memberCount > 0 ? Math.round((totalVotes / memberCount) * 100) : 0

  return (
    <div
      onClick={onClick}
      className="card-interactive cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <CategoryIcon category={proposal.category} size="lg" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={proposal.status} size="sm" />
            <span className="text-xs text-primary-700/60 dark:text-cream-400">
              {getCategoryLabel(proposal.category)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-primary-700 dark:text-cream-100 line-clamp-1">
            {proposal.title}
          </h3>

          {/* Description */}
          {proposal.description && (
            <p className="text-sm text-primary-700/70 dark:text-cream-400 mt-1 line-clamp-2">
              {proposal.description}
            </p>
          )}

          {/* Scheduled date */}
          {proposal.scheduledDate && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-primary-700/60 dark:text-cream-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(proposal.scheduledDate)}</span>
              {proposal.scheduledTime && <span>at {proposal.scheduledTime}</span>}
            </div>
          )}

          {/* Footer: votes and comments */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-cream-400 dark:border-surface-dark-border">
            {/* Votes */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-success-600 text-sm font-medium">{voteSummary.yes}</span>
                <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-error-600 text-sm font-medium">{voteSummary.no}</span>
                <svg className="w-4 h-4 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span className="text-xs text-primary-700/50">
                {votingProgress}% voted
              </span>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1 text-primary-700/60 dark:text-cream-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">{proposal.comments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
