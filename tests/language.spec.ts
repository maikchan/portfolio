import { test, expect } from '@playwright/test';

test('First visit asks for a language and remembers the choice', async ({ page }) => {
  await page.goto('/');
  const gate = page.getByRole('dialog');
  await expect(gate).toBeVisible();
  await gate.getByRole('link', { name: /English/i }).click();
  await expect(gate).not.toBeVisible();
  await page.reload();
  await expect(gate).not.toBeVisible();
  await page.locator('.language-switch [data-language-choice="pt"]').click();
  await expect(page).toHaveURL(/\/pt\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ideias que viram filmes.');
});

test('Portuguese work keeps filters and project routes localized', async ({ page }) => {
  await page.goto('/pt/work/');
  await expect(page.locator('.project-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Comerciais' }).click();
  await expect(page.locator('[data-work-count]')).toHaveText('2 projetos');
  await page.locator('.project-card:not([hidden]) .project-card__link').first().click();
  await expect(page).toHaveURL(/\/pt\/work\/beach-creative\/$/);
  await expect(page.getByRole('heading', { name: 'Meu papel' })).toBeVisible();
  await page.locator('.language-switch [data-language-choice="en"]').click();
  await expect(page).toHaveURL(/\/work\/beach-creative\/$/);
});

test('Portuguese layouts fit narrow, tablet and desktop widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/pt/', '/pt/work/', '/pt/services/', '/pt/about/', '/pt/work/social-media-creative/']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(overflow, `${path} at ${width}px`).toBe(false);
    }
  }
});
