import type { Vote } from '@/types'
import Avatar from '@/components/ui/Avatar'

interface VoteResultsProps {
  votes: Vote[]
  memberCount: number
  getUserName: (userId: string) => string
  showVoters?: boolean
}

interface VoterInfo {
  vote: Vote['vote']
  userId: string
  name: string
}

export default function VoteResults({ votes, memberCount, getUserName, showVoters = true }: VoteResultsProps) {
  const voteCounts = votes.reduce(
    (acc, vote) => {
      acc[vote.vote]++
      return acc
    },
    { yes: 0, no: 0, abstain: 0 }
  )

  const totalVotes = votes.length
  const notVoted = memberCount - totalVotes
  const votingProgress = memberCount > 0 ? Math.round((totalVotes / memberCount) * 100) : 0

  // Group voters by vote type
  const votersByType: Record<Vote['vote'], VoterInfo[]> = {
    yes: [],
    no: [],
    abstain: [],
  }

  votes.forEach((vote) => {
    votersByType[vote.vote].push({
      vote: vote.vote,
      userId: vote.userId,
      name: getUserName(vote.userId),
    })
  })

  const voteConfig: { type: Vote['vote']; label: string; color: string; bgColor: string }[] = [
    { type: 'yes', label: 'Yes', color: 'text-success-600', bgColor: 'bg-success-500' },
    { type: 'no', label: 'No', color: 'text-error-600', bgColor: 'bg-error-500' },
    { type: 'abstain', label: 'Pass', color: 'text-cream-600', bgColor: 'bg-cream-500' },
  ]

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-primary-700/70 dark:text-cream-400">
            {totalVotes} of {memberCount} voted
          </span>
          <span className="font-medium text-primary-700 dark:text-cream-100">
            {votingProgress}%
          </span>
        </div>
        <div className="h-3 bg-cream-300 dark:bg-surface-dark-muted rounded-full overflow-hidden flex">
          {memberCount > 0 && (
            <>
              {voteCounts.yes > 0 && (
                <div
                  className="bg-success-500 h-full"
                  style={{ width: `${(voteCounts.yes / memberCount) * 100}%` }}
                />
              )}
              {voteCounts.no > 0 && (
                <div
                  className="bg-error-500 h-full"
                  style={{ width: `${(voteCounts.no / memberCount) * 100}%` }}
                />
              )}
              {voteCounts.abstain > 0 && (
                <div
                  className="bg-cream-500 h-full"
                  style={{ width: `${(voteCounts.abstain / memberCount) * 100}%` }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Vote counts */}
      <div className="flex gap-6">
        {voteConfig.map((config) => (
          <div key={config.type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.bgColor}`} />
            <span className={`font-medium ${config.color}`}>
              {voteCounts[config.type]}
            </span>
            <span className="text-sm text-primary-700/60 dark:text-cream-400">
              {config.label}
            </span>
          </div>
        ))}
        {notVoted > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cream-300 dark:bg-surface-dark-muted" />
            <span className="text-primary-700/60 dark:text-cream-400 font-medium">
              {notVoted}
            </span>
            <span className="text-sm text-primary-700/60 dark:text-cream-400">
              Not voted
            </span>
          </div>
        )}
      </div>

      {/* Voter list */}
      {showVoters && totalVotes > 0 && (
        <div className="pt-4 border-t border-cream-400 dark:border-surface-dark-border">
          <h4 className="text-sm font-medium text-primary-700/70 dark:text-cream-400 mb-3">
            Who voted what
          </h4>
          <div className="space-y-3">
            {voteConfig.map((config) => {
              const voters = votersByType[config.type]
              if (voters.length === 0) return null
              return (
                <div key={config.type} className="flex items-start gap-3">
                  <span className={`text-sm font-medium w-12 ${config.color}`}>
                    {config.label}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {voters.map((voter) => (
                      <div
                        key={voter.userId}
                        className="flex items-center gap-1.5 px-2 py-1 bg-cream-200 dark:bg-surface-dark-muted rounded-full"
                      >
                        <Avatar name={voter.name} size="sm" />
                        <span className="text-sm text-primary-700/70 dark:text-cream-400">
                          {voter.name.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
