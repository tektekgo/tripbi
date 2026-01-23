import { Timestamp } from 'firebase/firestore'

/**
 * Converts a Firebase Timestamp to a JavaScript Date
 */
export function timestampToDate(timestamp: Timestamp | null | undefined): Date | null {
  if (!timestamp) return null
  return timestamp.toDate()
}

/**
 * Formats a date for display
 */
export function formatDate(
  date: Date | Timestamp | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  if (!date) return ''

  const dateObj = date instanceof Timestamp ? date.toDate() : date
  return dateObj.toLocaleDateString('en-US', options)
}

/**
 * Formats a date and time for display
 */
export function formatDateTime(
  date: Date | Timestamp | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }
): string {
  if (!date) return ''

  const dateObj = date instanceof Timestamp ? date.toDate() : date
  return dateObj.toLocaleDateString('en-US', options)
}

/**
 * Formats a time for display
 */
export function formatTime(
  date: Date | Timestamp | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  }
): string {
  if (!date) return ''

  const dateObj = date instanceof Timestamp ? date.toDate() : date
  return dateObj.toLocaleTimeString('en-US', options)
}

/**
 * Gets a relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date | Timestamp | null | undefined): string {
  if (!date) return ''

  const dateObj = date instanceof Timestamp ? date.toDate() : date
  const now = new Date()
  const diffMs = dateObj.getTime() - now.getTime()
  const diffSecs = Math.round(diffMs / 1000)
  const diffMins = Math.round(diffSecs / 60)
  const diffHours = Math.round(diffMins / 60)
  const diffDays = Math.round(diffHours / 24)

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day')
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour')
  } else if (Math.abs(diffMins) >= 1) {
    return rtf.format(diffMins, 'minute')
  } else {
    return rtf.format(diffSecs, 'second')
  }
}
