(function () {
  const containers = document.querySelectorAll('[data-project-grid]');
  if (!containers.length) return;

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  }[character]));

  function card(project) {
    const categories = project.categories.join(' · ');
    return `
      <article class="project-card reveal" data-categories="${escapeHtml(project.categories.join('|'))}" data-video-id="${escapeHtml(project.videoId)}" data-video-title="${escapeHtml(project.title)}">
        <div class="project-card__media">
          <a class="project-card__link" href="/work/${encodeURIComponent(project.slug)}/" aria-label="Open project: ${escapeHtml(project.title)}">
            <img src="${escapeHtml(project.poster)}" alt="${escapeHtml(project.posterAlt)}" width="960" height="1707" loading="lazy" decoding="async">
            <div class="project-card__overlay" aria-hidden="true">
              <p>${escapeHtml(project.cardDescription)}</p>
              <span>Open project</span>
            </div>
          </a>
        </div>
          <div class="project-card__meta">
            <h3 class="project-card__title">${escapeHtml(project.title)}</h3>
            <span class="project-card__category">${escapeHtml(categories)}</span>
          </div>
        <details class="project-card__details">
          <summary>About this project</summary>
          <p>${escapeHtml(project.cardDescription)} <a class="button button--text" href="/work/${encodeURIComponent(project.slug)}/">Open project</a></p>
        </details>
      </article>`;
  }

  fetch('/assets/data/projects.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Project data returned ${response.status}`);
      return response.json();
    })
    .then((projects) => {
      containers.forEach((container) => {
        const selectedOnly = container.dataset.projectGrid === 'selected';
        const limit = Number(container.dataset.limit || projects.length);
        const visibleProjects = projects.filter((project) => !selectedOnly || project.selected).slice(0, limit);
        container.innerHTML = visibleProjects.map(card).join('');
      });

      document.dispatchEvent(new Event('projects:rendered'));
      document.dispatchEvent(new Event('projects:ready'));
      const count = document.querySelector('[data-work-count]');
      if (count) count.textContent = `${projects.length} projects`;

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
          if (count) count.textContent = `${visibleCount} project${visibleCount === 1 ? '' : 's'}`;
          const empty = document.querySelector('[data-filter-empty]');
          if (empty) empty.hidden = visibleCount !== 0;
        });
      });
    })
    .catch((error) => {
      containers.forEach((container) => {
        container.innerHTML = '<p class="status">Project data could not be loaded. Please try again.</p>';
      });
      console.error(error);
    });
}());
