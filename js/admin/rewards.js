// Admin → HWID & Rewards: three independent tools that all act on the same
// card elements in #myGamesGrid:
//   1. HWID reset      — 1st reset/month free, then -3 days off the key
//   2. Reward time      — add days to one key or to every active key
//   3. Maintenance freeze — pause a whole game's keys without touching the
//                           member's pause count (see dashboard.js's 2-pause rule)
//
// renderFreezeList() is exported because js/admin/games.js needs to
// re-render it whenever a game is added, toggled, or removed from the
// catalog — the freeze list always mirrors the active games catalog.
//
// TODO (backend): this whole file assumes a single demo account (Foxy /
// Genshin Impact). A real version needs the account/game picker to come
// from an actual member + key lookup instead of a hardcoded option.

import { state } from '../state.js';
import { showToast, wireStepper } from '../utils.js';
import { getCardsByGameName, addDaysToCard } from '../dashboard.js';

function updateHwidResetLabel(){
  const label = document.getElementById('hwidResetLabel');
  const sub = document.getElementById('hwidResetSub');
  label.textContent = state.hwidResets + ' reset' + (state.hwidResets === 1 ? '' : 's') + ' used this month';
  sub.textContent = state.hwidResets === 0 ? 'Next reset is free' : 'Next reset costs 3 days off the active key';
}

function initHwidReset(){
  updateHwidResetLabel();
  document.getElementById('hwidResetBtn').addEventListener('click', () => {
    const free = state.hwidResets === 0;
    state.hwidResets += 1;
    document.getElementById('hwidCurrent').value = 'NEW-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    if(free){
      showToast('HWID reset — first reset this month, free of charge');
    } else {
      getCardsByGameName('Genshin Impact').forEach(card => addDaysToCard(card, -3));
      showToast('HWID reset — 3 days deducted from the active key');
    }
    updateHwidResetLabel();
  });
}

function initRewardTime(){
  const rewardDaysInput = wireStepper({ inputId: 'rewardDaysInput', minusId: 'rewardMinus', plusId: 'rewardPlus', min: 1, max: 90 });

  document.getElementById('rewardIndividualBtn').addEventListener('click', () => {
    const days = Math.max(1, parseInt(rewardDaysInput.value || '1', 10));
    const target = document.getElementById('rewardTargetSelect').value;
    if(target === 'genshin'){
      getCardsByGameName('Genshin Impact').forEach(c => addDaysToCard(c, days));
      showToast('+' + days + ' days added to Genshin Impact — Foxy');
    }
  });

  document.getElementById('rewardAllBtn').addEventListener('click', () => {
    const days = Math.max(1, parseInt(rewardDaysInput.value || '1', 10));
    const cards = document.querySelectorAll('#myGamesGrid .card');
    cards.forEach(c => addDaysToCard(c, days));
    showToast('+' + days + ' days added to all active keys (' + cards.length + ')');
  });
}

export function renderFreezeList(){
  const wrap = document.getElementById('freezeGamesList');
  wrap.innerHTML = '';
  state.games.filter(g => g.active).forEach(g => {
    const cards = getCardsByGameName(g.name);
    const isFrozen = cards.length > 0 && cards[0].dataset.frozen === '1';
    const row = document.createElement('div');
    row.className = 'config-row';
    row.innerHTML = `
      <div>
        <div class="config-label">${g.name}</div>
        <div class="config-sub">${cards.length} active key${cards.length === 1 ? '' : 's'} for this game</div>
      </div>
      <div class="toggle ${isFrozen ? 'on' : ''}" data-game="${g.name}"><div class="knob"></div></div>`;
    wrap.appendChild(row);
  });

  wrap.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const gameName = toggle.dataset.game;
      const freezing = !toggle.classList.contains('on');
      toggle.classList.toggle('on');

      getCardsByGameName(gameName).forEach(card => {
        const badge = card.querySelector('.badge');
        const meta = card.querySelector('.card-meta');
        const btn = card.querySelector('.card-btn');
        if(freezing){
          card.dataset.frozen = '1';
          card.dataset.prevBadge = badge.className;
          card.dataset.prevBadgeText = badge.textContent;
          card.dataset.prevMeta = meta.textContent;
          card.dataset.prevMetaClass = meta.className;
          badge.textContent = 'Frozen'; badge.className = 'badge frozen';
          meta.textContent = 'frozen for maintenance · time not consumed';
          meta.className = 'card-meta frozen-text';
          btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed';
        } else {
          card.dataset.frozen = '0';
          badge.className = card.dataset.prevBadge || 'badge active';
          badge.textContent = card.dataset.prevBadgeText || 'Active';
          meta.className = card.dataset.prevMetaClass || 'card-meta remaining-text';
          meta.textContent = card.dataset.remaining + ' days remaining';
          btn.style.opacity = ''; btn.style.cursor = '';
        }
      });

      showToast((freezing ? 'Frozen ' : 'Unfroze ') + gameName + (freezing ? ' — active keys paused for maintenance' : ' — keys are counting down again'));
    });
  });
}

export function initRewardsAdmin(){
  initHwidReset();
  initRewardTime();
  renderFreezeList();
}
