import { Timestamp } from 'firebase/firestore'
import type { TripTimezoneSettings } from '@/types'

// Common timezone data with friendly names and UTC offsets
export interface TimezoneOption {
  value: string // IANA timezone identifier
  label: string // Display name
  offset: string // UTC offset display
  region: string // Region for grouping
}

// Popular timezones grouped by region
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // North America
  { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific)', offset: 'UTC-8', region: 'North America' },
  { value: 'America/Denver', label: 'Denver (Mountain)', offset: 'UTC-7', region: 'North America' },
  { value: 'America/Chicago', label: 'Chicago (Central)', offset: 'UTC-6', region: 'North America' },
  { value: 'America/New_York', label: 'New York (Eastern)', offset: 'UTC-5', region: 'North America' },
  { value: 'America/Toronto', label: 'Toronto', offset: 'UTC-5', region: 'North America' },
  { value: 'America/Vancouver', label: 'Vancouver', offset: 'UTC-8', region: 'North America' },
  { value: 'America/Phoenix', label: 'Phoenix (Arizona)', offset: 'UTC-7', region: 'North America' },
  { value: 'America/Anchorage', label: 'Anchorage (Alaska)', offset: 'UTC-9', region: 'North America' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (Hawaii)', offset: 'UTC-10', region: 'North America' },

  // Europe
  { value: 'Europe/London', label: 'London', offset: 'UTC+0', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Zurich', label: 'Zurich', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Vienna', label: 'Vienna', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Prague', label: 'Prague', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Stockholm', label: 'Stockholm', offset: 'UTC+1', region: 'Europe' },
  { value: 'Europe/Athens', label: 'Athens', offset: 'UTC+2', region: 'Europe' },
  { value: 'Europe/Istanbul', label: 'Istanbul', offset: 'UTC+3', region: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow', offset: 'UTC+3', region: 'Europe' },

  // Asia
  { value: 'Asia/Dubai', label: 'Dubai', offset: 'UTC+4', region: 'Asia' },
  { value: 'Asia/Kolkata', label: 'Mumbai / Delhi', offset: 'UTC+5:30', region: 'Asia' },
  { value: 'Asia/Bangkok', label: 'Bangkok', offset: 'UTC+7', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai / Beijing', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Taipei', label: 'Taipei', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Seoul', label: 'Seoul', offset: 'UTC+9', region: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9', region: 'Asia' },

  // Australia & Pacific
  { value: 'Australia/Perth', label: 'Perth', offset: 'UTC+8', region: 'Australia & Pacific' },
  { value: 'Australia/Adelaide', label: 'Adelaide', offset: 'UTC+9:30', region: 'Australia & Pacific' },
  { value: 'Australia/Sydney', label: 'Sydney', offset: 'UTC+10', region: 'Australia & Pacific' },
  { value: 'Australia/Melbourne', label: 'Melbourne', offset: 'UTC+10', region: 'Australia & Pacific' },
  { value: 'Australia/Brisbane', label: 'Brisbane', offset: 'UTC+10', region: 'Australia & Pacific' },
  { value: 'Pacific/Auckland', label: 'Auckland', offset: 'UTC+12', region: 'Australia & Pacific' },

  // South America
  { value: 'America/Sao_Paulo', label: 'Sao Paulo', offset: 'UTC-3', region: 'South America' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires', offset: 'UTC-3', region: 'South America' },
  { value: 'America/Lima', label: 'Lima', offset: 'UTC-5', region: 'South America' },
  { value: 'America/Bogota', label: 'Bogota', offset: 'UTC-5', region: 'South America' },
  { value: 'America/Santiago', label: 'Santiago', offset: 'UTC-4', region: 'South America' },

  // Africa & Middle East
  { value: 'Africa/Cairo', label: 'Cairo', offset: 'UTC+2', region: 'Africa & Middle East' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', offset: 'UTC+2', region: 'Africa & Middle East' },
  { value: 'Africa/Lagos', label: 'Lagos', offset: 'UTC+1', region: 'Africa & Middle East' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem / Tel Aviv', offset: 'UTC+2', region: 'Africa & Middle East' },
]

// Get user's local timezone
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Get timezone option by value
export function getTimezoneOption(value: string): TimezoneOption | undefined {
  return TIMEZONE_OPTIONS.find(tz => tz.value === value)
}

// Get short timezone label (e.g., "PST", "CET")
export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(date)
    const tzPart = parts.find(p => p.type === 'timeZoneName')
    return tzPart?.value || timezone
  } catch {
    return timezone
  }
}

// Format time in a specific timezone
export function formatTimeInTimezone(
  date: Date | Timestamp,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = date instanceof Timestamp ? date.toDate() : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options,
  }

  return dateObj.toLocaleTimeString('en-US', defaultOptions)
}

// Format date in a specific timezone
export function formatDateInTimezone(
  date: Date | Timestamp,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = date instanceof Timestamp ? date.toDate() : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options,
  }

  return dateObj.toLocaleDateString('en-US', defaultOptions)
}

// Format full datetime with timezone
export function formatDateTimeInTimezone(
  date: Date | Timestamp,
  timezone: string
): string {
  const dateObj = date instanceof Timestamp ? date.toDate() : date

  const dateStr = formatDateInTimezone(dateObj, timezone)
  const timeStr = formatTimeInTimezone(dateObj, timezone)

  return `${dateStr} at ${timeStr}`
}

// Get current time offset between two timezones in hours
export function getTimezoneOffset(
  fromTimezone: string,
  toTimezone: string,
  date: Date = new Date()
): number {
  try {
    const fromOffset = getTimezoneOffsetMinutes(fromTimezone, date)
    const toOffset = getTimezoneOffsetMinutes(toTimezone, date)
    return (toOffset - fromOffset) / 60
  } catch {
    return 0
  }
}

// Get timezone offset in minutes from UTC
function getTimezoneOffsetMinutes(timezone: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  return (tzDate.getTime() - utcDate.getTime()) / 60000
}

// Format offset as a readable string (e.g., "+9 hours")
export function formatTimezoneOffset(offsetHours: number): string {
  if (offsetHours === 0) return 'same time'
  const absOffset = Math.abs(offsetHours)
  const sign = offsetHours > 0 ? '+' : '-'
  const hours = Math.floor(absOffset)
  const minutes = Math.round((absOffset - hours) * 60)

  if (minutes === 0) {
    return `${sign}${hours}h`
  }
  return `${sign}${hours}h ${minutes}m`
}

// Get default timezone settings
export function getDefaultTimezoneSettings(): TripTimezoneSettings {
  return {
    homeTimezone: getLocalTimezone(),
    destinationTimezone: getLocalTimezone(),
    showHomeTime: false,
  }
}

// Suggest destination timezone based on city name (simple mapping)
export function suggestTimezoneForCity(cityName: string): string | null {
  const cityLower = cityName.toLowerCase()

  const cityTimezoneMap: Record<string, string> = {
    // North America
    'los angeles': 'America/Los_Angeles',
    'san francisco': 'America/Los_Angeles',
    'seattle': 'America/Los_Angeles',
    'las vegas': 'America/Los_Angeles',
    'san diego': 'America/Los_Angeles',
    'denver': 'America/Denver',
    'phoenix': 'America/Phoenix',
    'chicago': 'America/Chicago',
    'houston': 'America/Chicago',
    'dallas': 'America/Chicago',
    'austin': 'America/Chicago',
    'new york': 'America/New_York',
    'nyc': 'America/New_York',
    'boston': 'America/New_York',
    'miami': 'America/New_York',
    'atlanta': 'America/New_York',
    'toronto': 'America/Toronto',
    'vancouver': 'America/Vancouver',
    'honolulu': 'Pacific/Honolulu',
    'hawaii': 'Pacific/Honolulu',

    // Europe
    'london': 'Europe/London',
    'paris': 'Europe/Paris',
    'berlin': 'Europe/Berlin',
    'munich': 'Europe/Berlin',
    'rome': 'Europe/Rome',
    'milan': 'Europe/Rome',
    'florence': 'Europe/Rome',
    'venice': 'Europe/Rome',
    'madrid': 'Europe/Madrid',
    'barcelona': 'Europe/Madrid',
    'amsterdam': 'Europe/Amsterdam',
    'zurich': 'Europe/Zurich',
    'geneva': 'Europe/Zurich',
    'vienna': 'Europe/Vienna',
    'prague': 'Europe/Prague',
    'stockholm': 'Europe/Stockholm',
    'copenhagen': 'Europe/Stockholm',
    'athens': 'Europe/Athens',
    'istanbul': 'Europe/Istanbul',
    'moscow': 'Europe/Moscow',
    'lisbon': 'Europe/London',
    'dublin': 'Europe/London',
    'edinburgh': 'Europe/London',

    // Asia
    'tokyo': 'Asia/Tokyo',
    'osaka': 'Asia/Tokyo',
    'kyoto': 'Asia/Tokyo',
    'seoul': 'Asia/Seoul',
    'shanghai': 'Asia/Shanghai',
    'beijing': 'Asia/Shanghai',
    'hong kong': 'Asia/Hong_Kong',
    'taipei': 'Asia/Taipei',
    'singapore': 'Asia/Singapore',
    'bangkok': 'Asia/Bangkok',
    'dubai': 'Asia/Dubai',
    'mumbai': 'Asia/Kolkata',
    'delhi': 'Asia/Kolkata',
    'bangalore': 'Asia/Kolkata',

    // Australia
    'sydney': 'Australia/Sydney',
    'melbourne': 'Australia/Melbourne',
    'brisbane': 'Australia/Brisbane',
    'perth': 'Australia/Perth',
    'auckland': 'Pacific/Auckland',

    // South America
    'rio': 'America/Sao_Paulo',
    'sao paulo': 'America/Sao_Paulo',
    'buenos aires': 'America/Buenos_Aires',
    'lima': 'America/Lima',

    // Africa & Middle East
    'cairo': 'Africa/Cairo',
    'johannesburg': 'Africa/Johannesburg',
    'tel aviv': 'Asia/Jerusalem',
    'jerusalem': 'Asia/Jerusalem',
  }

  for (const [city, tz] of Object.entries(cityTimezoneMap)) {
    if (cityLower.includes(city)) {
      return tz
    }
  }

  return null
}

// Group timezones by region for display
export function getGroupedTimezones(): Record<string, TimezoneOption[]> {
  const grouped: Record<string, TimezoneOption[]> = {}

  for (const tz of TIMEZONE_OPTIONS) {
    if (!grouped[tz.region]) {
      grouped[tz.region] = []
    }
    grouped[tz.region].push(tz)
  }

  return grouped
}
