import { test, expect } from '@playwright/test';
import { submitForm } from './helpers';

test.describe('Dynamic Form - Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(1000);
  });

  test('should render the form with correct title and submit button', async ({ page }) => {
    await expect(page.getByText('Registration Form')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('should render all 4 form fields from JSON config', async ({ page }) => {
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Gender' })).toBeVisible();
  });

  test('should render Gender as a Select dropdown component', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Gender' })).toBeVisible();
  });
});

test.describe('Dynamic Form - Default Values', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(1000);
  });

  test('should pre-select Gender with default value Male', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Gender' })).toContainText('Male');
  });
});

test.describe('Dynamic Form - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Registration Form')).toBeVisible({ timeout: 15000 });
  });

  test('should show required validation errors when required fields are empty', async ({ page }) => {
    await page.getByLabel('Full Name').clear();
    await page.getByLabel('Email').clear();
    await page.getByLabel('Password').clear();
    await submitForm(page);
    await page.waitForTimeout(500);
    await expect(page.getByText('Full Name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel('Email').fill('not-an-email');
    await submitForm(page);
    await page.waitForTimeout(500);
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('should enforce password minimum length', async ({ page }) => {
    await page.getByLabel('Password').fill('123');
    await submitForm(page);
    await page.waitForTimeout(500);
    await expect(page.getByText(/Password must be at least/)).toBeVisible();
  });
});

test.describe('Dynamic Form - Field Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(1000);
  });

  test('should allow selecting a different value from Gender dropdown', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Gender' }).click();
    await page.getByRole('option', { name: 'Female', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Gender' })).toContainText('Female');
  });
});
