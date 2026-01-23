/**
 * Bump Version Script
 *
 * Updates the semantic version in version.json and package.json
 * Usage: node scripts/bump-version.js [major|minor|patch]
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const versionPath = resolve(__dirname, '../version.json')
const packagePath = resolve(__dirname, '../package.json')

const bumpType = process.argv[2]

if (!['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('Usage: node scripts/bump-version.js [major|minor|patch]')
  process.exit(1)
}

// Read current version
const versionData = JSON.parse(readFileSync(versionPath, 'utf-8'))
const packageData = JSON.parse(readFileSync(packagePath, 'utf-8'))

// Parse and bump version
const [major, minor, patch] = versionData.version.split('.').map(Number)

let newVersion
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`
    break
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`
    break
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`
    break
}

// Update version.json
versionData.version = newVersion
versionData.buildDate = new Date().toISOString()
writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n')

// Update package.json
packageData.version = newVersion
writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n')

console.log(`Version bumped to ${newVersion} (build ${versionData.build})`)
console.log('Updated: version.json, package.json')
