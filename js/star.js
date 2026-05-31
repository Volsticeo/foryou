/* ============================================================
   STAR.JS — Starfield, Shooting Star, Wish, EmailJS
   ============================================================ */

'use strict';

const EMAILJS_PUBLIC_KEY  = 'Wvl3qp18AJkkLilGf';
const EMAILJS_SERVICE_ID  = 'service_oegmn5m';
const EMAILJS_TEMPLATE_ID = 'template_5668czh';

const STAR_LINE_1 = 'Do I prefer the Moon or the Stars?';
const STAR_LINE_2 = 'Your Eyes.';

let starInited = false;

// No SDK init needed — using REST API directly to avoid browser tracking prevention

window.initStar = function() {
  if (starInited) return;
  starInited = true;
  setupCanvas();
  bindEvents();
};

/* ── CANVAS ── */
let canvas, ctx, W, H;
let stars = [];

function setupCanvas() {
  canvas = document.getElementById('star-canvas');
  ctx    = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  initStars();
  animateStars();
}

function resize() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}

function initStars() {
  stars = [];
  const count = Math.floor((W * H) / 3800);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.3 + 0.2,
      alpha: Math.random() * 0.65 + 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.018 + 0.004,
    });
  }
}

function animateStars() {
  ctx.clearRect(0, 0, W, H);
  stars.forEach(s => {
    s.phase += s.speed;
    const a = s.alpha * (0.55 + 0.45 * Math.sin(s.phase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fill();
  });
  requestAnimationFrame(animateStars);
}

/* ── SHOOTING STAR ──
   showTrace: draw text tracing along the path (true for wish + line1, false for line2)
*/
function shootStar(text, color, yFrac, showTrace, onDone) {
  const startX = W * 0.05;
  const endX   = W * 0.95;
  const peakY  = H * (yFrac - 0.08);
  const startY = H * (yFrac + 0.04);
  const endY   = H * yFrac;
  const dur    = 2200;
  const start  = performance.now();
  const cpX    = W * 0.5;
  const cpY    = peakY;

  function bezier(t, p0, p1, p2) {
    return (1-t)*(1-t)*p0 + 2*(1-t)*t*p1 + t*t*p2;
  }

  function frame(now) {
    const raw  = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - raw, 3);

    const cx = bezier(ease, startX, cpX, endX);
    const cy = bezier(ease, startY, cpY, endY);

    // tail
    const tailT = Math.max(0, ease - 0.06);
    const tx2   = bezier(tailT, startX, cpX, endX);
    const ty2   = bezier(tailT, startY, cpY, endY);

    const grad = ctx.createLinearGradient(tx2, ty2, cx, cy);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(1, color || 'rgba(255,255,255,0.92)');

    ctx.beginPath();
    ctx.moveTo(tx2, ty2);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // glow head
    const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
    hg.addColorStop(0, color || 'rgba(255,255,255,0.95)');
    hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = hg;
    ctx.fill();

    // text tracing — only when showTrace is true
    if (showTrace && raw > 0.08 && text) {
      const progress = Math.max(0, (raw - 0.08) / 0.75);
      const chars    = Math.floor(text.length * progress);
      const partial  = text.substring(0, chars);
      const midT     = ease * 0.5;
      const midX     = bezier(midT, startX, cpX, endX);
      const midY     = bezier(midT, startY, cpY, endY);

      ctx.font = '300 14px "Cormorant Garamond", serif';
      ctx.fillStyle = `rgba(255,255,255,${Math.min(raw * 2.5, 0.75)})`;
      ctx.textAlign = 'center';
      ctx.fillText(partial, midX, midY - 16);
    }

    if (raw < 1) {
      requestAnimationFrame(frame);
    } else {
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(frame);
}

/* ── EVENTS ── */
function bindEvents() {
  document.getElementById('star-send-btn').addEventListener('click', sendWish);
  document.getElementById('star-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendWish();
  });
  document.getElementById('star-next-btn').addEventListener('click', () => window.navigateTo(4));
}

function sendWish() {
  const input = document.getElementById('star-input');
  const wish  = input.value.trim() || 'something beautiful';

  document.getElementById('star-prompt').classList.add('hidden');

  // Send wish via EmailJS REST API directly — bypasses SDK storage issues
  fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:   EMAILJS_SERVICE_ID,
      template_id:  EMAILJS_TEMPLATE_ID,
      user_id:      EMAILJS_PUBLIC_KEY,
      template_params: {
        wish:      wish,
      }
    })
  }).catch(() => {}); // silent — she must never know

  // 1. Her wish shoots across with trace
  setTimeout(() => {
    shootStar(wish, 'rgba(180, 200, 255, 0.9)', 0.32, true, () => {

      // "noted" text fades in
      setTimeout(() => {
        document.getElementById('star-noted').classList.add('show');
      }, 500);

      // 2. Line 1 — with trace
      setTimeout(() => {
        shootStar(STAR_LINE_1, 'rgba(211, 211, 255, 0.95)', 0.40, true, () => {

          // Line 1 fades in as glowing text
          const l1 = document.getElementById('star-line1');
          l1.textContent = STAR_LINE_1;
          l1.classList.add('show');

          // 3. Wait 4.5s — then Line 2 — NO trace, just the star arc
          setTimeout(() => {
            shootStar(STAR_LINE_2, 'rgba(255, 255, 200, 0.95)', 0.52, false, () => {

              // "Your Eyes." fades in as final glowing state only
              const l2 = document.getElementById('star-line2');
              l2.textContent = STAR_LINE_2;
              l2.classList.add('show');

              setTimeout(() => {
                document.getElementById('star-next-btn').classList.add('show');
              }, 2000);
            });
          }, 4500);
        });
      }, 2000);
    });
  }, 400);
}