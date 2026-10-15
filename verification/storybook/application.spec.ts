import { expect, test } from '@playwright/test';

const pages = [
  {
    story: 'home',
    text: 'À vous de jouer.',
    destination: 'Accueil',
    nested: false,
    board: false,
  },
  {
    story: 'openings',
    text: 'Partie italienne',
    destination: 'Apprendre',
    nested: false,
    board: false,
  },
  { story: 'opening', text: 'Giuoco Piano', destination: 'Apprendre', nested: true, board: false },
  {
    story: 'exercise',
    text: 'Trait aux blancs',
    destination: 'Apprendre',
    nested: true,
    board: true,
  },
  {
    story: 'play',
    text: 'Commencer une partie',
    destination: 'Jouer',
    nested: false,
    board: false,
  },
  { story: 'game', text: 'À vous de jouer', destination: 'Jouer', nested: true, board: true },
  { story: 'history', text: 'Revoir la partie', destination: 'Jouer', nested: true, board: false },
  {
    story: 'analysis',
    text: 'Continuer l’analyse',
    destination: 'Jouer',
    nested: true,
    board: true,
  },
  {
    story: 'progress',
    text: 'Votre progression',
    destination: 'Progression',
    nested: false,
    board: false,
  },
];

for (const width of [360, 412, 480]) {
  for (const entry of pages) {
    test(`Page ${entry.story} : shell et contenu à ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 915 });
      await page.goto(
        `/iframe.html?id=business-pages-application--${entry.story}&viewMode=story&globals=catalogueWidth:${width}`,
      );
      const frame = page.getByTestId('storybook-application-frame');
      await expect(frame).toBeVisible();
      await expect(page.getByText(entry.text, { exact: false }).first()).toBeVisible();
      const navigation = page.getByRole('tablist');
      await expect(navigation.getByRole('tab')).toHaveCount(4);
      const selected = navigation.getByRole('tab', { name: entry.destination, exact: true });
      await expect(selected).toHaveCSS('background-color', 'rgb(53, 67, 50)');
      await expect(
        selected.getByText(entry.destination === 'Progression' ? 'Progrès' : entry.destination, {
          exact: true,
        }),
      ).toHaveCSS('color', 'rgb(182, 199, 168)');
      await expect(page.getByRole('button', { name: 'Retour', exact: true })).toHaveCount(
        entry.nested ? 1 : 0,
      );
      expect((await navigation.boundingBox())!.y).toBeGreaterThanOrEqual(810);
      expect((await frame.boundingBox())!.width).toBe(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if (entry.board) {
        const squares = page.getByRole('button', { name: /^[a-h][1-8],/ });
        await expect(squares).toHaveCount(64);
        const first = (await squares.first().boundingBox())!;
        expect(Math.abs(first.width - first.height)).toBeLessThan(1);
        expect(first.width).toBeGreaterThan(40);
      }
    });
  }
}

test('Le contenu défile dans le shell ; la navigation reste au bas de la fenêtre', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto(
    '/iframe.html?id=business-pages-application--first-launch&viewMode=story&globals=catalogueWidth:360',
  );
  const navigation = page.getByRole('tablist');
  await expect(navigation).toBeVisible();
  const before = (await navigation.boundingBox())!;
  const last = page.getByRole('button', { name: 'Comprendre', exact: true });
  await last.scrollIntoViewIfNeeded();
  const after = (await navigation.boundingBox())!;
  expect(after.y).toBe(before.y);
  expect(after.y + after.height).toBeLessThanOrEqual(640);
  const scrolled = await page.getByTestId('storybook-application-frame').evaluate((frame) => {
    return Array.from(frame.querySelectorAll('*')).some((element) => element.scrollTop > 0);
  });
  expect(scrolled).toBe(true);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('Les pages se cadrent sur ordinateur avec la largeur choisie', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 915 });
  for (const width of [360, 412, 480]) {
    await page.goto(
      `/iframe.html?id=business-pages-application--exercise&viewMode=story&globals=catalogueWidth:${width}`,
    );
    await expect(page.getByText('Trait aux blancs')).toBeVisible();
    const frame = (await page.getByTestId('storybook-application-frame').boundingBox())!;
    expect(frame.width).toBe(width);
    expect(frame.x).toBe((1280 - width) / 2);
    await page.screenshot({
      path: `artifacts/storybook-web/exercise-desktop-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  }
  for (const entry of ['first-launch', 'exercise', 'progress']) {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto(`/iframe.html?id=business-pages-application--${entry}&viewMode=story`);
    await expect(page.getByRole('tablist')).toBeVisible();
    await page.screenshot({
      path: `artifacts/storybook-web/${entry}-412.png`,
      fullPage: true,
      animations: 'disabled',
    });
  }
});
