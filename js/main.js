(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  let raf = 0, x = 0, y = 0, tx = 0, ty = 0;
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5) * 12; ty = (e.clientY / innerHeight - .5) * 12; if (!raf) raf = requestAnimationFrame(tick); });
  }
  function tick(){ x += (tx-x)*.06; y += (ty-y)*.06; root.style.setProperty('--pointer-x', `${x.toFixed(2)}px`); root.style.setProperty('--pointer-y', `${y.toFixed(2)}px`); raf = requestAnimationFrame(tick); }
  if (!reduced && matchMedia('(pointer:fine)').matches) tick();

  const nativeTimeline = CSS.supports && CSS.supports('animation-timeline:view()');
  if (!nativeTimeline) {
    let last = 0;
    addEventListener('scroll', () => {
      const now = performance.now();
      if (now - last < 50) return;
      last = now;
      root.style.setProperty('--page-progress', (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(4));
    }, {passive:true});
  }
})();
