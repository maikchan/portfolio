(function () {
  const language = document.documentElement.lang === 'pt-BR' ? 'pt' : 'en';
  const path = window.location.pathname;
  const home = path === '/' || path === '/index.html';
  let saved = null;
  try { saved = localStorage.getItem('maikon-language'); } catch {}

  if (language === 'pt') {
    try { localStorage.setItem('maikon-language', 'pt'); } catch {}
  } else if (home && saved === 'pt') {
    window.location.replace(`/pt/${window.location.search}${window.location.hash}`);
    return;
  }

  const gate = document.querySelector('[data-language-gate]');
  if (gate && !saved && home && typeof gate.showModal === 'function') {
    gate.showModal();
    gate.addEventListener('close', () => {
      try { if (!localStorage.getItem('maikon-language')) localStorage.setItem('maikon-language', 'en'); } catch {}
    }, { once: true });
  }

  document.querySelectorAll('[data-language-choice]').forEach((choice) => {
    choice.addEventListener('click', (event) => {
      const selected = choice.dataset.languageChoice;
      try { localStorage.setItem('maikon-language', selected); } catch {}
      if (selected === 'en' && gate?.open && home) {
        event.preventDefault();
        gate.close();
      }
    });
  });
}());
