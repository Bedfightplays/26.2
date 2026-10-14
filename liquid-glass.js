/* Dicestack88 Liquid Glass — lightweight, stable fallback.
   Deliberately avoids SVG backdrop filters and canvas displacement maps: those caused
   severe scrolling lag and unwanted RGB/chromatic artifacts in Chromium. */
(() => {
  const selectors = [
    '.navbar','body > nav','.glass-card','.card','.card1','.card2','.card3','.card4',
    '.experience-panel','.feature-card','.theme-toggle','.btn','.panel',
    '.youtube-embed-panel','.video-error','.video-card','.filter-btn','.yt-card',
    '.split-card','.player-box','.cta-inner','.stat','.hero-badge','.tag','.status',
    '.social-card','.resource-card','.client-card','.wide-card','.about-section',
    '.channel-link','.footer','footer','.hero-stats > div'
  ].join(',');
  function init() {
    document.querySelectorAll(selectors).forEach(el => el.classList.add('lg-surface'));
    document.documentElement.classList.remove('lg-refraction-supported','lg-svg-filter-supported');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();