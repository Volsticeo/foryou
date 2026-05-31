/* ============================================================
   ORIGIN.JS — Boot Sequence, Typewriter, Visual Novel
   ============================================================ */

'use strict';

const STORY_LINES = [
  "I was in one class room where I saw you singing, I still remember that day! 😗",
  "In radio studio when my eyes met yours, found out that those were the prettiest eyes I had ever seen in my life... 😭",
  "You scold me TOO much ☹️",
  "But that's okay... I really hate it when you don't. Keep scolding! 🥴",
  "Remember the first ride we had? We were so awkward, but I loved every single minute, while you were sat behind me. 💦",
  "The Controller, DONT GET ME STARTED!! Yours gonna be finding you very soon 🔪",
  "Chalo, I wont keep u holding here, Enjoy your Birthday My Favoritest GIRLL!! 💓",
  "LOVE YOU!",
];

let originInited = false;
let currentLine  = -1;
let isTyping     = false;
let typeTimer    = null;

window.initOrigin = function() {
  if (originInited) return;
  originInited = true;

  runBoot();
};

function runBoot() {
  const boot    = document.getElementById('origin-boot');
  const label   = document.getElementById('boot-label');
  const bar     = document.getElementById('boot-bar');
  const sub     = document.getElementById('boot-sub');

  const steps = [
    { pct: 0,   l: 'Initialising...',   s: '' },
    { pct: 18,  l: 'Loading: Her...',   s: 'stand by' },
    { pct: 42,  l: 'Loading: Her...',   s: 'this might take a while' },
    { pct: 71,  l: 'Loading: Her...',   s: 'worth it though' },
    { pct: 90,  l: 'Almost ready...',   s: '' },
    { pct: 100, l: 'Done.',             s: 'chapter 1' },
  ];

  let i = 0;
  const delays = [0, 350, 700, 800, 550, 400];

  function step() {
    if (i >= steps.length) {
      setTimeout(() => {
        boot.classList.add('fade-out');
        setTimeout(() => {
          boot.style.display = 'none';
          advanceLine();
        }, 700);
      }, 500);
      return;
    }
    const { pct, l, s } = steps[i];
    bar.style.width = pct + '%';
    label.textContent = l;
    sub.textContent = s;
    setTimeout(step, delays[i] || 400);
    i++;
  }
  step();
}

function typeText(text, el, onDone) {
  isTyping = true;
  el.innerHTML = '';
  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'origin-cursor';
  el.appendChild(cursor);

  typeTimer = setInterval(() => {
    if (i >= text.length) {
      clearInterval(typeTimer);
      isTyping = false;
      if (onDone) onDone();
      return;
    }
    el.insertBefore(document.createTextNode(text[i]), cursor);
    i++;
  }, 32);
}

function advanceLine() {
  SoundSystem.play('chime', 0.4, 0.95 + Math.random() * 0.1);
  if (isTyping) {
    // Skip to end of current line
    clearInterval(typeTimer);
    isTyping = false;
    const textEl = document.getElementById('origin-text');
    const line   = STORY_LINES[currentLine];
    textEl.innerHTML = line + '<span class="origin-cursor"></span>';
    return;
  }

  currentLine++;

  if (currentLine >= STORY_LINES.length) return;

  const textEl    = document.getElementById('origin-text');
  const counterEl = document.getElementById('origin-counter');
  const progressEl = document.getElementById('origin-progress');
  const btn       = document.getElementById('origin-btn');
  const hint      = document.getElementById('origin-hint');

  counterEl.textContent = (currentLine + 1) + ' / ' + STORY_LINES.length;
  progressEl.style.width = ((currentLine + 1) / STORY_LINES.length * 100) + '%';

  const isLast = currentLine === STORY_LINES.length - 1;

  if (isLast) {
    btn.textContent = 'Next level →';
    btn.classList.add('done');
    hint.textContent = '';
    btn.onclick = () => window.navigateTo(2);
  }

  typeText(STORY_LINES[currentLine], textEl);
}

// Bind click/tap
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('origin-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const isLast = currentLine === STORY_LINES.length - 1;
      if (!isLast) advanceLine();
    });
  }

  // Tap anywhere on body (except button) to advance
  const page = document.getElementById('page-origin');
  if (page) {
    page.addEventListener('click', e => {
      if (e.target.id === 'origin-btn') return;
      const isLast = currentLine === STORY_LINES.length - 1;
      if (!isLast) advanceLine();
    });
  }
});