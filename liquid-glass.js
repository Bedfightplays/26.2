/* Liquid Glass interactions and progressive SVG refraction enhancement. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  svg.innerHTML = `<filter id="liquidGlassRefraction" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="8" result="noise"/>
    <feGaussianBlur in="noise" stdDeviation="1.1" result="softNoise"/>
    <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="5.5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`;
  document.body.prepend(svg);
  const surfaces = document.querySelectorAll('.navbar, body > nav, .glass-card, .card, .experience-panel, .feature-card, .theme-toggle, .btn, .panel, .yt-card, .split-card, .player-box, .cta-inner, .stat, .hero-badge, .tag, .status');
  surfaces.forEach(el => {
    el.classList.add('lg-surface');
    if (!reduceMotion) {
      el.addEventListener('pointermove', event => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--lg-x', Math.max(0, Math.min(100, ((event.clientX-r.left)/r.width)*100))+'%');
        el.style.setProperty('--lg-y', Math.max(0, Math.min(100, ((event.clientY-r.top)/r.height)*100))+'%');
      }, {passive:true});
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--lg-x','18%'); el.style.setProperty('--lg-y','0%');
      }, {passive:true});
    }
  });
  if (CSS.supports('filter','url(#liquidGlassRefraction)')) document.documentElement.classList.add('lg-svg-filter-supported');
})();