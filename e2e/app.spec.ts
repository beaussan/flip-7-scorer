import { test, expect } from '@playwright/test';

test('scoring basic hand works', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[placeholder="New player"]', 'Alice');
  await page.getByTestId('add-player-button').click();

  await page.getByTestId('score-player-1').click();
  await page.getByTestId('number-card-3').click();
  await page.getByTestId('number-card-5').click();
  await page.getByTestId('number-card-11').click();
  await expect(page.getByTestId('round-score-preview')).toHaveText('19');

  await page.getByTestId('x2-toggle').click();
  await expect(page.getByTestId('round-score-preview')).toHaveText('38');
  await page.getByTestId('confirm-score').click();

  await expect(page.getByTestId('player-total-1')).toHaveText('38');
  await expect(page.locator('text=Turn 1 - Player 1')).toBeVisible();
  await expect(page.locator('text=Total 38')).toBeVisible();
});

test('bust sets score to 0', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('score-player-2').click();
  await page.getByTestId('number-card-10').click();
  await page.getByTestId('bust-toggle').click();
  await expect(page.getByTestId('round-score-preview')).toHaveText('0');

  await page.getByTestId('confirm-score').click();
  await expect(page.getByTestId('player-total-2')).toHaveText('0');
  await expect(page.locator('text=Turn 1 - Player 2')).toBeVisible();
  await expect(page.locator('text=Busted')).toBeVisible();
});
