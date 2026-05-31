/* ============================================================
   ARCHIVE.JS — Polaroids, Lightbox, Hearts, Parallax
   ============================================================ */

'use strict';

const PHOTOS = [
  { file: '1.jpg',  caption: 'THE EYES!!' },
  { file: '2.jpg',  caption: 'My Reaction when YOU!' },
  { file: '3.jpg',  caption: 'Remember this day?' },
  { file: '4.jpg',  caption: 'What about this?' },
  { file: '5.jpg',  caption: 'Stop biting my ASS' },
  { file: '6.jpg',  caption: 'LOOK AT YOU!!! AWWW' },
  { file: '7.jpeg', caption: 'Only Sleep.. Eepy Girl' },
  { file: '8.jpeg', caption: 'Look who woke up!!' },
  { file: '9.jpeg', caption: 'The kindest girl!' },
  { file: '10.jpg', caption: 'Estupido' },
  { file: '11.jpg', caption: 'My partner in crime' },
  { file: '12.jpg', caption: 'Those times!' },
  { file: '14.jpg', caption: 'My Love' },
  { file: '15.jpg', caption: 'Power Couple' },
];

// Assign orientations — will be detected from actual image on load
// For layout we spread them in a visually pleasing order
const ORIENTATIONS = [
  'portrait','landscape','square','portrait','landscape','square',
  'portrait','landscape','portrait','square','landscape','portrait',
  'square','landscape',
];

const ROTATIONS = [
  -3, 1.5, -1, 2.5, -2, 1, -2.5, 3, -1.5, 2, -1, 3, -2.5, 1.5,
];

let archiveInited = false;
let currentLb     = 0;

window.initArchive = function() {
  if (archiveInited) return;
  archiveInited = true;

  buildPolaroids();
  bindLightbox();
  bindNextBtn();
  bindParallax();
};

function buildPolaroids() {
  const scatter = document.getElementById('archive-scatter');
  scatter.innerHTML = '';

  PHOTOS.forEach((photo, i) => {
    const pol = document.createElement('div');
    pol.className = `polaroid ${ORIENTATIONS[i % ORIENTATIONS.length]}`;
    pol.style.transform = `rotate(${ROTATIONS[i % ROTATIONS.length]}deg) translateY(${Math.abs(ROTATIONS[i % ROTATIONS.length]) * 2}px)`;
    pol.dataset.idx = i;

    const img = document.createElement('img');
    img.className    = 'polaroid-img';
    img.src          = `assets/${photo.file}`;
    img.alt          = photo.caption;
    img.draggable    = false;

    // Detect actual orientation on load
    img.onload = function() {
      if (this.naturalWidth > 0 && this.naturalHeight > 0) {
        const ratio = this.naturalWidth / this.naturalHeight;
        if (ratio > 1.15) {
          pol.className = `polaroid landscape`;
        } else if (ratio < 0.87) {
          pol.className = `polaroid portrait`;
        } else {
          pol.className = `polaroid square`;
        }
      }
    };

    const caption = document.createElement('div');
    caption.className   = 'polaroid-caption';
    caption.textContent = photo.caption;

    pol.appendChild(img);
    pol.appendChild(caption);
    pol.addEventListener('click', () => openLightbox(i, pol));
    scatter.appendChild(pol);
  });

  document.getElementById('archive-count').textContent =
    `${PHOTOS.length} polaroids`;
}

/* ── LIGHTBOX ── */
function openLightbox(idx, polEl) {
  currentLb = idx;

  // Heart burst
  spawnHearts(polEl);

  renderLightbox();
  document.getElementById('archive-lightbox').classList.add('open');
}

function renderLightbox() {
  const photo = PHOTOS[currentLb];
  const img   = document.getElementById('lb-img');
  const cap   = document.getElementById('lb-caption');
  const dots  = document.getElementById('lb-dots');

  img.src = `assets/${photo.file}`;
  img.alt = photo.caption;
  cap.textContent = photo.caption;

  // Dots
  dots.innerHTML = '';
  PHOTOS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'lb-dot' + (i === currentLb ? ' active' : '');
    d.addEventListener('click', e => {
      e.stopPropagation();
      currentLb = i;
      renderLightbox();
    });
    dots.appendChild(d);
  });
}

function closeLightbox() {
  document.getElementById('archive-lightbox').classList.remove('open');
}

function bindLightbox() {
  document.getElementById('lb-close').addEventListener('click', closeLightbox);

  document.getElementById('archive-lightbox').addEventListener('click', e => {
    if (e.target === document.getElementById('archive-lightbox')) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    const lb = document.getElementById('archive-lightbox');
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowRight') { currentLb = (currentLb + 1) % PHOTOS.length; renderLightbox(); }
    if (e.key === 'ArrowLeft')  { currentLb = (currentLb + PHOTOS.length - 1) % PHOTOS.length; renderLightbox(); }
    if (e.key === 'Escape')     { closeLightbox(); }
  });
}

/* ── HEARTS ── */
function spawnHearts(polEl) {
  const rect = polEl.getBoundingClientRect();
  const cx   = rect.left + rect.width / 2;
  const cy   = rect.top  + rect.height / 2;

  const emojis = ['❤️', '💕', '✨', '💫', '🩷', '💝'];
  emojis.forEach((e, i) => {
    const el   = document.createElement('div');
    el.className   = 'heart-particle';
    el.textContent = e;

    const angle = (i / emojis.length) * Math.PI * 2;
    const dist  = 35 + Math.random() * 20;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist - 20;

    el.style.left = cx + 'px';
    el.style.top  = cy + 'px';
    el.style.setProperty('--tx', tx + 'px');
    el.style.setProperty('--ty', ty + 'px');
    el.style.animationDelay = (i * 0.07) + 's';

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  });
}

/* ── PARALLAX MOUSE DRIFT ── */
function bindParallax() {
  const scatter = document.getElementById('archive-scatter');

  document.getElementById('page-archive').addEventListener('mousemove', e => {
    const rect = scatter.getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / rect.width;
    const dy   = (e.clientY - cy) / rect.height;

    const pols = scatter.querySelectorAll('.polaroid');
    pols.forEach((pol, i) => {
      const depth  = 0.5 + (i % 3) * 0.3;
      const baseRot = ROTATIONS[i % ROTATIONS.length];
      const mx    = dx * depth * 10;
      const my    = dy * depth * 8;
      pol.style.transform = `rotate(${baseRot + dx * depth * 1.5}deg) translate(${mx}px, ${my}px)`;
    });
  });

  // Reset on leave
  document.getElementById('page-archive').addEventListener('mouseleave', () => {
    const pols = document.querySelectorAll('.polaroid');
    pols.forEach((pol, i) => {
      const baseRot = ROTATIONS[i % ROTATIONS.length];
      pol.style.transform = `rotate(${baseRot}deg) translateY(${Math.abs(baseRot) * 2}px)`;
    });
  });
}

function bindNextBtn() {
  document.getElementById('archive-next-btn').addEventListener('click', () => {
    window.navigateTo(6);
  });
}