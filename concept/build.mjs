import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const root = new URL('../', import.meta.url);
const concept = new URL('./', import.meta.url);
const projects = JSON.parse(await readFile(new URL('assets/data/projects.json', root), 'utf8'));
const routes = ['index.html', 'work/index.html', 'services/index.html', 'about/index.html', ...projects.map(({ slug }) => `work/${slug}/index.html`)];

function transform(source, route) {
  let page = source
    .replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="robots" content="noindex,follow">')
    .replace('<body>', '<body class="concept">')
    .replace(/\/assets\/css\/site\.css\?v=[^"']+/g, '/concept/style.css?v=5')
    .replace(/\/assets\/js\/site\.js\?v=[^"']+/g, '/concept/site.js?v=1')
    .replace(/\/assets\/js\/projects\.js\?v=[^"']+/g, '/concept/projects.js?v=1')
    .replaceAll('href="/#contact"', 'href="/concept/#contact"')
    .replaceAll('href="/work/', 'href="/concept/work/')
    .replaceAll('href="/services/', 'href="/concept/services/')
    .replaceAll('href="/about/', 'href="/concept/about/')
    .replaceAll('href="/"', 'href="/concept/"')
    .replaceAll('class="section-head"', 'class="section-head motion-wipe"')
    .replace(/class="service(?: reveal)?"/g, 'class="service reveal motion-slide"')
    .replace('</nav></div></footer>', '<a class="concept-return" href="/">View current site ↗</a></nav></div></footer>');

  if (route === 'index.html') {
    const showreel = `<div class="reveal reel-stage motion-curtain" data-showreel>
          <div class="player player--intro">
            <iframe src="https://player.vimeo.com/video/1204975032?autoplay=1&amp;muted=1&amp;loop=1&amp;controls=0&amp;unmute_button=0&amp;title=0&amp;byline=0&amp;portrait=0&amp;playsinline=1&amp;preload=auto&amp;api=1" title="Maikon Winter showreel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="eager" data-showreel-frame></iframe>
            <img class="reel-poster" src="https://i.vimeocdn.com/video/2203894466-8429ec0062b3e604318ee5be93dad85c35aa1b8e67e945b8d31549db1c324cb6-d_1280?region=us" alt="" width="1280" height="960" loading="lazy" decoding="async">
          </div>
          <div class="reel-controls"><span>Maikon Winter / Showreel</span><div class="reel-controls__actions"><button class="reel-control reel-control--play" type="button" data-reel-play data-state="playing" aria-label="Pause showreel" aria-pressed="true"><span class="reel-control__icon" aria-hidden="true"></span><span data-reel-play-label>Playing</span></button><button class="reel-control reel-control--sound" type="button" data-reel-sound data-state="off" aria-label="Turn sound on" aria-pressed="false"><span class="reel-control__icon" aria-hidden="true"></span><span data-reel-sound-label>Sound off</span></button><a class="reel-control reel-control--fallback" href="https://vimeo.com/1204975032" target="_blank" rel="noopener" data-reel-fallback hidden>Open film ↗</a></div></div>
        </div>`;
    const vision = `<section class="section quote-section section--line" aria-labelledby="vision-title" data-vision-parallax>
      <div class="vision-photo reveal motion-curtain"><img src="/assets/hero.jpg" alt="Maikon Winter in a red shirt, lit against a dark background" width="1080" height="1080" loading="lazy" decoding="async"></div>
      <div class="wrap vision-layout"><div class="vision-copy">
        <p class="eyebrow vision-eyebrow">One project. One vision.</p>
        <h2 class="vision-title statement motion-wipe motion-wipe--reverse" id="vision-title"><span>Production decisions</span> <span class="vision-title__bridge">already consider</span> <strong>performance, composition, sound and the edit.</strong></h2>
        <p class="lede">Working across production and post means I can see how a shot will cut, what needs to be solved on set and where the film needs room to breathe.</p>
      </div></div>
    </section>`;
    page = page
      .replace('<div class="hero-media"><img src="/assets/hero.jpg" alt="Maikon Winter" width="1080" height="1080" fetchpriority="high" decoding="async"></div>',
        '<div class="hero-media"><picture><source media="(max-width: 760px)" srcset="/assets/mm-33.jpg"><img src="/assets/mm-21.jpg" alt="Portrait of Maikon Winter in low, directional light" width="2048" height="1152" fetchpriority="high" decoding="async"></picture></div>')
      .replace('<h1 class="display">Turn ideas <span class="gradient-text">into films.</span></h1>', '<h1 class="display"><span class="hero-phrase">Turn ideas</span> <span class="hero-phrase gradient-text">into films.</span></h1>')
      .replace(/<div class="reveal"><div class="player player--intro">[\s\S]*?<\/div><a class="reel-external" href="https:\/\/vimeo.com\/1204975032" target="_blank" rel="noopener">Watch full film ↗<\/a><\/div>/, showreel)
      .replace(/<div class="wrap about-photos"[\s\S]*?<\/div>/, `<div class="wrap about-photos" aria-label="Maikon Winter at work and in portrait">
        <figure class="reveal motion-curtain"><img src="/assets/Background%202.jpg" alt="Maikon Winter looking aside with a cinema camera under a tree" width="1080" height="720" loading="lazy" decoding="async"></figure>
        <figure class="reveal motion-curtain"><img src="/assets/bg-main.jpg" alt="Maikon Winter at his editing and color workstation" width="1400" height="781" loading="lazy" decoding="async"></figure>
        <figure class="reveal motion-curtain"><img src="/assets/mm-32.jpg" alt="Portrait of Maikon Winter in a light blue shirt" width="2048" height="1152" loading="lazy" decoding="async"></figure>
      </div>`)
      .replace('aria-label="On set and in post-production"', 'aria-label="Maikon Winter at work and in portrait"')
      .replace('Films made with intention.', 'A closer look at the work.')
      .replace('The work<br>speaks for itself.', 'See the work<br>in motion.')
      .replace(/<section class="section quote-section section--line">[\s\S]*?<\/section>/, vision)
      .replace('</body>', '<script src="/concept/hero-light.js?v=4" defer></script><script src="/concept/vision-parallax.js?v=1" defer></script><script src="/concept/showreel.js?v=3" defer></script></body>');
    if (!page.includes('data-showreel-frame')) throw new Error('Showreel markup was not replaced');
    if (!page.includes('data-vision-parallax')) throw new Error('Vision section was not replaced');
    if (!page.includes('class="hero-phrase gradient-text"')) throw new Error('Hero headline was not prepared for re-entry');
  }

  if (route === 'work/index.html') {
    page = page.replace('Work shaped around each idea.', 'Selected films.<br>Full context.');
  }

  if (route === 'about/index.html') {
    if (!page.includes('src="/assets/Untitled-3_05.jpg" alt="Black-and-white portrait of Maikon Winter"')) throw new Error('Original black-and-white About portrait is missing');
  }

  return page;
}

for (const route of routes) {
  const source = await readFile(new URL(route, root), 'utf8');
  const target = join(new URL(concept).pathname, route);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, transform(source, route));
}

const projectScript = await readFile(new URL('assets/js/projects.js', root), 'utf8');
await writeFile(new URL('projects.js', concept), projectScript.replaceAll('/work/${encodeURIComponent(project.slug)}/', '/concept/work/${encodeURIComponent(project.slug)}/'));
await writeFile(new URL('base.css', concept), await readFile(new URL('assets/css/site.css', root)));
await writeFile(new URL('site.js', concept), await readFile(new URL('assets/js/site.js', root)));
console.log(`Built ${routes.length} concept pages without changing the current site.`);
