(() => {
  const loader = document.querySelector('[data-site-loader]');
  if (!loader) return;
  const finish = () => {
    loader.classList.add('is-ready');
    window.setTimeout(() => loader.remove(), 500);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.setTimeout(finish, 120), { once: true });
  } else {
    window.setTimeout(finish, 120);
  }
})();
