/**
 * Sync Version Script
 *
 * Synchronizes version from version.json to:
 * - package.json
 * - Android: android/app/build.gradle (versionCode, versionName)
 * - iOS: ios/App/App/Info.plist (CFBundleVersion, CFBundleShortVersionString)
 *
 * Run this after Capacitor is set up to sync versions to native projects.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const versionPath = resolve(__dirname, '../version.json')
const packagePath = resolve(__dirname, '../package.json')
const androidGradlePath = resolve(__dirname, '../android/app/build.gradle')
const iosPlistPath = resolve(__dirname, '../ios/App/App/Info.plist')

// Read version.json
const versionData = JSON.parse(readFileSync(versionPath, 'utf-8'))
const { version, build } = versionData

console.log(`Syncing version ${version} (build ${build})...`)

// Sync to package.json
const packageData = JSON.parse(readFileSync(packagePath, 'utf-8'))
if (packageData.version !== version) {
  packageData.version = version
  writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n')
  console.log('  Updated: package.json')
} else {
  console.log('  Skipped: package.json (already in sync)')
}

// Sync to Android (if exists)
if (existsSync(androidGradlePath)) {
  let gradle = readFileSync(androidGradlePath, 'utf-8')

  // Update versionCode (build number)
  gradle = gradle.replace(
    /versionCode\s+\d+/,
    `versionCode ${build}`
  )

  // Update versionName (semantic version)
  gradle = gradle.replace(
    /versionName\s+"[^"]+"/,
    `versionName "${version}"`
  )

  writeFileSync(androidGradlePath, gradle)
  console.log('  Updated: android/app/build.gradle')
} else {
  console.log('  Skipped: Android (not initialized)')
}

// Sync to iOS (if exists)
if (existsSync(iosPlistPath)) {
  let plist = readFileSync(iosPlistPath, 'utf-8')

  // Update CFBundleVersion (build number)
  plist = plist.replace(
    /(<key>CFBundleVersion<\/key>\s*<string>)[^<]+(<\/string>)/,
    `$1${build}$2`
  )

  // Update CFBundleShortVersionString (semantic version)
  plist = plist.replace(
    /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]+(<\/string>)/,
    `$1${version}$2`
  )

  writeFileSync(iosPlistPath, plist)
  console.log('  Updated: ios/App/App/Info.plist')
} else {
  console.log('  Skipped: iOS (not initialized)')
}

console.log('Version sync complete!')
