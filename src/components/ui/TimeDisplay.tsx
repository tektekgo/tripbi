import { useMemo } from 'react'
import { Timestamp } from 'firebase/firestore'
import {
  formatTimeInTimezone,
  formatDateInTimezone,
  getTimezoneAbbreviation,
  getTimezoneOffset,
  formatTimezoneOffset,
} from '@/utils/timezone'
import type { TripTimezoneSettings } from '@/types'

interface TimeDisplayProps {
  date: Date | Timestamp
  time?: string // Optional time string (e.g., "14:30")
  timezoneSettings?: TripTimezoneSettings
  showDate?: boolean
  showOffset?: boolean
  size?: 'sm' | 'md' | 'lg'
  layout?: 'inline' | 'stacked'
  className?: string
}

export default function TimeDisplay({
  date,
  time,
  timezoneSettings,
  showDate = false,
  showOffset = false,
  size = 'md',
  layout = 'inline',
  className = '',
}: TimeDisplayProps) {
  // Convert date if it's a Timestamp
  const dateObj = useMemo(() => {
    if (date instanceof Timestamp) {
      return date.toDate()
    }
    return date
  }, [date])

  // If we have a time string, create a new date with that time in the destination timezone
  const effectiveDate = useMemo(() => {
    if (!time) return dateObj

    // Parse the time string and set it on the date
    const [hours, minutes] = time.split(':').map(Number)
    const newDate = new Date(dateObj)
    newDate.setHours(hours, minutes, 0, 0)
    return newDate
  }, [dateObj, time])

  // Format times in each timezone
  const destinationTime = useMemo(() => {
    if (!timezoneSettings) {
      return formatTimeInTimezone(effectiveDate, Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
    return formatTimeInTimezone(effectiveDate, timezoneSettings.destinationTimezone)
  }, [effectiveDate, timezoneSettings])

  const homeTime = useMemo(() => {
    if (!timezoneSettings?.showHomeTime) return null
    return formatTimeInTimezone(effectiveDate, timezoneSettings.homeTimezone)
  }, [effectiveDate, timezoneSettings])

  // Format dates if needed
  const destinationDate = useMemo(() => {
    if (!showDate || !timezoneSettings) return null
    return formatDateInTimezone(effectiveDate, timezoneSettings.destinationTimezone)
  }, [effectiveDate, showDate, timezoneSettings])

  const homeDate = useMemo(() => {
    if (!showDate || !timezoneSettings?.showHomeTime) return null
    return formatDateInTimezone(effectiveDate, timezoneSettings.homeTimezone)
  }, [effectiveDate, showDate, timezoneSettings])

  // Get timezone abbreviations
  const destAbbr = useMemo(() => {
    if (!timezoneSettings) return ''
    return getTimezoneAbbreviation(timezoneSettings.destinationTimezone, effectiveDate)
  }, [effectiveDate, timezoneSettings])

  const homeAbbr = useMemo(() => {
    if (!timezoneSettings?.showHomeTime) return ''
    return getTimezoneAbbreviation(timezoneSettings.homeTimezone, effectiveDate)
  }, [effectiveDate, timezoneSettings])

  // Calculate offset
  const offset = useMemo(() => {
    if (!showOffset || !timezoneSettings) return null
    return formatTimezoneOffset(
      getTimezoneOffset(timezoneSettings.homeTimezone, timezoneSettings.destinationTimezone)
    )
  }, [showOffset, timezoneSettings])

  // Size classes
  const sizeClasses = {
    sm: {
      primary: 'text-sm',
      secondary: 'text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      primary: 'text-base',
      secondary: 'text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      primary: 'text-lg',
      secondary: 'text-base',
      icon: 'w-5 h-5',
    },
  }

  const sizes = sizeClasses[size]

  // If no timezone settings or home time not shown, simple display
  if (!timezoneSettings || !timezoneSettings.showHomeTime) {
    return (
      <div className={`flex items-center gap-1.5 text-primary-700/60 dark:text-cream-400 ${className}`}>
        <svg className={sizes.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={sizes.primary}>
          {showDate && destinationDate && `${destinationDate} at `}
          {destinationTime}
          {destAbbr && <span className="text-primary-700/40 ml-1">{destAbbr}</span>}
        </span>
      </div>
    )
  }

  // Dual timezone display
  if (layout === 'stacked') {
    return (
      <div className={`space-y-1 ${className}`}>
        {/* Destination time (primary) */}
        <div className="flex items-center gap-1.5 text-primary-700 dark:text-cream-100">
          <svg className={sizes.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`font-medium ${sizes.primary}`}>
            {showDate && destinationDate && `${destinationDate} at `}
            {destinationTime}
          </span>
          <span className="text-xs px-1.5 py-0.5 bg-primary-100 dark:bg-surface-dark-muted text-primary-600 dark:text-primary-400 rounded-full">
            {destAbbr}
          </span>
        </div>

        {/* Home time (secondary) */}
        <div className="flex items-center gap-1.5 text-primary-700/50 dark:text-cream-400">
          <svg className={sizes.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className={sizes.secondary}>
            {showDate && homeDate && `${homeDate} at `}
            {homeTime}
          </span>
          <span className="text-xs text-primary-700/40 dark:text-cream-500">
            {homeAbbr} (home)
          </span>
        </div>

        {/* Offset indicator */}
        {offset && offset !== 'same time' && (
          <div className="flex items-center gap-1 text-xs text-primary-700/40 dark:text-cream-500 pl-5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>{offset} from home</span>
          </div>
        )}
      </div>
    )
  }

  // Inline layout
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {/* Destination time (primary) */}
      <div className="flex items-center gap-1.5 text-primary-700 dark:text-cream-100">
        <svg className={sizes.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`font-medium ${sizes.primary}`}>
          {showDate && destinationDate && `${destinationDate} at `}
          {destinationTime}
        </span>
        <span className="text-xs px-1.5 py-0.5 bg-primary-100 dark:bg-surface-dark-muted text-primary-600 dark:text-primary-400 rounded-full">
          {destAbbr}
        </span>
      </div>

      {/* Separator */}
      <span className="text-primary-700/30 dark:text-cream-600">•</span>

      {/* Home time (secondary) */}
      <div className="flex items-center gap-1.5 text-primary-700/50 dark:text-cream-400">
        <svg className={`${sizes.icon} opacity-60`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className={sizes.secondary}>
          {homeTime} {homeAbbr}
        </span>
      </div>
    </div>
  )
}

// Compact version for lists
export function TimeDisplayCompact({
  date,
  time,
  timezoneSettings,
  className = '',
}: Omit<TimeDisplayProps, 'showDate' | 'showOffset' | 'size' | 'layout'>) {
  const dateObj = date instanceof Timestamp ? date.toDate() : date

  const effectiveDate = useMemo(() => {
    if (!time) return dateObj
    const [hours, minutes] = time.split(':').map(Number)
    const newDate = new Date(dateObj)
    newDate.setHours(hours, minutes, 0, 0)
    return newDate
  }, [dateObj, time])

  const destinationTime = useMemo(() => {
    if (!timezoneSettings) {
      return formatTimeInTimezone(effectiveDate, Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
    return formatTimeInTimezone(effectiveDate, timezoneSettings.destinationTimezone)
  }, [effectiveDate, timezoneSettings])

  const homeTime = useMemo(() => {
    if (!timezoneSettings?.showHomeTime) return null
    return formatTimeInTimezone(effectiveDate, timezoneSettings.homeTimezone)
  }, [effectiveDate, timezoneSettings])

  if (!homeTime) {
    return <span className={className}>{destinationTime}</span>
  }

  return (
    <span className={className}>
      {destinationTime}
      <span className="text-primary-700/40 dark:text-cream-500 ml-1">
        ({homeTime} home)
      </span>
    </span>
  )
}
