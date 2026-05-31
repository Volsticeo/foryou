/* ============================================================
   VAULT.JS — Single Password: ILOVEYOU, 8-Dot Display
   ============================================================ */

'use strict';

(function initVault() {

  const PW        = 'iloveyou';
  const MAX_LEN   = 8;
  const COMPLETED_KEY = 'anu_journey_complete';

  const dotsWrap    = document.getElementById('vault-dots-wrap');
  const slots       = document.querySelectorAll('.vault-dot-slot');
  const hiddenInput = document.getElementById('vault-input');
  const submit      = document.getElementById('vault-submit');
  const hintEl      = document.getElementById('vault-hint');
  const wrongEl     = document.getElementById('vault-wrong');
  const glitch      = document.getElementById('vault-glitch');

  let realValue = '';

  /* ── PORTRAIT DETECTION ── */
  const heroImg = document.getElementById('vault-hero-img');
  const blurDiv = document.getElementById('vault-backdrop-blur');
  if (blurDiv) blurDiv.style.backgroundImage = "url('assets/hero.jpg')";
  if (heroImg) {
    const applyPortrait = () => {
      if (heroImg.naturalHeight > heroImg.naturalWidth) heroImg.classList.add('is-portrait');
    };
    if (heroImg.complete && heroImg.naturalWidth > 0) applyPortrait();
    else heroImg.onload = applyPortrait;
  }

  /* ── REVEAL ANIMATIONS ── */
  setTimeout(() => document.getElementById('vault-tagline').classList.add('reveal'), 300);
  // vault ring removed
  setTimeout(() => document.getElementById('vault-input-wrap').classList.add('reveal'), 900);

  /* ── DOT RENDERING ── */
  function renderDots() {
    slots.forEach((slot, i) => {
      slot.classList.remove('filled', 'active-cursor');
      if (i < realValue.length) {
        slot.classList.add('filled');
      } else if (i === realValue.length && realValue.length < MAX_LEN) {
        slot.classList.add('active-cursor');
      }
    });
  }

  function clearDots() {
    realValue = '';
    hiddenInput.value = '';
    renderDots();
  }

  /* ── INPUT HANDLING ── */
  dotsWrap.addEventListener('click', () => {
    hiddenInput.focus();
    dotsWrap.classList.add('focused');
  });

  hiddenInput.addEventListener('focus', () => dotsWrap.classList.add('focused'));
  hiddenInput.addEventListener('blur',  () => dotsWrap.classList.remove('focused'));

  // Mobile typing via hidden input
  hiddenInput.addEventListener('input', () => {
    const raw = hiddenInput.value.slice(0, MAX_LEN);
    realValue = raw;
    hiddenInput.value = raw;
    wrongEl.classList.remove('show');
    SoundSystem.play('type', 0.35, 0.9 + Math.random() * 0.2);
    renderDots();
  });

  // Desktop keyboard
  document.addEventListener('keydown', e => {
    if (!document.getElementById('page-vault').classList.contains('active')) return;

    if (e.key === 'Enter') { e.preventDefault(); tryUnlock(); return; }

    if (e.key === 'Backspace') {
      e.preventDefault();
      realValue = realValue.slice(0, -1);
      hiddenInput.value = realValue;
      wrongEl.classList.remove('show');
      SoundSystem.play('type', 0.25, 0.75);
      renderDots();
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (realValue.length >= MAX_LEN) return;
      realValue += e.key;
      hiddenInput.value = realValue;
      wrongEl.classList.remove('show');
      SoundSystem.play('type', 0.35, 0.9 + Math.random() * 0.2);
      renderDots();
    }
  });

  /* ── WRONG / GLITCH ── */
  function showWrong() {
    wrongEl.classList.add('show');
    setTimeout(() => wrongEl.classList.remove('show'), 2500);
  }

  function flashGlitch() {
    glitch.classList.add('flash');
    setTimeout(() => glitch.classList.remove('flash'), 160);
  }

  function shakeInput() {
    dotsWrap.classList.add('error');
    setTimeout(() => dotsWrap.classList.remove('error'), 500);
  }

  /* ── TRY UNLOCK ── */
  function tryUnlock() {
    const val = realValue.trim().toLowerCase();
    if (!val) return;

    if (val === PW) {
      unlockSequence();
      return;
    }

    // Wrong
    flashGlitch();
    shakeInput();
    showWrong();
    clearDots();
  }

  /* ── UNLOCK SEQUENCE ── */
  function unlockSequence() {
    submit.disabled = true;

    // Fill all dots
    slots.forEach(s => { s.classList.remove('active-cursor'); s.classList.add('filled'); });

    SoundSystem.play('success', 0.7);

    // ring removed — just fill dots and navigate

    setTimeout(() => window.navigateTo(1), 900);
  }

  submit.addEventListener('click', tryUnlock);
  renderDots();

})();