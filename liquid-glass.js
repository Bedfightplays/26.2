/* Dicestack88 Liquid Glass — controlled single-pass SVG refraction.
   Real refraction is limited to the navbar and one large feature panel.
   No RGB-split/chromatic passes, canvas maps, pointer-driven filters, or scroll work. */
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
    filter.setAttribute('x', '-8%');
    filter.setAttribute('y', '-8%');
    filter.setAttribute('width', '116%');
    filter.setAttribute('height', '116%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    // One subtle displacement pass. No separate red/green/blue channels.
    const noise = document.createElementNS(svgNS, 'feTurbulence');
    noise.setAttribute('type', 'fractalNoise');
    noise.setAttribute('baseFrequency', '0.012 0.018');
    noise.setAttribute('numOctaves', '1');
    noise.setAttribute('seed', '7');
    noise.setAttribute('result', 'lensMap');

    const displacement = document.createElementNS(svgNS, 'feDisplacementMap');
    displacement.setAttribute('in', 'SourceGraphic');
    displacement.setAttribute('in2', 'lensMap');
    displacement.setAttribute('scale', '10');
    displacement.setAttribute('xChannelSelector', 'R');
    displacement.setAttribute('yChannelSelector', 'G');

    filter.append(noise, displacement);
    defs.append(filter);
    svg.append(defs);
    (document.body || document.documentElement).prepend(svg);
  }

  function init() {
    const root = document.documentElement;
    document.querySelectorAll(surfaceSelectors).forEach(el => el.classList.add('lg-surface'));

    // Chromium-only progressive enhancement. Other browsers keep the CSS glass fallback.
    const isChromium = /Chrome|Chromium|Edg\//.test(navigator.userAgent) &&
      !/OPR\//.test(navigator.userAgent);
    const supportsBlur = window.CSS && CSS.supports &&
      CSS.supports('backdrop-filter', 'blur(1px)');

    if (!isChromium || !supportsBlur) {
      root.classList.remove('lg-refraction-supported', 'lg-svg-filter-supported');
      return;
    }

    addFilter();

    // Only two large surfaces get the expensive optical effect; no cards/buttons in bulk.
    const navbar = document.querySelector('.navbar, body > nav');
    const featurePanel = document.querySelector('.experience-panel, .hero-panel, .hero-card');
    if (navbar) navbar.classList.add('lg-lens-active');
    if (featurePanel && featurePanel !== navbar) featurePanel.classList.add('lg-lens-active');

    if (navbar || featurePanel) root.classList.add('lg-refraction-supported');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
