(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const details = window.PORTFOLIO_FEATURED_DETAILS || {};

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[char]));

  const repoURL = project => `https://github.com/Shashwat-Aneja/${encodeURIComponent(project.slug)}`;

  function createUI() {
    if (document.querySelector('[data-command-palette]')) return;

    const palette = document.createElement('div');
    palette.className = 'command-palette';
    palette.dataset.commandPalette = '';
    palette.hidden = true;
    palette.innerHTML = `
      <div class="command-palette__veil" data-command-close></div>
      <section class="command-palette__panel" role="dialog" aria-modal="true" aria-labelledby="command-title">
        <div class="command-palette__top">
          <div><span class="mono">FIELD / COMMAND</span><strong id="command-title">What are you looking for?</strong></div>
          <button type="button" class="command-palette__close mono" data-command-close>ESC</button>
        </div>
        <label class="command-search"><span class="mono">⌕</span><input data-command-input type="search" autocomplete="off" spellcheck="false" placeholder="Search projects, sections, ideas..." aria-label="Search the portfolio"></label>
        <div class="command-results" data-command-results role="listbox" aria-label="Search results"></div>
        <div class="command-hints mono"><span>↑↓ NAVIGATE</span><span>ENTER OPEN</span><span>ESC CLOSE</span></div>
      </section>`;
    document.body.appendChild(palette);

    const quick = document.createElement('div');
    quick.className = 'project-quickview';
    quick.dataset.projectQuickview = '';
    quick.hidden = true;
    quick.innerHTML = `
      <div class="project-quickview__veil" data-quick-close></div>
      <section class="project-quickview__panel" role="dialog" aria-modal="true" aria-labelledby="quick-title">
        <button type="button" class="project-quickview__close mono" data-quick-close>ESC / CLOSE</button>
        <div class="project-quickview__index mono" data-quick-index></div>
        <div class="project-quickview__body" data-quick-body></div>
      </section>`;
    document.body.appendChild(quick);
  }

  let paletteOpen = false;
  let quickOpen = false;
  let lastFocus = null;
  let selectedIndex = 0;
  let commandItems = [];

  function sectionItems() {
    return [...document.querySelectorAll('[data-scroll-section]')].map(section => ({
      kind: 'section',
      title: section.querySelector('.section-lead h2')?.textContent?.trim() || section.id,
      meta: `${String(section.dataset.field || '').padStart(2,'0')} / ${section.id.toUpperCase()}`,
      href: `#${section.id}`
    }));
  }

  function projectItems() {
    return projects.map(project => ({
      kind: 'project',
      title: project.name,
      meta: project.type,
      project,
      href: repoURL(project)
    }));
  }

  function buildItems(query = '') {
    const q = query.trim().toLowerCase();
    const actions = [
      {kind:'action', title:'Random project', meta:'SURPRISE ME', action:'random'},
      {kind:'action', title:'Change atmosphere', meta:'THEME', action:'theme'},
      {kind:'action', title:'Open project archive', meta:'ARCHIVE', href:'/projects/'}
    ];
    const all = [...actions, ...sectionItems(), ...projectItems()];
    if (!q) return all.slice(0, 12);
    return all.filter(item => `${item.title} ${item.meta} ${item.project?.description || ''}`.toLowerCase().includes(q)).slice(0, 14);
  }

  function renderCommands(query = '') {
    const results = document.querySelector('[data-command-results]');
    if (!results) return;
    commandItems = buildItems(query);
    selectedIndex = Math.min(selectedIndex, Math.max(0, commandItems.length - 1));
    results.innerHTML = commandItems.length ? commandItems.map((item, index) => `
      <button type="button" class="command-result${index === selectedIndex ? ' is-active' : ''}" data-command-index="${index}" role="option" aria-selected="${index === selectedIndex}">
        <span class="command-result__mark">${item.kind === 'project' ? '◫' : item.kind === 'section' ? '↓' : '↗'}</span>
        <span class="command-result__copy"><strong>${esc(item.title)}</strong><small class="mono">${esc(item.meta)}</small></span>
        <span class="command-result__arrow">↗</span>
      </button>`).join('') : '<div class="command-empty mono">NO MATCHES / TRY ANOTHER QUERY</div>';
  }

  function openPalette() {
    createUI();
    const palette = document.querySelector('[data-command-palette]');
    const input = document.querySelector('[data-command-input]');
    if (!palette || !input) return;
    lastFocus = document.activeElement;
    palette.hidden = false;
    palette.classList.add('is-open');
    paletteOpen = true;
    input.value = '';
    selectedIndex = 0;
    renderCommands();
    requestAnimationFrame(() => input.focus());
  }

  function closePalette() {
    const palette = document.querySelector('[data-command-palette]');
    if (!palette) return;
    palette.classList.remove('is-open');
    paletteOpen = false;
    window.setTimeout(() => { if (!paletteOpen) palette.hidden = true; }, reduce ? 0 : 220);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function openQuick(project) {
    createUI();
    const quick = document.querySelector('[data-project-quickview]');
    const body = quick?.querySelector('[data-quick-body]');
    const index = quick?.querySelector('[data-quick-index]');
    if (!quick || !body || !project) return;
    lastFocus = document.activeElement;
    const detail = details[project.slug.toLowerCase()] || details[project.slug] || {};
    const categories = Array.isArray(project.categories) ? project.categories.join(' / ') : '';
    body.innerHTML = `
      <div class="quick-kicker mono">${esc(detail.category || categories || 'PROJECT')}</div>
      <h2 id="quick-title">${esc(project.name)}</h2>
      <p class="quick-question">${esc(detail.question || project.description)}</p>
      <div class="quick-meta"><span>${esc(project.type)}</span><span>${esc(detail.focus || categories)}</span></div>
      <div class="quick-grid">
        <div><span class="mono">WHAT IT IS</span><p>${esc(detail.built || project.description)}</p></div>
        <div><span class="mono">SYSTEM</span><p>${esc(Array.isArray(detail.system) ? detail.system.join(' → ') : 'Explore the repository for implementation details.')}</p></div>
      </div>
      <div class="quick-actions"><a class="field-button" href="${esc(detail.repo || repoURL(project))}" target="_blank" rel="noopener noreferrer">OPEN REPOSITORY ↗</a><button type="button" class="field-button" data-quick-share>SHARE PROJECT ↗</button><button type="button" class="field-button" data-quick-close>BACK TO FIELD</button></div>`;
    index.textContent = `${String(projects.indexOf(project) + 1).padStart(2,'0')} / PROJECT QUICK VIEW`;
    quick.hidden = false;
    quick.classList.add('is-open');
    quickOpen = true;
    quick.querySelector('[data-quick-close]')?.focus();
  }

  function closeQuick() {
    const quick = document.querySelector('[data-project-quickview]');
    if (!quick) return;
    quick.classList.remove('is-open');
    quickOpen = false;
    window.setTimeout(() => { if (!quickOpen) quick.hidden = true; }, reduce ? 0 : 260);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function runCommand(item) {
    if (!item) return;
    closePalette();
    if (item.kind === 'project') {
      openQuick(item.project);
      return;
    }
    if (item.action === 'random') {
      const project = projects[Math.floor(Math.random() * projects.length)];
      if (project) openQuick(project);
      return;
    }
    if (item.action === 'theme') {
      document.querySelector('[data-theme-open]')?.click();
      return;
    }
    if (item.href?.startsWith('#')) {
      document.querySelector(item.href)?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
      return;
    }
    if (item.href) window.location.href = item.href;
  }

  function bind() {
    createUI();
    const palette = document.querySelector('[data-command-palette]');
    const quick = document.querySelector('[data-project-quickview]');
    const input = document.querySelector('[data-command-input]');

    document.addEventListener('keydown', event => {
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        paletteOpen ? closePalette() : openPalette();
        return;
      }
      if (event.key === 'Escape') {
        if (quickOpen) closeQuick();
        else if (paletteOpen) closePalette();
        return;
      }
      if (!paletteOpen) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        selectedIndex = (selectedIndex + delta + commandItems.length) % Math.max(1, commandItems.length);
        renderCommands(input?.value || '');
        document.querySelector(`[data-command-index="${selectedIndex}"]`)?.focus();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        runCommand(commandItems[selectedIndex]);
      }
    });

    input?.addEventListener('input', event => { selectedIndex = 0; renderCommands(event.target.value); });
    palette?.addEventListener('click', event => {
      const close = event.target.closest('[data-command-close]');
      if (close) closePalette();
      const result = event.target.closest('[data-command-index]');
      if (result) runCommand(commandItems[Number(result.dataset.commandIndex)]);
    });
    quick?.addEventListener('click', async event => {
      if (event.target.closest('[data-quick-close]')) { closeQuick(); return; }
      const share = event.target.closest('[data-quick-share]');
      if (!share) return;
      const project = projects.find(item => item.name === quick.querySelector('#quick-title')?.textContent);
      const url = `${location.origin}${location.pathname}#project-${project?.slug || ''}`;
      try {
        if (navigator.share) await navigator.share({title: project?.name || 'Shashwat Aneja Project', text: project?.description || '', url});
        else if (navigator.clipboard) { await navigator.clipboard.writeText(url); share.textContent='LINK COPIED ✓'; setTimeout(()=>share.textContent='SHARE PROJECT ↗',1600); }
      } catch (_) {}
    });

    document.addEventListener('click', event => {
      const quickButton = event.target.closest('[data-project-quick]');
      if (quickButton) {
        event.preventDefault();
        event.stopPropagation();
        const slug = quickButton.dataset.projectQuick;
        const project = projects.find(item => item.slug === slug);
        if (project) openQuick(project);
      }
    });

    const updateReading = () => {
      const scroller = document.scrollingElement || document.documentElement;
      const max = Math.max(1, scroller.scrollHeight - innerHeight);
      document.documentElement.style.setProperty('--reading-progress', `${Math.round((scroller.scrollTop / max) * 100)}%`);
    };
    addEventListener('scroll', updateReading, {passive:true});
    addEventListener('resize', updateReading, {passive:true});
    updateReading();

    // V22: reveal major content only when it enters the field, keeping the page quiet at first load.
    const revealTargets = [...document.querySelectorAll('.section-lead, .archive-card, .current-note, .workspace-shell, .notes-grid, .about-layout, .contact-block')];
    revealTargets.forEach((el, index) => { el.classList.add('v22-reveal'); el.style.transitionDelay = `${Math.min(index % 5, 4) * 55}ms`; });
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
      }), {threshold:.08, rootMargin:'0px 0px -7% 0px'});
      revealTargets.forEach(el => revealObserver.observe(el));
    } else revealTargets.forEach(el => el.classList.add('is-visible'));

  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
