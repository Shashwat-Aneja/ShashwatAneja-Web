(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const index = document.querySelector('[data-index]');
  const indexOpen = document.querySelector('[data-index-open]');
  const indexClose = [...document.querySelectorAll('[data-index-close]')];
  const progress = document.querySelector('[data-field-progress]');
  const progressLabel = progress?.querySelector('.field-progress__label');
  const sections = [...document.querySelectorAll('[data-field]')];
  const cursor = document.querySelector('[data-cursor]');
  const cursorLabel = cursor?.querySelector('small');

  let indexPreviousFocus = null;
  let progressFrame = 0;

  const setIndex = openState => {
    if (!index || !indexOpen) return;
    if (openState) {
      indexPreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : indexOpen;
      index.classList.add('is-open');
      index.setAttribute('aria-hidden', 'false');
      indexOpen.setAttribute('aria-expanded', 'true');
      body.classList.add('index-is-open');
      const focusTarget = index.querySelector('.index-close') || index.querySelector('a[href]');
      window.setTimeout(() => focusTarget?.focus(), 0);
      return;
    }
    index.classList.remove('is-open');
    index.setAttribute('aria-hidden', 'true');
    indexOpen.setAttribute('aria-expanded', 'false');
    body.classList.remove('index-is-open');
    const restoreTarget = indexPreviousFocus || indexOpen;
    indexPreviousFocus = null;
    window.setTimeout(() => restoreTarget?.focus(), 0);
  };

  indexOpen?.addEventListener('click', () => setIndex(true));
  indexClose.forEach(element => element.addEventListener('click', () => setIndex(false)));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && index?.classList.contains('is-open')) {
      event.preventDefault();
      setIndex(false);
      return;
    }
    if (event.key === 'Tab' && index?.classList.contains('is-open')) {
      const focusable = [...index.querySelectorAll('a[href], button:not([disabled])')]
        .filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const updateProgress = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const percentage = Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100));
    root.style.setProperty('--field-progress', `${percentage}%`);
    progress?.setAttribute('aria-valuenow', String(Math.round(percentage)));
    const probe = window.scrollY + window.innerHeight * 0.38;
    let current = sections[0];
    sections.forEach(section => {
      if (section.offsetTop <= probe) current = section;
    });
    if (current) {
      if (progressLabel) progressLabel.textContent = `FIELD ${String(current.dataset.field).padStart(2, '0')} / 12`;
      setCurrentNav(current.id);
    }
    revealSections();
  };

  // Keep the primary navigation aware of the section currently occupying the reading frame.
  const primaryNavLinks = [...document.querySelectorAll('.field-nav nav a[data-nav-target]')];
  const setCurrentNav = id => {
    primaryNavLinks.forEach(link => {
      const active = link.dataset.navTarget === id;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  // Reveal sections once, using the same viewport language as the field progress indicator.
  const revealSections = () => {
    const probe = window.scrollY + window.innerHeight * 0.72;
    sections.forEach(section => {
      if (section.offsetTop < probe) section.classList.add('is-revealed');
    });
  };
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-revealed');
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    sections.forEach(section => sectionObserver.observe(section));
  } else {
    sections.forEach(section => section.classList.add('is-revealed'));
  }

  const requestProgress = () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(() => {
      progressFrame = 0;
      updateProgress();
    });
  };

  window.addEventListener('scroll', requestProgress, { passive: true });
  window.addEventListener('resize', requestProgress, { passive: true });
  updateProgress();

  if (cursor && finePointer) {
    document.addEventListener('pointermove', event => {
      cursor.style.setProperty('--x', `${event.clientX}px`);
      cursor.style.setProperty('--y', `${event.clientY}px`);
    }, { passive: true });

    document.addEventListener('mouseover', event => {
      const target = event.target.closest('a, button, [role="button"], [data-cursor]');
      const label = target?.dataset.cursorLabel || (target?.dataset.cursor === 'drag' ? 'DRAG' : target ? 'EXPLORE' : '');
      cursor.classList.toggle('is-active', Boolean(target));
      cursor.classList.toggle('is-drag', target?.dataset.cursor === 'drag');
      if (cursorLabel) cursorLabel.textContent = label;
    });
  }

  // Keyboard users can move the resident robot in small increments when it has focus.
  const robotForKeyboard = document.querySelector('[data-guide-robot]');
  robotForKeyboard?.addEventListener('keydown', event => {
    const step = event.shiftKey ? 24 : 10;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const rect = robotForKeyboard.getBoundingClientRect();
    const nextX = Math.max(50, Math.min(window.innerWidth - 50, rect.left + rect.width / 2 + move[0]));
    const nextY = Math.max(62, Math.min(window.innerHeight - 62, rect.top + rect.height / 2 + move[1]));
    robotForKeyboard.style.setProperty('--rx', `${nextX}px`);
    robotForKeyboard.style.setProperty('--ry', `${nextY}px`);
    robotForKeyboard.dataset.manualPosition = 'true';
    robotForKeyboard.classList.add('is-curious');
    window.setTimeout(() => robotForKeyboard.classList.remove('is-curious'), 500);
  });

  /* Workspace: each study is a transparent browser-side interpretation of the real repository.
     It never claims to run the original project. It exposes the concept that is useful to understand. */
  const workspaceData = {
    mnist: {
      coord: 'MNIST / 01', kicker: 'INPUT STUDY / 01', title: 'Draw it. Keep it.',
      text: 'A small neural-network input study. Draw directly on the 28 × 28 field, erase with the same gesture, then export your creation with a quiet site mark.',
      note: 'The exported image is your drawing, not a prediction from the repository model.',
      action: 'DOWNLOAD CREATION', repo: 'https://github.com/Shashwat-Aneja/Mnist-Digit-Classifier'
    },
    sorting: {
      coord: 'SORT / 02', kicker: 'ALGORITHM STUDY / 02', title: 'How satisfying can order be?',
      text: 'A denser browser interpretation of Bubble Sort. Change the number of bars, choose a starting pattern, make chaos, then watch order emerge.',
      note: 'The browser visualization is an interface study of the algorithms in the repository.',
      action: 'SORT THE CHAOS', repo: 'https://github.com/Shashwat-Aneja/sorting-visualizer'
    },
    pathfinding: {
      coord: 'PATH / 03', kicker: 'ALGORITHM STUDY / 03', title: 'Can you build the maze?',
      text: 'Place walls on a small grid, choose an algorithm, then watch it search cell by cell for a route from start to finish.',
      note: 'A browser study of graph traversal and pathfinding behaviour.',
      action: 'FIND THE PATH', repo: 'https://github.com/Shashwat-Aneja'
    },
    color: {
      coord: 'IMAGE / 04', kicker: 'VISUAL STUDY / 04', title: 'How little can an image become?',
      text: 'Transform a sample image through grayscale, contrast, threshold and pixelation. The controls change the image itself, not a decorative overlay.',
      note: 'A browser image-processing study. Your local files are never uploaded.',
      action: 'DOWNLOAD EDITED IMAGE', repo: 'https://github.com/Shashwat-Aneja'
    },
    world: {
      coord: 'WORLD / 05', kicker: 'PROCEDURAL STUDY / 05', title: 'Can one seed make a world?',
      text: 'Change the seed and terrain controls, then generate a new miniature landscape. Same rules, different world.',
      note: 'A compact procedural-generation study, not a full game environment.',
      action: 'GENERATE WORLD', repo: 'https://github.com/Shashwat-Aneja/ARC-Asian-Royal-Conquest'
    }
  };

  const workspaceStage = document.querySelector('[data-workspace-stage]');
  const workspaceVisual = workspaceStage?.querySelector('[data-workspace-visual]');
  const workspaceCopy = workspaceStage?.querySelector('[data-workspace-copy]');
  let workspaceCoordinate = workspaceStage?.querySelector('[data-workspace-coordinate]');
  const workspaceTabs = [...document.querySelectorAll('[data-workspace]')];
  let workspaceCleanup = () => {};

  const safeText = value => String(value ?? '');

  const renderWorkspaceVisual = key => {
    if (!workspaceVisual) return;
    workspaceCleanup();
    workspaceVisual.dataset.mode = key;
    workspaceVisual.innerHTML = '';
    workspaceCoordinate = null;

    if (key === 'mnist') {
      const cells = Array.from({ length: 784 }, (_, i) => `<button type="button" tabindex="-1" aria-label="Pixel ${i + 1}" class="mnist-pixel" data-pixel="${i}"></button>`).join('');
      workspaceVisual.innerHTML = `
        <div class="ws-mnist">
          <div class="mnist-grid" data-mnist-grid>${cells}</div>
          <div class="mnist-readout"><span class="mono">PIXELS</span><strong data-mnist-count>0</strong><span class="mono">/ 784 ACTIVE</span></div>
          <div class="mnist-actions"><button type="button" class="ws-control" data-mnist-clear>CLEAR</button><button type="button" class="ws-control" data-mnist-download>DOWNLOAD PNG</button></div>
          <div class="mnist-tools"><label class="mono" for="mnist-brush">BRUSH <input id="mnist-brush" data-mnist-brush type="range" min="1" max="3" step="1" value="1"></label><span class="mono" data-mnist-mode>DRAW / CLICK AGAIN TO ERASE</span></div>
          <span class="mnist-format mono">EXPORT / 28 × 28 · WATERMARKED</span>
        </div>`;
      workspaceVisual.insertAdjacentHTML('beforeend', '<span class="workspace-coordinate mono" data-workspace-coordinate></span>');
      workspaceCoordinate = workspaceVisual.querySelector('[data-workspace-coordinate]');
      const grid = workspaceVisual.querySelector('[data-mnist-grid]');
      const count = workspaceVisual.querySelector('[data-mnist-count]');
      const brush = workspaceVisual.querySelector('[data-mnist-brush]');
      const mode = workspaceVisual.querySelector('[data-mnist-mode]');
      let drawing = false, paintMode = 'draw';
      const release = () => { drawing = false; };
      const updateCount = () => { if (count) count.textContent = String(grid.querySelectorAll('.is-on').length); };
      const paint = (index, action = paintMode) => {
        const cell = grid?.querySelector(`[data-pixel="${index}"]`); if (!cell) return;
        const i = Number(index), cx = i % 28, cy = Math.floor(i / 28), radius = Math.max(0, Number(brush?.value || 1) - 1);
        for (let y = Math.max(0, cy-radius); y <= Math.min(27, cy+radius); y++) for (let x = Math.max(0, cx-radius); x <= Math.min(27, cx+radius); x++) {
          const target = grid.querySelector(`[data-pixel="${y*28+x}"]`); if (target) target.classList.toggle('is-on', action === 'draw');
        }
        updateCount();
      };
      const pointerPaint = e => { const target = e.target.closest('[data-pixel]'); if (target && drawing) paint(target.dataset.pixel); };
      const download = () => {
        const scale=12, canvas=document.createElement('canvas'); canvas.width=28*scale; canvas.height=28*scale+42;
        const ctx=canvas.getContext('2d'); ctx.fillStyle='#0b0a0f'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#f1edf4';
        grid?.querySelectorAll('.is-on').forEach(cell=>{const i=Number(cell.dataset.pixel);ctx.fillRect((i%28)*scale,Math.floor(i/28)*scale,scale,scale);});
        ctx.fillStyle='#a9a1b2';ctx.font='12px monospace';ctx.fillText('SHASHWATANEJA.COM / MNIST WORKSPACE',10,28*scale+26);
        canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='shashwat-mnist-creation.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
      };
      grid?.addEventListener('pointerdown', e => { const target=e.target.closest('[data-pixel]'); if(!target)return; drawing=true;grid.setPointerCapture?.(e.pointerId);paintMode=target.classList.contains('is-on')?'erase':'draw';mode.textContent=paintMode==='erase'?'ERASER / DRAG TO REMOVE':'DRAW / CLICK AGAIN TO ERASE';paint(target.dataset.pixel);e.preventDefault(); });
      grid?.addEventListener('pointerover', pointerPaint); window.addEventListener('pointerup',release,{passive:true});
      brush?.addEventListener('input',()=>{mode.textContent=`BRUSH ${brush.value} / CLICK AGAIN TO ERASE`;});
      workspaceVisual.querySelector('[data-mnist-clear]')?.addEventListener('click',()=>{grid?.querySelectorAll('.is-on').forEach(c=>c.classList.remove('is-on'));updateCount();});
      workspaceVisual.querySelector('[data-mnist-download]')?.addEventListener('click',download);
      workspaceCleanup=()=>{grid?.removeEventListener('pointerover',pointerPaint);window.removeEventListener('pointerup',release);};
      return;
    }

    if (key === 'sorting') {
      workspaceVisual.innerHTML=`<div class="ws-sort"><div class="ws-sort-bars" data-sort-bars></div><div class="ws-sort-controls"><button type="button" class="ws-control" data-sort-run>SORT</button><button type="button" class="ws-control" data-sort-shuffle>CHAOS</button><span class="mono" data-sort-status>96 BARS / READY</span></div><div class="ws-sort-custom"><label class="mono">BARS <input data-sort-count type="range" min="24" max="180" step="12" value="96"><b data-sort-count-label>96</b></label><label class="mono">PATTERN <select data-sort-pattern><option value="random">RANDOM</option><option value="wave">WAVE</option><option value="stairs">STAIRS</option></select></label></div><div class="ws-sort-metrics mono"><span>COMPARISONS <b data-sort-comparisons>0</b></span><span>SWAPS <b data-sort-swaps>0</b></span></div></div>`;
      workspaceVisual.insertAdjacentHTML('beforeend','<span class="workspace-coordinate mono" data-workspace-coordinate></span>'); workspaceCoordinate=workspaceVisual.querySelector('[data-workspace-coordinate]');
      const bars=workspaceVisual.querySelector('[data-sort-bars]'),status=workspaceVisual.querySelector('[data-sort-status]'),comparisons=workspaceVisual.querySelector('[data-sort-comparisons]'),swaps=workspaceVisual.querySelector('[data-sort-swaps]'),countInput=workspaceVisual.querySelector('[data-sort-count]'),countLabel=workspaceVisual.querySelector('[data-sort-count-label]'),pattern=workspaceVisual.querySelector('[data-sort-pattern]');
      let values=[],running=false,comparisonCount=0,swapCount=0;
      const makeValues=()=>{const n=Number(countInput.value||96),type=pattern.value;if(type==='wave')return Array.from({length:n},(_,i)=>Math.round(18+((Math.sin(i*.34)+1)/2)*70+Math.random()*8));if(type==='stairs')return Array.from({length:n},(_,i)=>Math.round(15+((i%18)/17)*76+Math.random()*6));return Array.from({length:n},()=>Math.round(12+Math.random()*82));};
      const draw=(a=-1,b=-1)=>{bars.innerHTML=values.map((v,i)=>`<span class="ws-sort-bar${i===a||i===b?' is-active':''}" style="height:${v}%"></span>`).join('');comparisons.textContent=String(comparisonCount).padStart(4,'0');swaps.textContent=String(swapCount).padStart(3,'0');};
      const reset=()=>{if(running)return;values=makeValues();comparisonCount=0;swapCount=0;countLabel.textContent=String(values.length);draw();status.textContent=`${values.length} BARS / READY`;};
      const sleep=ms=>new Promise(r=>setTimeout(r,ms));
      const bubble=async()=>{for(let i=0;i<values.length-1&&running;i++)for(let j=0;j<values.length-i-1&&running;j++){comparisonCount++;draw(j,j+1);status.textContent=`COMPARE ${j+1} / ${j+2}`;await sleep(reducedMotion?0:Math.max(2,Math.min(8,420/values.length)));if(values[j]>values[j+1]){[values[j],values[j+1]]=[values[j+1],values[j]];swapCount++;}}};
      const run=async()=>{if(running)return;running=true;comparisonCount=0;swapCount=0;status.textContent=`SORTING ${values.length} BARS`;await bubble();running=false;draw();status.textContent=`SORTED / ${values.length} BARS`;};
      workspaceVisual.querySelector('[data-sort-run]')?.addEventListener('click',run);workspaceVisual.querySelector('[data-sort-shuffle]')?.addEventListener('click',reset);countInput.addEventListener('input',reset);pattern.addEventListener('change',reset);reset();workspaceCleanup=()=>{};return;
    }

    if (key === 'pathfinding') {
      workspaceVisual.innerHTML=`<div class="ws-path" data-path-field><div class="ws-path-grid" data-path-grid></div><div class="ws-path-legend mono"><span><i class="path-start"></i> START</span><span><i class="path-end"></i> END</span><span><i class="path-wall"></i> WALL</span></div></div><div class="ws-control-row"><label class="mono ws-mini-control">ALGORITHM <select data-path-algorithm><option value="astar">A*</option><option value="bfs">BFS</option><option value="dfs">DFS</option></select></label><button type="button" class="ws-control" data-path-run>FIND PATH</button><button type="button" class="ws-control" data-path-random>GENERATE RANDOM WALLS</button><button type="button" class="ws-control" data-path-clear>CLEAR</button><span class="mono" data-path-status>CLICK CELLS TO BUILD</span></div>`;
      workspaceVisual.insertAdjacentHTML('beforeend','<span class="workspace-coordinate mono" data-workspace-coordinate></span>');workspaceCoordinate=workspaceVisual.querySelector('[data-workspace-coordinate]');
      const grid=workspaceVisual.querySelector('[data-path-grid]'),status=workspaceVisual.querySelector('[data-path-status]'),select=workspaceVisual.querySelector('[data-path-algorithm]');
      const cols=18,rows=11,total=cols*rows,start=1*cols+2,end=9*cols+15;let walls=new Set();let running=false;
      const idx=(r,c)=>r*cols+c;const rc=i=>[Math.floor(i/cols),i%cols];
      const draw=path=>{grid.innerHTML=Array.from({length:total},(_,i)=>{const cls=[i===start?'is-start':'',i===end?'is-end':'',walls.has(i)?'is-wall':'',path?.has(i)?'is-path':''].filter(Boolean).join(' ');return `<button type="button" class="path-cell ${cls}" data-path-cell="${i}" aria-label="Cell ${i+1}"></button>`;}).join('');};
      const neighbours=i=>{const[r,c]=rc(i),out=[];if(r>0)out.push(idx(r-1,c));if(r<rows-1)out.push(idx(r+1,c));if(c>0)out.push(idx(r,c-1));if(c<cols-1)out.push(idx(r,c+1));return out.filter(n=>!walls.has(n));};
      const findPath=async()=>{if(running)return;running=true;status.textContent='SEARCHING';const alg=select.value,q=[start],came=new Map(),seen=new Set([start]),g=new Map([[start,0]]);while(q.length&&running){let current;if(alg==='bfs')current=q.shift();else if(alg==='dfs')current=q.pop();else{q.sort((a,b)=>(g.get(a)+Math.abs(rc(a)[0]-rc(end)[0])+Math.abs(rc(a)[1]-rc(end)[1]))-(g.get(b)+Math.abs(rc(b)[0]-rc(end)[0])+Math.abs(rc(b)[1]-rc(end)[1])));current=q.shift();}if(current===end)break;for(const n of neighbours(current)){if(seen.has(n))continue;seen.add(n);came.set(n,current);g.set(n,(g.get(current)||0)+1);q.push(n);}draw(new Set(seen));await new Promise(r=>setTimeout(r,reducedMotion?0:18));}let path=new Set();if(seen.has(end)){let cur=end;while(cur!==undefined){path.add(cur);if(cur===start)break;cur=came.get(cur);}}draw(path);status.textContent=path.size?`${alg.toUpperCase()} / ${path.size} CELLS IN PATH`:'NO PATH / BUILD ANOTHER MAZE';running=false;};
      grid.addEventListener('click',e=>{const cell=e.target.closest('[data-path-cell]');if(!cell||running)return;const i=Number(cell.dataset.pathCell);if(i!==start&&i!==end){walls.has(i)?walls.delete(i):walls.add(i);draw();status.textContent=`${walls.size} WALLS / READY`;}});
      const randomWalls=()=>{if(running)return;walls.clear();const density=.22+Math.random()*.18;for(let i=0;i<total;i++){if(i===start||i===end)continue;if(Math.random()<density)walls.add(i);}draw();status.textContent=`${walls.size} RANDOM WALLS / READY`;};workspaceVisual.querySelector('[data-path-run]')?.addEventListener('click',findPath);workspaceVisual.querySelector('[data-path-random]')?.addEventListener('click',randomWalls);workspaceVisual.querySelector('[data-path-clear]')?.addEventListener('click',()=>{if(running)return;walls.clear();draw();status.textContent='CLICK CELLS TO BUILD';});draw();workspaceCleanup=()=>{};return;
    }

    if (key === 'color') {
      workspaceVisual.innerHTML=`<div class="ws-image" data-image-lab><canvas data-image-canvas></canvas><div class="ws-image-controls"><label>CONTRAST <input data-image-contrast type="range" min="50" max="170" value="100"></label><label>THRESHOLD <input data-image-threshold type="range" min="0" max="255" value="128"></label><label>PIXELATE <input data-image-pixel type="range" min="1" max="18" value="1"></label></div><span class="ws-image-label mono" data-image-label>ORIGINAL / SAMPLE IMAGE</span></div><div class="ws-control-row"><label class="ws-upload-button ws-control">UPLOAD IMAGE<input data-image-upload type="file" accept="image/*"></label><button type="button" class="ws-control" data-image-gray>GRAYSCALE</button><button type="button" class="ws-control" data-image-threshold-toggle>THRESHOLD</button><button type="button" class="ws-control" data-image-download>DOWNLOAD IMAGE</button><button type="button" class="ws-control" data-image-reset>RESET</button><span class="mono">LOCAL IMAGE PROCESSING / NOTHING UPLOADED</span></div>`;
      workspaceVisual.insertAdjacentHTML('beforeend','<span class="workspace-coordinate mono" data-workspace-coordinate></span>');workspaceCoordinate=workspaceVisual.querySelector('[data-workspace-coordinate]');
      const canvas=workspaceVisual.querySelector('[data-image-canvas]'),ctx=canvas.getContext('2d'),contrast=workspaceVisual.querySelector('[data-image-contrast]'),threshold=workspaceVisual.querySelector('[data-image-threshold]'),pixel=workspaceVisual.querySelector('[data-image-pixel]'),label=workspaceVisual.querySelector('[data-image-label]'),upload=workspaceVisual.querySelector('[data-image-upload]');let gray=false,thresh=false,uploadedName='';
      const source=document.createElement('canvas');source.width=480;source.height=300;const s=source.getContext('2d');
      const sample=()=>{s.clearRect(0,0,480,300);const grad=s.createLinearGradient(0,0,480,300);grad.addColorStop(0,'#6b5b7c');grad.addColorStop(.5,'#dccddc');grad.addColorStop(1,'#a7c4b0');s.fillStyle=grad;s.fillRect(0,0,480,300);s.strokeStyle='#0b0a0f';s.lineWidth=3;for(let x=0;x<480;x+=32){s.beginPath();s.moveTo(x,0);s.lineTo(x+90,300);s.stroke();}s.fillStyle='#0b0a0f';s.font='bold 54px Georgia';s.fillText('IMAGE / LAB',34,155);s.font='12px monospace';s.fillText('SHASHWAT ANEJA',36,180);};sample();
      const draw=()=>{canvas.width=480;canvas.height=300;ctx.imageSmoothingEnabled=false;const c=Number(contrast.value)/100,p=Number(pixel.value);ctx.filter=gray?'grayscale(1)':'none';ctx.drawImage(source,0,0);ctx.filter='none';if(c!==1){const img=ctx.getImageData(0,0,480,300),d=img.data;for(let i=0;i<d.length;i+=4){d[i]=Math.max(0,Math.min(255,(d[i]-128)*c+128));d[i+1]=Math.max(0,Math.min(255,(d[i+1]-128)*c+128));d[i+2]=Math.max(0,Math.min(255,(d[i+2]-128)*c+128));}ctx.putImageData(img,0,0);}if(thresh){const img=ctx.getImageData(0,0,480,300),d=img.data,t=Number(threshold.value);for(let i=0;i<d.length;i+=4){const v=(d[i]+d[i+1]+d[i+2])/3>t?255:11;d[i]=d[i+1]=d[i+2]=v;}ctx.putImageData(img,0,0);}if(p>1){const small=document.createElement('canvas');small.width=Math.max(1,Math.ceil(480/p));small.height=Math.max(1,Math.ceil(300/p));small.getContext('2d').drawImage(canvas,0,0,small.width,small.height);ctx.clearRect(0,0,480,300);ctx.drawImage(small,0,0,480,300);}label.textContent=`${uploadedName||'SAMPLE IMAGE'} / ${gray?'GRAYSCALE':'COLOUR'} / ${thresh?'THRESHOLD':'NORMAL'} / ${p}× PIXEL`;};
      const downloadEdited=()=>{const out=document.createElement('canvas');out.width=480;out.height=342;const o=out.getContext('2d');o.fillStyle='#0b0a0f';o.fillRect(0,0,out.width,out.height);o.drawImage(canvas,0,0);o.fillStyle='#a9a1b2';o.font='12px monospace';o.fillText('SHASHWATANEJA.COM / IMAGE WORKSPACE',10,326);o.fillStyle='#70697a';o.font='9px monospace';o.fillText(`${uploadedName||'SAMPLE IMAGE'} / ${gray?'GRAYSCALE':'COLOUR'} / ${thresh?'THRESHOLD':'NORMAL'} / ${pixel.value}× PIXEL`,10,338);out.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='shashwat-image-edit.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');};
      upload?.addEventListener('change',()=>{const file=upload.files?.[0];if(!file)return;const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{s.fillStyle='#0b0a0f';s.fillRect(0,0,480,300);const scale=Math.min(480/img.width,300/img.height),w=img.width*scale,h=img.height*scale;s.drawImage(img,(480-w)/2,(300-h)/2,w,h);uploadedName=file.name.replace(/\.[^.]+$/,'').slice(0,28).toUpperCase();draw();URL.revokeObjectURL(url);};img.src=url;});
      [contrast,threshold,pixel].forEach(c=>c.addEventListener('input',draw));workspaceVisual.querySelector('[data-image-gray]')?.addEventListener('click',()=>{gray=!gray;draw();});workspaceVisual.querySelector('[data-image-threshold-toggle]')?.addEventListener('click',()=>{thresh=!thresh;draw();});workspaceVisual.querySelector('[data-image-download]')?.addEventListener('click',downloadEdited);workspaceVisual.querySelector('[data-image-reset]')?.addEventListener('click',()=>{gray=false;thresh=false;uploadedName='';if(upload)upload.value='';contrast.value=100;threshold.value=128;pixel.value=1;sample();draw();});draw();workspaceCleanup=()=>{};return;
    }

    if (key === 'world') {
      workspaceVisual.innerHTML=`<div class="ws-world" data-world-field><canvas data-world-canvas></canvas><div class="ws-world-readout mono"><span>SEED <b data-world-seed>48291</b></span><span>WORLD <b data-world-biome>ISLAND</b></span><span>LANDMARKS <b data-world-landmarks>0</b></span></div><div class="ws-world-hint mono">CLICK THE MAP TO EXPLORE</div></div><div class="ws-control-row"><label class="mono ws-mini-control">SEED <input data-world-seed-input type="range" min="10000" max="99999" value="48291"></label><label class="mono ws-mini-control">WATER <input data-world-water type="range" min="15" max="65" value="34"></label><label class="mono ws-mini-control">RELIEF <input data-world-relief type="range" min="20" max="90" value="62"></label><button type="button" class="ws-control" data-world-run>GENERATE WORLD</button></div>`;
      workspaceVisual.insertAdjacentHTML('beforeend','<span class="workspace-coordinate mono" data-workspace-coordinate></span>');workspaceCoordinate=workspaceVisual.querySelector('[data-workspace-coordinate]');
      const canvas=workspaceVisual.querySelector('[data-world-canvas]'),ctx=canvas.getContext('2d'),seedInput=workspaceVisual.querySelector('[data-world-seed-input]'),waterInput=workspaceVisual.querySelector('[data-world-water]'),reliefInput=workspaceVisual.querySelector('[data-world-relief]'),seedLabel=workspaceVisual.querySelector('[data-world-seed]'),biomeLabel=workspaceVisual.querySelector('[data-world-biome]'),landmarkLabel=workspaceVisual.querySelector('[data-world-landmarks]');let worldData=[];
      const rand=seed=>{let n=seed>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};};
      const generate=()=>{canvas.width=720;canvas.height=400;const seed=Number(seedInput.value),water=Number(waterInput.value),relief=Number(reliefInput.value),r=rand(seed),cols=72,rows=40,cell=10;worldData=[];ctx.fillStyle='#0b0a0f';ctx.fillRect(0,0,720,400);
        for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const nx=x/(cols-1)*2-1,ny=y/(rows-1)*2-1,dist=Math.sqrt((nx*1.12)**2+(ny*.88)**2);const noise=(Math.sin(x*.19+seed*.001)+Math.sin(y*.27-seed*.002)+Math.sin((x+y)*.11+seed*.003))/3;const h=(1-dist)*1.35+noise*(relief/220)+(r()-.5)*.08-(water-34)/100;let type='water';if(h>.05)type=h>.72?'mountain':h>.43?'highland':h>.22?'forest':'grass';worldData.push({x,y,h,type});}
        const colors={water:'#252033',grass:'#8fae9a',forest:'#587968',highland:'#9c927d',mountain:'#d1c6bb'};for(const c of worldData){ctx.fillStyle=colors[c.type];ctx.fillRect(c.x*cell,c.y*cell,cell+1,cell+1);}
        // coast contour
        ctx.strokeStyle='rgba(220,205,220,.55)';ctx.lineWidth=1;for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++){const c=worldData[y*cols+x];if(c.type!=='water'&&worldData[y*cols+x-1].type==='water'){ctx.beginPath();ctx.moveTo(x*cell,y*cell);ctx.lineTo(x*cell,(y+1)*cell);ctx.stroke();}}
        // rivers and landmarks make each seed feel authored rather than like a static texture
        ctx.strokeStyle='rgba(183,167,217,.72)';ctx.lineWidth=2;for(let k=0;k<3;k++){let x=Math.floor((.2+r()*.6)*cols),y=Math.floor(.08*rows+r()*.18*rows);ctx.beginPath();ctx.moveTo(x*cell+5,y*cell+5);for(let step=0;step<22;step++){const c=worldData[Math.max(0,Math.min(worldData.length-1,y*cols+x))];if(c?.type==='water')break;x=Math.max(1,Math.min(cols-2,x+(r()>.5?1:-1)));y=Math.min(rows-1,y+1);ctx.lineTo(x*cell+5,y*cell+5);}ctx.stroke();}
        let landmarks=0;for(let i=0;i<9;i++){const c=worldData[Math.floor(r()*worldData.length)];if(c&&c.type!=='water'&&c.type!=='mountain'){landmarks++;ctx.fillStyle=i<3?'#dccddc':'#b8846a';ctx.beginPath();ctx.arc(c.x*cell+5,c.y*cell+5,i<3?3:2,0,Math.PI*2);ctx.fill();}}
        // a compass and subtle grid make the world feel explorable
        ctx.strokeStyle='rgba(231,223,214,.10)';ctx.strokeRect(10,10,700,380);ctx.fillStyle='rgba(231,223,214,.48)';ctx.font='9px monospace';ctx.fillText('N',702,24);ctx.beginPath();ctx.moveTo(706,30);ctx.lineTo(706,45);ctx.stroke();seedLabel.textContent=String(seed);biomeLabel.textContent=landmarks>6?'CONTINENT':landmarks>3?'ISLAND':'ARCHIPELAGO';landmarkLabel.textContent=String(landmarks);};
      canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect(),x=Math.floor(((e.clientX-rect.left)/rect.width)*72),y=Math.floor(((e.clientY-rect.top)/rect.height)*40),c=worldData[y*72+x];if(c)canvas.title=`${c.type.toUpperCase()} / ELEVATION ${Math.max(0,Math.round(c.h*100))}`;});
      canvas.addEventListener('click',e=>{const rect=canvas.getBoundingClientRect(),x=Math.floor(((e.clientX-rect.left)/rect.width)*72),y=Math.floor(((e.clientY-rect.top)/rect.height)*40),c=worldData[y*72+x];if(!c)return;ctx.fillStyle='#a7c4b0';ctx.beginPath();ctx.arc(x*10+5,y*10+5,5,0,Math.PI*2);ctx.strokeStyle='#a7c4b0';ctx.stroke();biomeLabel.textContent=c.type.toUpperCase();});
      [seedInput,waterInput,reliefInput].forEach(c=>c.addEventListener('input',generate));workspaceVisual.querySelector('[data-world-run]')?.addEventListener('click',generate);generate();workspaceCleanup=()=>{};return;
    }
  };

  const renderWorkspace = key => {
    const data = workspaceData[key];
    if (!data || !workspaceCopy) return;
    workspaceTabs.forEach(tab => {
      const active = tab.dataset.workspace === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('tabindex', active ? '0' : '-1');
    });
    workspaceCopy.innerHTML = `
      <span class="mono">${safeText(data.kicker)}</span>
      <h3>${safeText(data.title)}</h3>
      <p>${safeText(data.text)}</p>
      <small class="workspace-disclaimer">${safeText(data.note)}</small>
      <div class="workspace-actions"><button class="field-button" type="button" data-workspace-action>${safeText(data.action)} <span aria-hidden="true">↗</span></button><a class="workspace-repo field-link" href="${data.repo}" target="_blank" rel="noopener noreferrer">Repository <span>↗</span></a></div>`;
    renderWorkspaceVisual(key);
    if (workspaceCoordinate) workspaceCoordinate.textContent = data.coord;
  };

  workspaceTabs.forEach(tab => {
    tab.addEventListener('click', () => renderWorkspace(tab.dataset.workspace));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = workspaceTabs.indexOf(tab);
      let next = current;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = workspaceTabs.length - 1;
      else next = (current + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + workspaceTabs.length) % workspaceTabs.length;
      workspaceTabs[next].focus();
      renderWorkspace(workspaceTabs[next].dataset.workspace);
    });
  });

  workspaceStage?.addEventListener('click', event => {
    if (!event.target.closest('[data-workspace-action]')) return;
    const mode = workspaceVisual?.dataset.mode;
    if (mode === 'sorting') workspaceVisual?.querySelector('[data-sort-run]')?.click();
    if (mode === 'xylo') workspaceVisual?.querySelector('[data-xylo-run]')?.click();
    if (mode === 'mnist') {
      workspaceVisual?.querySelector('[data-mnist-download]')?.click();
      const grid = workspaceVisual?.querySelector('[data-mnist-grid]');
      grid?.classList.remove('is-invited');
      window.requestAnimationFrame(() => grid?.classList.add('is-invited'));
    }
    if (mode === 'pathfinding') workspaceVisual?.querySelector('[data-path-run]')?.click();
    if (mode === 'color') workspaceVisual?.querySelector('[data-image-download]')?.click();
    if (mode === 'world') workspaceVisual?.querySelector('[data-world-run]')?.click();
    workspaceStage.classList.remove('is-triggered');
    window.requestAnimationFrame(() => workspaceStage.classList.add('is-triggered'));
  });

  document.addEventListener('click', event => {
    const makeLink = event.target.closest('[data-make-filter]');
    if (!makeLink) return;
    const filter = makeLink.dataset.makeFilter;
    if (!filter) return;
    window.setTimeout(() => document.querySelector(`.project-filter[data-filter="${CSS.escape(filter)}"]`)?.click(), 80);
  });

  document.addEventListener('pointerdown', event => {
    const target = event.target.closest('.field-link, .field-button, .make-row, .selected-project, .archive-list .project-row, .contact-card, .ws-control');
    target?.classList.add('is-pressed');
  });
  document.addEventListener('pointerup', () => document.querySelectorAll('.is-pressed').forEach(element => element.classList.remove('is-pressed')));
  renderWorkspace(workspaceTabs.find(tab => tab.classList.contains('is-active'))?.dataset.workspace || 'mnist');

  window.addEventListener('pagehide', () => {
    if (progressFrame) window.cancelAnimationFrame(progressFrame);
    workspaceCleanup();
  }, { once: true });
})();
