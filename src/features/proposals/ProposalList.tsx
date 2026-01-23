import type { Proposal } from '@/types'
import ProposalCard from './ProposalCard'
import EmptyState from '@/components/ui/EmptyState'

interface ProposalListProps {
  proposals: Proposal[]
  memberCount: number
  onProposalClick: (proposalId: string) => void
  onCreateProposal: () => void
  loading?: boolean
  filterStatus?: Proposal['status'] | 'all'
  filterCategory?: Proposal['category'] | 'all'
}

export default function ProposalList({
  proposals,
  memberCount,
  onProposalClick,
  onCreateProposal,
  loading,
  filterStatus = 'all',
  filterCategory = 'all',
}: ProposalListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner-lg text-primary-500"></div>
      </div>
    )
  }

  // Apply filters
  let filteredProposals = proposals
  if (filterStatus !== 'all') {
    filteredProposals = filteredProposals.filter(p => p.status === filterStatus)
  }
  if (filterCategory !== 'all') {
    filteredProposals = filteredProposals.filter(p => p.category === filterCategory)
  }

  if (proposals.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        title="No proposals yet"
        description="Start planning by adding flights, hotels, activities, and more."
        action={{
          label: 'Add First Proposal',
          onClick: onCreateProposal,
        }}
      />
    )
  }

  if (filteredProposals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-primary-700/60 dark:text-cream-400">
          No proposals match the current filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredProposals.map((proposal) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          memberCount={memberCount}
          onClick={() => onProposalClick(proposal.id)}
        />
      ))}
    </div>
  )
}
