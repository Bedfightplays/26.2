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
    // scale increased from 10 -> 14 for a more noticeable, but still tasteful warp
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

    // Apply the expensive optical effect to every matched surface. This produces
    // the iOS‑like liquid refraction across cards, navbar, and other surfaces.
    const surfaces = Array.from(document.querySelectorAll(surfaceSelectors));
    surfaces.forEach(el => el.classList.add('lg-lens-active'));

    // indicate support on the root so CSS can enable the refraction-backed rules
    if (surfaces.length) root.classList.add('lg-refraction-supported', 'lg-svg-filter-supported');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
