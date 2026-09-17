import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const headHtml = html.slice(0, html.indexOf('</head>'));
const stylePattern = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const cspMatch = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)">/i);
let inlineScriptCount = 0;
let match;

if (!cspMatch) {
  console.error('index.html is missing a Content-Security-Policy meta element.');
  process.exitCode = 1;
}

function sourceHash(source) {
  const browserNormalizedSource = source.replace(/\r\n?/g, '\n');
  return `'sha256-${crypto.createHash('sha256').update(browserNormalizedSource, 'utf8').digest('base64')}'`;
}

while ((match = scriptPattern.exec(html)) !== null) {
  const attributes = match[1];
  const source = match[2];
  if (/\bsrc\s*=/.test(attributes)) {
    continue;
  }

  inlineScriptCount += 1;
  if (cspMatch && !cspMatch[1].includes(sourceHash(source))) {
    console.error(`Content-Security-Policy is missing the hash for inline script ${inlineScriptCount}.`);
    process.exitCode = 1;
  }
  try {
    new vm.Script(source, { filename: `index.html:inline-script-${inlineScriptCount}` });
  } catch (error) {
    console.error(`Inline script ${inlineScriptCount} has invalid JavaScript syntax.`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

let inlineStyleCount = 0;
while ((match = stylePattern.exec(headHtml)) !== null) {
  inlineStyleCount += 1;
  if (cspMatch && !cspMatch[1].includes(sourceHash(match[1]))) {
    console.error(`Content-Security-Policy is missing the hash for inline style ${inlineStyleCount}.`);
    process.exitCode = 1;
  }
}

if (inlineScriptCount === 0) {
  console.error('No inline scripts were found in index.html.');
  process.exitCode = 1;
} else if (!process.exitCode) {
  console.log(`Validated ${inlineScriptCount} inline script block(s), ${inlineStyleCount} inline style block(s), and CSP hashes.`);
}
