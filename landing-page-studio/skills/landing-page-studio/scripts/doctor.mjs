#!/usr/bin/env node
// Preflight: what this workflow needs, what is installed, and how to install the rest.
// Never prints a key's value, only whether it is set.
import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir, platform } from 'os';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { chromePath } from './lib/browser.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const skillDir = join(here, '..');
const home = homedir();
const rows = [];
const add = (need, name, ok, detail, fix) => rows.push({ need, name, ok, detail, fix });

const has = cmd => { try { return execSync(`command -v ${cmd}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; } };
const run = cmd => { try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; } };

// Search the installed plugins for a skill folder by name.
function findSkill(name) {
  const roots = [join(home, '.claude', 'plugins'), join(home, '.claude', 'skills'), join(process.cwd(), '.claude', 'skills')];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const hit = run(`find "${root}" -maxdepth 8 -type f -path "*/${name}/SKILL.md" 2>/dev/null | head -1`);
    if (hit) return dirname(hit);
  }
  return '';
}

const major = Number(process.versions.node.split('.')[0]);
add('required', 'Node 18+', major >= 18, process.versions.node, 'Install Node 18 or newer from nodejs.org');

let pw = '';
for (const base of [join(process.cwd(), 'package.json'), join(skillDir, 'package.json')]) {
  try { createRequire(base).resolve('playwright-core'); pw = base.replace(/package\.json$/, ''); break; } catch {}
}
add('required', 'playwright-core', !!pw, pw ? `found from ${pw}` : 'not found', 'npm i playwright-core   (in the build project)');

const chrome = chromePath();
add('required', 'Google Chrome', !!chrome, chrome || 'not found', 'Install Chrome, or set CHROME_PATH to a Chrome/Chromium binary');

const sc = findSkill('scroll-craft');
add('required', 'ScrollCraft skill', !!sc, sc || 'not installed', '/plugin marketplace add nateherkai/scroll-craft  then  /plugin install nateherk-design@nateherk');

add('recommended', '21st.dev key (TWENTYFIRST_API_KEY)', !!process.env.TWENTYFIRST_API_KEY, process.env.TWENTYFIRST_API_KEY ? 'set' : 'not set',
  'Get a key at 21st.dev, then export TWENTYFIRST_API_KEY=... before starting Claude Code (the plugin .mcp.json reads it)');

const unslop = findSkill('unslop');
add('recommended', 'unslop skill (polish pass)', !!unslop, unslop || 'not installed', '/plugin marketplace add heydamir/unslop  then  /plugin install unslop@heydamir');

const seoCli = [join(home, '.claude', 'skills', 'seo', 'scripts', 'claude-seo')].find(existsSync) || (() => {
  const s = findSkill('seo'); return s && existsSync(join(s, 'scripts', 'claude-seo')) ? join(s, 'scripts', 'claude-seo') : '';
})();
add('recommended', 'claude-seo (page and agent checks)', !!seoCli, seoCli || 'not installed', 'Install claude-seo v2.6.2+ from github.com/AgriciDaniel/claude-seo');

const geo = has('geo') || [join(home, '.local', 'bin', 'geo'), join(home, '.local', 'venvs', 'geo-optimizer', 'bin', 'geo'), join(home, '.local', 'pipx', 'venvs', 'geo-optimizer-skill', 'bin', 'geo')].find(existsSync) || '';
add('recommended', 'geo-optimizer (GEO score)', !!geo, geo || 'not found', 'pipx install geo-optimizer-skill');

const ffmpeg = has('ffmpeg');
add('optional', 'ffmpeg (stills from their videos)', !!ffmpeg, ffmpeg || 'not found', 'brew install ffmpeg');
const cwebp = has('cwebp');
add('optional', 'cwebp (image compression)', !!cwebp, cwebp || 'not found', 'brew install webp');
const vercel = has('vercel');
add('optional', 'Vercel CLI (deploy)', !!vercel, vercel || 'not found', 'npm i -g vercel');

if (platform() === 'darwin') {
  const visionDir = join(skillDir, 'tools', 'vision');
  const built = existsSync(join(visionDir, 'cutout')) && existsSync(join(visionDir, 'faces'));
  const swiftc = has('swiftc');
  add('optional', 'Vision cut-out tools (macOS)', built, built ? 'built' : (swiftc ? 'not built yet' : 'swiftc missing'),
    swiftc ? `bash "${join(visionDir, 'build.sh')}"` : 'xcode-select --install, then run tools/vision/build.sh');
} else {
  add('optional', 'Vision cut-out tools', false, 'macOS only', 'Cut people out by hand or with another background-removal tool');
}

const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
console.log('\nLanding Page Studio preflight\n');
for (const r of rows) console.log(`${r.ok ? 'ok  ' : (r.need === 'required' ? 'MISS' : 'skip')}  ${pad(r.name, 38)} ${pad(r.need, 12)} ${r.detail}`);
const missing = rows.filter(r => !r.ok);
if (missing.length) {
  console.log('\nTo install:');
  for (const r of missing) console.log(`- ${r.name}: ${r.fix}`);
}
if (sc) console.log(`\nScrollCraft folder (use as $SC in verification.md): ${sc}`);
if (seoCli) console.log(`claude-seo command: ${seoCli}`);
const hardFail = rows.some(r => r.need === 'required' && !r.ok);
console.log(hardFail ? '\nRequired pieces are missing. Install them before building.' : '\nReady.');
process.exit(hardFail ? 1 : 0);
