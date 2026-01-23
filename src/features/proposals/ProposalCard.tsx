import { useState } from 'react'
import { doc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { Proposal, Reaction } from '@/types'
import CategoryIcon, { getCategoryLabel } from '@/components/ui/CategoryIcon'
import StatusBadge from './StatusBadge'

interface ProposalCardProps {
  proposal: Proposal
  onClick: () => void
  memberCount: number
}

type ReactionType = Reaction['reaction']

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

const reactionConfig = {
  interested: { icon: '👍', label: 'Interested', color: 'text-success-600' },
  maybe: { icon: '🤔', label: 'Maybe', color: 'text-warning-600' },
  not_interested: { icon: '👎', label: 'Not for me', color: 'text-error-600' },
}

export default function ProposalCard({ proposal, onClick, memberCount }: ProposalCardProps) {
  const { user } = useAuth()
  const [reacting, setReacting] = useState(false)

  const voteSummary = getVoteSummary(proposal.votes)
  const totalVotes = proposal.votes.length
  const votingProgress = memberCount > 0 ? Math.round((totalVotes / memberCount) * 100) : 0

  // Get current user's reaction
  const myReaction = proposal.reactions?.find(r => r.userId === user?.uid)

  // Handle reaction toggle
  const handleReaction = async (e: React.MouseEvent, reaction: ReactionType) => {
    e.stopPropagation() // Prevent card click
    if (!user || reacting) return

    setReacting(true)
    try {
      const proposalRef = doc(db, 'proposals', proposal.id)

      // Remove existing reaction if any
      if (myReaction) {
        await updateDoc(proposalRef, {
          reactions: arrayRemove(myReaction)
        })
      }

      // Add new reaction if different from current
      if (!myReaction || myReaction.reaction !== reaction) {
        const newReaction: Reaction = {
          userId: user.uid,
          reaction,
          timestamp: Timestamp.now(),
        }
        await updateDoc(proposalRef, {
          reactions: arrayUnion(newReaction)
        })
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
    } finally {
      setReacting(false)
    }
  }

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

          {/* Footer: votes, comments, and personal reaction */}
          <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-cream-400 dark:border-surface-dark-border">
            <div className="flex items-center gap-4">
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

            {/* Personal Reaction (only visible to current user) */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {(['interested', 'maybe', 'not_interested'] as ReactionType[]).map((reaction) => {
                const config = reactionConfig[reaction]
                const isActive = myReaction?.reaction === reaction
                return (
                  <button
                    key={reaction}
                    onClick={(e) => handleReaction(e, reaction)}
                    disabled={reacting}
                    className={`p-1.5 rounded-full transition-all text-sm
                      ${isActive
                        ? `${config.color} bg-cream-300 dark:bg-surface-dark-muted scale-110`
                        : 'text-primary-700/40 hover:text-primary-700/70 hover:bg-cream-200 dark:hover:bg-surface-dark-muted'
                      }
                      ${reacting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={config.label}
                  >
                    <span className="text-base">{config.icon}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
