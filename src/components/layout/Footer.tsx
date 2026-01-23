import { getVersionInfo } from '@/lib/version'

interface FooterProps {
  /** Additional CSS classes */
  className?: string
  /** Show a simpler version (no border, less padding) */
  minimal?: boolean
}

/**
 * Consistent footer component for all pages
 * Displays: "© 2026 TripBi. Bi-Suite Solutions."
 *           "v1.0.9 Beta · Built Jan 22, 2026"
 */
export default function Footer({ className = '', minimal = false }: FooterProps) {
  const { version, build, buildDate } = getVersionInfo()

  // Format the build date (e.g., "Jan 22, 2026")
  const formattedDate = new Date(buildDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Format version like "v1.0.9" (using build as patch number for now)
  const versionDisplay = `v${version.split('.').slice(0, 2).join('.')}.${build}`

  const currentYear = new Date().getFullYear()

  if (minimal) {
    return (
      <footer className={`py-6 px-4 ${className}`}>
        <p className="text-center text-sm text-primary-700/70">
          © {currentYear} <span className="font-medium">TripBi</span>. Bi-Suite Solutions.
        </p>
        <p className="text-center text-xs text-primary-700/50 mt-1">
          {versionDisplay} Beta · Built {formattedDate}
        </p>
      </footer>
    )
  }

  return (
    <footer className={`border-t border-cream-400 bg-cream-100 safe-bottom ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-center text-sm text-primary-700/70">
          © {currentYear} <span className="font-medium">TripBi</span>. Bi-Suite Solutions.
        </p>
        <p className="text-center text-xs text-primary-700/50 mt-1">
          {versionDisplay} Beta · Built {formattedDate}
        </p>
      </div>
    </footer>
  )
}
