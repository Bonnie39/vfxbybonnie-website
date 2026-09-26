// Drives the viewer overlay: a time-of-day timecode at 24 fps, a frame
// counter since page load, the timeline playhead (one sweep per minute),
// and the copyright year.
(() => {
  const FPS = 24;

  const timecode = document.querySelector('[data-timecode]');
  const frame = document.querySelector('[data-frame]');
  const timeline = document.querySelector('[data-timeline]');
  const year = document.querySelector('[data-year]');

  if (year) year.textContent = new Date().getFullYear();

  const pad = (n, length = 2) => String(n).padStart(length, '0');
  const start = performance.now();
  let lastText = '';

  function tick(now) {
    const d = new Date();
    const f = Math.floor(d.getMilliseconds() / (1000 / FPS));
    const text = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}:${pad(f)}`;

    // Only touch the DOM when the displayed frame actually changes
    if (text !== lastText) {
      lastText = text;
      if (timecode) timecode.textContent = text;
      if (frame) frame.textContent = pad(Math.floor(((now - start) / 1000) * FPS) % 1e6, 6);
    }

    if (timeline) {
      const progress = (d.getSeconds() + d.getMilliseconds() / 1000) / 60;
      timeline.style.setProperty('--progress', progress.toFixed(4));
    }
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Step once a second instead of running at the display's frame rate
    tick(performance.now());
    setInterval(() => tick(performance.now()), 1000);
  } else {
    const loop = (now) => {
      tick(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
})();
