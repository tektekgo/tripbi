import { useState } from 'react'
import { doc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { Proposal, Reaction, TripTimezoneSettings } from '@/types'
import CategoryIcon, { getCategoryLabel, getCategoryColor } from '@/components/ui/CategoryIcon'
import StatusBadge from './StatusBadge'
import { TimeDisplayCompact } from '@/components/ui/TimeDisplay'

interface ProposalCardProps {
  proposal: Proposal
  onClick: () => void
  memberCount: number
  timezoneSettings?: TripTimezoneSettings
}

type ReactionType = Reaction['reaction']

function formatDate(timestamp: Timestamp | undefined): string {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' })
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${dayOfWeek}, ${monthDay}`
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
  interested: { icon: '👍', label: 'Interested', bgActive: 'bg-success-100 dark:bg-success-900/30', borderActive: 'border-success-300 dark:border-success-700' },
  maybe: { icon: '🤔', label: 'Maybe', bgActive: 'bg-warning-100 dark:bg-warning-900/30', borderActive: 'border-warning-300 dark:border-warning-700' },
  not_interested: { icon: '👎', label: 'Not for me', bgActive: 'bg-error-100 dark:bg-error-900/30', borderActive: 'border-error-300 dark:border-error-700' },
}

export default function ProposalCard({ proposal, onClick, memberCount, timezoneSettings }: ProposalCardProps) {
  const { user } = useAuth()
  const [reacting, setReacting] = useState(false)

  const voteSummary = getVoteSummary(proposal.votes)
  const totalVotes = proposal.votes.length
  const votingProgress = memberCount > 0 ? Math.round((totalVotes / memberCount) * 100) : 0
  const categoryColor = getCategoryColor(proposal.category)

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
      className="group bg-white dark:bg-surface-dark-elevated rounded-2xl shadow-sm hover:shadow-md
        border border-cream-300 dark:border-surface-dark-border
        transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Category color bar */}
      <div className={`h-1 ${categoryColor.replace('text-', 'bg-')}`} />

      <div className="p-5">
        {/* Top row: Category badge + Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CategoryIcon category={proposal.category} size="sm" />
            <span className={`text-xs font-medium ${categoryColor}`}>
              {getCategoryLabel(proposal.category)}
            </span>
          </div>
          <StatusBadge status={proposal.status} size="sm" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-primary-800 dark:text-cream-100 leading-tight mb-2
          group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {proposal.title}
        </h3>

        {/* Description */}
        {proposal.description && (
          <p className="text-sm text-primary-600/80 dark:text-cream-400 line-clamp-2 mb-3">
            {proposal.description}
          </p>
        )}

        {/* Scheduled date/time - cleaner pill style */}
        {proposal.scheduledDate && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream-100 dark:bg-surface-dark-muted
            rounded-full text-sm text-primary-700 dark:text-cream-300 mb-4">
            <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{formatDate(proposal.scheduledDate)}</span>
            {proposal.scheduledTime && (
              <>
                <span className="text-primary-400">•</span>
                <TimeDisplayCompact
                  date={proposal.scheduledDate}
                  time={proposal.scheduledTime}
                  timezoneSettings={timezoneSettings}
                />
              </>
            )}
          </div>
        )}

        {/* Stats row: Votes + Comments */}
        <div className="flex items-center gap-4 text-sm">
          {/* Votes - compact pills */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-1 bg-success-50 dark:bg-success-900/20 rounded-full">
              <svg className="w-3.5 h-3.5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-success-700 dark:text-success-400">{voteSummary.yes}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-error-50 dark:bg-error-900/20 rounded-full">
              <svg className="w-3.5 h-3.5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-error-700 dark:text-error-400">{voteSummary.no}</span>
            </div>
            <span className="text-xs text-primary-500/60 dark:text-cream-500">
              {votingProgress}%
            </span>
          </div>

          {/* Comments */}
          <div className="flex items-center gap-1.5 text-primary-600/70 dark:text-cream-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{proposal.comments.length}</span>
          </div>
        </div>
      </div>

      {/* Personal Reaction Section - visually separated */}
      <div
        className="px-5 py-3 bg-cream-50/80 dark:bg-surface-dark-muted/50 border-t border-cream-200 dark:border-surface-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          {/* Label with lock icon and clear privacy message */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-cream-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Your interest</span>
            </div>
            <span className="text-[10px] text-primary-400 dark:text-cream-600 pl-5">Private - only you can see this</span>
          </div>

          {/* Reaction buttons */}
          <div className="flex items-center gap-2">
            {(['interested', 'maybe', 'not_interested'] as ReactionType[]).map((reaction) => {
              const config = reactionConfig[reaction]
              const isActive = myReaction?.reaction === reaction
              return (
                <button
                  key={reaction}
                  onClick={(e) => handleReaction(e, reaction)}
                  disabled={reacting}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border-2 transition-all
                    ${isActive
                      ? `${config.bgActive} ${config.borderActive} scale-110 shadow-sm`
                      : 'bg-white dark:bg-surface-dark border-cream-200 dark:border-surface-dark-border hover:border-cream-400 dark:hover:border-cream-600 hover:scale-105'
                    }
                    ${reacting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={config.label}
                >
                  <span className="text-lg">{config.icon}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
