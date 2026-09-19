(() => {
  let ticking = false;
  const subscribers = new Set();
  const state = { y: 0, progress: 0 };
  const update = () => { ticking = false; state.y = scrollY; state.progress = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); subscribers.forEach(fn => fn(state)); };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, {passive:true});
  window.ScrollEngine = { subscribe(fn){ subscribers.add(fn); return () => subscribers.delete(fn); }, getState(){ return {...state}; } };
})();
