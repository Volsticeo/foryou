/* ============================================================
   APP.JS — Cursor, Routing, Curtain, Progress Dots, Sounds
   ============================================================ */

'use strict';

/* ── CURSOR ── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animTrail() {
    tx += (mx - tx) * 0.1;
    ty += (my - ty) * 0.1;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  }
  animTrail();
})();


/* ── PAGE ROUTING ── */
const PAGES = [
  'page-vault',
  'page-origin',
  'page-bugs',
  'page-star',
  'page-radio',
  'page-archive',
  'page-finale',
];

let currentPage  = 0;
let transitioning = false;

const curtain = document.getElementById('curtain');
const dots    = document.querySelectorAll('.pdot');
const dotsNav = document.getElementById('progress-dots');

function updateDots(idx) {
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  dotsNav.classList.toggle('visible', idx > 0);
}

function navigateTo(idx) {
  if (transitioning || idx === currentPage) return;
  if (idx < 0 || idx >= PAGES.length) return;
  transitioning = true;

  SoundSystem.play('swoosh', 0.55);

  curtain.className = 'wipe-in';

  setTimeout(() => {
    const prev = document.getElementById(PAGES[currentPage]);
    const next = document.getElementById(PAGES[idx]);

    prev.classList.remove('active');
    next.classList.add('active');

    currentPage = idx;
    updateDots(idx);

    curtain.className = 'wipe-out';

    if (idx === 1) window.initOrigin  && window.initOrigin();
    if (idx === 2) window.initBugs    && window.initBugs();
    if (idx === 3) window.initStar    && window.initStar();
    if (idx === 4) window.initRadio   && window.initRadio();
    if (idx === 5) window.initArchive && window.initArchive();
    if (idx === 6) window.initFinale  && window.initFinale();

    setTimeout(() => { transitioning = false; }, 600);
  }, 500);
}

window.navigateTo = navigateTo;

dots.forEach(d => {
  d.addEventListener('click', () => {
    const idx = parseInt(d.dataset.page);
    if (idx > 0) navigateTo(idx);
  });
});

updateDots(0);


/* ── SOUND SYSTEM ── */

/*
  Sound file map — put these in assets/:
  ─────────────────────────────────────────────────────────
  swoosh.mp3        page transitions (every page change)
  small_swoosh.mp3  bug patch entry expand clicks
  click.mp3         general button clicks
  type.mp3          each keystroke on lock screen
  success.mp3       vault unlock success + radio tuned
  chime.mp3         visual novel line advance (origin story)
  ─────────────────────────────────────────────────────────
*/

const SoundSystem = (function() {
  let ctx      = null;
  let unlocked = false;

  const sounds = {
    swoosh:       null,
    small_swoosh: null,
    click:        null,
    type:         null,
    success:      null,
    chime:        null,
  };

  function unlock() {
    if (unlocked) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      unlocked = true;
      loadSounds();
    } catch(e) {}
  }

  function loadSounds() {
    Object.keys(sounds).forEach(key => {
      fetch(`assets/${key}.mp3`)
        .then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
        .then(buf => ctx.decodeAudioData(buf))
        .then(decoded => { sounds[key] = decoded; })
        .catch(() => {}); // silent if file missing
    });
  }

  function play(key, volume = 1.0, pitchShift = 1.0) {
    if (!unlocked || !ctx || !sounds[key]) return;
    try {
      const source = ctx.createBufferSource();
      source.buffer = sounds[key];
      source.playbackRate.value = pitchShift;
      const gain = ctx.createGain();
      gain.gain.value = Math.min(1.0, volume);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch(e) {}
  }

  // Unlock on first interaction
  ['click','keydown','touchstart'].forEach(ev => {
    document.addEventListener(ev, unlock, { once: true });
  });

  return {
    play,
    unlock,
    isUnlocked: () => unlocked,
    getCtx:     () => ctx,
  };
})();

window.SoundSystem = SoundSystem;

// General button click sound (excluding specific buttons handled in their own JS)
document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (btn) {
    // Skip buttons that play their own sounds
    const skipIds = ['vault-submit', 'origin-btn', 'bugs-close-btn', 'bugs-modal-btn'];
    if (!skipIds.includes(btn.id)) {
      SoundSystem.play('click', 0.45);
    }
  }
});