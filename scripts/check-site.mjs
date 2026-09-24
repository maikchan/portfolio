import { readFile, access } from 'node:fs/promises';
import { resolve, dirname, join, extname } from 'node:path';
import { load } from 'cheerio';

const root = resolve(new URL('..', import.meta.url).pathname);
const projects = JSON.parse(await readFile(join(root, 'assets/data/projects.json'), 'utf8'));
const pages = [
  'index.html',
  'work/index.html',
  'services/index.html',
  'about/index.html',
  ...projects.map((project) => `work/${project.slug}/index.html`)
];
const errors = [];

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

for (const page of pages) {
  const fullPath = join(root, page);
  const source = await readFile(fullPath, 'utf8');
  const $ = load(source);
  if (!$('title').text().trim()) errors.push(`${page}: missing title`);
  if (!$('meta[name="description"]').attr('content')) errors.push(`${page}: missing meta description`);
  if (!$('link[rel="canonical"]').attr('href')) errors.push(`${page}: missing canonical`);
  if ($('main').length !== 1) errors.push(`${page}: expected one main element`);
  if ($('h1').length !== 1) errors.push(`${page}: expected one h1 element`);
  if (/Video Editor|Editor & Colorist/i.test($('body').text())) errors.push(`${page}: old positioning remains`);
  if (/[—–]/.test($('body').text())) errors.push(`${page}: public copy contains a dash`);

  for (const image of $('img').toArray()) {
    const element = $(image);
    if (!element.attr('alt')) errors.push(`${page}: image missing alt text`);
    if (!element.attr('width') || !element.attr('height')) errors.push(`${page}: image missing dimensions`);
  }

  for (const attribute of ['href', 'src']) {
    for (const node of $(`[${attribute}]`).toArray()) {
      const value = $(node).attr(attribute);
      if (!value || /^(https?:|mailto:|tel:|#|data:)/.test(value) || value.includes('{{')) continue;
      const withoutQuery = decodeURIComponent(value.split(/[?#]/)[0]);
      const candidate = withoutQuery.startsWith('/')
        ? join(root, withoutQuery)
        : resolve(dirname(fullPath), withoutQuery);
      const target = extname(candidate) ? candidate : join(candidate, 'index.html');
      if (!(await exists(target))) errors.push(`${page}: missing local target ${value}`);
    }
  }
}

const requiredVideoIds = ['1229154554', '1229142739', '1229144661', '1213463839', '1204975376', '1204966430'];
for (const id of requiredVideoIds) {
  if (!projects.some((project) => project.videoId === id)) errors.push(`Missing project video ${id}`);
}
if (new Set(projects.map((project) => project.slug)).size !== projects.length) errors.push('Project slugs must be unique');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${pages.length} pages and ${projects.length} project videos.`);
}
