#!/usr/bin/env node
// Copy a concept build into a deploy folder at /<slug>/, with only what the page needs, and mark it noindex.
//   node prepare-concept.mjs <build-folder> <deploy-root> <slug> [--studio "Your Studio"]
// Copies index.html, top-level .js/.css/.woff2 files and assets/ (and fonts/ if present). Never the brief, scores, notes or screenshots.
// Adds the concept vercel.json, a plain root page and robots.txt to the deploy root when they are missing. Deletes nothing.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from './lib/browser.mjs';

const { flags, pos } = parseArgs();
const [build, root, slug] = pos;
if (!build || !root || !slug) { console.log('usage: node prepare-concept.mjs <build-folder> <deploy-root> <slug> [--studio "Your Studio"]'); process.exit(1); }
if (!/^[a-z0-9-]+$/.test(slug)) { console.log('slug must be lowercase letters, digits and hyphens'); process.exit(1); }
const templates = join(dirname(fileURLToPath(import.meta.url)), '..', 'templates');
const dest = join(root, slug);
mkdirSync(dest, { recursive: true });

const copied = [];
for (const f of readdirSync(build)) {
  const p = join(build, f), st = statSync(p);
  if (st.isFile() && (f === 'index.html' || ['.js', '.css', '.woff2', '.woff', '.ico', '.webmanifest'].includes(extname(f)))) { cpSync(p, join(dest, f)); copied.push(f); }
  if (st.isDirectory() && ['assets', 'fonts'].includes(f)) { cpSync(p, join(dest, f), { recursive: true }); copied.push(f + '/'); }
}
if (!copied.includes('index.html')) { console.log(`no index.html in ${build}`); process.exit(1); }

let html = readFileSync(join(dest, 'index.html'), 'utf8');
if (!/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html)) {
  html = html.replace(/<head([^>]*)>/i, `<head$1>\n<meta name="robots" content="noindex">`);
  writeFileSync(join(dest, 'index.html'), html);
  console.log('added <meta name="robots" content="noindex">');
}
const warnings = [];
if (!/not affiliated/i.test(html)) warnings.push('the page has no visible "Concept by ... Not affiliated with ..." line. Add it before deploying.');
if (/—/.test(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ''))) warnings.push('the page copy contains an em dash.');

const studio = flags.studio || 'the studio';
const addIfMissing = (name, from, transform = s => s) => {
  const target = join(root, name);
  if (existsSync(target)) return;
  writeFileSync(target, transform(readFileSync(join(templates, from), 'utf8')));
  console.log(`added ${name} to the deploy root`);
};
addIfMissing('vercel.json', 'concept-vercel.json');
addIfMissing('index.html', 'concept-index.html', s => s.replaceAll('{{STUDIO}}', studio));
addIfMissing('robots.txt', 'concept-robots.txt');

console.log(`copied to ${dest}: ${copied.join(', ')}`);
for (const w of warnings) console.log('WARNING: ' + w);
console.log(`\nNext (only with the user's yes for this site):\n  cd "${root}" && vercel deploy --prod --yes\n  curl -sI https://<project>.vercel.app/${slug}/ | grep -i x-robots-tag`);
