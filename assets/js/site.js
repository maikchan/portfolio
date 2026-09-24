(function () {
  const portuguese = document.documentElement.lang === 'pt-BR';
  const menuButton = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');

  function closeMenu(returnFocus) {
    if (!menuButton || !menu) return;
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', portuguese ? 'Abrir menu' : 'Open menu');
    if (returnFocus) menuButton.focus();
  }

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      menu.classList.toggle('is-open', willOpen);
      menuButton.setAttribute('aria-expanded', String(willOpen));
      menuButton.setAttribute('aria-label', portuguese ? (willOpen ? 'Fechar menu' : 'Abrir menu') : (willOpen ? 'Close menu' : 'Open menu'));
    });
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) closeMenu(true);
    });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const observer = !reducedMotion && 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -24px', threshold: .08 }) : null;
  function observeReveals(root = document) {
    root.querySelectorAll('.reveal:not([data-observed])').forEach((element, index) => {
      element.dataset.observed = 'true';
      if (!observer) return;
      element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 70}ms`);
      element.classList.add('is-pending');
      observer.observe(element);
    });
  }
  document.querySelectorAll('.section-head, .split > *, .work-with article, .capability, .statement').forEach((element) => element.classList.add('reveal'));
  observeReveals();
  document.addEventListener('projects:rendered', () => observeReveals());
  const hero = document.querySelector('.hero-inner');
  if (hero && !reducedMotion) {
    [...hero.children].forEach((element, index) => {
      element.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 650, delay: index * 90, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    });
  }

  // Keep pointer motion local to the hero and stop rendering once it settles.
  const heroSection = document.querySelector('.hero');
  const homeHeader = document.querySelector('.site-header--home');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
  if (homeHeader && heroSection) {
    const updateHeader = () => homeHeader.classList.toggle('is-past-hero', window.scrollY > heroSection.offsetHeight - 110);
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader, { passive: true });
    updateHeader();
  }
  if (heroSection) {
    let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;
    let enabled = false;
    function renderParallax() {
      x += (targetX - x) * .1;
      y += (targetY - y) * .1;
      heroSection.style.setProperty('--hero-x', `${(x * 32).toFixed(2)}px`);
      heroSection.style.setProperty('--hero-y', `${(y * 22).toFixed(2)}px`);
      heroSection.style.setProperty('--text-x', `${(x * -14).toFixed(2)}px`);
      heroSection.style.setProperty('--text-y', `${(y * -10).toFixed(2)}px`);
      heroSection.style.setProperty('--spot-x', `${(64 + x * 7).toFixed(2)}%`);
      heroSection.style.setProperty('--spot-y', `${(38 + y * 6).toFixed(2)}%`);
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > .001 ? requestAnimationFrame(renderParallax) : 0;
    }
    function schedule() { if (!frame && enabled) frame = requestAnimationFrame(renderParallax); }
    function reset() { targetX = targetY = 0; schedule(); }
    function updateMotion() {
      enabled = finePointer.matches && !motionPreference.matches;
      heroSection.classList.toggle('has-parallax', enabled);
      if (!enabled) { cancelAnimationFrame(frame); frame = 0; x = y = targetX = targetY = 0; }
    }
    heroSection.addEventListener('pointermove', (event) => {
      if (!enabled || event.pointerType === 'touch') return;
      const bounds = heroSection.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      targetY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
      schedule();
    }, { passive: true });
    heroSection.addEventListener('pointerleave', reset);
    heroSection.addEventListener('focusin', reset);
    motionPreference.addEventListener('change', updateMotion);
    finePointer.addEventListener('change', updateMotion);
    updateMotion();
  }

  const timeline = document.querySelector('[data-timeline]');
  const timelineToggle = document.querySelector('[data-timeline-toggle]');
  if (timeline && timelineToggle) {
    let inView = false;
    let paused = false;
    const wideScreen = window.matchMedia('(min-width: 761px)');
    function updateTimeline() {
      const canAnimate = !motionPreference.matches && wideScreen.matches;
      timelineToggle.hidden = !canAnimate;
      timeline.classList.toggle('is-playing', canAnimate && inView && !paused && !document.hidden);
    }
    timelineToggle.addEventListener('click', () => {
      paused = !paused;
      timelineToggle.setAttribute('aria-pressed', String(paused));
      timelineToggle.textContent = portuguese
        ? (paused ? 'Retomar animação da linha do tempo' : 'Pausar animação da linha do tempo')
        : (paused ? 'Resume timeline animation' : 'Pause timeline animation');
      updateTimeline();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateTimeline(); }).observe(timeline);
    } else { inView = true; }
    motionPreference.addEventListener('change', updateTimeline);
    wideScreen.addEventListener('change', updateTimeline);
    document.addEventListener('visibilitychange', updateTimeline);
    updateTimeline();
  }

  function createFilmFrame(id, title, { muted = true, loop = false, preview = false } = {}) {
    const iframe = document.createElement('iframe');
    const query = new URLSearchParams({ autoplay: '1', muted: muted ? '1' : '0', loop: loop ? '1' : '0', autopause: '0', background: preview ? '1' : '0', controls: preview ? '0' : '1', color: 'BDA562', title: '0', byline: '0', portrait: '0', api: '1' });
    iframe.src = `https://player.vimeo.com/video/${encodeURIComponent(id)}?${query}`;
    iframe.title = title || (portuguese ? 'Filme de Maikon Winter' : 'Film by Maikon Winter');
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    return iframe;
  }

  function primeCardPreview(card) {
    const media = card.querySelector('.project-card__media');
    if (!media || media.querySelector('iframe') || !finePointer.matches || motionPreference.matches) return;
    const iframe = createFilmFrame(card.dataset.videoId, card.dataset.videoTitle, { muted: true, loop: true, preview: true });
    iframe.className = 'project-card__preview';
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.addEventListener('load', () => {
      media.classList.add('is-preview-ready');
      if (card.matches(':hover') || card.contains(document.activeElement)) media.classList.add('is-previewing');
    }, { once: true });
    media.prepend(iframe);
  }

  function showCardPreview(card) {
    primeCardPreview(card);
    const media = card.querySelector('.project-card__media');
    if (media?.classList.contains('is-preview-ready')) media.classList.add('is-previewing');
  }

  function hideCardPreview(card) { card.querySelector('.project-card__media')?.classList.remove('is-previewing'); }

  const previewObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const card = entry.target;
      if (entry.isIntersecting) primeCardPreview(card);
      else {
        hideCardPreview(card);
        const media = card.querySelector('.project-card__media');
        media?.classList.remove('is-preview-ready');
        media?.querySelector('iframe')?.remove();
      }
    });
  }, { rootMargin: '350px 0px' }) : null;

  function setupCardPreviews() {
    if (motionPreference.matches || !finePointer.matches) return;
    document.querySelectorAll('.project-card[data-video-id]:not([data-preview-ready])').forEach((card) => {
      card.dataset.previewReady = 'true';
      card.addEventListener('mouseenter', () => showCardPreview(card));
      card.addEventListener('mouseleave', () => hideCardPreview(card));
      card.addEventListener('focusin', () => showCardPreview(card));
      card.addEventListener('focusout', () => hideCardPreview(card));
      if (previewObserver) previewObserver.observe(card);
    });
  }
  document.addEventListener('projects:ready', setupCardPreviews);
  function clearCardPreviews() {
    document.querySelectorAll('.project-card').forEach((card) => {
      hideCardPreview(card);
      const media = card.querySelector('.project-card__media');
      media?.classList.remove('is-preview-ready');
      media?.querySelector('iframe')?.remove();
      previewObserver?.unobserve(card);
      delete card.dataset.previewReady;
    });
  }
  finePointer.addEventListener('change', () => {
    if (!finePointer.matches) clearCardPreviews();
    else setupCardPreviews();
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) clearCardPreviews();
    else setupCardPreviews();
  });

  document.addEventListener('click', (event) => {
    const scrollButton = event.target.closest('[data-scroll-to]');
    if (scrollButton) {
      document.getElementById(scrollButton.dataset.scrollTo)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    const playerButton = event.target.closest('[data-film-player]');
    if (playerButton) {
      const iframe = createFilmFrame(playerButton.dataset.filmPlayer, playerButton.dataset.videoTitle, { muted: false });
      playerButton.replaceWith(iframe);
      iframe.focus();
      return;
    }
  });
}());
