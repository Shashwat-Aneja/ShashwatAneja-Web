(() => {
  const notice = document.querySelector('[data-privacy-notice]');
  if (!notice) return;
  const key = 'shashwat-privacy-notice-seen';
  try {
    if (localStorage.getItem(key) === '1') notice.hidden = true;
  } catch (_) {}
  const button = notice.querySelector('[data-privacy-dismiss]');
  button?.addEventListener('click', () => {
    notice.classList.add('is-dismissed');
    try { localStorage.setItem(key, '1'); } catch (_) {}
    window.setTimeout(() => { notice.hidden = true; }, 350);
  });
})();
