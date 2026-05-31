/* ============================================================
   RADIO.JS — Dial, Static Sound, Tune Lock, Song
   ============================================================ */

'use strict';

const FREQ_MIN    = 88.0;
const FREQ_MAX    = 104.0;
const FREQ_TARGET = 90.0;
const FREQ_SNAP   = 0.35;

let radioInited = false;
let audioCtx    = null;
let staticNode  = null;
let staticGain  = null;
let staticBuf   = null;

window.initRadio = function() {
  if (radioInited) return;
  radioInited = true;

  setTimeout(() => {
    document.getElementById('radio-eyebrow').classList.add('reveal');
    document.getElementById('radio-unit').classList.add('reveal');
  }, 200);

  setupWaveform();
  setupDial();

  // Start static immediately — try to use existing AudioContext from SoundSystem if available
  // This means static plays as soon as she enters the page
  setTimeout(() => {
    unlockAudio(); // will reuse ctx if possible
  }, 300);

  // Also bind click/touch as fallback for strict browsers
  document.getElementById('page-radio').addEventListener('click', unlockAudio, { once: true });
  document.getElementById('page-radio').addEventListener('touchstart', unlockAudio, { once: true });
};

/* ── AUDIO CONTEXT ── */
function unlockAudio() {
  if (audioCtx) return;
  // Reuse SoundSystem's AudioContext if already unlocked
  if (window.SoundSystem && window.SoundSystem.isUnlocked() && window.SoundSystem.getCtx()) {
    audioCtx = window.SoundSystem.getCtx();
  } else {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { return; }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {
      setupStaticChain();
    });
  } else {
    setupStaticChain();
  }
}

function setupStaticChain() {
  if (staticGain) return; // already setup
  staticGain = audioCtx.createGain();
  staticGain.gain.value = 0;
  staticGain.connect(audioCtx.destination);
  createStaticBuffer();
  playStatic();
}

function createStaticBuffer() {
  const bufLen = audioCtx.sampleRate * 2;
  staticBuf    = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
  const data   = staticBuf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.4;
  }
}

function playStatic() {
  if (!audioCtx || !staticBuf) return;
  staticNode = audioCtx.createBufferSource();
  staticNode.buffer = staticBuf;
  staticNode.loop   = true;
  staticNode.connect(staticGain);
  staticNode.start();

  // Fade in static
  staticGain.gain.setTargetAtTime(0.18, audioCtx.currentTime, 0.5); // lower auto-start volume
}

function stopStatic(fadeDur = 1.0) {
  if (!staticGain) return;
  staticGain.gain.setTargetAtTime(0, audioCtx.currentTime, fadeDur / 4);
  setTimeout(() => {
    if (staticNode) { try { staticNode.stop(); } catch(e){} }
  }, fadeDur * 1000);
}

function setStaticVolume(vol) {
  if (!staticGain) return;
  staticGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.05);
}

/* ── WAVEFORM CANVAS ── */
let wfCanvas, wfCtx, wfW, wfH;
let wfPhase = 0;
let isTuned = false;

function setupWaveform() {
  wfCanvas = document.getElementById('waveform-canvas');
  wfCtx    = wfCanvas.getContext('2d');
  wfW = wfCanvas.width  = wfCanvas.offsetWidth;
  wfH = wfCanvas.height = wfCanvas.offsetHeight;
  drawWaveform();
}

function drawWaveform() {
  wfCtx.clearRect(0, 0, wfW, wfH);
  wfPhase += isTuned ? 0.04 : 0.015;

  const cy = wfH / 2;

  if (isTuned) {
    wfCtx.beginPath();
    for (let x = 0; x <= wfW; x++) {
      const t   = (x / wfW) * Math.PI * 6;
      const amp = 14 * Math.sin(wfPhase * 0.5);
      const y   = cy + Math.sin(t + wfPhase) * amp;
      x === 0 ? wfCtx.moveTo(x, y) : wfCtx.lineTo(x, y);
    }
    wfCtx.strokeStyle = 'rgba(211, 211, 255, 0.6)';
    wfCtx.lineWidth = 1.5;
    wfCtx.stroke();
  } else {
    const prox    = currentProximity();
    const noiseAmp = 10 * (1 - prox * 0.8);
    for (let x = 0; x <= wfW; x += 3) {
      const noise = (Math.random() - 0.5) * noiseAmp * 2;
      const r = Math.round(80  + prox * 100);
      const g = Math.round(80  + prox * 80);
      const b = Math.round(180 + prox * 60);
      wfCtx.fillStyle = `rgba(${r},${g},${b},${0.3 + prox * 0.3})`;
      wfCtx.fillRect(x, cy + noise - 1, 2, 2);
    }
  }
  requestAnimationFrame(drawWaveform);
}

/* ── DIAL ── */
let currentFreq = FREQ_MIN;
let dialAngle   = 0;
let velocity    = 0;
let isDragging  = false;
let lastY       = 0;
let tuned       = false;

function currentProximity() {
  const dist = Math.abs(currentFreq - FREQ_TARGET);
  return Math.max(0, 1 - dist / 3);
}

function setupDial() {
  const knob = document.getElementById('dial-knob');

  knob.addEventListener('mousedown', e => {
    isDragging = true;
    lastY      = e.clientY;
    velocity   = 0;
    unlockAudio(); // ensure audio on first drag too
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dy = lastY - e.clientY;
    lastY    = e.clientY;
    velocity = dy;
    applyDial(dy);
  });

  document.addEventListener('mouseup', () => { isDragging = false; });

  knob.addEventListener('touchstart', e => {
    e.preventDefault();
    isDragging = true;
    lastY      = e.touches[0].clientY;
    velocity   = 0;
    unlockAudio();
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const dy = lastY - e.touches[0].clientY;
    lastY    = e.touches[0].clientY;
    velocity = dy;
    applyDial(dy);
  }, { passive: false });

  document.addEventListener('touchend', () => { isDragging = false; });

  requestAnimationFrame(momentumLoop);
}

function applyDial(dy) {
  if (tuned) return;
  const freqDelta = dy * 0.04;
  currentFreq = Math.min(FREQ_MAX, Math.max(FREQ_MIN, currentFreq + freqDelta));
  dialAngle  += dy * 2;
  updateDialUI();
  checkTune();
  updateStaticFromFreq();
}

function momentumLoop() {
  if (!isDragging && !tuned && Math.abs(velocity) > 0.1) {
    velocity   *= 0.92;
    currentFreq = Math.min(FREQ_MAX, Math.max(FREQ_MIN, currentFreq + velocity * 0.04));
    dialAngle  += velocity * 2;
    updateDialUI();
    checkTune();
    updateStaticFromFreq();
  }
  requestAnimationFrame(momentumLoop);
}

function updateStaticFromFreq() {
  if (!staticGain || tuned) return;
  const prox = currentProximity();
  // As she gets closer, static gets quieter and warmer
  const vol  = 0.35 * (1 - prox * 0.9);
  setStaticVolume(vol);
}

function updateDialUI() {
  const indicator = document.getElementById('dial-indicator');
  const freqEl    = document.getElementById('radio-freq-num');
  const trackFill = document.getElementById('dial-track-fill');
  const knob      = document.getElementById('dial-knob');
  const hint      = document.getElementById('dial-hint');

  indicator.style.transform       = `translateX(-50%) rotate(${dialAngle}deg)`;
  indicator.style.transformOrigin = '50% 100%';

  freqEl.innerHTML = currentFreq.toFixed(1) + '<span class="radio-freq-mhz">FM</span>';

  const pct = ((currentFreq - FREQ_MIN) / (FREQ_MAX - FREQ_MIN)) * 100;
  trackFill.style.width = pct + '%';

  const prox = currentProximity();
  if (prox > 0.7) {
    hint.textContent = 'almost there...';
    knob.style.boxShadow = `0 4px 20px rgba(0,0,0,0.6), 0 0 ${prox * 28}px rgba(211,211,255,${prox * 0.3}), inset 0 1px 0 rgba(255,255,255,0.05)`;
  } else if (prox > 0.3) {
    hint.textContent = 'getting warmer...';
    knob.style.boxShadow = `0 4px 20px rgba(0,0,0,0.6), 0 0 ${prox * 20}px rgba(211,211,255,${prox * 0.2}), inset 0 1px 0 rgba(255,255,255,0.05)`;
  } else {
    hint.textContent = 'drag to tune';
    knob.style.boxShadow = '';
  }
}

function checkTune() {
  if (tuned) return;
  if (Math.abs(currentFreq - FREQ_TARGET) <= FREQ_SNAP) {
    onTuned();
  }
}

function onTuned() {
  tuned   = true;
  isTuned = true;
  velocity = 0;
  currentFreq = FREQ_TARGET;

  const freqEl    = document.getElementById('radio-freq-num');
  const knob      = document.getElementById('dial-knob');
  const indicator = document.getElementById('dial-indicator');
  const trackFill = document.getElementById('dial-track-fill');

  freqEl.innerHTML = '90.0<span class="radio-freq-mhz">FM</span>';
  freqEl.classList.add('tuned');
  knob.classList.add('tuned');
  trackFill.classList.add('tuned');
  trackFill.style.width = ((FREQ_TARGET - FREQ_MIN) / (FREQ_MAX - FREQ_MIN) * 100) + '%';
  document.getElementById('dial-hint').textContent = '';

  // Fade out static
  stopStatic(1.2);
  SoundSystem.play('success', 0.6);

  // Show station info
  setTimeout(() => {
    document.getElementById('radio-station-info').classList.add('show');
  }, 500);

  // Play song — unlock AudioContext first if needed, then play
  setTimeout(() => {
    const audio = document.getElementById('radio-audio');

    // Resume AudioContext if suspended (browser autoplay policy)
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        fadeInAudio(audio, 0, 0.85, 2200);
      }).catch(() => {
        // Fallback: try again on next user gesture
        document.getElementById('page-radio').addEventListener('click', () => {
          audio.play().then(() => fadeInAudio(audio, 0, 0.85, 2200)).catch(() => {});
        }, { once: true });
      });
    }
  }, 700);

  // Next button
  setTimeout(() => {
    const nextBtn = document.getElementById('radio-next-btn');
    nextBtn.classList.add('show');
    nextBtn.addEventListener('click', () => {
      fadeOutAudio(document.getElementById('radio-audio'), 800);
      setTimeout(() => window.navigateTo(5), 500);
    });
  }, 3500);
}

function fadeInAudio(audio, from, to, dur) {
  const steps = 40;
  const inc   = (to - from) / steps;
  let vol     = from;
  const id    = setInterval(() => {
    vol = Math.min(to, vol + inc);
    audio.volume = vol;
    if (vol >= to) clearInterval(id);
  }, dur / steps);
}

function fadeOutAudio(audio, dur) {
  const steps = 30;
  const dec   = audio.volume / steps;
  const id    = setInterval(() => {
    audio.volume = Math.max(0, audio.volume - dec);
    if (audio.volume <= 0) { clearInterval(id); audio.pause(); }
  }, dur / steps);
}