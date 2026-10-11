/* Liquid Glass v2: pointer-reactive reflections and progressive backdrop refraction.
   Browsers without SVG backdrop-filter support retain the transparent glass fallback. */
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.style.cssText = 'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none';
  svg.innerHTML = `
    <filter id="liquidGlassRefraction" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="glassNoise"/>
      <feGaussianBlur in="glassNoise" stdDeviation="1.15" result="softNoise"/>
      <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="8" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
  document.body.prepend(svg);

  const canRefractBackdrop = CSS.supports('backdrop-filter', 'url(#liquidGlassRefraction)');
  if (canRefractBackdrop) document.documentElement.classList.add('lg-refraction-supported');

  const selector = [
    '.navbar', 'body > nav', '.glass-card', '.card', '.card1', '.card2', '.card3', '.card4',
    '.experience-panel', '.feature-card', '.theme-toggle', '.btn', '.panel',
    '.youtube-embed-panel', '.video-error', '.video-card', '.filter-btn',
    '.yt-card', '.split-card', '.player-box', '.cta-inner', '.stat',
    '.hero-badge', '.tag', '.status', '.social-card', '.resource-card'
  ].join(',');
  document.querySelectorAll(selector).forEach(el => {
    el.classList.add('lg-surface');
    if (!reduceMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      el.addEventListener('pointermove', event => {
        const rect = el.getBoundingClientRect();
        const px = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
        const py = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100));
        el.style.setProperty('--lg-x', px + '%');
        el.style.setProperty('--lg-y', py + '%');
        el.style.setProperty('--lg-angle', (Math.atan2(py - 50, px - 50) * 180 / Math.PI) + 'deg');
      }, { passive: true });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--lg-x', '18%');
        el.style.setProperty('--lg-y', '0%');
        el.style.removeProperty('--lg-angle');
      }, { passive: true });
    }
  });
})();