import type { Comment } from '@/types'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'

interface CommentListProps {
  comments: Comment[]
  currentUserId: string
  getUserName: (userId: string) => string
  getUserPhoto?: (userId: string) => string | null
  onAddComment: (text: string) => Promise<void>
  onEditComment?: (commentId: string, text: string) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
  currentUserName: string
  currentUserPhoto?: string | null
}

export default function CommentList({
  comments,
  currentUserId,
  getUserName,
  getUserPhoto,
  onAddComment,
  onDeleteComment,
  currentUserName,
  currentUserPhoto,
}: CommentListProps) {
  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <CommentForm
        userName={currentUserName}
        userPhoto={currentUserPhoto}
        onSubmit={onAddComment}
      />

      {/* Comments */}
      {comments.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-cream-400 dark:border-surface-dark-border">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userName={getUserName(comment.userId)}
              userPhoto={getUserPhoto?.(comment.userId)}
              isOwn={comment.userId === currentUserId}
              onDelete={
                onDeleteComment && comment.userId === currentUserId
                  ? () => onDeleteComment(comment.id)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {comments.length === 0 && (
        <p className="text-sm text-cream-500 text-center py-4">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}
    </div>
  )
}
