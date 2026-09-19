(() => {
  'use strict';

  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const list = document.querySelector('[data-project-list]');
  const controls = document.querySelector('[data-project-controls]');
  const count = document.querySelector('[data-project-count]');
  const active = document.querySelector('[data-project-active]');
  const paginationHost = document.querySelector('[data-project-pagination]');

  if (!list || !controls) return;

  const tabs = ['ALL','AI / ML','DATA','SOFTWARE','GAMES','VR / 3D','HARDWARE','AUTOMATION','EXPERIMENTS','ARCHIVE'];
  const perPage = 8;
  let currentFilter = 'ALL';
  let currentPage = 1;

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const repositoryURL = project => `https://github.com/Shashwat-Aneja/${encodeURIComponent(project.slug)}`;
  const projectIcon = project => `<span class="project-icon" aria-hidden="true">${escapeHTML(project.icon || '·')}</span>`;
  const categoryCount = tab => tab === 'ALL' ? projects.length : projects.filter(project => Array.isArray(project.categories) && project.categories.includes(tab)).length;

  controls.innerHTML = tabs.map((tab, index) => `<button type="button" class="project-filter${index === 0 ? ' is-active' : ''}" data-filter="${escapeHTML(tab)}" aria-pressed="${index === 0 ? 'true' : 'false'}">${escapeHTML(tab)}<sup>${categoryCount(tab)}</sup></button>`).join('');

  function getVisible(filter) {
    return filter === 'ALL' ? projects : projects.filter(project => Array.isArray(project.categories) && project.categories.includes(filter));
  }

  function renderPagination(total) {
    if (!paginationHost) return;
    const pages = Math.max(1, Math.ceil(total / perPage));
    paginationHost.innerHTML = `<button type="button" class="archive-prev" data-page-prev ${currentPage === 1 ? 'disabled' : ''}>← PREV</button><div class="archive-pagination__pages" aria-label="Archive pages">${Array.from({length: pages}, (_, i) => { const page = i + 1; return `<button type="button" class="archive-page${page === currentPage ? ' is-active' : ''}" data-page="${page}" aria-current="${page === currentPage ? 'page' : 'false'}">${String(page).padStart(2,'0')}</button>`; }).join('')}</div><span class="archive-pagination__status mono">PAGE ${String(currentPage).padStart(2,'0')} / ${String(pages).padStart(2,'0')}</span><button type="button" class="archive-next" data-page-next ${currentPage === pages ? 'disabled' : ''}>NEXT →</button>`;
  }

  function render(filter = currentFilter, page = currentPage) {
    currentFilter = filter;
    const visible = getVisible(filter);
    const pages = Math.max(1, Math.ceil(visible.length / perPage));
    currentPage = Math.min(Math.max(1, page), pages);
    const start = (currentPage - 1) * perPage;
    const pageItems = visible.slice(start, start + perPage);

    list.innerHTML = pageItems.map((project, index) => {
      const number = String(start + index + 1).padStart(2, '0');
      const categories = Array.isArray(project.categories) ? project.categories.join(' / ') : '';
      return `<a class="project-row" href="${repositoryURL(project)}" target="_blank" rel="noopener noreferrer" data-project="${escapeHTML(project.name)}" data-project-slug="${escapeHTML(project.slug)}" data-cursor-label="VIEW"><div class="project-row__index mono">${number}</div><div class="project-row__icon">${projectIcon(project)}</div><div class="project-row__main"><span class="mono">${escapeHTML(project.type)}</span><h3>${escapeHTML(project.name)}</h3><p>${escapeHTML(project.description)}</p></div><div class="project-row__meta"><span class="mono">${escapeHTML(categories)}</span><strong>REPOSITORY ↗</strong><span class="project-row__quick" data-project-quick="${escapeHTML(project.slug)}">QUICK VIEW</span></div></a>`;
    }).join('');

    if (count) count.textContent = `${String(visible.length).padStart(2, '0')} PROJECTS`;
    if (active) active.textContent = `${filter} / ${visible.length}`;
    renderPagination(visible.length);

    list.dispatchEvent(new CustomEvent('projects:rendered', {bubbles:true, detail:{filter, count:visible.length, page:currentPage, perPage}}));
  }

  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button || !controls.contains(button)) return;
    const filter = button.dataset.filter || 'ALL';
    controls.querySelectorAll('.project-filter').forEach(item => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    render(filter, 1);
  });

  if (paginationHost) {
    paginationHost.addEventListener('click', event => {
      if (event.target.closest('[data-page-prev]')) render(currentFilter, currentPage - 1);
      if (event.target.closest('[data-page-next]')) render(currentFilter, currentPage + 1);
      const pageButton = event.target.closest('[data-page]');
      if (pageButton) render(currentFilter, Number(pageButton.dataset.page));
    });
  }

  render('ALL', 1);
})();
