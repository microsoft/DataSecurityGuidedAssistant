import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

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

  await expect(page.locator('#result .label-badge')).toContainText('Public');
  await expect(page.locator('#result .result-summary')).toContainText('The content is approved for unrestricted external use.');
  expect(await page.evaluate(() => ({
    labelName: state.sessionLog[0].labelName,
    rationale: state.sessionLog[0].rationale
  }))).toEqual({
    labelName: 'Public',
    rationale: 'The content is approved for unrestricted external use.'
  });
  await expect(page.locator('#industry-payload, #rationale-payload, #label-payload, #handler-payload')).toHaveCount(0);
  expect(await page.evaluate(() => window.__importPwned === 1)).toBe(false);
});

test('uses the imported decision path when rebuilding duplicate-label rationale', async ({ page }) => {
  const payload = validImportedSession();
  const generalHistory = [
    { questionId: 'q1', question: 'untrusted', answer: 'NO' },
    { questionId: 'q2', question: 'untrusted', answer: 'NO' },
    { questionId: 'q3', question: 'untrusted', answer: 'NO' }
  ];
  payload.labelingState.resultKey = 'general';
  payload.labelingState.history = generalHistory;
  payload.sessionLog[0].labelKey = 'general';
  payload.sessionLog[0].history = generalHistory;
  payload.visibleLabelKeys = ['general'];

  await importTestSession(page, payload);

  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  await expect(page.locator('#result .result-summary')).toContainText('Without named people or non-public business data, the content stays at General.');
  await expect(page.locator('#result .result-summary')).not.toContainText('low-risk internal business information');
  expect(await page.evaluate(() => ({
    stateRationale: state.rationale,
    savedRationale: state.sessionLog[0].rationale
  }))).toEqual({
    stateRationale: 'Without named people or non-public business data, the content stays at General.',
    savedRationale: 'Without named people or non-public business data, the content stays at General.'
  });
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

test('rejects inherited label and question property names', async ({ page }) => {
  const inheritedLabel = validImportedSession();
  inheritedLabel.labelingState.resultKey = 'constructor';
  await importTestSession(page, inheritedLabel);
  await expect(page.locator('#appAlertMessage')).toContainText('labelingState.resultKey is invalid');
  await page.locator('#appAlertOkButton').click();

  const inheritedEntryLabel = validImportedSession();
  inheritedEntryLabel.sessionLog[0].labelKey = 'toString';
  await importTestSession(page, inheritedEntryLabel);
  await expect(page.locator('#appAlertMessage')).toContainText('sessionLog[0].labelKey is invalid');
  await page.locator('#appAlertOkButton').click();

  const inheritedQuestion = validImportedSession();
  inheritedQuestion.labelingState.currentQuestionId = 'constructor';
  inheritedQuestion.labelingState.resultKey = null;
  await importTestSession(page, inheritedQuestion);
  await expect(page.locator('#appAlertMessage')).toContainText('labelingState.currentQuestionId is invalid');
  await page.locator('#appAlertOkButton').click();

  const inheritedDlpLabel = validImportedSession();
  inheritedDlpLabel.dlpState = { selectedLabels: ['constructor'] };
  await importTestSession(page, inheritedDlpLabel);
  await expect(page.locator('#appAlertMessage')).toContainText('dlpState.selectedLabels contains an unknown label key');
  await page.locator('#appAlertOkButton').click();

  const inheritedDataType = validImportedSession();
  inheritedDataType.context.dataTypes = ['constructor'];
  await importTestSession(page, inheritedDataType);
  await expect(page.locator('#appAlertMessage')).toContainText('context.dataTypes contains an unknown value');
  await page.locator('#appAlertOkButton').click();

  const inheritedGeography = validImportedSession();
  inheritedGeography.context.orgProfile = { geography: ['constructor'] };
  await importTestSession(page, inheritedGeography);
  await expect(page.locator('#appAlertMessage')).toContainText('context.orgProfile.geography contains an unknown value');
  await page.locator('#appAlertOkButton').click();

  const inheritedSitFamily = validImportedSession();
  inheritedSitFamily.dlpState = {
    posture: {
      enforcement: '',
      sitFamilies: ['constructor'],
      selectedSits: [],
      strictnessOverride: ''
    }
  };
  await importTestSession(page, inheritedSitFamily);
  await expect(page.locator('#appAlertMessage')).toContainText('dlpState.posture.sitFamilies contains an unknown value');
  await page.locator('#appAlertOkButton').click();

  expect(await page.evaluate(() => ({
    countries: getCountryFilterOptionsForGeographies(['constructor']),
    sits: getSitKeysForFamilies(['constructor'])
  }))).toEqual({ countries: [], sits: [] });
});

test('round-trips the emitted encrypted envelope and algorithm', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async payload => {
    const encrypted = await encryptPayload(JSON.stringify(payload), 'correct horse battery staple');
    const envelope = JSON.parse(encrypted);
    envelope.v = 2;
    const plaintext = await decryptPayload(JSON.stringify(envelope), 'correct horse battery staple');
    const sanitized = validateAndSanitizeImportedSession(JSON.parse(plaintext));
    return {
      alg: envelope.alg,
      version: sanitized.version,
      resultKey: sanitized.labelingState.resultKey
    };
  }, validImportedSession());

  expect(result).toEqual({
    alg: 'AES-GCM-256 / PBKDF2-SHA-256 / 310000 iterations',
    version: 2,
    resultKey: 'public'
  });
});

test('imports combined flow context with exported geography arrays', async ({ page }) => {
  const payload = validImportedSession();
  payload.selectedToolFlow = 'both';
  payload.context.orgProfile = {
    geography: ['US', 'EU / EEA'],
    workforce: 'Hybrid',
    deviceModel: 'Mix',
    contractors: 'Yes'
  };
  payload.sessionLog[0].contextSnapshot.orgProfile = structuredClone(payload.context.orgProfile);

  await importTestSession(page, payload);

  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  const imported = await page.evaluate(() => ({
    selectedToolFlow: state.selectedToolFlow,
    geography: state.context.orgProfile.geography
  }));
  expect(imported).toEqual({
    selectedToolFlow: 'both',
    geography: ['US', 'EU / EEA']
  });
});

test('validates 4-tier DLP labels against the imported model', async ({ page }) => {
  await page.goto('/');
  const payload = validImportedSession();
  payload.context.labelModel = '4tier';
  payload.sessionLog[0].labelModel = '4tier';
  payload.sessionLog[0].contextSnapshot.labelModel = '4tier';
  payload.dlpState = {
    workflowMode: 'quick',
    labelSource: 'pick',
    selectedLabels: ['confidential'],
    configuredLabels: ['highly_confidential'],
    currentStepId: 'g3',
    history: ['g1', 'g2'],
    posture: {
      enforcement: 'balanced',
      sitFamilies: ['personal_ids'],
      selectedSits: ['all_full_names'],
      strictnessOverride: ''
    },
    labelConfigs: {
      confidential: {
        actions: {
          matchAction: 'block_override',
          overrideMode: 'always',
          justifications: ['business_need'],
          otherJustification: '',
          blockActions: ['block_sharing']
        },
        sitConfig: {
          selectedSits: ['all_full_names'],
          customSitType: 'no',
          confidence: 'medium',
          minCount: 2,
          logic: 'or'
        },
        source: 'suggested',
        reasoning: ['Trusted generated rationale']
      }
    },
    derived: null
  };

  const extracted = await page.evaluate(imported => {
    const sanitized = validateAndSanitizeImportedSession(imported);
    return extractLabelKeysFromImportedSession(sanitized);
  }, payload);
  expect(extracted).toEqual(expect.arrayContaining([
    'confidential_all',
    'confidential_specific',
    'confidential_exception'
  ]));

  await importTestSession(page, payload);

  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  const dlpState = await page.evaluate(() => ({
    selectedLabels: state.dlp.selectedLabels,
    configuredLabels: state.dlp.configuredLabels,
    minCount: state.dlp.labelConfigs.confidential.sitConfig.minCount,
    derivedIsObject: !!state.dlp.derived && !Array.isArray(state.dlp.derived)
  }));
  expect(dlpState).toEqual({
    selectedLabels: ['confidential'],
    configuredLabels: ['highly_confidential'],
    minCount: 2,
    derivedIsObject: true
  });
});

test('normalizes license aliases and rejects unknown licenses', async ({ page }) => {
  const aliasPayload = validImportedSession();
  aliasPayload.context.licensing = 'e3';
  aliasPayload.context.licensingLabel = 'untrusted';
  aliasPayload.sessionLog[0].contextSnapshot.licensing = 'e3';
  aliasPayload.sessionLog[0].contextSnapshot.licensingLabel = 'untrusted';

  await importTestSession(page, aliasPayload);
  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  expect(await page.evaluate(() => ({
    licensing: state.context.licensing,
    label: state.context.licensingLabel
  }))).toEqual({
    licensing: 'm365_core',
    label: 'Business Premium / E3'
  });

  await page.goto('/');
  const invalidPayload = validImportedSession();
  invalidPayload.context.licensing = 'not-a-license';
  await importTestSession(page, invalidPayload);
  await expect(page.locator('#appAlertMessage')).toContainText('context.licensing is invalid');
});

test('migrates legacy DLP label selection and validates review focus targets', async ({ page }) => {
  const legacyPayload = validImportedSession();
  legacyPayload.dlpState = { selectedLabelKey: 'public' };

  await importTestSession(page, legacyPayload);
  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  expect(await page.evaluate(() => state.dlp.selectedLabels)).toEqual(['public']);
  const migrated = await page.evaluate(imported => {
    return validateAndSanitizeImportedSession(imported).dlpState.selectedLabels;
  }, legacyPayload);
  expect(migrated).toEqual(['public']);

  await page.goto('/');
  const invalidTarget = validImportedSession();
  invalidTarget.dlpState = { reviewFocusTarget: '"] invalid selector' };
  await importTestSession(page, invalidTarget);
  await expect(page.locator('#appAlertMessage')).toContainText('dlpState.reviewFocusTarget is invalid');
});

test('normalizes saved DLP snapshots for report and CSV consumers', async ({ page }) => {
  const payload = validImportedSession();
  payload.sessionLog[0].dlpEnabled = false;
  payload.sessionLog[0].dlpSummary = {
    policyName: 'Imported policy',
    labelName: 'Public',
    locations: ['Exchange Online'],
    actions: 'Audit only',
    sitSummary: ['Example SIT'],
    limitations: []
  };
  payload.sessionLog[0].dlpConfig = {
    version: 3,
    policy: {
      conditions: {
        sits: [{ label: 'Example SIT' }]
      }
    }
  };

  await importTestSession(page, payload);
  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  const normalized = await page.evaluate(() => {
    const entry = state.sessionLog[0];
    const report = buildLabelReportHtml(false);
    exportCSV();
    return {
      dlpEnabled: entry.dlpEnabled,
      exemptGroups: entry.dlpConfig.policy.exceptions.exemptGroups,
      confidence: entry.dlpConfig.policy.conditions.sits[0].confidence,
      minCount: entry.dlpConfig.policy.conditions.sits[0].minCount,
      reportIncludesPolicy: report.includes('Imported policy')
    };
  });
  expect(normalized).toEqual({
    dlpEnabled: true,
    exemptGroups: [],
    confidence: 'medium',
    minCount: 1,
    reportIncludesPolicy: true
  });

  await page.goto('/');
  const invalidConfidence = validImportedSession();
  invalidConfidence.sessionLog[0].dlpConfig = {
    version: 3,
    policy: {
      conditions: {
        sits: [{ label: 'Example SIT', confidence: 'impossible' }]
      }
    }
  };
  await importTestSession(page, invalidConfidence);
  await expect(page.locator('#appAlertMessage')).toContainText('confidence is invalid');
});

test('rejects unknown imported SIT and deployment keys', async ({ page }) => {
  const labelConfigSit = validImportedSession();
  labelConfigSit.dlpState = {
    labelConfigs: {
      public: {
        sitConfig: { selectedSits: ['constructor'] }
      }
    }
  };
  await importTestSession(page, labelConfigSit);
  await expect(page.locator('#appAlertMessage')).toContainText('dlpState.labelConfigs.public.sitConfig.selectedSits contains an unknown value');
  await page.locator('#appAlertOkButton').click();

  const postureSit = validImportedSession();
  postureSit.dlpState = {
    posture: {
      enforcement: '',
      sitFamilies: [],
      selectedSits: ['constructor'],
      strictnessOverride: ''
    }
  };
  await importTestSession(page, postureSit);
  await expect(page.locator('#appAlertMessage')).toContainText('dlpState.posture.selectedSits contains an unknown value');
  await page.locator('#appAlertOkButton').click();

  const scopeLocation = validImportedSession();
  scopeLocation.dlpState = {
    config: {
      targetScopes: { locations: ['constructor'] }
    }
  };
  await importTestSession(page, scopeLocation);
  await expect(page.locator('#appAlertMessage')).toContainText('dlpState.config.targetScopes.locations contains an unknown value');
  await page.locator('#appAlertOkButton').click();

  const sharedSitConfig = validImportedSession();
  sharedSitConfig.dlpState = {
    config: {
      sitConfig: { selectedSits: ['constructor'] }
    }
  };
  await importTestSession(page, sharedSitConfig);
  await expect(page.locator('#appAlertMessage')).toContainText('dlpState.config.sitConfig.selectedSits contains an unknown value');
  await page.locator('#appAlertOkButton').click();

  const deployment = validImportedSession();
  deployment.context.labelDeployment.rollout = 'constructor';
  await importTestSession(page, deployment);
  await expect(page.locator('#appAlertMessage')).toContainText('context.labelDeployment.rollout is invalid');
  await page.locator('#appAlertOkButton').click();

  expect(await page.evaluate(() => ({
    posture: getSelectedPostureSitKeys({ selectedSits: ['constructor'], sitFamilies: [] }),
    tier: getTierAwareSitKeys('confidential_all', ['constructor'])
  }))).toEqual({
    posture: ['all_full_names'],
    tier: ['all_full_names']
  });
});

test('accepts tool-sized arrays within the bounded import payload', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(payload => {
    payload.sessionLog = Array.from({ length: 201 }, () => structuredClone(payload.sessionLog[0]));
    return validateAndSanitizeImportedSession(payload).sessionLog.length;
  }, validImportedSession());
  expect(result).toBe(201);
});

test('neutralizes spreadsheet formulas in CSV cells', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => [
    sanitizeCsvCell('=cmd|calc'),
    sanitizeCsvCell('+SUM(1,1)'),
    sanitizeCsvCell('-1+1'),
    sanitizeCsvCell('@malicious'),
    sanitizeCsvCell('\tformula'),
    sanitizeCsvCell('safe text')
  ])).toEqual([
    "'=cmd|calc",
    "'+SUM(1,1)",
    "'-1+1",
    "'@malicious",
    "'\tformula",
    'safe text'
  ]);
});

test('neutralizes imported DLP formula values when exporting CSV', async ({ page }) => {
  const payload = validImportedSession();
  payload.sessionLog[0].dlpSummary = {
    policyName: 'Imported policy',
    labelName: 'Public',
    locations: ['Exchange Online'],
    actions: '=HYPERLINK("https://example.test","open")',
    sitSummary: ['Example SIT'],
    overrides: '+Override',
    limitations: ['@Limitation']
  };
  payload.sessionLog[0].rolloutPlan = [{
    phase: '-Pilot',
    start: '2026-10-01',
    end: '2026-10-31',
    criteria: []
  }];

  await importTestSession(page, payload);
  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  await page.evaluate(() => {
    window.__downloadedCsv = '';
    downloadFile = function(filename, content) { window.__downloadedCsv = content; };
    sha256Hex = async function() { return 'testhash'; };
    exportCSV();
  });
  await expect.poll(() => page.evaluate(() => window.__downloadedCsv)).toContain('SHA-256 Integrity Hash,testhash');
  const csv = await page.evaluate(() => window.__downloadedCsv);
  expect(csv).toContain('\'=HYPERLINK');
  expect(csv).toContain('\'+Override');
  expect(csv).toContain('\'-Pilot');
  expect(csv).toContain('\'@Limitation');
});

test('rejects malformed nested DLP state and saved DLP snapshots', async ({ page }) => {
  const malformedPosture = validImportedSession();
  malformedPosture.dlpState = { posture: null };
  await importTestSession(page, malformedPosture);
  await expect(page.locator('#appAlertMessage')).toContainText('dlpState.posture must be an object');
  await page.locator('#appAlertOkButton').click();

  const malformedSummary = validImportedSession();
  malformedSummary.sessionLog[0].dlpSummary = { locations: 'not-an-array' };
  await importTestSession(page, malformedSummary);
  await expect(page.locator('#appAlertMessage')).toContainText('dlpSummary.locations must be an array');
  await page.locator('#appAlertOkButton').click();

  const malformedRollout = validImportedSession();
  malformedRollout.sessionLog[0].rolloutPlan = [null];
  await importTestSession(page, malformedRollout);
  await expect(page.locator('#appAlertMessage')).toContainText('rolloutPlan[0] must be an object');
});

test('sanitizes unfinished decision history and clears imported rationale', async ({ page }) => {
  const payload = validImportedSession();
  payload.labelingState.currentQuestionId = 'q2';
  payload.labelingState.resultKey = null;
  payload.labelingState.rationale = '<img src=x onerror="window.__historyPwned=1">';
  payload.labelingState.history = [{
    questionId: 'q1',
    question: '<svg onload="window.__historyPwned=1"></svg>',
    answer: 'NO'
  }];

  await importTestSession(page, payload);

  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  const imported = await page.evaluate(() => ({
    currentQuestionId: state.currentQuestionId,
    question: state.history[0].question,
    rationale: state.rationale,
    pwned: window.__historyPwned === 1
  }));
  expect(imported).toEqual({
    currentQuestionId: 'q2',
    question: 'Is this content approved for unrestricted external sharing?',
    rationale: '',
    pwned: false
  });
});

test('derives rationale from the imported terminal decision path', async ({ page }) => {
  await page.goto('/?testMode=true');
  const payload = validImportedSession();
  payload.labelingState.resultKey = 'general';
  payload.labelingState.history = [
    { questionId: 'q1', question: 'untrusted', answer: 'NO' },
    { questionId: 'q2', question: 'untrusted', answer: 'NO' },
    { questionId: 'q3', question: 'untrusted', answer: 'NO' }
  ];
  payload.sessionLog[0].labelKey = 'general';
  payload.sessionLog[0].history = structuredClone(payload.labelingState.history);
  payload.labelingState.currentQuestionId = 'q2';

  await importTestSession(page, payload);
  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  expect(await page.evaluate(() => ({
    currentQuestionId: state.currentQuestionId,
    rationale: state.rationale,
    savedRationale: state.sessionLog[0].rationale
  }))).toEqual({
    currentQuestionId: null,
    rationale: 'Without named people or non-public business data, the content stays at General.',
    savedRationale: 'Without named people or non-public business data, the content stays at General.'
  });
});

test('rejects unknown regulations and DLP location keys', async ({ page }) => {
  await page.goto('/');
  const contextRegulation = validImportedSession();
  contextRegulation.context.regulations = ['fake_regulation'];
  await importTestSession(page, contextRegulation);
  await expectImportError(page, 'context.regulations contains an unknown value');

  const entryRegulation = validImportedSession();
  entryRegulation.sessionLog[0].regulations = ['constructor'];
  await importTestSession(page, entryRegulation);
  await expectImportError(page, 'sessionLog[0].regulations contains an unknown value');

  const location = validImportedSession();
  location.dlpState = {
    config: {
      targetScopes: {
        locations: ['constructor']
      }
    }
  };
  await importTestSession(page, location);
  await expectImportError(page, 'dlpState.config.targetScopes.locations contains an unknown value');

  const countryFilter = validImportedSession();
  countryFilter.context.regulationCountryFilter = 'constructor';
  await importTestSession(page, countryFilter);
  await expectImportError(page, 'context.regulationCountryFilter is invalid');

  const snapshotLocation = validImportedSession();
  snapshotLocation.sessionLog[0].dlpConfig = {
    version: 3,
    policy: {
      locationKeys: ['constructor']
    }
  };
  await importTestSession(page, snapshotLocation);
  await expectImportError(page, 'sessionLog[0].dlpConfig.policy.locationKeys contains an unknown value');
});

test('normalizes emitted label policy SITs for report consumers', async ({ page }) => {
  await page.goto('/');
  const payload = validImportedSession();
  payload.sessionLog[0].dlpSummary = {
    policyName: 'Label policy export',
    labelName: 'Public',
    locations: [],
    actions: 'Audit only',
    sitSummary: [],
    limitations: []
  };
  payload.sessionLog[0].dlpConfig = {
    version: 3,
    policy: {
      labelPolicies: [{
        labelKey: 'public',
        conditions: {
          sits: [{ key: 'all_full_names', label: 'All Full Names', confidence: 'HIGH', minCount: 2 }]
        }
      }]
    }
  };

  await importTestSession(page, payload);
  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  const result = await page.evaluate(() => {
    const sits = state.sessionLog[0].dlpConfig.policy.conditions.sits;
    return {
      sits,
      reportContainsSit: buildLabelReportHtml(false).includes('All Full Names (HIGH, min 2)')
    };
  });
  expect(result).toEqual({
    sits: [{
      key: 'all_full_names',
      label: 'All Full Names',
      confidence: 'high',
      minCount: 2
    }],
    reportContainsSit: true
  });
});

test('deduplicates validated SITs across imported label policies', async ({ page }) => {
  await page.goto('/');
  const payload = validImportedSession();
  const sit = { key: 'all_full_names', label: 'All Full Names', confidence: 'HIGH', minCount: 2 };
  payload.sessionLog[0].dlpConfig = {
    version: 3,
    policy: {
      labelPolicies: [
        { labelKey: 'public', conditions: { sits: [sit] } },
        { labelKey: 'general', conditions: { sits: [sit] } }
      ]
    }
  };

  await importTestSession(page, payload);
  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  expect(await page.evaluate(() => state.sessionLog[0].dlpConfig.policy.conditions.sits)).toEqual([{
    key: 'all_full_names',
    label: 'All Full Names',
    confidence: 'high',
    minCount: 2
  }]);
});

test('rejects unknown SIT keys in imported policy snapshots', async ({ page }) => {
  await page.goto('/');
  const payload = validImportedSession();
  payload.sessionLog[0].dlpConfig = {
    version: 3,
    policy: {
      conditions: {
        sits: [{ key: 'constructor', label: 'Invalid', confidence: 'medium', minCount: 1 }]
      }
    }
  };

  await importTestSession(page, payload);
  await expectImportError(page, 'sessionLog[0].dlpConfig.policy.conditions.sits[0].key is invalid');
});

test('canonicalizes keyed SIT labels and rejects invalid minimum counts', async ({ page }) => {
  await page.goto('/');
  const payload = validImportedSession();
  payload.sessionLog[0].dlpConfig = {
    version: 3,
    policy: {
      conditions: {
        sits: [{ key: 'all_full_names', label: 'Not sensitive', confidence: 'medium', minCount: 2 }]
      }
    }
  };

  await importTestSession(page, payload);
  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  expect(await page.evaluate(() => state.sessionLog[0].dlpConfig.policy.conditions.sits[0].label)).toBe('All Full Names');

  for (const invalidCount of [0, -1, 1.5]) {
    await page.goto('/');
    const invalid = structuredClone(payload);
    invalid.sessionLog[0].dlpConfig.policy.conditions.sits[0].minCount = invalidCount;
    await importTestSession(page, invalid);
    await expectImportError(page, 'sessionLog[0].dlpConfig.policy.conditions.sits[0].minCount is invalid');
  }
});

test('rejects impossible imported session-log decision paths', async ({ page }) => {
  await page.goto('/');
  const payload = validImportedSession();
  payload.sessionLog[0].history = [
    { questionId: 'q1', question: 'untrusted', answer: 'NO' },
    { questionId: 'q3', question: 'untrusted', answer: 'NO' }
  ];
  payload.sessionLog[0].labelKey = 'general';

  await importTestSession(page, payload);
  await expectImportError(page, 'sessionLog[0].history[1].questionId does not follow the decision path');
});

test('derives unfinished current question from validated history', async ({ page }) => {
  await page.goto('/');
  const payload = validImportedSession();
  payload.labelingState = {
    currentQuestionId: 'q3',
    history: [{ questionId: 'q1', question: 'untrusted', answer: 'NO' }],
    resultKey: null,
    rationale: 'untrusted'
  };

  await importTestSession(page, payload);
  await expect(page.locator('#announcer')).toContainText('1 item(s) loaded');
  expect(await page.evaluate(() => state.currentQuestionId)).toBe('q2');
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

test('keeps displayed and package versions synchronized with the changelog', async ({ page }) => {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const packageLock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  expect(packageJson.version).toBe('2.0.1572');
  expect(packageLock.version).toBe('2.0.1572');
  expect(packageLock.packages[''].version).toBe('2.0.1572');

  await page.goto('/');
  await expect(page.locator('#versionBadge')).toHaveText('v2.0.1572');
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
const TEST_SALT = Buffer.from('playwright-import-salt');
const encryptedSessionKeys = new Map();

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

async function expectImportError(page, message) {
  await expect(page.locator('#appAlertMessage')).toContainText(message);
  await page.locator('#appAlertOkButton').click();
}

async function importTestSession(page, payload, passphrase = TEST_PASSPHRASE) {
  if (page.url() === 'about:blank') {
    await page.goto('/');
  }
  if (!await page.getByRole('button', { name: 'Resume labeling session' }).isVisible()) {
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
  const iv = randomBytes(12);
  let key = encryptedSessionKeys.get(passphrase);
  if (!key) {
    key = pbkdf2Sync(passphrase, TEST_SALT, 310000, 32, 'sha256');
    encryptedSessionKeys.set(passphrase, key);
  }
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return Buffer.from(JSON.stringify({
    v: 2,
    alg: 'AES-GCM-256 / PBKDF2-SHA-256 / 310000 iterations',
    salt: TEST_SALT.toString('base64'),
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
