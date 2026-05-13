import { test, expect } from '@playwright/test';

// Helper: navigate to /uk and clear localStorage (fresh basket every test)
test.beforeEach(async ({ page }) => {
  await page.goto('/uk');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

// 1. Products load without a loading spinner (SSR - products present on first paint)
test('products load immediately without a full-page spinner', async ({ page }) => {
  await page.goto('/uk');
  // At least one product card should be visible without waiting
  await expect(page.getByRole('button', { name: /add .+ to basket/i }).first()).toBeVisible();
  // No full-page spinner (the only spinner is the "loading more" one at the bottom)
  await expect(page.getByText('Loading more products...')).not.toBeVisible({ timeout: 500 });
});

// 2. UK locale shows GBP prices
test('UK store shows GBP prices', async ({ page }) => {
  await page.goto('/uk');
  await expect(page.getByRole('button', { name: /add .+ to basket/i }).first()).toBeVisible();
  // At least one price formatted as GBP
  await expect(page.getByText(/£\d+\.\d{2}/).first()).toBeVisible();
});

// 3. US locale shows USD prices
test('US store shows USD prices', async ({ page }) => {
  await page.goto('/us');
  await expect(page.getByRole('button', { name: /add .+ to basket/i }).first()).toBeVisible();
  await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
});

// 4. Adding a product opens/updates the basket badge
test('adding a product increments the basket badge', async ({ page }) => {
  await page.goto('/uk');
  const firstProduct = page.getByRole('button', { name: /add .+ to basket/i }).first();
  await firstProduct.click();
  await expect(page.getByRole('button', { name: /open basket, 1 item/i })).toBeVisible();
});

// 5. Basket drawer opens and shows the added item
test('basket drawer shows added item with correct price', async ({ page }) => {
  await page.goto('/uk');
  const firstProduct = page.getByRole('button', { name: /add .+ to basket/i }).first();
  // Capture the product name from aria-label
  const label = await firstProduct.getAttribute('aria-label') ?? '';
  const productName = label.replace(/^Add (.+) to basket$/i, '$1');
  await firstProduct.click();
  await page.getByRole('button', { name: /open basket/i }).click();
  const dialog = page.getByRole('dialog', { name: 'Shopping basket' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(productName)).toBeVisible();
  await expect(dialog.getByText(/£\d+\.\d{2}/).first()).toBeVisible();
});

// 6. Quantity controls in the basket drawer work
test('quantity controls in drawer increment and remove items', async ({ page }) => {
  await page.goto('/uk');
  await page.getByRole('button', { name: /add .+ to basket/i }).first().click();
  await page.getByRole('button', { name: /open basket/i }).click();
  const dialog = page.getByRole('dialog', { name: 'Shopping basket' });

  // Increase to 2
  await page.getByRole('button', { name: /increase quantity/i }).click();
  await expect(dialog.getByText('2', { exact: true })).toBeVisible();

  // Decrease back to 1
  await page.getByRole('button', { name: /decrease quantity/i }).click();
  await expect(dialog.getByText('1', { exact: true })).toBeVisible();

  // Decrease to 0 removes the item
  await page.getByRole('button', { name: /decrease quantity/i }).click();
  await expect(dialog.getByText('Your basket is empty')).toBeVisible();
});

// 7. Checkout button navigates to the checkout page with item listed
test('checkout page shows basket items and total', async ({ page }) => {
  await page.goto('/uk');
  await page.getByRole('button', { name: /add .+ to basket/i }).first().click();
  await page.getByRole('button', { name: /open basket/i }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page).toHaveURL(/\/uk\/checkout/);
  await expect(page.getByRole('button', { name: 'Place order' })).toBeVisible();
  await expect(page.getByText(/£\d+\.\d{2}/).first()).toBeVisible();
});

// 8. Place order clears basket and shows confirmation
test('placing an order shows confirmation and clears basket', async ({ page }) => {
  await page.goto('/uk');
  await page.getByRole('button', { name: /add .+ to basket/i }).first().click();
  await page.goto('/uk/checkout');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByText('Order placed!')).toBeVisible();
  // Badge should be gone (basket cleared)
  await expect(page.getByRole('button', { name: /open basket, \d+ item/i })).not.toBeVisible();
});

// 9. Locale switcher switches from UK to US preserving basket
test('switching locale from UK to US updates prices and keeps basket', async ({ page }) => {
  await page.goto('/uk');
  await page.getByRole('button', { name: /add .+ to basket/i }).first().click();
  // Switch to US via the locale pill (use getByLabel to avoid fragility from role overrides)
  await page.getByLabel(/switch to united states/i).click();
  await expect(page).toHaveURL(/\/us/);
  // Basket count still shows 1
  await expect(page.getByRole('button', { name: /open basket, 1 item/i })).toBeVisible();
  // Prices now in USD
  await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
});

// 10. Invalid locale redirects to 404 (not found)
test('invalid locale returns a not-found page', async ({ page }) => {
  const response = await page.goto('/zz');
  expect(response?.status()).toBe(404);
});
