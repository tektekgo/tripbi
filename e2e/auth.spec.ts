import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('page loads without errors', async ({ page }) => {
    // Navigate to the app
    const response = await page.goto('/')

    // Verify the page loaded successfully
    expect(response?.status()).toBeLessThan(400)

    // Check that no console errors occurred
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Verify no critical errors
    expect(errors.filter((e) => !e.includes('Firebase'))).toHaveLength(0)
  })

  test('displays TripBi branding', async ({ page }) => {
    await page.goto('/')

    // Check for app name
    await expect(page.locator('text=TripBi')).toBeVisible()
  })

  test('shows login button when not authenticated', async ({ page }) => {
    await page.goto('/')

    // Check for Google sign-in button
    const signInButton = page.locator('text=Get Started with Google')
    await expect(signInButton).toBeVisible()
  })

  test('login button is clickable', async ({ page }) => {
    await page.goto('/')

    // Find and verify the sign-in button is enabled
    const signInButton = page.locator('text=Get Started with Google')
    await expect(signInButton).toBeEnabled()
  })

  test('shows landing page content for unauthenticated users', async ({ page }) => {
    await page.goto('/')

    // Should show the landing/marketing content
    // Check for key landing page elements
    await expect(page.locator('text=Plan trips together')).toBeVisible()
  })

  test('has proper page title', async ({ page }) => {
    await page.goto('/')

    // Check page title contains TripBi
    const title = await page.title()
    expect(title.toLowerCase()).toContain('tripbi')
  })

  test('is responsive on mobile', async ({ page }) => {
    // This test runs on Mobile Chrome project
    await page.goto('/')

    // Verify the page is usable on mobile
    await expect(page.locator('text=TripBi')).toBeVisible()
    await expect(page.locator('text=Get Started with Google')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('shared timeline page is accessible without auth', async ({ page }) => {
    // Try accessing a shared timeline path (should handle gracefully even if token is invalid)
    const response = await page.goto('/shared/test-token')

    // Should either load the page or redirect, not error
    expect(response?.status()).toBeLessThan(500)
  })

  test('accept invite page handles missing token', async ({ page }) => {
    // Try accessing invite page without token
    const response = await page.goto('/accept-invite')

    // Should handle gracefully
    expect(response?.status()).toBeLessThan(500)
  })
})
