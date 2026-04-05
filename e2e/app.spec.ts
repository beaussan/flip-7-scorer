import { test, expect } from '@playwright/test';

test('scoring basic hand works', async ({ page }) => {
  await page.goto('/');

  // Create a new player
  await page.fill('input[placeholder="New Player Name"]', 'Alice');
  // Actually, let's just click the button next to the input
  await page.click('input[placeholder="New Player Name"] + button');

  // Verify Player 1 is there and click their play button
  const p1Play = page.locator('text=Player 1').locator('..').locator('button');
  await p1Play.first().click();

  // Click numbers: 3, 5, 11
  await page.click('button:has-text("3")');
  await page.click('button:has-text("5")');
  await page.click('button:has-text("11")');

  // Verify live score is 19
  await expect(page.locator('text=Round Score:').locator('..').locator('span').nth(1)).toHaveText('19');

  // Add x2
  await page.click('button:has-text("×2")');
  await expect(page.locator('text=Round Score:').locator('..').locator('span').nth(1)).toHaveText('38');

  // Confirm score
  await page.click('button:has-text("Confirm Score")');

  // Verify Player 1's score is now 38
  await expect(page.locator('text=Player 1').locator('..').locator('span.text-yellow-400')).toHaveText('38');
});

test('bust sets score to 0', async ({ page }) => {
  await page.goto('/');
  const p2Play = page.locator('text=Player 2').locator('..').locator('button');
  await p2Play.first().click();

  await page.click('button:has-text("10")');
  await page.click('button:has-text("Did Player Bust?")');
  await expect(page.locator('text=Round Score:').locator('..').locator('span').nth(1)).toHaveText('0');

  await page.click('button:has-text("Confirm Score")');
  await expect(page.locator('text=Player 2').locator('..').locator('span.text-yellow-400')).toHaveText('0');
});
