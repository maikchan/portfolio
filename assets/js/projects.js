(function () {
  const containers = document.querySelectorAll('[data-project-grid]');
  if (!containers.length) return;
  const portuguese = document.documentElement.lang === 'pt-BR';
  const categoryNames = { Films: 'Filmes', Commercials: 'Comerciais', 'Branded Content': 'Conteúdo de marca', Campaigns: 'Campanhas', 'Personal Work': 'Projetos pessoais' };

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  }[character]));

  function card(project) {
    const categories = project.categories.map((category) => portuguese ? categoryNames[category] : category).join(' · ');
    return `
      <article class="project-card reveal" data-categories="${escapeHtml(project.categories.join('|'))}" data-video-id="${escapeHtml(project.videoId)}" data-video-title="${escapeHtml(project.title)}">
        <div class="project-card__media">
          <a class="project-card__link" href="${portuguese ? '/pt' : ''}/work/${encodeURIComponent(project.slug)}/" aria-label="${portuguese ? 'Abrir projeto' : 'Open project'}: ${escapeHtml(project.title)}">
            <img src="${escapeHtml(project.poster)}" alt="${escapeHtml(project.posterAlt)}" width="960" height="1707" loading="lazy" decoding="async">
            <div class="project-card__overlay" aria-hidden="true">
              <p>${escapeHtml(project.cardDescription)}</p>
              <span>${portuguese ? 'Abrir projeto' : 'Open project'}</span>
            </div>
          </a>
        </div>
          <div class="project-card__meta">
            <h3 class="project-card__title">${escapeHtml(project.title)}</h3>
            <span class="project-card__category">${escapeHtml(categories)}</span>
          </div>
        <details class="project-card__details">
          <summary>${portuguese ? 'Sobre este projeto' : 'About this project'}</summary>
          <p>${escapeHtml(project.cardDescription)} <a class="button button--text" href="${portuguese ? '/pt' : ''}/work/${encodeURIComponent(project.slug)}/">${portuguese ? 'Abrir projeto' : 'Open project'}</a></p>
        </details>
      </article>`;
  }

  Promise.all([
    fetch('/assets/data/projects.json').then((response) => { if (!response.ok) throw new Error(`Project data returned ${response.status}`); return response.json(); }),
    portuguese ? fetch('/assets/data/projects.pt.json').then((response) => { if (!response.ok) throw new Error(`Portuguese project data returned ${response.status}`); return response.json(); }) : Promise.resolve(null)
  ]).then(([sourceProjects, localized]) => {
      const projects = sourceProjects.map((project) => portuguese ? { ...project, ...localized[project.slug] } : project);
      containers.forEach((container) => {
        const selectedOnly = container.dataset.projectGrid === 'selected';
        const limit = Number(container.dataset.limit || projects.length);
        const visibleProjects = projects.filter((project) => !selectedOnly || project.selected).slice(0, limit);
        container.innerHTML = visibleProjects.map(card).join('');
      });

      document.dispatchEvent(new Event('projects:rendered'));
      document.dispatchEvent(new Event('projects:ready'));
      const count = document.querySelector('[data-work-count]');
      if (count) count.textContent = `${projects.length} ${portuguese ? 'projetos' : 'projects'}`;

      const filters = document.querySelectorAll('[data-filter]');
      filters.forEach((button) => {
        button.addEventListener('click', () => {
          filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
          const active = button.dataset.filter;
          document.querySelectorAll('.project-card').forEach((projectCard) => {
            const categories = projectCard.dataset.categories.split('|');
            projectCard.hidden = active !== 'All' && !categories.includes(active);
          });
          const visibleCount = document.querySelectorAll('.project-card:not([hidden])').length;
          if (count) count.textContent = portuguese ? `${visibleCount} ${visibleCount === 1 ? 'projeto' : 'projetos'}` : `${visibleCount} project${visibleCount === 1 ? '' : 's'}`;
          const empty = document.querySelector('[data-filter-empty]');
          if (empty) empty.hidden = visibleCount !== 0;
        });
      });
    })
    .catch((error) => {
      containers.forEach((container) => {
        container.innerHTML = `<p class="status">${portuguese ? 'Não foi possível carregar os projetos. Tente novamente.' : 'Project data could not be loaded. Please try again.'}</p>`;
      });
      console.error(error);
    });
}());
