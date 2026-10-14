/* Dicestack88 Liquid Glass — controlled single-pass SVG refraction.
   Real refraction is limited to surfaces selected by surfaceSelectors.
   This script now respects the user's `glass` preference ("liquid" vs "frosted")
   stored in localStorage and listens for the `glass-mode-change` CustomEvent and
   storage events so the UI toggle works immediately across tabs.
*/
(() => {
  'use strict';

  const surfaceSelectors = [
    '.navbar', 'body > nav', '.glass-card', '.card', '.card1', '.card2', '.card3', '.card4',
    '.experience-panel', '.feature-card', '.theme-toggle', '.btn', '.panel',
    '.youtube-embed-panel', '.video-error', '.video-card', '.filter-btn', '.yt-card',
    '.split-card', '.player-box', '.cta-inner', '.stat', '.hero-badge', '.tag', '.status',
    '.social-card', '.resource-card', '.client-card', '.wide-card', '.about-section',
    '.channel-link', '.footer', 'footer', '.hero-stats > div'
  ].join(',');

  function addFilter() {
    if (document.getElementById('liquidGlassRefraction')) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';

    const defs = document.createElementNS(svgNS, 'defs');
    const filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', 'liquidGlassRefraction');
    filter.setAttribute('x', '-12%');
    filter.setAttribute('y', '-12%');
    filter.setAttribute('width', '124%');
    filter.setAttribute('height', '124%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    // Tuned turbulence + subtle blur to produce a smoother, thicker "liquid" lens.
    const noise = document.createElementNS(svgNS, 'feTurbulence');
    noise.setAttribute('type', 'fractalNoise');
    // slightly lower frequency for larger, softer waves that match the reference image
    noise.setAttribute('baseFrequency', '0.009 0.014');
    noise.setAttribute('numOctaves', '2');
    noise.setAttribute('seed', '7');
    noise.setAttribute('result', 'lensMap');

    // Smooth the turbulence map so refraction feels more glassy and less grainy
    const blur = document.createElementNS(svgNS, 'feGaussianBlur');
    blur.setAttribute('in', 'lensMap');
    blur.setAttribute('stdDeviation', '1');
    blur.setAttribute('result', 'lensBlur');

    // Displace the source graphic using the smoothed turbulence map.
    const displacement = document.createElementNS(svgNS, 'feDisplacementMap');
    displacement.setAttribute('in', 'SourceGraphic');
    displacement.setAttribute('in2', 'lensBlur');
    // scale gives the strength of the warp; 14 is noticeable but tasteful
    displacement.setAttribute('scale', '14');
    displacement.setAttribute('xChannelSelector', 'R');
    displacement.setAttribute('yChannelSelector', 'G');

    filter.append(noise, blur, displacement);
    defs.append(filter);
    svg.append(defs);
    (document.body || document.documentElement).prepend(svg);
  }

  function init() {
    const root = document.documentElement;
    // ensure every surface gets the lg-surface helper class
    const surfaces = Array.from(document.querySelectorAll(surfaceSelectors));
    surfaces.forEach(el => el.classList.add('lg-surface'));

    // Chromium-only progressive enhancement. Other browsers keep the CSS glass fallback.
    const isChromium = /Chrome|Chromium|Edg\//.test(navigator.userAgent) && !/OPR\//.test(navigator.userAgent);
    const supportsBlur = window.CSS && CSS.supports && CSS.supports('backdrop-filter', 'blur(1px)');

    if (!isChromium || !supportsBlur) {
      root.classList.remove('lg-refraction-supported', 'lg-svg-filter-supported');
      return;
    }

    addFilter();

    // Controller to enable/disable heavy SVG refraction based on mode
    function applyMode(mode) {
      // safety: on very low-end devices prefer frosted mode regardless
      const deviceMemory = navigator.deviceMemory || 0;
      const cores = navigator.hardwareConcurrency || 0;
      if (mode === 'liquid' && (deviceMemory && deviceMemory < 1.5 || cores && cores < 2)) {
        // force fallback on very constrained devices
        mode = 'frosted';
        console.info('Liquid glass disabled on low-memory/low-core device — using frosted fallback');
      }

      if (mode === 'liquid') {
        surfaces.forEach(el => el.classList.add('lg-lens-active'));
        root.classList.add('lg-refraction-supported', 'lg-svg-filter-supported');
      } else {
        surfaces.forEach(el => el.classList.remove('lg-lens-active'));
        root.classList.remove('lg-refraction-supported', 'lg-svg-filter-supported');
      }
    }

    // initial mode read from localStorage (set by theme.js UI)
    const initialMode = localStorage.getItem('glass') || 'liquid';
    applyMode(initialMode);

    // react to UI toggle events inside the page
    window.addEventListener('glass-mode-change', (e) => {
      const mode = (e && e.detail) ? e.detail : (localStorage.getItem('glass') || 'liquid');
      applyMode(mode);
    });

    // react to storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'glass') {
        applyMode(e.newValue || 'liquid');
      }
    });

    // expose a simple programmatic API for debugging or future use
    root.liquidGlass = root.liquidGlass || {};
    root.liquidGlass.applyMode = applyMode;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
