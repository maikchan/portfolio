import { test, expect } from '@playwright/test';

const corePages = ['/', '/work/', '/services/', '/about/', '/work/social-media-creative/'];

test.describe('Core routes', () => {
  for (const path of corePages) {
    test(`${path} loads without horizontal overflow`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      await expect(page.locator('main')).toBeVisible();
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      expect(overflow).toBe(false);
    });
  }
});

test('Home communicates the new positioning and loads selected work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Turn ideas into films.');
  await expect(page.getByText('DIRECTOR & FILMMAKER', { exact: true })).toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(3);
});

test('Work includes all six Vimeo projects and filters them', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.locator('.project-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Campaigns' }).click();
  await expect(page.locator('.project-card:not([hidden])')).toHaveCount(1);
  await expect(page.locator('[data-work-count]')).toHaveText('1 project');
});

test('Project card descriptions work with focus', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'Desktop focus behavior');
  await page.goto('/work/');
  const link = page.locator('.project-card__link').first();
  await link.focus();
  await expect(link.locator('.project-card__overlay')).toHaveCSS('opacity', '1');
});

test('Project card descriptions have a touch equivalent', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile details behavior');
  await page.goto('/work/');
  const details = page.locator('.project-card__details').first();
  await expect(details).toBeVisible();
  await details.locator('summary').click();
  await expect(details.locator('p')).toBeVisible();
});

test('Mobile menu opens, closes and exposes all main links', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile menu behavior');
  await page.goto('/');
  await page.getByRole('link', { name: /English.*Explore in English/i }).click();
  const button = page.getByRole('button', { name: 'Open menu' });
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-menu]')).toHaveClass(/is-open/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
});

test('Case pages render verified role and capabilities', async ({ page }) => {
  await page.goto('/work/social-media-creative/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SOCIAL MEDIA CREATIVE');
  await expect(page.getByRole('heading', { name: 'Role' })).toBeVisible();
  await expect(page.getByText('Direction, Performance Direction, Cinematography and Post-Production')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play Social Media Creative' })).toBeVisible();
});

test('All images declare intrinsic dimensions', async ({ page }) => {
  for (const path of corePages) {
    await page.goto(path);
    const missing = await page.$$eval('img', (images) => images
      .filter((image) => !image.hasAttribute('width') || !image.hasAttribute('height'))
      .map((image) => image.src));
    expect(missing).toEqual([]);
  }
});

test('About page preserves the approved closing line', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByText('The idea comes first. My job is to find the best way to bring it to the screen.')).toBeVisible();
});
