import type { Comment } from '@/types'
import Avatar from '@/components/ui/Avatar'
import { Timestamp } from 'firebase/firestore'

interface CommentItemProps {
  comment: Comment
  userName: string
  userPhoto?: string | null
  isOwn: boolean
  onEdit?: () => void
  onDelete?: () => void
}

function formatTime(timestamp: Timestamp): string {
  const date = timestamp.toDate()
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function CommentItem({
  comment,
  userName,
  userPhoto,
  isOwn,
  onEdit,
  onDelete,
}: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <Avatar src={userPhoto} name={userName} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-primary-700 dark:text-cream-100">
            {userName}
          </span>
          <span className="text-xs text-primary-700/50">
            {formatTime(comment.timestamp)}
          </span>
          {comment.editedAt && (
            <span className="text-xs text-primary-700/50 italic">(edited)</span>
          )}
        </div>
        <p className="text-sm text-primary-700/70 dark:text-cream-400 whitespace-pre-wrap">
          {comment.text}
        </p>
        {isOwn && (onEdit || onDelete) && (
          <div className="flex gap-2 mt-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-xs text-primary-700/50 hover:text-primary-600 transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-xs text-primary-700/50 hover:text-error-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
