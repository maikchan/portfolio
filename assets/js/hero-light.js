(function () {
  const hero = document.querySelector('.concept .hero');
  const media = hero?.querySelector('.hero-media');
  if (!hero || !media) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0, y = 0, targetX = 0, targetY = 0;
  let strength = 0, targetStrength = 0, frame = 0;

  function render() {
    x += (targetX - x) * .2;
    y += (targetY - y) * .2;
    strength += (targetStrength - strength) * .22;
    hero.style.setProperty('--reveal-x', `${x.toFixed(1)}px`);
    hero.style.setProperty('--reveal-y', `${y.toFixed(1)}px`);
    hero.style.setProperty('--reveal-alpha', (.48 - .46 * strength).toFixed(3));
    hero.style.setProperty('--light-x', `${(x + media.offsetLeft).toFixed(1)}px`);
    hero.style.setProperty('--light-y', `${y.toFixed(1)}px`);
    hero.style.setProperty('--light-glow', (.07 * strength).toFixed(3));
    if (Math.abs(targetX - x) + Math.abs(targetY - y) + Math.abs(targetStrength - strength) > .02) {
      frame = requestAnimationFrame(render);
    } else {
      frame = 0;
    }
  }

  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function fade() { targetStrength = 0; schedule(); }
  function active() { return finePointer.matches && !reducedMotion.matches; }

  hero.addEventListener('pointermove', (event) => {
    if (!active() || event.pointerType === 'touch') return;
    const bounds = media.getBoundingClientRect();
    const heroBounds = hero.getBoundingClientRect();
    if (event.clientX < heroBounds.left + heroBounds.width * .69 || event.clientX > bounds.right) { fade(); return; }
    targetX = event.clientX - bounds.left;
    targetY = event.clientY - bounds.top;
    targetStrength = 1;
    schedule();
  }, { passive: true });

  hero.addEventListener('pointerleave', fade);
  window.addEventListener('blur', fade);
  document.addEventListener('visibilitychange', () => { if (document.hidden) fade(); });
  finePointer.addEventListener('change', () => { if (!active()) fade(); });
  reducedMotion.addEventListener('change', () => { if (!active()) fade(); });

  const mobile = window.matchMedia('(max-width: 760px)');
  let scrollFrame = 0;
  let hasLeftHero = false;
  let reentryTimer = 0;
  function updateScroll(initial = false) {
    scrollFrame = 0;
    if (reducedMotion.matches) {
      hero.style.setProperty('--mobile-photo-y', '0px');
      hero.style.setProperty('--hero-scroll-opacity', '1');
      hero.classList.remove('is-awaiting-return', 'is-reentering');
      hasLeftHero = false;
      clearTimeout(reentryTimer);
      return;
    }
    const bounds = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -bounds.top / bounds.height));
    hero.style.setProperty('--mobile-photo-y', mobile.matches ? `${(progress * 34).toFixed(1)}px` : '0px');
    hero.style.setProperty('--hero-scroll-opacity', Math.max(0, 1 - Math.max(0, progress - .08) / .58).toFixed(3));

    if (progress >= .84) {
      hasLeftHero = true;
      hero.classList.remove('is-reentering');
      hero.classList.add('is-awaiting-return');
      clearTimeout(reentryTimer);
    } else if (!initial && hasLeftHero && progress <= .52) {
      hasLeftHero = false;
      // Keep the copy hidden until the staggered reveal starts in this same frame.
      hero.classList.remove('is-awaiting-return');
      hero.classList.add('is-reentering');
      clearTimeout(reentryTimer);
      reentryTimer = setTimeout(() => hero.classList.remove('is-reentering'), 1750);
    }
  }
  function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(() => updateScroll()); }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  document.body.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  mobile.addEventListener('change', scheduleScroll);
  reducedMotion.addEventListener('change', scheduleScroll);
  updateScroll(true);
}());
