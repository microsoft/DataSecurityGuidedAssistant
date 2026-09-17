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

test('imports trusted session keys without rendering imported markup or handlers', async ({ page }) => {
  await page.goto('/?testMode=true');
  const payload = validImportedSession();
  payload.context.industryLabel = '<img id="industry-payload" src=x onerror="window.__importPwned=1">';
  payload.labelingState.rationale = '<svg id="rationale-payload" onload="window.__importPwned=1"></svg>';
  payload.sessionLog[0].labelName = '<img id="label-payload" src=x onerror="window.__importPwned=1">';
  payload.sessionLog[0].rationale = '<button id="handler-payload" onclick="window.__importPwned=1">click</button>';

  await importTestSession(page, payload);

  await expect(page.locator('#testStatus')).toContainText('Loaded: 1 label(s)');
  await expect(page.locator('#filterChipRow')).toContainText('Education + 8-tier implementation model');
  await expect(page.locator('#result .label-badge')).toContainText('Public');
  await expect(page.locator('#result .result-summary')).toContainText('The content is approved for unrestricted external use.');
  await expect(page.locator('#industry-payload, #rationale-payload, #label-payload, #handler-payload')).toHaveCount(0);
  expect(await page.evaluate(() => window.__importPwned === 1)).toBe(false);
});

test('rejects imported sessions with unknown fields or unsupported versions', async ({ page }) => {
  await page.goto('/?testMode=true');
  const unknownFieldPayload = validImportedSession();
  unknownFieldPayload.unexpected = 'not allowed';
  await importTestSession(page, unknownFieldPayload);
  await expect(page.locator('#testStatus')).toContainText('unknown property "unexpected"');

  const unsupportedPayload = validImportedSession();
  unsupportedPayload.version = 99;
  await importTestSession(page, unsupportedPayload);
  await expect(page.locator('#testStatus')).toContainText('Unsupported session file version: 99');
});

test('rejects oversized imported session files', async ({ page }) => {
  await page.goto('/?testMode=true');
  let chooserPromise = page.waitForEvent('filechooser');
  await page.locator('#testImportBtn').click();
  let chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'oversized-session.json',
    mimeType: 'application/json',
    buffer: Buffer.from(' '.repeat((2 * 1024 * 1024) + 1))
  });
  await expect(page.locator('#testStatus')).toContainText('Import file exceeds the 2 MB size limit');

  chooserPromise = page.waitForEvent('filechooser');
  await page.locator('#testImportBtn').click();
  chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'oversized-payload.json',
    mimeType: 'application/json',
    buffer: Buffer.from(`{"version":2,"padding":"${'x'.repeat((1024 * 1024) + 1)}"}`)
  });
  await expect(page.locator('#testStatus')).toContainText('Import payload exceeds the 1 MB size limit');
});

function isBlockingViolation(violation) {
  return violation.impact === 'serious' || violation.impact === 'critical';
}

async function openLabelingSetup(page) {
  await page.getByRole('button', { name: 'Start Labeling tool' }).click();
  await expect(page.getByRole('dialog', { name: 'Before you start the Labeling tool' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to setup' }).click();
}

async function importTestSession(page, payload) {
  const chooserPromise = page.waitForEvent('filechooser');
  await page.locator('#testImportBtn').click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'session.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(payload))
  });
}

function validImportedSession() {
  return {
    version: 2,
    exportedAt: '2026-09-16T00:00:00.000Z',
    context: {
      industry: 'education',
      industryLabel: 'Education',
      dataTypes: [],
      regulations: [],
      manualRegulations: [],
      suppressedRegulations: [],
      regulationCountryFilter: null,
      labelModel: '8tier',
      locked: true,
      labelDeployment: {
        rollout: 'pilot',
        publishingScope: 'regulated_teams',
        mandatory: 'required_for_sensitive',
        defaultLabel: 'secure_by_default',
        autoLabeling: 'recommend',
        reviewCadence: 'quarterly'
      }
    },
    selectedToolFlow: 'labeling',
    labelingState: {
      currentQuestionId: null,
      history: [{ questionId: 'q1', question: 'untrusted', answer: 'YES' }],
      resultKey: 'public',
      rationale: 'untrusted'
    },
    visibleLabelKeys: ['public'],
    hiddenLabelKeys: [],
    sessionLog: [{
      labelKey: 'public',
      labelName: 'Public',
      implementationLabelName: 'Public',
      labelModel: '8tier',
      color: '#107c10',
      rationale: 'untrusted',
      history: [{ questionId: 'q1', question: 'untrusted', answer: 'YES' }],
      regulations: [],
      contextSnapshot: {
        industry: 'education',
        industryLabel: 'Education',
        dataTypes: [],
        regulations: [],
        manualRegulations: [],
        suppressedRegulations: [],
        regulationCountryFilter: null,
        labelModel: '8tier',
        locked: true,
        labelDeployment: {
          rollout: 'pilot',
          publishingScope: 'regulated_teams',
          mandatory: 'required_for_sensitive',
          defaultLabel: 'secure_by_default',
          autoLabeling: 'recommend',
          reviewCadence: 'quarterly'
        }
      },
      dlpEnabled: false,
      dlpSummary: null,
      dlpConfig: null,
      rolloutPlan: []
    }]
  };
}
