(() => {
  const root = document.querySelector('[data-workshop-stations]');
  if (!root) return;
  const index = document.querySelector('[data-workshop-index]');
  const note = document.querySelector('[data-workshop-note]');
  const notes = {
    make: 'Make something real enough that it can disagree with you.',
    break: 'A useful failure is one that gives the next version a better question.',
    understand: 'If you can see the system, you can start asking better questions about it.',
    rebuild: 'Keep what you learned. Rebuild what no longer makes sense.'
  };
  const labels = {make:'MAKE / 01',break:'BREAK / 02',understand:'UNDERSTAND / 03',rebuild:'REBUILD / 04'};
  const stations = [...root.querySelectorAll('[data-workshop-station]')];
  function activate(station) {
    const key = station.dataset.workshopStation;
    stations.forEach(item => item.classList.toggle('is-active', item === station));
    if (index) index.textContent = labels[key] || 'WORKSHOP';
    if (note) note.textContent = notes[key] || '';
  }
  stations.forEach(station => {
    station.addEventListener('mouseenter', () => activate(station));
    station.addEventListener('focusin', () => activate(station));
  });
  activate(stations[0]);
})();
