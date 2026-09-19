(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'shashwat-theme';
  const themes = {
    void: { label:'VOID', note:'dark / editorial', vars:{
      '--void':'#0B0A0F','--charcoal':'#1A1823','--shadow-lavender':'#6B5B7C','--lavender':'#B7A7D9','--fog':'#DCCDDC','--sage':'#A7C4B0','--stone':'#E7DFD6','--ember':'#B8846A','--text-primary':'#F1EDF4','--text-secondary':'#A9A1B2','--text-muted':'#70697A','--border':'rgba(183,167,217,.16)','--field-line':'rgba(183,167,217,.16)','--line':'rgba(220,205,220,.16)','--line-strong':'rgba(183,167,217,.34)','--card':'#111016','--card-alt':'#15121c','--card-hover':'rgba(183,167,217,.05)','--path-cell':'rgba(231,223,214,.025)','--path-border':'rgba(63,57,65,.16)','--path-wall':'rgba(184,132,106,.55)','--path-route':'#E7DFD6','--robot-shell':'#121018','--robot-body':'#121018','--robot-border':'rgba(220,213,226,.72)','--robot-limb':'rgba(220,213,226,.72)','--robot-eye':'#B7A7D9','--robot-glow':'rgba(183,167,217,.22)','--robot-outline':'rgba(241,237,244,.22)'
    }},
    paper: { label:'PAPER', note:'warm / editorial', vars:{
      '--void':'#F3EEE6','--charcoal':'#E8E0D5','--shadow-lavender':'#8C7C78','--lavender':'#6B5B7C','--fog':'#3F3941','--sage':'#5E7867','--stone':'#C9BDAF','--ember':'#9A6248','--text-primary':'#211E24','--text-secondary':'#5C5660','--text-muted':'#817984','--border':'rgba(63,57,65,.16)','--field-line':'rgba(63,57,65,.16)','--line':'rgba(63,57,65,.16)','--line-strong':'rgba(107,91,124,.34)','--card':'#EAE2D8','--card-alt':'#F3EEE6','--card-hover':'rgba(107,91,124,.07)','--path-cell':'rgba(63,57,65,.045)','--path-border':'rgba(63,57,65,.18)','--path-wall':'rgba(154,98,72,.72)','--path-route':'#8C7C78','--robot-shell':'#F0E8DD','--robot-body':'#F0E8DD','--robot-border':'rgba(63,57,65,.62)','--robot-limb':'rgba(63,57,65,.62)','--robot-eye':'#6B5B7C','--robot-glow':'rgba(107,91,124,.18)','--robot-outline':'rgba(63,57,65,.32)'
    }},
    terminal: { label:'TERMINAL', note:'monochrome / signal', vars:{
      '--void':'#090D0B','--charcoal':'#111814','--shadow-lavender':'#3C5A4A','--lavender':'#8ED5A8','--fog':'#D2E0D6','--sage':'#6DAA83','--stone':'#BFCBC3','--ember':'#D2A15B','--text-primary':'#E8F2EB','--text-secondary':'#A6B8AC','--text-muted':'#66766C','--border':'rgba(142,213,168,.17)','--field-line':'rgba(142,213,168,.17)','--line':'rgba(142,213,168,.17)','--line-strong':'rgba(142,213,168,.34)','--card':'#101612','--card-alt':'#131B16','--card-hover':'rgba(142,213,168,.06)','--path-cell':'rgba(210,224,214,.025)','--path-border':'rgba(142,213,168,.14)','--path-wall':'rgba(210,161,91,.62)','--path-route':'#BFCBC3','--robot-shell':'#DDE9E0','--robot-body':'#DDE9E0','--robot-border':'rgba(210,224,214,.68)','--robot-limb':'rgba(210,224,214,.68)','--robot-eye':'#8ED5A8','--robot-glow':'rgba(142,213,168,.22)','--robot-outline':'rgba(232,242,235,.24)'
    }},
    dusk: { label:'DUSK', note:'warm / atmospheric', vars:{
      '--void':'#130F12','--charcoal':'#21181B','--shadow-lavender':'#74535C','--lavender':'#D2A6B3','--fog':'#E3CFC8','--sage':'#9DAE9B','--stone':'#D9C0B1','--ember':'#C67E62','--text-primary':'#F2E7E4','--text-secondary':'#BFAFB0','--text-muted':'#7D6C70','--border':'rgba(210,166,179,.17)','--field-line':'rgba(210,166,179,.17)','--line':'rgba(210,166,179,.17)','--line-strong':'rgba(210,166,179,.34)','--card':'#1A1317','--card-alt':'#21181B','--card-hover':'rgba(210,166,179,.06)','--path-cell':'rgba(227,207,200,.03)','--path-border':'rgba(210,166,179,.15)','--path-wall':'rgba(198,126,98,.62)','--path-route':'#D9C0B1','--robot-shell':'#E4D5D5','--robot-body':'#E4D5D5','--robot-border':'rgba(236,220,218,.68)','--robot-limb':'rgba(236,220,218,.68)','--robot-eye':'#D2A6B3','--robot-glow':'rgba(210,166,179,.22)','--robot-outline':'rgba(242,231,228,.24)'
    }}
  };

  function apply(name, persist = true) {
    const theme = themes[name] || themes.void;
    Object.entries(theme.vars).forEach(([prop, value]) => root.style.setProperty(prop, value));
    root.dataset.theme = name;
    if (persist) { try { localStorage.setItem(key, name); } catch (_) {} }
    document.querySelectorAll('[data-theme-choice]').forEach(btn => {
      const active = btn.dataset.themeChoice === name;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-theme-current]').forEach(el => el.textContent = theme.label);
  }

  let saved = 'void';
  try { saved = localStorage.getItem(key) || 'void'; } catch (_) {}
  apply(saved, false);

  function build() {
    if (document.querySelector('[data-theme-panel]')) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'theme-trigger mono'; button.setAttribute('aria-expanded','false');
    button.dataset.themeOpen = '';
    button.innerHTML = '<span class="theme-trigger__orb" aria-hidden="true"></span><span>ATMOSPHERE</span><b data-theme-current>VOID</b>';
    const panel = document.createElement('div');
    panel.className = 'theme-panel'; panel.dataset.themePanel = ''; panel.hidden = true;
    panel.innerHTML = `<div class="theme-panel__head"><div><span class="mono">CHANGE THE ATMOSPHERE</span><strong>Choose a visual field.</strong></div><button type="button" class="theme-panel__close mono" data-theme-close>ESC</button></div><div class="theme-options" role="group" aria-label="Website themes"></div>`;
    const options = panel.querySelector('.theme-options');
    Object.entries(themes).forEach(([name, theme]) => {
      const b = document.createElement('button'); b.type='button'; b.className='theme-choice'; b.dataset.themeChoice=name; b.setAttribute('aria-pressed','false');
      b.innerHTML = `<span class="theme-choice__swatch theme-choice__swatch--${name}"><i></i><i></i><i></i></span><span class="theme-choice__copy"><strong>${theme.label}</strong><small>${theme.note}</small></span><span class="theme-choice__mark">↗</span>`;
      options.appendChild(b);
    });
    document.body.append(button, panel);
    apply(root.dataset.theme || saved, false);
    const open = () => { panel.hidden=false; button.setAttribute('aria-expanded','true'); panel.classList.add('is-open'); panel.querySelector('[data-theme-choice].is-active')?.focus(); };
    const close = () => { panel.classList.remove('is-open'); button.setAttribute('aria-expanded','false'); setTimeout(() => { panel.hidden=true; }, 260); button.focus(); };
    button.addEventListener('click', () => panel.hidden ? open() : close());
    panel.querySelector('[data-theme-close]').addEventListener('click', close);
    options.addEventListener('click', e => { const choice=e.target.closest('[data-theme-choice]'); if(!choice) return; apply(choice.dataset.themeChoice); choice.animate?.([{transform:'scale(.97)'},{transform:'scale(1)'}],{duration:240,easing:'cubic-bezier(.22,1,.36,1)'}); });
    panel.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
