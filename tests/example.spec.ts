import { test, expect } from '@playwright/test';

test('homepage has title and login form', async ({ page }) => {
  await page.goto('/');
  
  // Should redirect to login
  await expect(page).toHaveURL('/auth/login');
  
  // Check for login form elements
  await expect(page.locator('h1')).toContainText('InmoFlow AI');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
});

test('can login with demo credentials', async ({ page }) => {
  await page.goto('/auth/login');
  
  // Fill in demo credentials
  await page.fill('input[type="email"]', 'admin@inmoflow.com');
  await page.fill('input[type="password"]', 'demo123');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Should redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});

test('can navigate to properties page', async ({ page }) => {
  // Login first
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', 'admin@inmoflow.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');
  
  // Navigate to properties
  await page.click('text=Properties');
  await expect(page).toHaveURL('/properties');
  await expect(page.locator('h1')).toContainText('Properties');
});