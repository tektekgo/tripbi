interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getColorFromName(name: string | null | undefined): string {
  if (!name) return 'bg-cream-500'
  const colors = [
    'bg-primary-400',
    'bg-info-400',
    'bg-success-400',
    'bg-warning-400',
    'bg-error-400',
    'bg-brand-teal',
    'bg-brand-blue',
    'bg-brand-coral',
  ]
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-20 h-20 text-2xl',
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium text-white
                  ${sizeClasses[size]} ${getColorFromName(name)} ${className}`}
    >
      {getInitials(name)}
    </div>
  )
}

interface AvatarGroupProps {
  users: Array<{ photoURL?: string | null; displayName?: string | null }>
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

export function AvatarGroup({ users, max = 4, size = 'sm' }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max)
  const remaining = users.length - max

  const overlapClasses = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  }

  return (
    <div className="flex items-center">
      {displayUsers.map((user, index) => (
        <div
          key={index}
          className={`${index > 0 ? overlapClasses[size] : ''} ring-2 ring-cream-100 dark:ring-surface-dark rounded-full`}
        >
          <Avatar src={user.photoURL} name={user.displayName} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`${overlapClasses[size]} flex items-center justify-center rounded-full
                      bg-cream-400 dark:bg-surface-dark-muted
                      ring-2 ring-cream-100 dark:ring-surface-dark
                      ${size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base'}
                      font-medium text-cream-700 dark:text-cream-300`}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
