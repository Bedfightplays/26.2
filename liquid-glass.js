/* Liquid Glass surface initializer.
   Deliberately no cursor-following glow and no false claim of browser refraction. */
(() => {
  const selector = [
    '.navbar', 'body > nav', '.glass-card', '.card', '.card1', '.card2', '.card3', '.card4',
    '.experience-panel', '.feature-card', '.theme-toggle', '.btn', '.panel',
    '.youtube-embed-panel', '.video-error', '.video-card', '.filter-btn',
    '.yt-card', '.split-card', '.player-box', '.cta-inner', '.stat',
    '.hero-badge', '.tag', '.status', '.social-card', '.resource-card',
    '.client-card', '.wide-card', '.about-section', '.channel-link', '.footer', 'footer', '.hero-stats > div'
  ].join(',');
  document.querySelectorAll(selector).forEach(el => el.classList.add('lg-surface'));
})();