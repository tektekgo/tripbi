/**
 * Bump Build Script
 *
 * Increments the build number in version.json
 * Called automatically during `npm run build`
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const versionPath = resolve(__dirname, '../version.json')

// Read current version
const version = JSON.parse(readFileSync(versionPath, 'utf-8'))

// Increment build number
version.build += 1
version.buildDate = new Date().toISOString()

// Write back
writeFileSync(versionPath, JSON.stringify(version, null, 2) + '\n')

console.log(`Build bumped to ${version.version} (${version.build})`)
