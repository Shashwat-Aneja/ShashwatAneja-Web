(() => {
  const projects = [
    { title: 'Xylo', type: 'AI / PRODUCTIVITY', year: '2025 — NOW', description: 'An AI-based productivity and behavioural modelling system exploring how software can help people understand and improve their workflows.', href: 'https://www.linkedin.com/in/shashwat-aneja/', external: true, art: 'one' },
    { title: 'GitHub Profile Analyst', type: 'PYTHON / DATA', year: '2025', description: 'A Python project that uses the GitHub API to turn profile statistics into readable insights.', href: 'https://github.com/Shashwat-Aneja', external: true, art: 'two' },
    { title: 'India-UAE Food Allocation System', type: 'SYSTEMS / LOGIC', year: '2024 — 2025', description: 'A design-first conceptual system for surplus-demand optimisation across an India-UAE foodgrain allocation flow.', href: 'https://www.linkedin.com/in/shashwat-aneja/', external: true, art: 'three' },
    { title: 'Python File Organizer', type: 'PYTHON / AUTOMATION', year: '2025', description: 'A small utility for organising files by type, with dry-run and collision-safe behaviour.', href: 'https://github.com/Shashwat-Aneja', external: true, art: 'four' },
    { title: 'VR Cricket', type: 'VR / ARDUINO / UNITY', year: '2024', description: 'A sensor-driven cricket simulation exploring head tracking and gaze-based interaction.', href: 'https://www.linkedin.com/in/shashwat-aneja/', external: true, art: 'five' },
    { title: 'WIZARD', type: 'ARDUINO / AUTOMATION', year: '2023', description: 'A smart-home automation system using Arduino, Bluetooth and relays for wireless appliance control.', href: 'https://www.linkedin.com/in/shashwat-aneja/', external: true, art: 'six' }
  ];

  const filters = ['ALL', 'AI / DATA', 'SOFTWARE', 'GAME / VR', 'HARDWARE'];
  const list = document.querySelector('[data-project-list]');
  const controls = document.querySelector('[data-project-controls]');
  const count = document.querySelector('[data-project-count]');
  const active = document.querySelector('[data-project-active]');
  const contact = document.querySelector('[data-contact-links]');
  const progress = document.querySelector('[data-scroll-codebar]');

  const filterProject = (project, filter) => {
    if (filter === 'ALL') return true;
    if (filter === 'AI / DATA') return /AI|DATA|PRODUCTIVITY|LOGIC/.test(project.type);
    if (filter === 'SOFTWARE') return /PYTHON|SYSTEMS|AUTOMATION/.test(project.type);
    if (filter === 'GAME / VR') return /VR/.test(project.type);
    if (filter === 'HARDWARE') return /ARDUINO|AUTOMATION/.test(project.type);
    return true;
  };

  function renderProjects(filter = 'ALL') {
    if (!list) return;
    const visible = projects.filter(project => filterProject(project, filter));
    list.innerHTML = visible.map((project, i) => `
      <a class="work-item" href="${project.href}" ${project.external ? 'target="_blank" rel="noopener noreferrer"' : ''} data-project-index="${i}">
        <div class="work-media"><div class="work-art work-art--${project.art}"></div><span class="work-year mono">${project.year}</span></div>
        <div class="work-info">
          <span class="mono">${String(i + 1).padStart(2, '0')} / ${project.type}</span>
          <h2>${project.title}</h2>
          <p>${project.description}</p>
        </div>
        <span class="work-arrow">↗</span>
      </a>
    `).join('');
    if (count) count.textContent = `${String(visible.length).padStart(2, '0')} PROJECTS`;
    list.querySelectorAll('.work-item').forEach((item, i) => {
      item.addEventListener('mouseenter', () => { if (active) active.textContent = `${String(i + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`; });
      item.addEventListener('focus', () => { if (active) active.textContent = `${String(i + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`; });
    });
  }

  if (controls) {
    controls.innerHTML = filters.map((filter, i) => `<button type="button" class="project-filter${i === 0 ? ' is-active' : ''}" data-filter="${filter}">${filter}</button>`).join('');
    controls.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      controls.querySelectorAll('.project-filter').forEach(el => el.classList.remove('is-active'));
      button.classList.add('is-active');
      renderProjects(button.dataset.filter);
    });
  }
  renderProjects();

  const links = [
    { label: 'GitHub', detail: 'CODE / REPOSITORIES', href: 'https://github.com/Shashwat-Aneja', icon: '&lt;/&gt;' },
    { label: 'LinkedIn', detail: 'PROFILE / CONNECT', href: 'https://www.linkedin.com/in/shashwat-aneja', icon: 'in' },
    { label: 'Phone', detail: 'DIRECT / NUMBER NOT PUBLISHED', href: '', icon: '☎', static: true }
  ];
  if (contact) {
    contact.innerHTML = links.map(link => link.static ? `
      <div class="contact-card contact-card--phone" aria-label="Phone contact">
        <span class="contact-card__icon mono">${link.icon}</span>
        <span class="contact-card__body"><strong>${link.label}</strong><small class="mono">${link.detail}</small></span>
        <span class="contact-card__arrow">•</span>
      </div>
    ` : `
      <a class="contact-card" href="${link.href}" target="_blank" rel="noopener noreferrer">
        <span class="contact-card__icon mono">${link.icon}</span>
        <span class="contact-card__body"><strong>${link.label}</strong><small class="mono">${link.detail}</small></span>
        <span class="contact-card__arrow">↗</span>
      </a>
    `).join('');
  }

  function updateScrollBar() {
    if (!progress) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const value = Math.max(0, Math.min(1, scrollY / max));
    progress.style.setProperty('--scroll-progress', value.toFixed(4));
    progress.setAttribute('aria-valuenow', String(Math.round(value * 100)));
  }

  addEventListener('scroll', updateScrollBar, { passive: true });
  addEventListener('resize', updateScrollBar, { passive: true });
  updateScrollBar();
})();
