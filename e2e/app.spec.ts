import { test, expect } from '@playwright/test';

test('scoring basic hand works', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('edit-player-1').click();
  await page.getByTestId('number-card-3').click();
  await page.getByTestId('number-card-5').click();
  await page.getByTestId('number-card-11').click();
  await expect(page.getByTestId('round-score-preview')).toHaveText('19');

  await page.getByTestId('x2-toggle').click();
  await expect(page.getByTestId('round-score-preview')).toHaveText('38');
  await page.getByTestId('save-player-round').click();

  await expect(page.getByTestId('round-preview-1')).toHaveText('+38');
  await page.getByTestId('finalize-round').click();

  await expect(page.getByTestId('player-total-1')).toHaveText('38');
  await expect(page.locator('text=Round 1')).toBeVisible();
  await expect(page.locator('text=+38 -> 38')).toBeVisible();
});

test('bust sets score to 0', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('edit-player-2').click();
  await page.getByTestId('number-card-10').click();
  await page.getByTestId('bust-toggle').click();
  await expect(page.getByTestId('round-score-preview')).toHaveText('0');

  await page.getByTestId('save-player-round').click();
  await page.getByTestId('finalize-round').click();

  await expect(page.getByTestId('player-total-2')).toHaveText('0');
  await expect(page.locator('text=0 -> 0 (Busted)')).toBeVisible();
});
