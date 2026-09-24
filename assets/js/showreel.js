(function () {
  const portuguese = document.documentElement.lang === 'pt-BR';
  const stage = document.querySelector('[data-showreel]');
  const iframe = stage?.querySelector('[data-showreel-frame]');
  const playButton = stage?.querySelector('[data-reel-play]');
  const soundButton = stage?.querySelector('[data-reel-sound]');
  const playLabel = playButton?.querySelector('[data-reel-play-label]');
  const soundLabel = soundButton?.querySelector('[data-reel-sound-label]');
  const fallback = stage?.querySelector('[data-reel-fallback]');
  if (!stage || !iframe || !playButton || !soundButton || !playLabel || !soundLabel || !fallback) return;

  const origin = 'https://player.vimeo.com';
  let ready = false;
  let loaded = false;
  let playing = true;
  let muted = true;

  function send(method, value) {
    const message = value === undefined ? { method } : { method, value };
    iframe.contentWindow?.postMessage(message, origin);
  }

  function updatePlay() {
    playButton.dataset.state = playing ? 'playing' : 'paused';
    playLabel.textContent = portuguese ? (playing ? 'Reproduzindo' : 'Pausado') : (playing ? 'Playing' : 'Paused');
    playButton.setAttribute('aria-label', portuguese ? (playing ? 'Pausar showreel' : 'Reproduzir showreel') : (playing ? 'Pause showreel' : 'Play showreel'));
    playButton.setAttribute('aria-pressed', String(playing));
  }

  function updateSound() {
    soundButton.dataset.state = muted ? 'off' : 'on';
    soundLabel.textContent = portuguese ? (muted ? 'Som desligado' : 'Som ligado') : (muted ? 'Sound off' : 'Sound on');
    soundButton.setAttribute('aria-label', portuguese ? (muted ? 'Ativar som' : 'Desativar som') : (muted ? 'Turn sound on' : 'Mute showreel'));
    soundButton.setAttribute('aria-pressed', String(!muted));
  }

  function onReady() {
    if (ready) return;
    ready = true;
    loaded = true;
    stage.classList.add('is-loaded');
    fallback.hidden = true;
    send('addEventListener', 'play');
    send('addEventListener', 'playing');
    send('addEventListener', 'pause');
    send('getPaused');
    send('getMuted');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      send('pause');
      playing = false;
      updatePlay();
    }
  }

  window.addEventListener('message', (event) => {
    if (event.origin !== origin || event.source !== iframe.contentWindow) return;
    let data = event.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { return; }
    }
    if (!data || typeof data !== 'object') return;
    if (data.event === 'ready' || data.method === 'ping') onReady();
    if (data.event === 'play' || data.event === 'playing') {
      playing = true;
      stage.classList.add('is-playing');
      updatePlay();
    }
    if (data.event === 'pause') {
      playing = false;
      updatePlay();
    }
    if (data.method === 'getPaused' && typeof data.value === 'boolean') {
      playing = !data.value;
      updatePlay();
    }
    if ((data.method === 'setMuted' || data.method === 'getMuted') && typeof data.value === 'boolean') {
      muted = data.value;
      updateSound();
    }
    if (data.event === 'error' && data.data?.method === 'setMuted') {
      muted = !muted;
      updateSound();
    }
  });

  playButton.addEventListener('click', () => {
    const nextPlaying = !playing;
    send(nextPlaying ? 'play' : 'pause');
    playing = nextPlaying;
    updatePlay();
  });
  soundButton.addEventListener('click', () => {
    if (muted) send('setVolume', 1);
    send('setMuted', !muted);
    muted = !muted;
    updateSound();
  });

  iframe.addEventListener('load', () => {
    loaded = true;
    stage.classList.add('is-loaded');
    playButton.hidden = false;
    soundButton.hidden = false;
    playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    updatePlay();
    updateSound();
    send('ping');
    if (!playing) send('pause');
  });
  send('ping');
  window.setTimeout(() => { if (!loaded) fallback.hidden = false; }, 9000);
}());
