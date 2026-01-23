import { describe, it, expect } from 'vitest'
import {
  getLocalTimezone,
  getTimezoneOption,
  getTimezoneAbbreviation,
  formatTimeInTimezone,
  formatDateInTimezone,
  formatDateTimeInTimezone,
  getTimezoneOffset,
  formatTimezoneOffset,
  getDefaultTimezoneSettings,
  suggestTimezoneForCity,
  getGroupedTimezones,
  TIMEZONE_OPTIONS,
} from './timezone'

describe('timezone utilities', () => {
  describe('getLocalTimezone', () => {
    it('returns a valid IANA timezone string', () => {
      const tz = getLocalTimezone()
      expect(typeof tz).toBe('string')
      expect(tz.length).toBeGreaterThan(0)
      // Should be in format like "America/New_York" or "UTC"
      expect(tz).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$/)
    })
  })

  describe('getTimezoneOption', () => {
    it('returns timezone option for valid timezone', () => {
      const option = getTimezoneOption('America/New_York')
      expect(option).toBeDefined()
      expect(option?.label).toBe('New York (Eastern)')
      expect(option?.region).toBe('North America')
    })

    it('returns undefined for unknown timezone', () => {
      const option = getTimezoneOption('Invalid/Timezone')
      expect(option).toBeUndefined()
    })
  })

  describe('getTimezoneAbbreviation', () => {
    it('returns timezone abbreviation', () => {
      const abbr = getTimezoneAbbreviation('America/New_York')
      // Should return something like "EST" or "EDT" depending on DST
      expect(typeof abbr).toBe('string')
      expect(abbr.length).toBeGreaterThan(0)
    })

    it('returns timezone string for invalid timezone', () => {
      const abbr = getTimezoneAbbreviation('Invalid/Timezone')
      expect(abbr).toBe('Invalid/Timezone')
    })
  })

  describe('formatTimeInTimezone', () => {
    it('formats time correctly', () => {
      const date = new Date('2024-06-15T12:30:00Z')
      const formatted = formatTimeInTimezone(date, 'UTC')
      expect(formatted).toMatch(/12:30\s*PM/i)
    })

    it('respects timezone parameter', () => {
      const date = new Date('2024-06-15T12:00:00Z')
      const utcTime = formatTimeInTimezone(date, 'UTC')
      const nyTime = formatTimeInTimezone(date, 'America/New_York')
      // NY is UTC-4 in summer, so 12:00 UTC = 8:00 AM NY
      expect(utcTime).not.toBe(nyTime)
    })
  })

  describe('formatDateInTimezone', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-06-15T12:00:00Z')
      const formatted = formatDateInTimezone(date, 'UTC')
      expect(formatted).toContain('Jun')
      expect(formatted).toContain('15')
    })
  })

  describe('formatDateTimeInTimezone', () => {
    it('formats full datetime', () => {
      const date = new Date('2024-06-15T12:30:00Z')
      const formatted = formatDateTimeInTimezone(date, 'UTC')
      expect(formatted).toContain('Jun')
      expect(formatted).toContain('15')
      expect(formatted).toContain('at')
      expect(formatted).toMatch(/12:30\s*PM/i)
    })
  })

  describe('getTimezoneOffset', () => {
    it('returns 0 for same timezone', () => {
      const offset = getTimezoneOffset('America/New_York', 'America/New_York')
      expect(offset).toBe(0)
    })

    it('returns positive offset for timezone ahead', () => {
      // Use a fixed date to avoid DST complications
      const winterDate = new Date('2024-01-15T12:00:00Z')
      const offset = getTimezoneOffset('America/New_York', 'Europe/London', winterDate)
      // London is 5 hours ahead of NY in winter
      expect(offset).toBe(5)
    })

    it('returns 0 for invalid timezones', () => {
      const offset = getTimezoneOffset('Invalid/TZ1', 'Invalid/TZ2')
      expect(offset).toBe(0)
    })
  })

  describe('formatTimezoneOffset', () => {
    it('returns "same time" for zero offset', () => {
      expect(formatTimezoneOffset(0)).toBe('same time')
    })

    it('formats positive offset correctly', () => {
      expect(formatTimezoneOffset(5)).toBe('+5h')
    })

    it('formats negative offset correctly', () => {
      expect(formatTimezoneOffset(-8)).toBe('-8h')
    })

    it('formats fractional offset correctly', () => {
      expect(formatTimezoneOffset(5.5)).toBe('+5h 30m')
    })
  })

  describe('getDefaultTimezoneSettings', () => {
    it('returns settings object with required fields', () => {
      const settings = getDefaultTimezoneSettings()
      expect(settings).toHaveProperty('homeTimezone')
      expect(settings).toHaveProperty('destinationTimezone')
      expect(settings).toHaveProperty('showHomeTime')
      expect(settings.showHomeTime).toBe(false)
    })
  })

  describe('suggestTimezoneForCity', () => {
    it('suggests correct timezone for known city', () => {
      expect(suggestTimezoneForCity('Tokyo')).toBe('Asia/Tokyo')
      expect(suggestTimezoneForCity('New York')).toBe('America/New_York')
      expect(suggestTimezoneForCity('London')).toBe('Europe/London')
    })

    it('handles case insensitivity', () => {
      expect(suggestTimezoneForCity('TOKYO')).toBe('Asia/Tokyo')
      expect(suggestTimezoneForCity('tokyo')).toBe('Asia/Tokyo')
      expect(suggestTimezoneForCity('ToKyO')).toBe('Asia/Tokyo')
    })

    it('handles partial matches', () => {
      expect(suggestTimezoneForCity('San Francisco, CA')).toBe('America/Los_Angeles')
      expect(suggestTimezoneForCity('Trip to Paris')).toBe('Europe/Paris')
    })

    it('returns null for unknown city', () => {
      expect(suggestTimezoneForCity('Unknown City XYZ')).toBeNull()
    })
  })

  describe('getGroupedTimezones', () => {
    it('returns timezones grouped by region', () => {
      const grouped = getGroupedTimezones()
      expect(grouped).toHaveProperty('North America')
      expect(grouped).toHaveProperty('Europe')
      expect(grouped).toHaveProperty('Asia')
      expect(Array.isArray(grouped['North America'])).toBe(true)
    })

    it('includes all timezones from TIMEZONE_OPTIONS', () => {
      const grouped = getGroupedTimezones()
      const totalGrouped = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0)
      expect(totalGrouped).toBe(TIMEZONE_OPTIONS.length)
    })
  })

  describe('TIMEZONE_OPTIONS', () => {
    it('has valid structure for all options', () => {
      TIMEZONE_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('offset')
        expect(option).toHaveProperty('region')
        expect(typeof option.value).toBe('string')
        expect(typeof option.label).toBe('string')
      })
    })
  })
})
