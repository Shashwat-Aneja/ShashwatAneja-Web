(() => {
  const nav = document.querySelector('[data-nav]');
  if (!nav || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let last = scrollY;
  addEventListener('scroll', () => { const y = scrollY; if (y > 80 && y > last + 8) nav.classList.add('is-hidden'); else if (y < last - 8) nav.classList.remove('is-hidden'); last = y; }, {passive:true});
})();
