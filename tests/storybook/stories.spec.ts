import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

type StoryEntry = Readonly<{ id: string; title: string; name: string; type: string }>;
type SmokeParameters = Readonly<{
  text?: string;
  svg?: boolean;
  logo?: boolean;
  board?: boolean;
  disabled?: boolean;
  checked?: boolean;
  selection?: boolean;
  readOnly?: boolean;
  promotion?: boolean;
  interactive?: boolean;
}>;

const index = JSON.parse(readFileSync(resolve('storybook-static/index.json'), 'utf8')) as {
  entries: Record<string, StoryEntry>;
};
const stories = Object.values(index.entries).filter((entry) => entry.type === 'story');

for (const entry of stories) {
  test(`1. ${entry.title} — ${entry.name} affiche son état réel`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    page.on('requestfailed', (request) => {
      errors.push(`${request.url()} : ${request.failure()?.errorText}`);
    });
    await page.goto(`/iframe.html?id=${entry.id}&viewMode=story`);
    await expect(page.locator('#storybook-root > *').first()).toBeAttached();
    const smoke = await page.evaluate(async (storyId) => {
      const preview = (
        window as unknown as {
          __STORYBOOK_PREVIEW__: {
            storyStore: {
              loadStory: (options: { storyId: string }) => Promise<{
                parameters: { smoke?: SmokeParameters };
              }>;
            };
          };
        }
      ).__STORYBOOK_PREVIEW__;
      const story = await preview.storyStore.loadStory({ storyId });
      return story.parameters.smoke ?? {};
    }, entry.id);

    expect(Object.keys(smoke).length, 'La story doit déclarer une preuve de rendu').toBeGreaterThan(
      0,
    );
    if (smoke.text) {
      await expect(page.getByText(smoke.text, { exact: false }).first()).toBeVisible();
    }
    if (smoke.svg) {
      expect(await page.locator('svg').count()).toBeGreaterThan(0);
      await expect(page.locator('svg').first()).toBeVisible();
    }
    if (smoke.logo) {
      await expect(page.getByRole('img', { name: 'Logo Chess69' }).first()).toBeVisible();
      await expect
        .poll(async () => {
          return page.locator('img').evaluateAll((images) => {
            return images.some(
              (image) =>
                image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
            );
          });
        })
        .toBe(true);
    }
    if (smoke.disabled) {
      await expect(page.getByRole('button')).toBeDisabled();
    }
    if (smoke.checked) {
      // RNW 0.21 does not translate React Native accessibilityState.checked.
      // Verify the selected visual state; TalkBack state is checked on the native APK.
      await expect(page.getByRole('radio')).toHaveCSS('background-color', 'rgb(255, 159, 67)');
    }
    if (smoke.board) {
      await expect(page.getByRole('button', { name: /^[a-h][1-8],/ })).toHaveCount(64);
    }
    if (smoke.selection) {
      await expect(page.getByRole('button', { name: /^e2,/ })).toHaveCSS(
        'background-color',
        'rgb(255, 159, 67)',
      );
      await expect(page.getByRole('button', { name: /^e4,/ })).toHaveAccessibleName(
        /coup possible/,
      );
    }
    if (smoke.readOnly) {
      await expect(page.getByRole('button', { name: /^e2,/ })).toBeDisabled();
    }
    if (smoke.promotion) {
      await expect(page.getByRole('button', { name: 'Dame', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Annuler', exact: true }).click();
      await expect(page.getByText('Promouvoir le pion')).not.toBeVisible();
      await expect(page.getByText('Aucun coup transmis')).toBeVisible();
      await page.getByRole('button', { name: /^a8,/ }).click();
      await page.getByRole('button', { name: 'Cavalier', exact: true }).click();
      await expect(page.getByText('Coups transmis : a7a8n')).toBeVisible();
      await expect(page.getByText('Promouvoir le pion')).not.toBeVisible();
    }
    if (smoke.interactive) {
      await page.getByRole('button', { name: /^e2,/ }).click();
      await expect(page.getByRole('button', { name: /^e4,/ })).toHaveAccessibleName(
        /coup possible/,
      );
      await page.getByRole('button', { name: /^e4,/ }).click();
      await expect(page.getByText('Coups transmis : e2e4')).toBeVisible();
    }
    expect(errors, 'Aucune erreur de script, de rendu ou de ressource').toEqual([]);
  });
}

test('2. Les écrans et la promotion restent lisibles aux largeurs 412 et 480 px', async ({
  page,
}) => {
  const captures = [
    { id: 'business-homescreen--first-launch', text: 'Bienvenue à l’échiquier' },
    { id: 'business-applicationshell--error', text: 'Le moteur ne répond pas' },
    { id: 'business-chessboard--promotion', text: 'Promouvoir le pion' },
    { id: 'business-analysisscreen--partial', text: 'Continuer l’analyse' },
  ];
  for (const width of [412, 480]) {
    await page.setViewportSize({ width, height: 915 });
    for (const capture of captures) {
      expect(stories.some((entry) => entry.id === capture.id)).toBe(true);
      await page.goto(`/iframe.html?id=${capture.id}&viewMode=story`);
      await expect(page.getByText(capture.text, { exact: false }).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      await page.screenshot({
        path: `artifacts/cu-archi-stories/${capture.id}-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    }
  }
});
