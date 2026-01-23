/**
 * Version information for TripBi
 *
 * Version format: MAJOR.MINOR.PATCH (semantic versioning)
 * Build number: Increments with each release build
 *
 * Single source of truth: /version.json
 * - Synced to package.json during build
 * - Synced to Android versionCode via Capacitor
 * - Synced to iOS CFBundleVersion via Capacitor
 */

export interface VersionInfo {
  /** Semantic version (e.g., "1.0.0") */
  version: string
  /** Build number (increments with each build) */
  build: number
  /** ISO date string of the build */
  buildDate: string
  /** Full version string for display (e.g., "1.0.0 (42)") */
  displayVersion: string
  /** Short version for compact display (e.g., "v1.0.0") */
  shortVersion: string
}

/**
 * Get the current app version information
 */
export function getVersionInfo(): VersionInfo {
  const version = __APP_VERSION__
  const build = __APP_BUILD__
  const buildDate = __APP_BUILD_DATE__

  return {
    version,
    build,
    buildDate,
    displayVersion: `${version} (${build})`,
    shortVersion: `v${version}`,
  }
}

/**
 * Get just the display version string
 * Format: "1.0.0 (42)"
 */
export function getDisplayVersion(): string {
  return `${__APP_VERSION__} (${__APP_BUILD__})`
}

/**
 * Get just the short version string
 * Format: "v1.0.0"
 */
export function getShortVersion(): string {
  return `v${__APP_VERSION__}`
}

/**
 * Check if current version is newer than a given version
 */
export function isNewerThan(otherVersion: string, otherBuild: number): boolean {
  const [major, minor, patch] = __APP_VERSION__.split('.').map(Number)
  const [otherMajor, otherMinor, otherPatch] = otherVersion.split('.').map(Number)

  if (major !== otherMajor) return major > otherMajor
  if (minor !== otherMinor) return minor > otherMinor
  if (patch !== otherPatch) return patch > otherPatch
  return __APP_BUILD__ > otherBuild
}
