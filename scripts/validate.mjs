import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pages = ['index.html', 'foundation.html', 'legal.html', 'privacy.html'];
const requiredAssets = [
  'assets/styles.css',
  'assets/main.js',
  'assets/fonts/manrope-variable.ttf',
  'assets/aurevon-horizontal-navy.svg',
  'assets/aurevon-primary-white.svg',
  'assets/favicon.ico',
  'assets/social-card.png'
];

for (const asset of requiredAssets) await access(resolve(root, asset));

for (const page of pages) {
  const html = await readFile(resolve(root, page), 'utf8');
  const checks = [
    ['doctype', /<!doctype html>/i],
    ['language', /<html lang="en">/i],
    ['viewport', /name="viewport"/i],
    ['title', /<title>[^<]+<\/title>/i],
    ['main landmark', /<main\b/i],
    ['footer', /<footer\b/i]
  ];
  for (const [label, pattern] of checks) {
    if (!pattern.test(html)) throw new Error(`${page}: missing ${label}`);
  }
  if (/href="\/(?!\/)/.test(html) || /src="\/(?!\/)/.test(html)) {
    throw new Error(`${page}: root-relative asset path breaks GitHub project pages`);
  }
}

const homepage = await readFile(resolve(root, 'index.html'), 'utf8');
if (!homepage.includes('Aurevon Partners S.à r.l.-SPF')) throw new Error('Homepage missing full legal name');
if (!homepage.includes('RCS Luxembourg B 293395')) throw new Error('Homepage missing RCS number');

const foundation = await readFile(resolve(root, 'foundation.html'), 'utf8');
if (!foundation.includes('not a separately incorporated or registered foundation')) {
  throw new Error('Foundation status disclosure is missing');
}

console.log(`Validated ${pages.length} pages and ${requiredAssets.length} required assets.`);
