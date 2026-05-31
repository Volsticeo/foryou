/* ============================================================
   FINALE.JS — Confetti, Boss Bar, Explosion, Credits, Final
   ============================================================ */

'use strict';

const CREDITS = [
  { role: 'Girlfriend',                   name: 'Anukkriti Poovannan' },
  { role: 'Moral Support',                name: 'also Anukkriti Poovannan' },
  { role: 'Reason this exists',           name: 'Anukkriti, obviously' },
  { role: 'Developer who cried making this', name: 'Sandipan Saha' },
  { role: 'Your Love',                    name: 'Sandipan Saha' },
];

let finaleInited = false;

window.initFinale = function() {
  if (finaleInited) return;
  finaleInited = true;

  runFinale();
};

function runFinale() {
  // Boss bar reveal
  setTimeout(() => {
    const bar = document.getElementById('finale-boss-bar');
    bar.classList.add('reveal');
  }, 300);

  // Health depletes
  setTimeout(() => {
    document.getElementById('boss-health-fill').style.width = '0%';
  }, 800);

  // Explosion section
  setTimeout(() => {
    document.getElementById('finale-explosion').classList.add('show');
    launchConfetti();
    setTimeout(() => {
      document.getElementById('finale-explosion-text').classList.add('pop');
    }, 100);
  }, 1600);

  // Transition to message
  setTimeout(() => {
    document.getElementById('finale-explosion').classList.remove('show');
    document.getElementById('finale-msg-section').classList.add('show');
  }, 4500);

  // Build credits
  buildCredits();

  // Credits button
  document.getElementById('finale-credits-btn').addEventListener('click', () => {
    document.getElementById('finale-msg-section').classList.remove('show');
    document.getElementById('finale-credits').classList.add('show');
    launchConfetti(true);
    // Small delay to let the section show before animating
    setTimeout(() => startCreditsRoll(), 100);
  });
}

/* ── CREDITS ── */
function buildCredits() {
  const scroll = document.getElementById('credits-scroll');
  scroll.innerHTML = '';
  scroll.style.animation = 'none'; // reset

  CREDITS.forEach(c => {
    const row = document.createElement('div');
    row.className = 'credit-row';
    row.innerHTML = `
      <div class="credit-role">${c.role}</div>
      <div class="credit-dots">············</div>
      <div class="credit-name">${c.name}</div>
    `;
    scroll.appendChild(row);
  });
}

function startCreditsRoll() {
  const scroll = document.getElementById('credits-scroll');
  const totalH = scroll.scrollHeight;
  const dur    = Math.max(18, CREDITS.length * 5);

  scroll.style.animation = 'none';
  scroll.style.transform  = 'translateY(100vh)';

  // Force reflow
  scroll.offsetHeight;

  scroll.style.transition = `transform ${dur}s linear`;
  scroll.style.transform  = `translateY(-${totalH}px)`;

  // After credits done -> final frame + set completion flag
  setTimeout(() => {
    document.getElementById('finale-credits').classList.remove('show');
    document.getElementById('finale-final-frame').classList.add('show');
    // Mark journey as complete — next visit either password works directly
    localStorage.setItem('anu_journey_complete', 'yes');

    // Finish button — close the tab
    const finishBtn = document.getElementById('finale-finish-btn');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        window.close();
        // Fallback if window.close() is blocked
        setTimeout(() => {
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#080810;font-family:serif;font-style:italic;color:rgba(255,255,255,0.3);font-size:20px;">you can close this tab now. 🤍</div>';
        }, 300);
      });
    }

    // Portrait detection for final photo
    const finalPhoto = document.getElementById('finale-final-photo');
    const finalBg    = document.getElementById('finale-final-bg');
    if (finalBg) finalBg.style.backgroundImage = "url('assets/her.jpg')";
    if (finalPhoto) {
      const checkPortrait = () => {
        if (finalPhoto.naturalWidth > 0) {
          if (finalPhoto.naturalHeight > finalPhoto.naturalWidth) {
            finalPhoto.classList.add('is-portrait');
          }
        }
      };
      if (finalPhoto.complete) checkPortrait();
      else finalPhoto.onload = checkPortrait;
    }
  }, dur * 1000 + 500);
}

/* ── CONFETTI ── */
let confettiParticles = [];
let confettiAnimId;

function launchConfetti(gentle = false) {
  const canvas = document.getElementById('confetti-canvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = [
    '#D3D3FF', '#ff3cb4', '#5078ff', '#00e6b4',
    '#ffd700', '#ffffff', '#ffaadd',
  ];

  const count = gentle ? 60 : 160;
  confettiParticles = [];

  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height * (gentle ? 1 : -0.2),
      w:      Math.random() * 8 + 4,
      h:      Math.random() * 4 + 2,
      color:  colors[Math.floor(Math.random() * colors.length)],
      vx:     (Math.random() - 0.5) * (gentle ? 1.5 : 3),
      vy:     Math.random() * (gentle ? 1.5 : 4) + 1,
      rot:    Math.random() * 360,
      rotV:   (Math.random() - 0.5) * 6,
      alpha:  1,
    });
  }

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  animateConfetti(ctx, canvas);
}

function animateConfetti(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiParticles = confettiParticles.filter(p => p.alpha > 0.02);

  confettiParticles.forEach(p => {
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.rotV;
    p.vy  += 0.06; // gravity
    if (p.y > canvas.height * 0.6) p.alpha -= 0.015;

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  if (confettiParticles.length > 0) {
    confettiAnimId = requestAnimationFrame(() => animateConfetti(ctx, canvas));
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}