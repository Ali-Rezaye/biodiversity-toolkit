#!/usr/bin/env node
// update-site.mjs: keeps the website in step with the tool files.
//
// Run it from the repository folder (the folder that holds index.html):
//   node scripts/update-site.mjs username <your-github-username>
//   node scripts/update-site.mjs comparer v1.17    (after copying the new comparer file into tools/)
//   node scripts/update-site.mjs viewer v50        (after copying the new viewer file into tools/)
//   node scripts/update-site.mjs cleaner v1.2      (after copying the new cleaner file into tools/)
//   node scripts/update-site.mjs doi 10.5281/zenodo.1234567              (once Zenodo gives the DOI)
//   node scripts/update-site.mjs analytics <goatcounter-code>            (turns on visit counting)
//   node scripts/update-site.mjs logger <apps-script-web-app-url>        (turns on the download log)
//
// It edits only the website files listed in SITE_FILES. It never opens or changes a tool file.
// Each tool's version is changed only where that tool's version is marked, so two tools that
// happen to share a version number can never overwrite each other.
// It prints the files it changed, so you know exactly what to upload.

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_FILES = [
  'index.html', 'comparer.html', 'viewer.html', 'cleaner.html', 'cite.html', 'about.html',
  'README.md', 'CITATION.cff', 'tools/comparer.html', 'tools/viewer.html', 'tools/cleaner.html',
];
// A tool that has never been released carries the placeholders <TOOL>-VERSION and <TOOL>-FILETAG
// (for example CLEANER-VERSION); its first run replaces them.
const TOOLS = {
  comparer: {
    name: 'Checklist Comparer', prefix: 'Checklist_comparison_tool-',
    pattern: /^v\d+\.\d+$/, example: 'v1.17', fileTag: v => v.replace(/\./g, '_'),
  },
  viewer: {
    name: 'Phylogenetic Checklist Viewer', prefix: 'Phylogenetic_checklist_viewer-',
    pattern: /^v\d+$/, example: 'v50', fileTag: v => v,
  },
  cleaner: {
    name: 'Checklist Cleaner', prefix: 'Checklist_cleaner-',
    pattern: /^v\d+\.\d+$/, example: 'v1.2', fileTag: v => v.replace(/\./g, '_'),
  },
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

const read = f => readFileSync(join(ROOT, f), 'utf8');
const write = (f, t) => writeFileSync(join(ROOT, f), t, 'utf8');
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function stop(message) { console.error(`\nStopped: ${message}\n`); process.exit(1); }

function applyToSite(edits) {
  for (const f of SITE_FILES) {
    if (!existsSync(join(ROOT, f))) stop(`${f} is missing. Run the script from the repository folder.`);
  }
  const changed = [];
  for (const f of SITE_FILES) {
    const before = read(f);
    let after = before;
    for (const [re, to] of edits) after = after.replace(re, to);
    if (after !== before) { write(f, after); changed.push(f); }
  }
  return changed;
}

function today() {
  const d = new Date();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { iso, words: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` };
}

function siteHas(text) {
  return SITE_FILES.some(f => existsSync(join(ROOT, f)) && read(f).includes(text));
}

const [command, value] = process.argv.slice(2);

if (command === 'username') {
  if (!value || !/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(value)) {
    stop('give your GitHub username, for example:  node scripts/update-site.mjs username alirezaye');
  }
  if (!siteHas('GITHUB-USERNAME')) stop('the username is already set (no GITHUB-USERNAME left in the files).');
  const changed = applyToSite([
    [/GITHUB-USERNAME\.github\.io/g, `${value.toLowerCase()}.github.io`],
    [/GITHUB-USERNAME/g, value],
  ]);
  console.log(`\nUsername set to ${value}. Website address: https://${value.toLowerCase()}.github.io/biodiversity-toolkit/`);
  console.log(`Changed files:\n  ${changed.join('\n  ')}\n`);
} else if (command in TOOLS) {
  const t = TOOLS[command];
  const TOOL = command.toUpperCase();
  if (!value || !t.pattern.test(value)) stop(`give the new version in this form:  node scripts/update-site.mjs ${command} ${t.example}`);

  const redirect = `tools/${command}.html`;
  const page = read(redirect);
  const firstRun = page.includes(`${t.prefix}${TOOL}-FILETAG.html`);
  let oldFile;
  if (firstRun) {
    oldFile = `${TOOL}-FILETAG`;
  } else {
    const match = page.match(new RegExp(`${escapeRe(t.prefix)}(v[0-9_]+)\\.html`));
    if (!match) stop(`could not find the current version in ${redirect}.`);
    oldFile = match[1];
  }
  const newFile = t.fileTag(value);
  if (oldFile === newFile) stop(`the website already shows ${value}.`);

  const newPath = `tools/${t.prefix}${newFile}.html`;
  if (!existsSync(join(ROOT, newPath))) stop(`copy the new file into the tools folder first. Expected: ${newPath}`);

  const kb = Math.max(10, Math.round(statSync(join(ROOT, newPath)).size / 1024 / 10) * 10);
  const date = today();
  const CUR = `(?:v[0-9.]+|${TOOL}-VERSION)`;   // the version as currently written, or the first-run placeholder
  const name = escapeRe(t.name);
  const changed = applyToSite([
    // file names in links, buttons and the stable-link page
    [new RegExp(escapeRe(`${t.prefix}${oldFile}.html`), 'g'), `${t.prefix}${newFile}.html`],
    // marked version text on the pages: <span data-v="tool">v1.2</span>
    [new RegExp(`(<span data-v="${command}">)[^<]*(</span>)`, 'g'), `$1${value}$2`],
    // buttons: data-tool="tool" data-version="v1.2"
    [new RegExp(`(data-tool="${command}" data-version=")[^"]*(")`, 'g'), `$1${value}$2`],
    // file size
    [new RegExp(`(<span data-size="${command}">)[^<]*(</span>)`, 'g'), `$1about ${kb}&nbsp;KB$2`],
    // README: table row and citation
    [new RegExp(`^(\\| ${name} \\|.*\\| )${CUR}( \\| \\[tools/${command}\\.html\\])`, 'm'), `$1${value}$2`],
    [new RegExp(`(\\*${name}\\* \\(Version )${CUR}(\\))`, 'g'), `$1${value}$2`],
    // CITATION.cff: this tool's part of the version line
    [new RegExp(`^(version: "[^"\\n]*\\b${command}-)${CUR}`, 'm'), `$1${value}`],
    // dates
    [/(Last updated <time datetime=")\d{4}-\d{2}-\d{2}(">)[^<]*(<\/time>)/g, `$1${date.iso}$2${date.words}$3`],
    [/^date-released: .*$/m, `date-released: ${date.iso}`],
  ]);
  const leftovers = SITE_FILES.filter(f => read(f).includes(firstRun ? `${TOOL}-VERSION` : `${t.prefix}${oldFile}.html`));
  const tag = (read('CITATION.cff').match(/^version: "([^"]+)"/m) || [])[1] || '(see CITATION.cff)';
  const from = firstRun ? 'first release' : oldFile.replace(/_/g, '.');
  console.log(`\nThe ${command} is now ${value} on the website (${from} -> ${value}; file about ${kb} KB).`);
  console.log(`Changed files:\n  ${changed.join('\n  ')}`);
  if (leftovers.length) console.log(`WARNING: the old version is still named in:\n  ${leftovers.join('\n  ')}`);
  console.log(`Also upload the new tool file:\n  ${newPath}`);
  console.log(`Then make a GitHub release with this tag:\n  ${tag}\n`);
} else if (command === 'doi') {
  if (!value || !/^10\.\d{4,9}\/\S+$/.test(value)) {
    stop('give the DOI without https://doi.org/, for example:  node scripts/update-site.mjs doi 10.5281/zenodo.1234567');
  }
  const url = `https://doi.org/${value}`;
  const changed = applyToSite([
    [/<p class="doi">DOI: [^<]*(?:<a [^>]*>[^<]*<\/a>[^<]*)?<\/p>/g, `<p class="doi">DOI: <a href="${url}">${url}</a> (all versions)</p>`],
    [/^DOI: .*$/m, `DOI: ${url} (all versions)`],
    [/^doi: .*\n/m, ''],
    [/^(version: .*\n)/m, `$1doi: "${value}"\n`],
  ]);
  console.log(`\nDOI set to ${url}`);
  console.log(`Changed files:\n  ${changed.join('\n  ')}\n`);
} else if (command === 'analytics') {
  // Accepts the site code (biodiversity-toolkit) or the whole address (https://biodiversity-toolkit.goatcounter.com).
  const code = (value || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\.goatcounter\.com.*$/, '');
  if (!/^[a-z0-9][a-z0-9-]{1,49}$/.test(code)) {
    stop('give your GoatCounter site code, for example:  node scripts/update-site.mjs analytics biodiversity-toolkit');
  }
  const changed = applyToSite([
    [/https:\/\/(?:GOATCOUNTER-CODE|[a-z0-9-]+)\.goatcounter\.com\/count/g, `https://${code}.goatcounter.com/count`],
  ]);
  if (!changed.length) stop('no counting address found in the pages, or it is already set to this code.');
  console.log(`\nVisit counting set to https://${code}.goatcounter.com`);
  console.log(`Changed files:\n  ${changed.join('\n  ')}\n`);
} else if (command === 'logger') {
  if (!value || !/^https:\/\/script\.google\.com\/(?:a\/macros\/[^/\s]+|macros)\/s\/[\w-]+\/exec$/.test(value)) {
    stop('give the Apps Script web-app URL (it starts with https://script.google.com/ and ends with /exec).');
  }
  const changed = applyToSite([
    [/(var LOGGER = ')(?:APPS-SCRIPT-URL|https:\/\/script\.google\.com\/[^']*)(';)/g, `$1${value}$2`],
  ]);
  if (!changed.length) stop('no download-log address found in the pages, or it is already set to this URL.');
  console.log(`\nDownload log set to ${value}`);
  console.log(`Changed files:\n  ${changed.join('\n  ')}\n`);
} else {
  console.log(`
Usage (run from the repository folder):
  node scripts/update-site.mjs username <your-github-username>
  node scripts/update-site.mjs comparer v1.17
  node scripts/update-site.mjs viewer v50
  node scripts/update-site.mjs cleaner v1.2
  node scripts/update-site.mjs doi 10.5281/zenodo.1234567
  node scripts/update-site.mjs analytics <goatcounter-code>
  node scripts/update-site.mjs logger <apps-script-web-app-url>
`);
}
