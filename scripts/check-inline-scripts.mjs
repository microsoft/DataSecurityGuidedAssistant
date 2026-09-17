import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let inlineScriptCount = 0;
let match;

while ((match = scriptPattern.exec(html)) !== null) {
  const attributes = match[1];
  const source = match[2];
  if (/\bsrc\s*=/.test(attributes)) {
    continue;
  }

  inlineScriptCount += 1;
  try {
    new vm.Script(source, { filename: `index.html:inline-script-${inlineScriptCount}` });
  } catch (error) {
    console.error(`Inline script ${inlineScriptCount} has invalid JavaScript syntax.`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (inlineScriptCount === 0) {
  console.error('No inline scripts were found in index.html.');
  process.exitCode = 1;
} else if (!process.exitCode) {
  console.log(`Validated ${inlineScriptCount} inline script block(s).`);
}
