import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { load } from 'cheerio';

const root = new URL('../', import.meta.url);
const projects = JSON.parse(await readFile(new URL('assets/data/projects.json', root), 'utf8'));
const translations = JSON.parse(await readFile(new URL('assets/data/projects.pt.json', root), 'utf8'));
const paths = ['/', '/work/', '/services/', '/about/', ...projects.map(({ slug }) => `/work/${slug}/`)];
const pageMeta = {
  '/': ['Maikon Winter · Diretor e Filmmaker', 'Direção, fotografia e pós-produção para filmes, comerciais, campanhas e conteúdo de marca.', 'Ideias que viram filmes. Da concepção à finalização.'],
  '/work/': ['Trabalhos · Maikon Winter', 'Conheça filmes, comerciais, campanhas e projetos pessoais de Maikon Winter.', 'Filmes, campanhas e projetos pessoais com contexto sobre cada produção.'],
  '/services/': ['Serviços · Maikon Winter', 'Desenvolvimento criativo, direção, fotografia e pós-produção para filmes, campanhas e conteúdo recorrente.', 'Direção, fotografia e pós-produção para o projeto completo ou uma etapa da produção.'],
  '/about/': ['Sobre · Maikon Winter', 'Conheça o trabalho de Maikon Winter como diretor e filmmaker, da ideia inicial ao corte final.', 'A trajetória e a forma de trabalhar de Maikon Winter.']
};

const copy = {
  'Skip to content': 'Ir para o conteúdo',
  'Work': 'Trabalhos', 'Services': 'Serviços', 'About': 'Sobre', 'Contact': 'Contato',
  'Start a project': 'Vamos conversar', 'DIRECTOR & FILMMAKER': 'DIRETOR & FILMMAKER',
  'Director & Filmmaker': 'Diretor & Filmmaker',
  'Turn ideas': 'Transforme', 'into films.': 'ideias em filmes.',
  'I develop, direct, shoot and finish audiovisual work. I can guide the whole project or step into the part of production that needs me.': 'Planejo, dirijo, filmo e finalizo. Posso acompanhar o projeto inteiro ou entrar na etapa em que você precisa de mim.',
  'View work': 'Ver trabalhos', 'Direction': 'Direção', 'Cinematography': 'Fotografia', 'Post-Production': 'Pós-produção',
  'Showreel': 'Showreel', 'See the work': 'Veja o trabalho', 'in motion.': 'em movimento.',
  'Framing, camera movement, lighting, color, sound, pacing, and storytelling are part of the same way of thinking about a film.': 'Enquadramento, movimento, luz, cor, som e ritmo trabalham juntos para contar uma história.',
  'Playing': 'Reproduzindo', 'Sound off': 'Som desligado', 'Open film ↗': 'Abrir filme ↗',
  'Selected work': 'Trabalhos selecionados', 'A closer look at the work.': 'Cada projeto conta uma história.',
  'View all work': 'Ver todos os trabalhos', 'Loading selected work...': 'Carregando trabalhos...',
  'The right scope for the film.': 'Trabalhos sob medida.',
  'Direction and cinematography can stand alone or connect with post-production in one continuous process.': 'Direção e fotografia podem ser etapas independentes ou seguir comigo até a finalização.',
  'Commercials & Brand Films': 'Comerciais e filmes de marca',
  'Films built around a clear idea, shaped for the people and place where they will be seen.': 'Filmes construídos a partir de uma ideia clara, pensados para o público e os canais em que serão vistos.',
  'Social & Campaign Content': 'Conteúdo para redes e campanhas',
  'Planned production for individual pieces, campaign material and ongoing channels.': 'Produção planejada para vídeos avulsos, campanhas e canais com conteúdo recorrente.',
  'Direction & Cinematography': 'Direção e fotografia',
  'Direction, performance direction, camera and lighting for productions that need those stages.': 'Direção de filme, performance do ator, câmera e luz para produções em geral.',
  'Editing, sound, motion, color and finishing for my own productions or footage created by other teams.': 'Montagem, som, motion, cor e finalização de projetos meus ou de imagens produzidas por outras equipes.',
  'Explore services': 'Conhecer serviços', 'One project. One vision.': 'Um projeto. Uma visão.',
  'Production decisions': 'Decisões na filmagem', 'already consider': 'já levam em conta',
  'performance, composition, sound and the edit.': 'atuação, composição, som e montagem.',
  'Working across production and post means I can see how a shot will cut, what needs to be solved on set and where the film needs room to breathe.': 'Por trabalhar na filmagem e na pós, consigo perceber como um plano vai funcionar na montagem, o que precisa ser resolvido no set e quando a cena precisa de espaço para respirar.',
  'How I can work with you': 'Como podemos trabalhar juntos', 'Join at the stage you need.': 'Entro na etapa de que seu projeto precisa.',
  'Full Project': 'Projeto completo', 'Concept, production and final delivery shaped as one project.': 'Da concepção à entrega, pré-produção, produção e pós-produção, amarradas em um projeto completo, do início ao fim.',
  'Production': 'Produção', 'Direction, performance direction, cinematography, camera and lighting.': 'Direção, trabalho com elenco, fotografia, câmera e luz.',
  'Editing and finishing for footage I shoot or material delivered by another team.': 'Montagem e finalização de imagens que filmei ou que outra equipe produziu.',
  'Ongoing Content': 'Conteúdo recorrente', 'A recurring collaboration planned around the work your channels need.': 'Uma parceria contínua, planejada a partir do que seus canais precisam comunicar.',
  'My work starts before the camera rolls.': 'Meu trabalho começa antes de ligar a câmera.',
  'I develop the idea, find the right way to tell the story, and guide the production from concept to final cut.': 'Desenvolvo a ideia, encontro a melhor forma de contá-la e acompanho a produção até o corte final.',
  'Experience in editing is a big part of how I direct. I know what makes footage useful in the edit, what can be solved on set, and when a shot is worth getting.': 'A experiência na montagem influencia minha direção. Sei o que faz uma imagem funcionar na edição, o que vale resolver no set e quando um plano merece mais tempo para acontecer.',
  'Read about my approach': 'Conheça meu trabalho',
  'Have an idea that needs a screen?': 'Tem uma ideia para tirar do papel?',
  'Tell me what you are making and where you need me in the process.': 'Conte o que você quer criar e em que etapa posso entrar.',
  '© 2026 Maikon Winter · Director & Filmmaker': '© 2026 Maikon Winter · Diretor & Filmmaker',
  'Selected films.': 'Filmes e projetos.', 'Full context.': 'Além da imagem.',
  'Each film is shown with its context, my role and the parts of the process I handled.': 'Cada projeto mostra o contexto, meu papel e as etapas que assumi na produção.',
  '6 projects': '6 projetos', 'All': 'Todos', 'Films': 'Filmes', 'Commercials': 'Comerciais',
  'Branded Content': 'Conteúdo de marca', 'Campaigns': 'Campanhas', 'Personal Work': 'Projetos pessoais',
  'Loading projects...': 'Carregando projetos...',
  'No published projects are assigned to this category yet.': 'Ainda não há projetos publicados nesta categoria.',
  'The whole film, or the stage you need.': 'O filme inteiro ou a etapa que você precisa.',
  'I can develop and deliver a complete project, direct and shoot within a wider production, or take existing footage through post.': 'Posso desenvolver e entregar um projeto completo, dirigir e filmar dentro de uma produção maior ou assumir a pós de imagens já captadas.',
  'Concept-led films made for a specific brand, audience and place of release.': 'Filmes que partem de uma ideia e consideram a marca, o público e onde serão exibidos.',
  'Individual pieces and connected campaign material planned around the channel and the way people will watch.': 'Vídeos avulsos e peças de campanha pensados para cada canal e para a forma como as pessoas assistem.',
  'Direction, performance direction, visual planning, camera and lighting within an existing production.': 'Direção, trabalho com elenco, planejamento visual, câmera e luz dentro de uma produção já em andamento.',
  'Editing, sound design, motion graphics, color grading and finishing for footage I shoot or material produced by other teams.': 'Montagem, desenho de som, motion graphics, tratamento de cor e finalização de imagens minhas ou de outras equipes.',
  'Creative Production': 'Produção criativa',
  'A complete path through concept, planning, production and final delivery, scaled to the real needs of the project.': 'Da ideia ao filme pronto, com planejamento e produção ajustados ao que o projeto pede.',
  'Content Production Days': 'Diárias de conteúdo',
  'A planned day or session used to build a useful content library and create multiple deliverables. The scope is defined around the idea, location and channels.': 'Uma diária ou sessão planejada para criar um acervo de imagens e gerar diferentes peças. O escopo depende da ideia, da locação e dos canais de publicação.',
  'The film takes shape at every stage.': 'O filme ganha forma em cada etapa.',
  'Pause timeline animation': 'Pausar animação da linha do tempo',
  'Concept': 'Conceito', 'Define the idea, the story and what the film needs to communicate.': 'Definir a ideia, a história e o que o filme precisa comunicar.',
  'Shape performance, camera movement and lighting around that idea.': 'Conduzir a atuação, o movimento de câmera e a luz a partir dessa ideia.',
  'Bring the footage together through editing, sound, motion and color.': 'Construir o filme na montagem, no som, nos elementos em movimento e na cor.',
  'Delivery': 'Entrega', 'Review the film and prepare the agreed formats for where it will be seen.': 'Revisar o filme e preparar os formatos combinados para cada canal.',
  'The scope can cover the whole film or the stage your production needs.': 'O trabalho pode abranger o filme inteiro ou uma etapa específica.',
  'Capabilities': 'Atuação', 'What each project can draw on.': 'Recursos para cada projeto.',
  'Creative': 'Criação', 'Concept development': 'Desenvolvimento de conceito', 'Scriptwriting': 'Roteiro',
  'Visual development': 'Desenvolvimento visual', 'Storyboarding when applicable': 'Storyboard, quando fizer sentido',
  'Creative direction': 'Direção criativa', 'Performance direction': 'Direção de performance',
  'Camera operation': 'Operação de câmera', 'Lighting': 'Iluminação', 'Location production': 'Produção em locação',
  'Post': 'Pós-produção', 'Editing': 'Edição', 'Sound design': 'Design de áudio',
  'Motion graphics': 'Motion graphics', 'Color grading': 'Tratamento de cor', 'Finishing': 'Finalização',
  'A scope built around the production.': 'O escopo acompanha o projeto.',
  'Development and execution across the full agreed scope.': 'Desenvolvimento e execução de todas as etapas combinadas.',
  'Direction, cinematography or both within a production.': 'Direção, fotografia ou as duas frentes dentro de uma produção.',
  'Finalization of my own material or footage supplied by another team.': 'Finalização de imagens minhas ou de material entregue por outra equipe.',
  'Recurring planning and production, with rhythm and deliverables defined for the work.': 'Planejamento e produção recorrentes, com frequência e entregas definidas conforme a necessidade.',
  'Tell me what the film needs.': 'Me conte como posso agregar na sua produção.',
  'Share the idea, stage and material you already have. We can define the right scope from there.': 'Compartilhe a ideia, em que etapa está e o material que já existe. A partir disso, definimos o escopo.',
  'I develop the idea, find the right way to tell the story, and guide the production from concept to final cut. That can include writing, directing, performance direction, cinematography, lighting, camera operation, editing, sound design, motion graphics, and color grading.': 'Desenvolvo a ideia, encontro a forma certa de contar a história e acompanho a produção do conceito ao corte final. Isso pode incluir roteiro, direção, trabalho com quem está em cena, fotografia, iluminação, operação de câmera, montagem, desenho de som, motion graphics e tratamento de cor.',
  'I’ve worked across different sides of production, from my own films and content to agencies, production companies, and commercial projects. Working on both production and post-production has taught me to think about the whole film while I’m on set, not just the individual shot in front of me.': 'Já trabalhei em diferentes lados de uma produção: nos meus próprios filmes e conteúdos, em agências, produtoras e projetos comerciais. A experiência na filmagem e na pós me ensinou a pensar no filme inteiro quando estou no set, e não só no plano que tenho diante de mim.',
  'I learned cinematography as a craft through practice, making my own work and working on different productions. Over time, framing, camera movement, lighting, color, sound, pacing, and storytelling became part of the same way of thinking about a film.': 'Aprendi fotografia cinematográfica na prática, criando meus próprios trabalhos e participando de produções diferentes. Com o tempo, enquadramento, movimento de câmera, luz, cor, som, ritmo e narrativa passaram a fazer parte de uma mesma forma de pensar o filme.',
  'When I direct, I’m not only concerned with what happens in front of the camera. I’m thinking about the performance, the composition, the movement, the rhythm of the scene, how it will cut together, and what the audience should feel when it does.': 'Quando dirijo, penso na atuação, na composição, no movimento e no ritmo da cena. Também penso em como os planos vão se encontrar na montagem e no que o público deve sentir quando isso acontecer.',
  'My experience in editing is a big part of how I direct. I know what makes footage useful in the edit, what can be solved on set, and when a shot is worth getting even if it takes more time to achieve.': 'Minha experiência na montagem é parte importante da forma como dirijo. Sei quais imagens serão úteis na edição, o que pode ser resolvido no set e quando vale dedicar mais tempo a um plano.',
  'I work as a Director and Filmmaker, creating films, commercials, campaigns, and branded content for brands, creators, and production teams.': 'Trabalho como diretor e filmmaker, criando filmes, comerciais, campanhas e conteúdo de marca para marcas, criadores e equipes de produção.',
  'The idea comes first. My job is to find the best way to bring it to the screen.': 'A ideia vem primeiro. Meu trabalho é encontrar a melhor maneira de levá-la para a tela.',
  'Bring the idea to the screen.': 'Vamos levar a ideia para a tela.'
};

const attributes = {
  'Main navigation': 'Navegação principal', 'Footer navigation': 'Navegação do rodapé',
  'Open menu': 'Abrir menu', 'Filter projects': 'Filtrar projetos', 'Capabilities': 'Áreas de atuação',
  'Portrait of Maikon Winter in low, directional light': 'Retrato de Maikon Winter com luz lateral em ambiente escuro',
  'Maikon Winter showreel': 'Showreel de Maikon Winter',
  'Maikon Winter showreel cover': 'Capa do showreel de Maikon Winter',
  'Pause showreel': 'Pausar showreel', 'Turn sound on': 'Ativar som',
  'Portrait of Maikon Winter': 'Retrato de Maikon Winter',
  'Maikon Winter in a red shirt, lit against a dark background': 'Maikon Winter com camisa vermelha diante de um fundo escuro',
  'Maikon Winter at work and in portrait': 'Maikon Winter trabalhando e em retrato',
  'Maikon Winter looking aside with a cinema camera under a tree': 'Maikon Winter com uma câmera de cinema debaixo de uma árvore',
  'Maikon Winter at his editing and color workstation': 'Maikon Winter na ilha de edição e tratamento de cor',
  'Portrait of Maikon Winter in a light blue shirt': 'Retrato de Maikon Winter com camisa azul-clara',
  'Black-and-white portrait of Maikon Winter': 'Retrato em preto e branco de Maikon Winter',
  'Open project': 'Abrir projeto'
};

function localizedPath(path) { return `/pt/${path.replace(/^\/+/, '')}`; }
function absolute(path) { return `https://www.maikchan.com${path}`; }
function escape(value) { return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;'); }

for (const path of paths) {
  const file = new URL(path.slice(1) + 'index.html', root);
  const original = await readFile(file, 'utf8');
  const en = load(original, { decodeEntities: false });
  const pt = load(original, { decodeEntities: false });
  const pair = localizedPath(path);

  for (const $ of [en, pt]) {
    $('link[href^="/assets/css/concept.css"], script[src^="/assets/js/site.js"], script[src^="/assets/js/projects.js"], script[src^="/assets/js/showreel.js"]').each((_, element) => {
      const attribute = element.name === 'link' ? 'href' : 'src';
      $(element).attr(attribute, $(element).attr(attribute).replace(/\?v=[^&]+$/, '?v=20260924-2'));
    });
    if (!$('.language-switch').length) {
      const switcher = `<div class="language-switch" aria-label="${$ === pt ? 'Idioma' : 'Language'}"><a href="${path}" lang="en" hreflang="en" data-language-choice="en">EN</a><span aria-hidden="true">/</span><a href="${pair}" lang="pt-BR" hreflang="pt-BR" data-language-choice="pt">PT</a></div>`;
      $('.nav > .button').before(switcher);
    }
    $('.language-switch a').removeAttr('aria-current');
    $(`.language-switch [data-language-choice="${$ === pt ? 'pt' : 'en'}"]`).attr('aria-current', 'true');
    $('link[rel="alternate"]').remove();
    $('head').append(`<link rel="alternate" hreflang="en" href="${absolute(path)}"><link rel="alternate" hreflang="pt-BR" href="${absolute(pair)}"><link rel="alternate" hreflang="x-default" href="${absolute(path)}">`);
    if (!$('script[src^="/assets/js/language.js"]').length) $('body').append('<script src="/assets/js/language.js?v=20260924-1" defer></script>');
  }

  if (path === '/' && !en('[data-language-gate]').length) {
    const gate = `<dialog class="language-gate" data-language-gate aria-labelledby="language-gate-title"><div class="language-gate__inner"><p class="eyebrow">MAIKON WINTER / DIRECTOR & FILMMAKER</p><h2 id="language-gate-title">Choose your language<span>Escolha seu idioma</span></h2><p>Select how you want to explore the site. / Escolha como prefere navegar pelo site.</p><div class="language-gate__choices"><a href="/" lang="en" data-language-choice="en">English <span>Explore in English ↗</span></a><a href="/pt/" lang="pt-BR" data-language-choice="pt">Português <span>Explorar em português ↗</span></a></div></div></dialog>`;
    en('body').prepend(gate);
  }

  pt('html').attr('lang', 'pt-BR');
  pt('body').addClass('locale-pt');
  pt('[data-language-gate]').remove();
  if (!pt('.whatsapp-float').length) {
    pt('body').prepend('<a class="whatsapp-float" href="https://wa.me/5547996553649?text=Oi%20Maik%2C%20quero%20falar%20sobre%20um%20projeto." target="_blank" rel="noopener" aria-label="Falar com Maikon pelo WhatsApp" title="Falar no WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.25a12.72 12.72 0 0 0-10.86 19.3L3.4 28.6l6.2-1.7A12.75 12.75 0 1 0 16 3.25Zm0 23.2a10.42 10.42 0 0 1-5.3-1.45l-.38-.23-3.68 1.01.99-3.58-.25-.4A10.42 10.42 0 1 1 16 26.45Zm5.72-7.82c-.31-.16-1.84-.91-2.12-1.01-.29-.11-.5-.16-.71.16-.21.31-.81 1.01-.99 1.22-.18.21-.36.23-.67.08-.31-.16-1.31-.48-2.5-1.52a9.35 9.35 0 0 1-1.73-2.15c-.18-.31-.02-.48.14-.64.14-.14.31-.36.47-.54.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.25-.61-.51-.53-.71-.54h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.61s1.13 3.03 1.29 3.24c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.51 1.8.65.76.24 1.45.21 2 .13.61-.09 1.84-.75 2.1-1.47.26-.73.26-1.35.18-1.48-.08-.13-.29-.21-.6-.37Z"/></svg><span>WhatsApp</span></a>');
  }
  if (pt('.contact-social').length && !pt('.contact-social .whatsapp-link').length) {
    pt('.contact-social').append('<a class="whatsapp-link" href="https://wa.me/5547996553649?text=Oi%20Maik%2C%20quero%20falar%20sobre%20um%20projeto." target="_blank" rel="noopener">WhatsApp</a>');
  }
  pt('.language-switch').attr('aria-label', 'Idioma');
  pt('body *').contents().each((_, node) => {
    if (node.type !== 'text' || !node.parent || ['script', 'style', 'svg'].includes(node.parent.name)) return;
    const key = node.data.trim().replace(/\s+/g, ' ');
    if (!key || !(key in copy)) return;
    const prefix = node.data.match(/^\s*/)[0], suffix = node.data.match(/\s*$/)[0];
    node.data = prefix + copy[key] + suffix;
  });
  pt('[alt], [aria-label], [title]').each((_, element) => {
    for (const name of ['alt', 'aria-label', 'title']) {
      const value = pt(element).attr(name);
      if (value in attributes) pt(element).attr(name, attributes[value]);
    }
  });
  pt('a[href^="/"]').each((_, element) => {
    const href = pt(element).attr('href');
    if (/^\/(assets\/|favicon|site\.webmanifest|pt\/)/.test(href)) return;
    pt(element).attr('href', localizedPath(href.slice(1)));
  });
  pt('a[href^="mailto:"]').each((_, element) => {
    const href = pt(element).attr('href');
    pt(element).attr('href', href.replace('subject=Project%20inquiry', 'subject=Novo%20projeto'));
  });
  // Restore the English switch destination after internal links are localized.
  pt('.language-switch [data-language-choice="en"]').attr('href', path);
  pt('.language-switch [data-language-choice="pt"]').attr('href', pair);
  const project = projects.find(({ slug }) => path === `/work/${slug}/`);
  if (project) {
    const localized = translations[project.slug];
    if (!localized) throw new Error(`Missing Portuguese copy for ${project.slug}`);
    const name = localized.title || project.title;
    pt('.case-layout__intro .eyebrow').text(project.categories.map((category) => copy[category] || category).join(' · '));
    pt('#project-title').text(name);
    pt('.case-layout__media img').attr('alt', localized.posterAlt);
    pt('[data-film-player]').attr('data-video-title', name).attr('aria-label', `Reproduzir ${name}`);
    pt('.case-copy').empty();
    for (const paragraph of localized.description) pt('.case-copy').append(pt('<p>').text(paragraph));
    pt('.case-facts h2').first().text('Meu papel');
    pt('.case-facts h2').last().text('Áreas de atuação');
    pt('.case-facts > p').text(localized.role);
    pt('.case-facts .tag-list').empty();
    for (const capability of localized.capabilities) pt('.case-facts .tag-list').append(pt('<li>').text(capability));
    pt('.case-layout__story > .button').text('← Voltar aos trabalhos');
    pt('.case-meta span').text(`Duração: ${project.duration}`);
  }
  if (path === '/about/') {
    const highlights = [
      ['Isso pode incluir roteiro, direção, trabalho com quem está em cena, fotografia, iluminação, operação de câmera, montagem, desenho de som, motion graphics e tratamento de cor.', 'Isso pode incluir roteiro, direção, trabalho com quem está em cena, fotografia, iluminação, operação de câmera, montagem, design de áudio, motion graphics e tratamento de cor.'],
      ['nos meus próprios filmes e conteúdos, em agências, produtoras e projetos comerciais.', 'nos meus próprios filmes e conteúdos, em agências, produtoras e projetos comerciais.'],
      ['Com o tempo, enquadramento, movimento de câmera, luz, cor, som, ritmo e narrativa passaram a fazer parte de uma mesma forma de pensar o filme.', 'Com o tempo, enquadramento, movimento de câmera, luz, cor, som, ritmo e narrativa passaram a fazer parte de uma mesma forma de pensar o filme.'],
      ['Trabalho como diretor e filmmaker, criando filmes, comerciais, campanhas e conteúdo de marca para marcas, criadores e equipes de produção.', 'Trabalho como diretor e filmmaker, criando filmes, comerciais, campanhas e conteúdo de marca para marcas, criadores e equipes de produção.']
    ];
    pt('.about-body p').each((_, element) => {
      let html = pt(element).html();
      for (const [source, replacement] of highlights) html = html.replace(source, `<strong class="copy-highlight">${replacement}</strong>`);
      pt(element).html(html);
    });
  }
  const [title, description, social] = project
    ? [`${translations[project.slug].title || project.title} · Maikon Winter`, translations[project.slug].cardDescription, translations[project.slug].cardDescription]
    : pageMeta[path];
  pt('title').text(title);
  pt('meta[name="description"]').attr('content', description);
  pt('meta[property="og:title"]').attr('content', title);
  pt('meta[property="og:description"]').attr('content', social);
  pt('meta[property="og:url"]').attr('content', absolute(pair));
  pt('meta[name="twitter:title"]').attr('content', title);
  pt('meta[name="twitter:description"]').attr('content', social);
  pt('link[rel="canonical"]').attr('href', absolute(pair));
  pt('meta[property="og:locale"]').remove();
  pt('head').append('<meta property="og:locale" content="pt_BR">');
  pt('script[type="application/ld+json"]').each((_, element) => {
    try {
      const data = JSON.parse(pt(element).html());
      if (data.jobTitle) data.jobTitle = 'Diretor e filmmaker';
      pt(element).text(JSON.stringify(data));
    } catch {}
  });
  en('meta[property="og:locale"]').remove();
  en('head').append('<meta property="og:locale" content="en_US">');
  if (path === '/work/' || path === '/') pt('[data-project-grid]').attr('data-locale', 'pt');
  const output = new URL('pt' + path + 'index.html', root);
  await mkdir(new URL('pt' + path, root), { recursive: true });
  await writeFile(file, en.html());
  await writeFile(output, pt.html());
}

// The previous one-page Portuguese site is kept as a reference outside /pt/.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.flatMap((path) => [path, localizedPath(path)]).map((path) => `  <url><loc>${absolute(path)}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('sitemap.xml', root), sitemap);
console.log(`Localized ${paths.length} pages for pt-BR`);
