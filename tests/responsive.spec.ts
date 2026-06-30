import { test, expect } from '@playwright/test';

const PAGE = '/';

test.describe('Sem overflow horizontal', () => {
  test('não há scroll lateral', async ({ page }) => {
    await page.goto(PAGE);
    await page.waitForLoadState('load');
    const hasOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
  });
});

test.describe('Touch targets ≥ 44px', () => {
  test('botões e links de ação têm alvo suficiente', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'só em coarse pointer');
    await page.goto(PAGE);
    // CSS é inline mas as fonts vêm de CDN — espera load + fonts antes de medir,
    // senão as métricas de layout flutuam sob carga paralela
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts.ready);
    const violations = await page.$$eval(
      'button, a.btn-primary, a.btn-secondary, a.wa-btn, .drawer-link',
      els => els.filter(el => {
        const r = el.getBoundingClientRect();
        // Ignora elementos hidden (display:none retorna rect 0×0)
        if (r.width === 0 && r.height === 0) return false;
        // tolerância de subpixel
        return r.width < 43.5 || r.height < 43.5;
      }).map(el => ({ tag: el.tagName, text: el.textContent?.trim().slice(0, 40) }))
    );
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
});

test.describe('Imagens com width/height', () => {
  test('toda <img> tem atributos de dimensão', async ({ page }) => {
    await page.goto(PAGE);
    const sem = await page.$$eval('img', imgs =>
      imgs
        .filter(i => !i.hasAttribute('width') || !i.hasAttribute('height'))
        .map(i => i.src)
    );
    expect(sem).toEqual([]);
  });
});

test.describe('Hamburger menu', () => {
  // Hamburger aparece apenas em viewports ≤768px CSS.
  // Checamos isVisible() após goto para garantir viewport já aplicado.

  test('aparece em mobile e abre drawer', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'só em mobile');
    await page.goto(PAGE);
    const hamburger = page.locator('#nav-hamburger');
    const visible = await hamburger.isVisible();
    test.skip(!visible, 'hamburger não visível neste viewport (>768px)');
    await hamburger.click();
    await expect(page.locator('#nav-drawer')).toHaveClass(/is-open/);
  });

  test('drawer fecha ao clicar em link', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'só em mobile');
    await page.goto(PAGE);
    const hamburger = page.locator('#nav-hamburger');
    const visible = await hamburger.isVisible();
    test.skip(!visible, 'hamburger não visível neste viewport (>768px)');
    await hamburger.click();
    await expect(page.locator('#nav-drawer')).toHaveClass(/is-open/);
    await page.locator('.drawer-link').first().click();
    await expect(page.locator('#nav-drawer')).not.toHaveClass(/is-open/);
  });

  test('drawer fecha com Escape', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'só em mobile');
    await page.goto(PAGE);
    const hamburger = page.locator('#nav-hamburger');
    const visible = await hamburger.isVisible();
    test.skip(!visible, 'hamburger não visível neste viewport (>768px)');
    await hamburger.click();
    await expect(page.locator('#nav-drawer')).toHaveClass(/is-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#nav-drawer')).not.toHaveClass(/is-open/);
  });
});

test.describe('Semântica HTML', () => {
  test('tem header, main e footer', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('header')).toBeAttached();
    await expect(page.locator('main')).toBeAttached();
    await expect(page.locator('footer')).toBeAttached();
  });
});

test.describe('Hero acima do fold', () => {
  test('hero image não tem loading=lazy', async ({ page }) => {
    await page.goto(PAGE);
    const heroImg = page.locator('.hero-photo img');
    const loading = await heroImg.getAttribute('loading');
    expect(loading).not.toBe('lazy');
  });
});

test.describe('Foco visível', () => {
  test('Tab mostra foco no primeiro elemento interativo', async ({ page }) => {
    await page.goto(PAGE);
    await page.keyboard.press('Tab');
    const hasFocus = await page.evaluate(() =>
      !!document.activeElement && document.activeElement !== document.body
    );
    expect(hasFocus).toBe(true);
  });
});

test.describe('Snapshot visual', () => {
  test('hero visível acima do fold', async ({ page }) => {
    await page.goto(PAGE);
    await page.waitForLoadState('load');
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('.hero-h1')).toBeVisible();
  });

  test('nav visível em desktop', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'só desktop');
    await page.goto(PAGE);
    await expect(page.locator('.nav-links')).toBeVisible();
    await expect(page.locator('.nav-cta')).toBeVisible();
  });
});
