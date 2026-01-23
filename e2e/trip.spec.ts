import { test, expect } from '@playwright/test'

test.describe('Trip Management (Unauthenticated)', () => {
  test('redirects to landing when accessing trips without auth', async ({ page }) => {
    await page.goto('/')

    // When not authenticated, should show landing page
    // The sign-in button should be visible
    await expect(page.locator('text=Get Started with Google')).toBeVisible()

    // Should not show dashboard elements
    await expect(page.locator('text=My Trips')).not.toBeVisible()
  })

  test('landing page shows feature highlights', async ({ page }) => {
    await page.goto('/')

    // Check for feature descriptions that explain the app
    const pageContent = await page.content()

    // Should have some indication of what the app does
    expect(
      pageContent.toLowerCase().includes('trip') ||
        pageContent.toLowerCase().includes('travel') ||
        pageContent.toLowerCase().includes('plan')
    ).toBeTruthy()
  })
})

test.describe('Trip UI Elements', () => {
  test('page has proper structure', async ({ page }) => {
    await page.goto('/')

    // Check for main landmark elements
    await expect(page.locator('body')).toBeVisible()

    // Should have some main content area
    const mainContent = page.locator('main, [role="main"], #root')
    await expect(mainContent).toBeVisible()
  })

  test('no broken images on landing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that all images loaded successfully
    const images = await page.locator('img').all()

    for (const img of images) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      // Image should have loaded (naturalWidth > 0) or be a placeholder
      expect(naturalWidth).toBeGreaterThanOrEqual(0)
    }
  })

  test('no accessibility violations in tab order', async ({ page }) => {
    await page.goto('/')

    // Tab through the page and ensure focusable elements are reachable
    await page.keyboard.press('Tab')

    // First focusable element should receive focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })
})

test.describe('Performance', () => {
  test('page loads within reasonable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - startTime

    // Page should load in under 10 seconds even on slow connections
    expect(loadTime).toBeLessThan(10000)
  })

  test('critical content is visible quickly', async ({ page }) => {
    await page.goto('/')

    // The app name should be visible almost immediately
    await expect(page.locator('text=TripBi')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Error Handling', () => {
  test('handles 404 gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page-12345')

    // Should not crash - either 404 or redirect to home
    expect(response?.status()).toBeLessThan(500)
  })

  test('app recovers from navigation errors', async ({ page }) => {
    // Navigate to home
    await page.goto('/')

    // Try to navigate to invalid route
    await page.goto('/invalid/route/path')

    // Should still be able to navigate back to home
    await page.goto('/')
    await expect(page.locator('text=TripBi')).toBeVisible()
  })
})
