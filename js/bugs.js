/* ============================================================
   BUGS.JS — Terminal, Patch Notes, Expand, Unlock
   ============================================================ */

'use strict';

const PATCH_DATA = [
  {
    ver: 'v0.1',
    joke: 'User detected. Attempted removal. Failed.',
    feeling: 'Well Once I tried, but failed gravely!',
  },
  {
    ver: 'v0.3',
    joke: 'Smiled once. System resources never recovered.',
    feeling: "Yeah, never could really get up from that fall. Your Smile is something on another level!",
  },
  {
    ver: 'v1.0',
    joke: 'Laugh exploit discovered. Critical vulnerability. No patch available.',
    feeling: 'Each Laugh: -10HP, -10HP...',
  },
  {
    ver: 'v1.3',
    joke: 'Discovered: over-the-glasses stare. Severity: fatal. No known defense.',
    feeling: 'Really... FLAT, seriously FLATTT!!',
  },
  {
    ver: 'v2.1',
    joke: 'Art style flagged as illegal. Too good. Under investigation.',
    feeling: 'BroO! Too good really, Biggest Fan',
  },
  {
    ver: 'v6.0',
    joke: 'Alternate mode unlocked: 10% volume, 300% cute. Trigger: Alcohol.',
    feeling: 'I will be 🤐!',
  },
  {
    ver: 'v7.0',
    joke: 'Critical weakness found: creative Hindi gaalis. Instant system crash. Repeatable exploit.',
    feeling: 'Well i do exploit that a lot, man u look so good when you laugh!',
  },
  {
    ver: 'v8.0',
    joke: 'Marked as feature, not a bug. Shipping forever.',
    feeling: 'FOREVER!! 🔪',
  },
];

let bugsInited   = false;
let openedCount  = 0;
const totalCount = PATCH_DATA.length;

window.initBugs = function() {
  if (bugsInited) return;
  bugsInited = true;

  runTerminal();
};

function runTerminal() {
  const lines = ['tl0','tl1','tl2','tl3','tl4','tl5'];
  const delays = [200, 700, 1300, 1900, 2700, 3300];

  lines.forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('show');
    }, delays[i]);
  });

  // Crash transition
  setTimeout(() => {
    const flash = document.getElementById('bugs-crash-flash');
    flash.classList.add('flash');
    setTimeout(() => {
      flash.classList.remove('flash');
      document.getElementById('bugs-terminal').classList.add('fade-out');
      setTimeout(() => {
        document.getElementById('bugs-terminal').style.display = 'none';
        showMain();
      }, 600);
    }, 130);
  }, 4200);
}

function showMain() {
  buildPatchList();
  const main = document.getElementById('bugs-main');
  main.classList.add('show');

  // Animate entries in with stagger
  setTimeout(() => {
    const entries = document.querySelectorAll('.patch-entry');
    entries.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, i * 80);
    });
  }, 100);
}

function buildPatchList() {
  const list = document.getElementById('bugs-list');
  list.innerHTML = '';

  PATCH_DATA.forEach((item, idx) => {
    const entry = document.createElement('div');
    entry.className = 'patch-entry';
    entry.dataset.idx = idx;

    entry.innerHTML = `
      <div class="patch-dot"></div>
      <div class="patch-ver">${item.ver}</div>
      <div class="patch-content">
        <div class="patch-joke">${item.joke}</div>
        <div class="patch-feeling">${item.feeling}</div>
      </div>
      <div class="patch-arrow">▶</div>
    `;

    entry.addEventListener('click', () => toggleEntry(entry, idx));
    list.appendChild(entry);
  });

  // Update commit count
  document.getElementById('bugs-commit-count').textContent =
    `${PATCH_DATA.length} entries · click each to expand`;

  // Close button — opens modal
  const closeBtn = document.getElementById('bugs-close-btn');
  closeBtn.addEventListener('click', () => {
    if (closeBtn.disabled) return;
    document.getElementById('bugs-modal-overlay').classList.add('open');
    closeBtn.style.opacity = '0.3';
    closeBtn.style.pointerEvents = 'none';
  });

  // Modal confirm button
  document.getElementById('bugs-modal-btn').addEventListener('click', () => {
    document.getElementById('bugs-modal-overlay').classList.remove('open');
    setTimeout(() => window.navigateTo(3), 400);
  });
}

function toggleEntry(entry, idx) {
  const wasOpen = entry.classList.contains('open');

  if (!wasOpen) {
    entry.classList.add('open');
    openedCount++;
    SoundSystem.play('small_swoosh', 0.5);
    checkAllOpened();
  }
  // entries stay open once clicked — no toggling closed
}

function checkAllOpened() {
  if (openedCount >= totalCount) {
    const btn = document.getElementById('bugs-close-btn');
    btn.disabled = false;
    btn.classList.add('unlocked');
    document.getElementById('bugs-commit-count').textContent =
      `${totalCount} / ${totalCount} entries read`;
  } else {
    document.getElementById('bugs-commit-count').textContent =
      `${openedCount} / ${totalCount} entries read`;
  }
}