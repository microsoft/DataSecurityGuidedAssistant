import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('guidedLabelingAnalyticsConsent', 'denied');
  });
});

test('completes a representative labeling workflow without browser errors', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') {
      browserErrors.push(message.text());
    }
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Data Security Guided Assistant' })).toBeVisible();

  await openLabelingSetup(page);
  await expect(page.getByRole('heading', { name: 'Tell us about your labeling context' })).toBeVisible();

  await page.locator('#industrySelect').selectOption('education');
  await expect(page.locator('#startFlowButton')).toBeEnabled();
  await page.locator('#startFlowButton').click();

  await expect(page.locator('#activeQuestionHeading')).toBeVisible();
  await page.locator('#question .choice-yes').click();

  await expect(page.locator('#question')).toContainText('Decision flow complete.');
  await expect(page.locator('#result .label-badge')).toContainText('Public');
  expect(browserErrors).toEqual([]);
});

test('has no serious or critical accessibility violations in the primary flow', async ({ page }) => {
  await page.goto('/');

  const landingResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(landingResults.violations.filter(isBlockingViolation)).toEqual([]);

  await openLabelingSetup(page);

  const setupResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(setupResults.violations.filter(isBlockingViolation)).toEqual([]);

  await page.locator('#industrySelect').selectOption('education');
  await page.locator('#startFlowButton').click();

  const flowResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(flowResults.violations.filter(isBlockingViolation)).toEqual([]);
});

function isBlockingViolation(violation) {
  return violation.impact === 'serious' || violation.impact === 'critical';
}

async function openLabelingSetup(page) {
  await page.getByRole('button', { name: 'Start Labeling tool' }).click();
  await expect(page.getByRole('dialog', { name: 'Before you start the Labeling tool' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to setup' }).click();
}
