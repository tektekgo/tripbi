import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the TripBi landing page', async ({ page }) => {
    await page.goto('/');

    // Check that the page title or app name is visible
    await expect(page.locator('text=TripBi')).toBeVisible();
  });

  test('should show sign in button when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Check for sign in button
    await expect(page.locator('text=Get Started with Google')).toBeVisible();
  });
});
