(function () {
  const section = document.querySelector('[data-vision-parallax]');
  if (!section) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;

  function render() {
    x += (targetX - x) * .1;
    y += (targetY - y) * .1;
    section.style.setProperty('--vision-photo-x', `${(x * 22).toFixed(2)}px`);
    section.style.setProperty('--vision-photo-y', `${(y * 15).toFixed(2)}px`);
    section.style.setProperty('--vision-text-x', `${(x * -9).toFixed(2)}px`);
    section.style.setProperty('--vision-text-y', `${(y * -7).toFixed(2)}px`);
    frame = Math.abs(targetX - x) + Math.abs(targetY - y) > .002 ? requestAnimationFrame(render) : 0;
  }

  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function reset() { targetX = targetY = 0; schedule(); }
  section.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
    const bounds = section.getBoundingClientRect();
    targetX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    targetY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    schedule();
  }, { passive: true });
  section.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  finePointer.addEventListener('change', reset);
  reducedMotion.addEventListener('change', reset);
}());
