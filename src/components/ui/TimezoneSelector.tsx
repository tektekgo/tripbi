import { useState, useMemo, useRef, useEffect } from 'react'
import {
  TIMEZONE_OPTIONS,
  getGroupedTimezones,
  getTimezoneAbbreviation,
  getLocalTimezone,
  type TimezoneOption,
} from '@/utils/timezone'

interface TimezoneSelectorProps {
  value: string
  onChange: (timezone: string) => void
  label?: string
  placeholder?: string
  showCurrentTime?: boolean
  detectLocalButton?: boolean
}

export default function TimezoneSelector({
  value,
  onChange,
  label,
  placeholder = 'Select timezone...',
  showCurrentTime = true,
  detectLocalButton = false,
}: TimezoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const groupedTimezones = useMemo(() => getGroupedTimezones(), [])

  // Get selected timezone info
  const selectedTz = useMemo(() => {
    return TIMEZONE_OPTIONS.find(tz => tz.value === value)
  }, [value])

  // Filter timezones based on search
  const filteredTimezones = useMemo(() => {
    if (!search.trim()) return groupedTimezones

    const searchLower = search.toLowerCase()
    const filtered: Record<string, TimezoneOption[]> = {}

    for (const [region, tzList] of Object.entries(groupedTimezones)) {
      const matches = tzList.filter(
        tz =>
          tz.label.toLowerCase().includes(searchLower) ||
          tz.value.toLowerCase().includes(searchLower) ||
          tz.offset.toLowerCase().includes(searchLower)
      )
      if (matches.length > 0) {
        filtered[region] = matches
      }
    }

    return filtered
  }, [search, groupedTimezones])

  // Get current time in selected timezone
  const currentTime = useMemo(() => {
    if (!value) return ''
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: value,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return ''
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (tz: TimezoneOption) => {
    onChange(tz.value)
    setIsOpen(false)
    setSearch('')
  }

  const handleDetectLocal = () => {
    const localTz = getLocalTimezone()
    onChange(localTz)
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-primary-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3
          bg-cream-100 border border-cream-400 rounded-2xl
          text-left transition-all duration-200
          hover:border-primary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
          ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Globe Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Timezone Info */}
          <div className="min-w-0 flex-1">
            {selectedTz ? (
              <>
                <div className="font-medium text-primary-700 truncate">
                  {selectedTz.label}
                </div>
                {showCurrentTime && currentTime && (
                  <div className="text-xs text-primary-700/60 flex items-center gap-2">
                    <span>{getTimezoneAbbreviation(value)}</span>
                    <span>•</span>
                    <span>Currently {currentTime}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-primary-700/50">{placeholder}</div>
            )}
          </div>
        </div>

        {/* Chevron */}
        <svg
          className={`w-5 h-5 text-primary-700/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Detect Local Button */}
      {detectLocalButton && !isOpen && (
        <button
          type="button"
          onClick={handleDetectLocal}
          className="mt-2 text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          Detect my timezone
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-cream-100 border border-cream-400 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
          {/* Search Input */}
          <div className="p-3 border-b border-cream-300">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-700/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cities or timezones..."
                className="w-full pl-9 pr-4 py-2.5 bg-cream-200 border-0 rounded-xl text-sm
                  placeholder:text-primary-700/40 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {/* Timezone List */}
          <div className="max-h-72 overflow-y-auto">
            {Object.entries(filteredTimezones).map(([region, tzList]) => (
              <div key={region}>
                {/* Region Header */}
                <div className="px-4 py-2 bg-cream-200 text-xs font-semibold text-primary-700/70 uppercase tracking-wider sticky top-0">
                  {region}
                </div>

                {/* Timezone Options */}
                {tzList.map((tz) => {
                  const isSelected = tz.value === value
                  const tzCurrentTime = new Date().toLocaleTimeString('en-US', {
                    timeZone: tz.value,
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })

                  return (
                    <button
                      key={tz.value}
                      type="button"
                      onClick={() => handleSelect(tz)}
                      className={`w-full px-4 py-3 flex items-center justify-between gap-3
                        transition-colors text-left
                        ${isSelected
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-cream-200 text-primary-700'
                        }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{tz.label}</div>
                        <div className="text-xs text-primary-700/60">
                          {tz.offset} • {tzCurrentTime}
                        </div>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}

            {Object.keys(filteredTimezones).length === 0 && (
              <div className="px-4 py-8 text-center text-primary-700/50 text-sm">
                No timezones found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
