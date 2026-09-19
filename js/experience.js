(() => {
  const cursor = document.querySelector('[data-cursor]');
  const robot = document.querySelector('[data-guide-robot]');
  const label = document.querySelector('[data-guide-label]');
  const code = document.querySelector('[data-scroll-codebar]');
  const sections = [...document.querySelectorAll('[data-scroll-section]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;

  if (cursor && finePointer) {
    addEventListener('pointermove', e => {
      cursor.style.setProperty('--x', `${e.clientX}px`);
      cursor.style.setProperty('--y', `${e.clientY}px`);
    }, { passive:true });
    document.addEventListener('mouseover', e => {
      const interactive = e.target.closest('a,button,[role="button"],.project-preview,[data-workshop-station]');
      cursor.classList.toggle('is-active', !!interactive);
    });
  }

  const guideCopy = {
    work:'PROJECTS', workshop:'WORKSHOP / THINK', journey:'JOURNEY', contact:'EDGE / CONNECT',
    introduction:'ENTERING', top:'ORIGIN', make:'MAKING', workspace:'WORKSPACE', experiments:'EXPERIMENTS',
    currently:'RIGHT NOW', thinking:'THINKING', notes:'NOTES', about:'ABOUT'
  };
  let currentSection = null;
  let tx = innerWidth * .78, ty = innerHeight * .30, x = tx, y = ty;
  let sectionIndex = 0;
  let robotState = 'idle';
  let stateUntil = 0;
  let finaleStarted = false;
  let robotHovered = false;
  let pointerX = innerWidth * .5, pointerY = innerHeight * .5;
  let dragging = false;
  let dragPointerId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let userMovedRobot = false;
  let lastScrollY = (document.scrollingElement || document.documentElement).scrollTop;
  let lastScrollAt = performance.now();
  let scrollVelocity = 0;
  let idleSince = performance.now();
  let emotionTimer = 0;
  let thrown = false;
  let throwVX = 0;
  let throwVY = 0;
  let throwRotation = 0;
  let landingY = 0;
  let lastDragX = x, lastDragY = y, lastDragAt = performance.now();

  const setEmotionLabel = text => {
    if (!robot) return;
    if (text) robot.dataset.emotionLabel = text;
    else delete robot.dataset.emotionLabel;
  };

  function updateProgress(){
    const scrolling = document.scrollingElement || document.documentElement;
    const max = Math.max(1, scrolling.scrollHeight - innerHeight);
    const value = Math.max(0, Math.min(1, scrolling.scrollTop / max));
    code?.style.setProperty('--scroll-progress', value.toFixed(4));
    code?.setAttribute('aria-valuenow', String(Math.round(value * 100)));
  }

  function updateContext(){
    if (dragging) return;
    const scrolling = document.scrollingElement || document.documentElement;
    const currentScroll = scrolling.scrollTop;
    const point = currentScroll + innerHeight * .46;
    const maxScroll = Math.max(1, scrolling.scrollHeight - innerHeight);
    const nearFinish = currentScroll / maxScroll > .965;
    if (nearFinish && !finaleStarted) {
      finaleStarted = true;
      tx = innerWidth * .50;
      ty = innerHeight * .60;
    }
    currentSection = sections.find(s => point >= s.offsetTop && point < s.offsetTop + s.offsetHeight) || sections[0];
    sectionIndex = Math.max(0, sections.indexOf(currentSection));
    const id = currentSection?.id || 'introduction';
    if(label && robotState === 'idle') label.textContent = guideCopy[id] || 'FOLLOWING';

    const heading = currentSection?.querySelector('.section-heading h2, .section-heading .mono, .work-heading, .section-lead h2, .section-lead > span');
    const rect = heading?.getBoundingClientRect();
    const headingVisible = rect && rect.bottom > 30 && rect.top < innerHeight - 30;
    const lanes = [[.18,.24],[.78,.22],[.30,.72],[.74,.64],[.20,.55],[.82,.42],[.46,.76],[.66,.26]];
    const lane = lanes[sectionIndex % lanes.length];
    if (headingVisible) {
      tx = Math.max(80, Math.min(innerWidth - 80, rect.left + rect.width * .72));
      ty = Math.max(95, rect.top - 92);
    } else {
      tx = innerWidth * lane[0];
      ty = innerHeight * lane[1];
    }
  }

  function setRobotState(next, now = performance.now(), labelText = null){
    if (!robot) return;
    robotState = next;
    stateUntil = now + (next === 'rest' ? 2200 : next === 'idle' ? 1500 : next === 'sleepy' ? 2800 : next === 'excited' ? 900 : next === 'happy' ? 1000 : next === 'surprised' ? 1000 : next === 'confused' ? 1200 : next === 'thinking' ? 2200 : 0);
    robot.classList.remove('is-idle','is-rest','is-moving','is-observing','is-celebrate','is-curious','is-excited','is-happy','is-surprised','is-confused','is-thinking','is-sleepy','is-dragging');
    robot.classList.add(`is-${next}`);
    const stateCopy = {
      idle:'IDLE', rest:'RESTING', moving:'MOVING', observing:'OBSERVING', celebrate:'SIGNAL SENT',
      curious:'CURIOUS', excited:'EXCITED', happy:'HAPPY', surprised:'SURPRISED', confused:'CONFUSED',
      thinking:'THINKING', sleepy:'SLEEPY', dragging:'MOVED BY YOU'
    };
    if(label) label.textContent = labelText || stateCopy[next] || guideCopy[currentSection?.id] || 'FOLLOWING';
    setEmotionLabel(labelText || (next === 'excited' ? 'EXCITED!' : next === 'happy' ? 'NICE' : next === 'surprised' ? 'OH!' : next === 'confused' ? 'HM...' : next === 'thinking' ? 'THINKING' : next === 'sleepy' ? '...zzz' : next === 'dragging' ? 'THANKS' : null));
  }

  function temporaryEmotion(next, duration = 1000, text = null){
    if (!robot || dragging || finaleStarted && next !== 'celebrate') return;
    clearTimeout(emotionTimer);
    setRobotState(next, performance.now(), text);
    emotionTimer = window.setTimeout(() => {
      if (!dragging) setRobotState('idle', performance.now());
    }, duration);
  }

  function tick(now){
    const t = now * .001;
    const scrolling = document.scrollingElement || document.documentElement;
    const currentScroll = scrolling.scrollTop;
    const maxScroll = Math.max(1, scrolling.scrollHeight - innerHeight);
    const nearFinish = currentScroll / maxScroll > .965;

    if (thrown) {
      throwVY += 0.72;
      throwVX *= 0.985;
      x += throwVX;
      y += throwVY;
      throwRotation += throwVX * .12;
      const floorY = Math.min(innerHeight - (innerWidth < 600 ? 52 : 64), landingY);
      const minX = innerWidth < 600 ? 44 : 56;
      const maxX = innerWidth - minX;
      if (x < minX) { x = minX; throwVX *= -0.55; }
      if (x > maxX) { x = maxX; throwVX *= -0.55; }
      if (y >= floorY) {
        y = floorY;
        throwVY *= -0.22;
        throwVX *= .72;
        if (Math.abs(throwVY) < 1.2) {
          thrown = false;
          robot.style.setProperty('--robot-rotation', '0deg');
          robot.dataset.manualPosition = '';
          userMovedRobot = false;
          // Re-seed the normal follow target so the robot never freezes where it was dropped.
          updateContext();
          tx = Math.max(64, Math.min(innerWidth - 64, tx));
          ty = Math.max(78, Math.min(innerHeight - 86, ty));
          setRobotState('happy', now, 'BACK TO WORK');
          window.setTimeout(() => { if (!dragging && !thrown) setRobotState('idle', performance.now()); }, 900);
        }
      }
      robot?.style.setProperty('--rx', `${x}px`);
      robot?.style.setProperty('--ry', `${y}px`);
      robot?.style.setProperty('--robot-rotation', `${throwRotation}deg`);
      requestAnimationFrame(tick);
      return;
    }

    if (!dragging) {
      if (reduce) {
        x = tx; y = ty;
      } else if (!userMovedRobot || !robot?.dataset.manualPosition) {
        const heading = currentSection?.querySelector('.section-heading h2, .section-heading .mono, .work-heading, .section-lead h2, .section-lead > span')?.getBoundingClientRect();
        const headingVisible = heading && heading.bottom > 30 && heading.top < innerHeight - 30;
        const dist = Math.hypot(tx - x, ty - y);
        if (nearFinish) {
          x += (tx - x) * .035; y += (ty - y) * .035;
          if (Math.hypot(tx-x,ty-y)<35 && robotState !== 'celebrate') temporaryEmotion('celebrate',1500,'THANKS FOR EXPLORING');
        }
        if (!nearFinish && robotState === 'idle' && headingVisible && dist < 26) setRobotState('rest', now);
        else if (!nearFinish && robotState === 'idle' && dist > 120) setRobotState('moving', now);
        else if (!nearFinish && robotState === 'moving' && dist <= 120) setRobotState('idle', now);
        const followEase = nearFinish ? .035 : (robotState === 'moving' ? .055 : .028);
        x += (tx-x)*followEase; y += (ty-y)*followEase;
        const roamX = nearFinish ? 0 : Math.sin(t*.63+sectionIndex*1.7)*34 + Math.sin(t*.29)*16;
        const roamY = nearFinish ? 0 : Math.cos(t*.79+sectionIndex*.8)*26 + Math.sin(t*.37)*13;
        const bob = robotState === 'rest' ? Math.sin(t*1.2)*2 : Math.sin(t*1.6)*5;
        const finalX=Math.max(56,Math.min(innerWidth-56,x+roamX));
        const finalY=Math.max(70,Math.min(innerHeight-80,y+roamY+bob));
        robot?.style.setProperty('--rx',`${finalX}px`); robot?.style.setProperty('--ry',`${finalY}px`); robot?.style.setProperty('--robot-rotation','0deg');
      }
      if (reduce) { robot?.style.setProperty('--rx',`${x}px`); robot?.style.setProperty('--ry',`${y}px`); }
    }
    requestAnimationFrame(tick);
  }

  function beginDrag(event){
    if (!robot || thrown) return;
    dragging = true;
    dragPointerId = event.pointerId;
    const rect = robot.getBoundingClientRect();
    dragOffsetX = event.clientX - (rect.left + rect.width/2);
    dragOffsetY = event.clientY - (rect.top + rect.height/2);
    lastDragX = event.clientX; lastDragY = event.clientY; lastDragAt = performance.now();
    robot.setPointerCapture?.(event.pointerId);
    clearTimeout(emotionTimer);
    robot.classList.remove('is-idle','is-rest','is-moving','is-observing','is-happy');
    robot.classList.add('is-dragging');
    setEmotionLabel('YOU CAN MOVE ME');
    if(label) label.textContent='MOVED BY YOU';
    event.preventDefault();
  }

  function moveDrag(event){
    if(!dragging || event.pointerId!==dragPointerId || !robot) return;
    const now=performance.now(), dt=Math.max(8,now-lastDragAt);
    const nx=Math.max(48,Math.min(innerWidth-48,event.clientX-dragOffsetX));
    const ny=Math.max(62,Math.min(innerHeight-62,event.clientY-dragOffsetY));
    throwVX=(nx-lastDragX)/dt*16; throwVY=(ny-lastDragY)/dt*16;
    x=nx; y=ny; tx=nx; ty=ny; lastDragX=event.clientX; lastDragY=event.clientY; lastDragAt=now;
    const speed=Math.hypot(throwVX,throwVY);
    robot.style.setProperty('--rx',`${nx}px`); robot.style.setProperty('--ry',`${ny}px`);
    robot.style.setProperty('--robot-rotation',`${Math.max(-18,Math.min(18,throwVX*1.5))}deg`);
    robot.style.setProperty('--drag-tilt',`${Math.max(-22,Math.min(22,throwVX*2))}deg`);
    robot.style.setProperty('--drag-yaw',`${Math.max(-10,Math.min(10,throwVY*.35))}deg`);
    robot.dataset.manualPosition='true'; userMovedRobot=true;
    if(speed>5) setEmotionLabel('WHEEEE');
  }

  function endDrag(event){
    if(!dragging || (event && event.pointerId!==dragPointerId) || !robot) return;
    dragging=false;
    try{robot.releasePointerCapture?.(dragPointerId);}catch{}
    dragPointerId=null;
    robot.classList.remove('is-dragging');
    const speed=Math.hypot(throwVX,throwVY);
    // Release always returns the robot to its living follow system after a tiny physics-like landing.
    thrown=true;
    throwVX=Math.max(-18,Math.min(18,throwVX || 2));
    throwVY=Math.max(-16,Math.min(14,throwVY || -5));
    throwRotation=Math.max(-20,Math.min(20,Number(robot.style.getPropertyValue('--robot-rotation').replace('deg',''))||0));
    landingY=Math.max(72,Math.min(innerHeight-(innerWidth<600?52:64),y+Math.max(26,Math.min(58,Math.abs(throwVY)*2.2))));
    setEmotionLabel(speed>4?'LET GO!':'WHEW!');
    if(label) label.textContent='FALLING';
    robot.classList.add('is-drag-landing');
    window.setTimeout(()=>robot.classList.remove('is-drag-landing'),500);
  }

  if (robot) {
    robot.addEventListener('pointerdown', beginDrag);
    robot.addEventListener('pointermove', moveDrag);
    robot.addEventListener('pointerup', endDrag);
    robot.addEventListener('pointercancel', endDrag);
    robot.addEventListener('pointerenter', () => {
      robotHovered = true;
      if (!dragging) temporaryEmotion('curious', 1200, 'HI');
    });
    robot.addEventListener('pointerleave', () => {
      robotHovered = false;
      if (!dragging && robotState === 'curious') setRobotState('idle', performance.now());
    });
    robot.addEventListener('pointermove', e => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      const rect = robot.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-1, Math.min(1, (pointerX - cx) / 90));
      const dy = Math.max(-1, Math.min(1, (pointerY - cy) / 90));
      robot.style.setProperty('--look-x', dx.toFixed(3));
      robot.style.setProperty('--look-y', dy.toFixed(3));
    });
  }

  // A click makes the resident visibly excited. External links open normally in a new tab.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.closest('[data-guide-robot]') || link.getAttribute('href')?.startsWith('#')) return;
    temporaryEmotion('excited', 900, 'LET’S GO!');
  }, true);

  // Internal navigation gets the same emotional response without blocking smooth scrolling.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.closest('[data-guide-robot]')) return;
    temporaryEmotion('excited', 800, 'LET’S GO!');
  }, true);

  addEventListener('scroll', () => {
    const now = performance.now();
    const scrolling = document.scrollingElement || document.documentElement;
    const currentScroll = scrolling.scrollTop;
    const delta = currentScroll - lastScrollY;
    const dt = Math.max(16, now - lastScrollAt);
    scrollVelocity = Math.abs(delta / dt);
    lastScrollY = currentScroll;
    lastScrollAt = now;
    idleSince = now;
    updateContext();
    updateProgress();
    if (!dragging && scrollVelocity > .85 && robotState === 'idle') temporaryEmotion('surprised', 700, 'WHOOSH');
  }, { passive:true });

  addEventListener('resize', () => {
    if (!dragging && !userMovedRobot) updateContext();
    updateProgress();
  }, { passive:true });

  // Long periods of no input make the robot visibly sleepy, then it wakes on interaction.
  setInterval(() => {
    if (!robot || reduce || dragging || document.hidden) return;
    const idleFor = performance.now() - idleSince;
    if (idleFor > 18000 && robotState === 'idle') temporaryEmotion('sleepy', 2800, '...zzz');
  }, 4000);

  // Workspace entry gives the resident a thoughtful state rather than another generic animation.
  const workspace = document.querySelector('#workspace');
  if (workspace) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) temporaryEmotion('thinking', 1800, 'HMM...');
    }, { threshold:.35 });
    observer.observe(workspace);
  }

  updateContext();
  updateProgress();
  requestAnimationFrame(tick);
})();
