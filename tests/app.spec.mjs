import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('guidedLabelingAnalyticsConsent', 'denied');
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', event => {
      window.__cspViolations.push({
        blockedURI: event.blockedURI,
        directive: event.effectiveDirective
      });
    });
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
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
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
  const payload = validImportedSession();
  payload.context.industryLabel = '<img id="industry-payload" src=x onerror="window.__importPwned=1">';
  payload.labelingState.rationale = '<svg id="rationale-payload" onload="window.__importPwned=1"></svg>';
  payload.sessionLog[0].labelName = '<img id="label-payload" src=x onerror="window.__importPwned=1">';
  payload.sessionLog[0].rationale = '<button id="handler-payload" onclick="window.__importPwned=1">click</button>';

  await importTestSession(page, payload);

  await expect(page.locator('#filterChipRow')).toContainText('Education + 8-tier implementation model');
  await expect(page.locator('#result .label-badge')).toContainText('Public');
  await expect(page.locator('#result .result-summary')).toContainText('The content is approved for unrestricted external use.');
  await expect(page.locator('#industry-payload, #rationale-payload, #label-payload, #handler-payload')).toHaveCount(0);
  expect(await page.evaluate(() => window.__importPwned === 1)).toBe(false);
});

test('rejects imported sessions with unknown fields or unsupported versions', async ({ page }) => {
  const unknownFieldPayload = validImportedSession();
  unknownFieldPayload.unexpected = 'not allowed';
  await importTestSession(page, unknownFieldPayload);
  await expect(page.locator('#appAlertMessage')).toContainText('unknown property "unexpected"');
  await page.locator('#appAlertOkButton').click();

  const unsupportedPayload = validImportedSession();
  unsupportedPayload.version = 99;
  await importTestSession(page, unsupportedPayload);
  await expect(page.locator('#appAlertMessage')).toContainText('Unsupported session file version: 99');
});

test('rejects oversized imported session files', async ({ page }) => {
  await openLabelingSetup(page);
  let chooser = await chooseImportFile(page);
  await chooser.setFiles({
    name: 'oversized-session.json',
    mimeType: 'application/json',
    buffer: Buffer.from(' '.repeat((2 * 1024 * 1024) + 1))
  });
  await expect(page.locator('#appAlertMessage')).toContainText('Import file exceeds the 2 MB size limit');
  await page.locator('#appAlertOkButton').click();

  chooser = await chooseImportFile(page);
  await chooser.setFiles({
    name: 'oversized-payload.json',
    mimeType: 'application/json',
    buffer: encryptedSession(`{"version":2,"padding":"${'x'.repeat((1024 * 1024) + 1)}"}`, TEST_PASSPHRASE)
  });
  await submitImportPassphrase(page);
  await expect(page.locator('#appAlertMessage')).toContainText('Import payload exceeds the 1 MB size limit');
});

test('?testMode=true exposes no production test panel', async ({ page }) => {
  await page.goto('/?testMode=true');
  await expect(page.locator('#testModePanel, #testImportBtn, #testStatus')).toHaveCount(0);
});

test('declined analytics and customer-entered values produce no third-party requests', async ({ page }) => {
  const requests = [];
  page.on('request', request => {
    if (!request.url().startsWith('http://127.0.0.1:4173/')) {
      requests.push({ url: request.url(), postData: request.postData() || '' });
    }
  });

  await page.addInitScript(() => {
    localStorage.setItem('guidedLabelingAnalyticsConsent', 'granted');
  });
  const customerValue = 'customer-secret-value@example.test';
  await importTestSession(page, validImportedSession(), customerValue);

  expect(requests).toEqual([]);
  expect(JSON.stringify(requests)).not.toContain(customerValue);
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
});

function isBlockingViolation(violation) {
  return violation.impact === 'serious' || violation.impact === 'critical';
}

async function openLabelingSetup(page) {
  if (page.url() === 'about:blank') {
    await page.goto('/');
  }
  await page.getByRole('button', { name: 'Start Labeling tool' }).click();
  await expect(page.getByRole('dialog', { name: 'Before you start the Labeling tool' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to setup' }).click();
}

const TEST_PASSPHRASE = 'playwright-import-passphrase';

async function chooseImportFile(page) {
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Resume labeling session' }).click();
  return chooserPromise;
}

async function submitImportPassphrase(page, passphrase = TEST_PASSPHRASE) {
  await expect(page.getByRole('alertdialog', { name: 'Decrypt import' })).toBeVisible();
  await page.locator('#appAlertInput').fill(passphrase);
  await page.getByRole('button', { name: 'Decrypt' }).click();
}

async function importTestSession(page, payload, passphrase = TEST_PASSPHRASE) {
  if (page.url() === 'about:blank') {
    await page.goto('/');
    await openLabelingSetup(page);
  }
  const chooser = await chooseImportFile(page);
  await chooser.setFiles({
    name: 'session.enc.json',
    mimeType: 'application/json',
    buffer: encryptedSession(JSON.stringify(payload), passphrase)
  });
  await submitImportPassphrase(page, passphrase);
}

function encryptedSession(plaintext, passphrase) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(passphrase, salt, 310000, 32, 'sha256');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return Buffer.from(JSON.stringify({
    v: 2,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    data: ciphertext.toString('base64')
  }));
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
