import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'

interface CommentFormProps {
  userName: string
  userPhoto?: string | null
  onSubmit: (text: string) => Promise<void>
  placeholder?: string
}

export default function CommentForm({
  userName,
  userPhoto,
  onSubmit,
  placeholder = 'Add a comment...',
}: CommentFormProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    try {
      await onSubmit(text.trim())
      setText('')
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Avatar src={userPhoto} name={userName} size="sm" />
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 bg-cream-100 dark:bg-surface-dark-elevated
                     border border-cream-400 dark:border-surface-dark-border
                     rounded-full text-sm text-primary-800 dark:text-cream-100
                     placeholder:text-cream-500
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none
                     transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="px-4 py-2 bg-primary-500 text-cream-100 rounded-full text-sm font-medium
                     hover:bg-primary-600 active:bg-primary-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          {loading ? (
            <span className="spinner-sm"></span>
          ) : (
            'Post'
          )}
        </button>
      </div>
    </form>
  )
}
