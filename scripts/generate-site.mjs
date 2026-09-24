import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const projects = JSON.parse(await readFile(new URL('assets/data/projects.json', root), 'utf8'));
const template = await readFile(new URL('work/project-template.html', root), 'utf8');

const escapeAttribute = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const projectContent = (project) => `
    <section class="section case-layout section--line" aria-labelledby="project-title">
      <div class="wrap case-layout__grid">
        <div class="case-layout__intro">
          <p class="eyebrow">${escapeAttribute(project.categories.join(' · '))}</p>
          <h1 class="display" id="project-title">${escapeAttribute(project.title)}</h1>
          <div class="case-meta"><span>${escapeAttribute(project.duration)}</span></div>
        </div>
        <div class="case-layout__media"><div class="player">
          <button class="player-button" type="button" data-film-player="${escapeAttribute(project.videoId)}" data-video-title="${escapeAttribute(project.title)}" aria-label="Play ${escapeAttribute(project.title)}">
            <img src="${escapeAttribute(project.poster)}" alt="${escapeAttribute(project.posterAlt)}" width="960" height="1707" fetchpriority="high" decoding="async">
            <span class="player-play" aria-hidden="true"><svg width="22" height="26" viewBox="0 0 22 26" fill="currentColor"><path d="M22 13 0 26V0l22 13Z"/></svg></span>
          </button>
        </div></div>
        <div class="case-layout__story" id="project-story">
          <div class="case-copy">${project.description.map((paragraph) => `<p>${escapeAttribute(paragraph)}</p>`).join('')}</div>
          <div class="case-facts"><h2>Role</h2><p>${escapeAttribute(project.role)}</p>
            <h2>Capabilities</h2><ul class="tag-list">${project.capabilities.map((capability) => `<li>${escapeAttribute(capability)}</li>`).join('')}</ul>
          </div>
          <a class="button button--text" href="/work/">← Back to work</a>
        </div>
      </div>
    </section>
    <section class="section section--surface contact" id="contact">
      <div class="narrow"><p class="eyebrow">Start a project</p><h2 class="title">Have an idea that needs a screen?</h2><p>Tell me what you are making and where you need me in the process.</p><a class="button" href="mailto:maik@maikchanstudio.com?subject=Project%20inquiry">Start a project</a></div>
    </section>`;

for (const project of projects) {
  const directory = new URL(`work/${project.slug}/`, root);
  await mkdir(directory, { recursive: true });
  const page = template
    .replaceAll('{{TITLE}}', escapeAttribute(project.title))
    .replaceAll('{{DESCRIPTION}}', escapeAttribute(project.cardDescription))
    .replaceAll('{{POSTER}}', escapeAttribute(project.poster))
    .replaceAll('{{SLUG}}', escapeAttribute(project.slug))
    .replaceAll('{{PROJECT_CONTENT}}', projectContent(project));
  await writeFile(new URL('index.html', directory), page);
}

const knownSlugs = new Set(projects.map((project) => project.slug));
const generatedMarker = '<meta name="description" content="';
for (const entry of await (await import('node:fs/promises')).readdir(new URL('work/', root), { withFileTypes: true })) {
  if (!entry.isDirectory() || knownSlugs.has(entry.name)) continue;
  const candidate = new URL(`work/${entry.name}/index.html`, root);
  try {
    const source = await readFile(candidate, 'utf8');
    if (source.includes(generatedMarker) && source.includes('data-project-page=')) await rm(new URL(`work/${entry.name}/`, root), { recursive: true });
  } catch {}
}

const urls = ['/', '/work/', '/services/', '/about/', ...projects.map((project) => `/work/${project.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((path) => `  <url><loc>https://www.maikchan.com${path}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('sitemap.xml', root), sitemap);

console.log(`Generated ${projects.length} project pages and sitemap.xml`);
