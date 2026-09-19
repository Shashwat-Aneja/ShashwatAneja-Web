(() => {
  const section = document.querySelector('.introduction');
  if (!section) return;

  const images = [...section.querySelectorAll('.visual-image')];
  const scenes = [...section.querySelectorAll('.intro-scene')];
  const index = section.querySelector('[data-intro-index]');
  const progressBar = section.querySelector('.intro-progress span');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let target = 0;
  let current = 0;
  let raf = 0;
  let lastActive = -1;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

  function getProgress() {
    const rect = section.getBoundingClientRect();
    return clamp(-rect.top / Math.max(1, rect.height - innerHeight));
  }

  function render(progress) {
    if (reduced) return;

    const count = Math.max(images.length, scenes.length, 1);
    const position = progress * (count - 1);
    const active = Math.min(count - 1, Math.floor(position));

    images.forEach((element, i) => {
      const distance = Math.abs(i - position);
      const visibility = clamp(1 - distance * 1.18);
      const direction = i - position;
      const scale = 1.08 - Math.min(1, distance) * 0.12;
      const rotate = direction * 3.5;
      const x = direction * 3.5;
      const y = Math.abs(direction) * 8;
      element.style.opacity = visibility.toFixed(3);
      element.style.transform = `translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)}) rotate(${rotate.toFixed(2)}deg)`;
      element.style.filter = `blur(${(Math.min(1, distance) * 7).toFixed(2)}px)`;
      element.style.zIndex = String(100 - Math.round(distance * 10));
    });

    scenes.forEach((element, i) => {
      const distance = Math.abs(i - position);
      const visibility = clamp(1 - distance * 1.2);
      const direction = i - position;
      element.style.opacity = visibility.toFixed(3);
      element.style.transform = `translate3d(0, ${(direction * 34).toFixed(2)}px, 0)`;
      element.style.filter = `blur(${(Math.min(1, distance) * 8).toFixed(2)}px)`;
      element.style.pointerEvents = distance < 0.5 ? 'auto' : 'none';
    });

    if (index && active !== lastActive) {
      index.textContent = `${String(active + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
      lastActive = active;
    }

    if (progressBar) progressBar.style.transform = `scaleX(${Math.max(0.02, progress)})`;
  }

  function frame() {
    raf = 0;
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.0005) current = target;
    render(current);
    if (Math.abs(target - current) > 0.0005) raf = requestAnimationFrame(frame);
  }

  function update() {
    target = getProgress();
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function immediate() {
    target = getProgress();
    current = target;
    render(current);
  }

  if (reduced) {
    images.forEach((element, i) => {
      element.style.opacity = i === 0 ? '1' : '0';
      element.style.filter = 'none';
      element.style.transform = 'none';
    });
    scenes.forEach((element, i) => {
      element.style.opacity = i === 0 ? '1' : '0';
      element.style.filter = 'none';
      element.style.transform = 'none';
    });
    return;
  }

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', immediate, { passive: true });
  immediate();
})();
