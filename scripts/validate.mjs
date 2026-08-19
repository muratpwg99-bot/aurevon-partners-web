import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pageNames = ['index.html', 'about.html', 'foundation.html', 'legal.html', 'privacy.html'];
const locales = [
  { prefix: '', lang: 'en' },
  { prefix: 'fr/', lang: 'fr' },
  { prefix: 'tr/', lang: 'tr' }
];
const pages = locales.flatMap(({ prefix, lang }) => pageNames.map((name) => ({ path: `${prefix}${name}`, lang })));
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
  const html = await readFile(resolve(root, page.path), 'utf8');
  const checks = [
    ['doctype', /<!doctype html>/i],
    ['language', new RegExp(`<html lang="${page.lang}">`, 'i')],
    ['viewport', /name="viewport"/i],
    ['title', /<title>[^<]+<\/title>/i],
    ['main landmark', /<main\b/i],
    ['footer', /<footer\b/i],
    ['language selector', /class="language-switcher"/i],
    ['English alternate', /hreflang="en"/i],
    ['French alternate', /hreflang="fr"/i],
    ['Turkish alternate', /hreflang="tr"/i]
  ];
  for (const [label, pattern] of checks) {
    if (!pattern.test(html)) throw new Error(`${page.path}: missing ${label}`);
  }
  if (/href="\/(?!\/)/.test(html) || /src="\/(?!\/)/.test(html)) {
    throw new Error(`${page.path}: root-relative asset path breaks GitHub project pages`);
  }
  if (html.includes('mb@aurevon-partners.com')) throw new Error(`${page.path}: old personal contact email remains`);

  const localRefs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((ref) => !ref.startsWith('#') && !/^(?:https?:|mailto:|tel:)/i.test(ref))
    .map((ref) => ref.split(/[?#]/, 1)[0])
    .filter(Boolean);
  for (const ref of localRefs) {
    try {
      await access(resolve(dirname(resolve(root, page.path)), ref));
    } catch {
      throw new Error(`${page.path}: broken local reference ${ref}`);
    }
  }
}

const homepage = await readFile(resolve(root, 'index.html'), 'utf8');
if (!homepage.includes('Aurevon Partners S.à r.l.-SPF')) throw new Error('Homepage missing full legal name');
if (!homepage.includes('RCS Luxembourg B 293395')) throw new Error('Homepage missing RCS number');
if (!homepage.includes('01 · About us')) throw new Error('Homepage missing About us section');
if (!homepage.includes('contact@aurevon-partners.com')) throw new Error('Homepage missing public contact email');

const about = await readFile(resolve(root, 'about.html'), 'utf8');
for (const term of ['asset managers', 'AIFMs', 'cybersecurity', 'Agentic AI as a Service', 'machinery', 'engineering firms']) {
  if (!about.toLowerCase().includes(term.toLowerCase())) throw new Error(`About page missing investment focus: ${term}`);
}
if (!about.includes('aria-current="page"')) throw new Error('About page navigation is not marked current');

for (const page of pages) {
  const html = await readFile(resolve(root, page.path), 'utf8');
  if (!html.includes('href="about.html"')) throw new Error(`${page.path}: About navigation does not link to the dedicated page`);
}

const foundation = await readFile(resolve(root, 'foundation.html'), 'utf8');
if (!foundation.includes('not a separately incorporated or registered foundation')) {
  throw new Error('Foundation status disclosure is missing');
}
if (!foundation.includes('children with disabilities')) throw new Error('Foundation focus is missing');
if (!foundation.includes('foundation@aurevon-partners.com')) throw new Error('Foundation contact email is missing');

const legal = await readFile(resolve(root, 'legal.html'), 'utf8');
if (legal.includes('Responsible for content') || legal.includes('Murat Bayindir')) {
  throw new Error('Legal notice still names an individual responsible for content');
}

console.log(`Validated ${pages.length} pages across ${locales.length} languages and ${requiredAssets.length} required assets.`);
