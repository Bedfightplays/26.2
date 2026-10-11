/* Liquid Glass — SVG displacement on Chromium, graceful blur fallback elsewhere.
   No cursor-following highlight: reflections are static and edge-based. */
(() => {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.style.cssText = 'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none';
  svg.innerHTML = `
    <filter id="liquidGlassRefraction" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.011" numOctaves="1" seed="8" result="lensMap"/>
      <feGaussianBlur in="lensMap" stdDeviation="1.2" result="softLensMap"/>
      <feDisplacementMap in="SourceGraphic" in2="softLensMap" scale="-17" xChannelSelector="R" yChannelSelector="G" result="refracted"/>
      <feColorMatrix in="refracted" type="saturate" values="1.18"/>
    </filter>`;
  document.body.prepend(svg);

  // URL-based SVG backdrop filters currently work most reliably in Chromium.
  const ua = navigator.userAgent;
  const chromium = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
  if (chromium) document.documentElement.classList.add('lg-refraction-supported');

  const selector = [
    '.navbar', 'body > nav', '.glass-card', '.card', '.card1', '.card2', '.card3', '.card4',
    '.experience-panel', '.feature-card', '.theme-toggle', '.btn', '.panel',
    '.youtube-embed-panel', '.video-error', '.video-card', '.filter-btn',
    '.yt-card', '.split-card', '.player-box', '.cta-inner', '.stat',
    '.hero-badge', '.tag', '.status', '.social-card', '.resource-card',
    '.client-card', '.wide-card', '.about-section', '.channel-link', '.footer',
    'footer', '.hero-stats > div'
  ].join(',');
  document.querySelectorAll(selector).forEach(el => el.classList.add('lg-surface'));
})();