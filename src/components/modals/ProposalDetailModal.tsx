import { useState, useCallback } from 'react'
import Modal from '@/components/ui/Modal'
import { useAuth } from '@/contexts/AuthContext'
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Proposal, Vote, Comment, TripMember } from '@/types'
import CategoryIcon, { getCategoryLabel } from '@/components/ui/CategoryIcon'
import { StatusBadge, CommentList } from '@/features/proposals'
import { VoteButtons, VoteResults } from '@/features/voting'

interface ProposalDetailModalProps {
  isOpen: boolean
  onClose: () => void
  proposal: Proposal | null
  tripMembers: TripMember[]
  onStatusChange?: (proposalId: string, status: Proposal['status']) => void
}

export default function ProposalDetailModal({
  isOpen,
  onClose,
  proposal,
  tripMembers,
}: ProposalDetailModalProps) {
  const { user } = useAuth()
  const [voteLoading, setVoteLoading] = useState(false)

  // Get member info helpers
  const getUserName = useCallback((userId: string): string => {
    const member = tripMembers.find(m => m.userId === userId)
    return member?.displayName || member?.email || 'Unknown'
  }, [tripMembers])

  const getUserPhoto = useCallback((): string | null => {
    // For now, we don't store photos in memberDetails
    return null
  }, [])

  // Get current user's vote
  const currentUserVote = proposal?.votes.find(v => v.userId === user?.uid)?.vote ?? null

  // Handle voting
  const handleVote = async (vote: Vote['vote']) => {
    if (!user || !proposal) return

    setVoteLoading(true)
    try {
      const proposalRef = doc(db, 'proposals', proposal.id)

      // Remove existing vote if any
      const existingVotes = proposal.votes.filter(v => v.userId !== user.uid)

      // Add new vote
      const newVote: Vote = {
        userId: user.uid,
        vote,
        timestamp: Timestamp.now(),
      }

      await updateDoc(proposalRef, {
        votes: [...existingVotes, newVote],
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVoteLoading(false)
    }
  }

  // Handle adding comment
  const handleAddComment = async (text: string) => {
    if (!user || !proposal) return

    const proposalRef = doc(db, 'proposals', proposal.id)

    const newComment: Comment = {
      id: `${user.uid}-${Date.now()}`,
      userId: user.uid,
      text,
      timestamp: Timestamp.now(),
    }

    await updateDoc(proposalRef, {
      comments: arrayUnion(newComment),
      updatedAt: Timestamp.now(),
    })
  }

  // Handle deleting comment
  const handleDeleteComment = async (commentId: string) => {
    if (!user || !proposal) return

    const proposalRef = doc(db, 'proposals', proposal.id)
    const updatedComments = proposal.comments.filter(c => c.id !== commentId)

    await updateDoc(proposalRef, {
      comments: updatedComments,
      updatedAt: Timestamp.now(),
    })
  }

  // Handle status change
  const handleStatusChange = async (newStatus: Proposal['status']) => {
    if (!proposal) return

    const proposalRef = doc(db, 'proposals', proposal.id)
    await updateDoc(proposalRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    })
  }

  if (!proposal) return null

  const details = proposal.details as Record<string, string>

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <CategoryIcon category={proposal.category} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={proposal.status} />
              <span className="text-sm text-primary-700/60 dark:text-cream-400">
                {getCategoryLabel(proposal.category)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-primary-700 dark:text-cream-100">
              {proposal.title}
            </h2>
          </div>
        </div>

        {/* Description */}
        {proposal.description && (
          <p className="text-primary-700/70 dark:text-cream-400">
            {proposal.description}
          </p>
        )}

        {/* Details */}
        {Object.keys(details).length > 0 && (
          <div className="card bg-cream-200 dark:bg-surface-dark-muted space-y-3">
            {details.location && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-primary-700/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-primary-700/70 dark:text-cream-400">{details.location}</span>
              </div>
            )}
            {details.price && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-primary-700/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-primary-700/70 dark:text-cream-400">{details.price}</span>
              </div>
            )}
            {details.link && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-primary-700/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <a
                  href={details.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View link
                </a>
              </div>
            )}
          </div>
        )}

        {/* Date and Time */}
        {proposal.scheduledDate && (
          <div className="flex items-center gap-2 text-sm text-primary-700/70 dark:text-cream-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {proposal.scheduledDate.toDate().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              {proposal.scheduledTime && ` at ${proposal.scheduledTime}`}
            </span>
          </div>
        )}

        {/* Voting Section */}
        <div className="pt-4 border-t border-cream-400 dark:border-surface-dark-border">
          <h3 className="font-medium text-primary-700 dark:text-cream-100 mb-4">
            Your Vote
          </h3>
          <VoteButtons
            currentUserVote={currentUserVote}
            onVote={handleVote}
            loading={voteLoading}
            disabled={proposal.status === 'decided'}
          />
        </div>

        {/* Vote Results */}
        {proposal.votes.length > 0 && (
          <div className="pt-4 border-t border-cream-400 dark:border-surface-dark-border">
            <h3 className="font-medium text-primary-700 dark:text-cream-100 mb-4">
              Vote Results
            </h3>
            <VoteResults
              votes={proposal.votes}
              memberCount={tripMembers.length}
              getUserName={getUserName}
            />
          </div>
        )}

        {/* Status Actions (for admins/creators) */}
        {proposal.status !== 'decided' && (
          <div className="pt-4 border-t border-cream-400 dark:border-surface-dark-border">
            <h3 className="font-medium text-primary-700 dark:text-cream-100 mb-4">
              Update Status
            </h3>
            <div className="flex gap-2">
              {proposal.status === 'proposed' && (
                <button
                  onClick={() => handleStatusChange('discussing')}
                  className="btn-outline btn-sm"
                >
                  Start Discussion
                </button>
              )}
              {proposal.status === 'discussing' && (
                <>
                  <button
                    onClick={() => handleStatusChange('proposed')}
                    className="btn-outline btn-sm"
                  >
                    Back to Proposed
                  </button>
                  <button
                    onClick={() => handleStatusChange('decided')}
                    className="btn-primary btn-sm"
                  >
                    Mark as Decided
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-4 border-t border-cream-400 dark:border-surface-dark-border">
          <h3 className="font-medium text-primary-700 dark:text-cream-100 mb-4">
            Comments ({proposal.comments.length})
          </h3>
          <CommentList
            comments={proposal.comments}
            currentUserId={user?.uid || ''}
            getUserName={getUserName}
            getUserPhoto={getUserPhoto}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            currentUserName={user?.displayName || user?.email || 'You'}
            currentUserPhoto={user?.photoURL}
          />
        </div>
      </div>
    </Modal>
  )
}
