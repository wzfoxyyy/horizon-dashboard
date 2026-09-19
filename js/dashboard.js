// The member-facing Dashboard: game cards (pause/resume), the Download
// button, and the "Add key" modal.
//
// getCardsByGameName() and addDaysToCard() are also used by
// js/admin/rewards.js (reward time + maintenance freeze act on the same
// card elements), which is why they're exported from here rather than kept
// private.

import { showToast, openModal, closeModal, wireBackdropClose } from './utils.js';

export function getCardsByGameName(name){
  return Array.from(document.querySelectorAll('#myGamesGrid .card')).filter(c =>
    c.querySelector('.card-title').textContent.trim() === name
  );
}

export function addDaysToCard(card, days){
  const total = Math.max(0, parseInt(card.dataset.remaining, 10) + days);
  card.dataset.remaining = total;
  const badge = card.querySelector('.badge');
  const meta = card.querySelector('.card-meta');
  if(card.dataset.frozen !== '1' && badge.textContent === 'Active'){
    meta.textContent = total + ' days remaining';
  }
}

const PAUSE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg> Pause';
const RESUME_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Resume';

// Business rule: a key can be paused up to 2 times, each pause freezes the
// countdown for up to 7 days. Resuming must restore the real
// remaining-days text — never leave a stale "resumed" message sitting
// there. Once the 2-pause limit is hit, pausing again is blocked. A card
// that's frozen for maintenance (see admin/rewards.js) can't be toggled at
// all — the freeze takes priority.
function wireCardToggle(btn){
  btn.addEventListener('click', () => {
    const card = btn.closest('.card');
    if(card.dataset.frozen === '1'){
      showToast('This game is frozen for maintenance — pausing is disabled');
      return;
    }

    const badge = card.querySelector('.badge');
    const meta = card.querySelector('.card-meta');
    const remaining = card.dataset.remaining;
    const maxPauses = parseInt(card.dataset.maxPauses, 10);
    let pauses = parseInt(card.dataset.pauses, 10);
    const isPaused = btn.classList.contains('resume');

    if(isPaused){
      badge.textContent = 'Active'; badge.className = 'badge active';
      meta.textContent = remaining + ' days remaining'; meta.className = 'card-meta remaining-text';

      const limitReached = pauses >= maxPauses;
      btn.className = 'card-btn pause';
      btn.disabled = limitReached;
      btn.title = limitReached ? 'Pause limit reached (' + maxPauses + '/' + maxPauses + ' used this month)' : '';
      btn.style.opacity = limitReached ? '0.45' : '';
      btn.style.cursor = limitReached ? 'not-allowed' : '';
      btn.innerHTML = PAUSE_ICON;

      showToast('Subscription resumed — ' + remaining + ' days remaining');
    } else {
      if(pauses >= maxPauses){
        showToast('Pause limit reached (' + maxPauses + '/' + maxPauses + ' used this month)');
        return;
      }
      pauses += 1;
      card.dataset.pauses = pauses;
      badge.textContent = 'Paused'; badge.className = 'badge paused';
      meta.textContent = 'time frozen · pause ' + pauses + '/' + maxPauses + ' · up to 7 days';
      meta.className = 'card-meta paused-text';
      btn.className = 'card-btn resume';
      btn.innerHTML = RESUME_ICON;
      showToast('Subscription paused — countdown frozen for up to 7 days');
    }
  });
}

// TODO (backend): swap the setTimeout below for a real download — either
// stream the .exe or redirect to the CDN URL saved in Launcher Config.
function wireDownload(btnId, labelId){
  const btn = document.getElementById(btnId);
  if(!btn) return;
  btn.addEventListener('click', function(){
    const label = labelId ? document.getElementById(labelId) : null;
    if(this.dataset.busy) return;
    this.dataset.busy = '1';
    const original = label ? label.textContent : this.textContent;
    if(label) label.textContent = 'Downloading...'; else this.textContent = 'Downloading...';
    this.style.filter = 'brightness(0.85)';
    setTimeout(() => {
      if(label) label.textContent = original; else this.textContent = original;
      this.style.filter = '';
      delete this.dataset.busy;
      showToast('Download complete');
    }, 1600);
  });
}

// TODO (backend): POST the pasted key to the activation endpoint instead of
// just toasting a fake success/failure.
function initAddKeyModal(){
  const modalOverlay = document.getElementById('modalOverlay');
  document.getElementById('addKeyBtn').addEventListener('click', () => openModal(modalOverlay));
  document.getElementById('modalCancel').addEventListener('click', () => closeModal(modalOverlay));
  wireBackdropClose(modalOverlay);
  document.getElementById('modalConfirm').addEventListener('click', () => {
    const val = document.getElementById('keyInput').value.trim();
    closeModal(modalOverlay);
    document.getElementById('keyInput').value = '';
    showToast(val ? 'Key activated successfully' : 'Enter a valid key');
  });
}

export function initDashboard(){
  document.querySelectorAll('.card-btn.pause, .card-btn.resume').forEach(wireCardToggle);
  wireDownload('downloadBtn', 'downloadLabel');
  wireDownload('downloadBtn2', 'downloadLabel2');
  initAddKeyModal();
}
