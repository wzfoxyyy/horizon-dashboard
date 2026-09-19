// Admin → Manage Games: the games catalog that feeds both the key
// generator's game dropdown and the Maintenance Freeze list.

import { state } from '../state.js';
import { showToast, openModal, closeModal, wireBackdropClose } from '../utils.js';
import { renderFreezeList } from './rewards.js';

function renderGamesTable(){
  const body = document.getElementById('gamesTableBody');
  body.innerHTML = '';
  state.games.forEach((game, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${game.name}</td>
      <td><span class="badge ${game.active ? 'active' : 'disabled'}">${game.active ? 'Active' : 'Disabled'}</span></td>
      <td style="text-align:right;">
        <button class="icon-btn toggle-game" data-idx="${idx}" title="Toggle status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
        </button>
        <button class="icon-btn remove-game" data-idx="${idx}" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </td>`;
    body.appendChild(tr);
  });

  body.querySelectorAll('.toggle-game').forEach(b => b.addEventListener('click', () => {
    const g = state.games[b.dataset.idx];
    g.active = !g.active;
    renderGamesTable(); renderGameSelect(); renderFreezeList();
    showToast(g.name + (g.active ? ' enabled' : ' disabled'));
  }));
  body.querySelectorAll('.remove-game').forEach(b => b.addEventListener('click', () => {
    const g = state.games[b.dataset.idx];
    state.games.splice(b.dataset.idx, 1);
    renderGamesTable(); renderGameSelect(); renderFreezeList();
    showToast(g.name + ' removed from catalog');
  }));
}

function renderGameSelect(){
  const sel = document.getElementById('keyGameSelect');
  sel.innerHTML = '';
  state.games.filter(g => g.active).forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.name; opt.textContent = g.name;
    sel.appendChild(opt);
  });
}

function initAddGameModal(){
  const addGameOverlay = document.getElementById('addGameOverlay');
  document.getElementById('addGameBtn').addEventListener('click', () => openModal(addGameOverlay));
  document.getElementById('addGameCancel').addEventListener('click', () => closeModal(addGameOverlay));
  wireBackdropClose(addGameOverlay);
  document.getElementById('addGameConfirm').addEventListener('click', () => {
    const input = document.getElementById('newGameInput');
    const name = input.value.trim();
    if(!name){ showToast('Enter a game name'); return; }
    state.games.push({ name, active: true });
    input.value = '';
    closeModal(addGameOverlay);
    renderGamesTable(); renderGameSelect(); renderFreezeList();
    showToast(name + ' added to catalog');
  });
}

// TODO (backend): state.games starts out as plain name strings (matching
// the games already shown on the member Dashboard); a real catalog would
// be fetched from the API instead of seeded client-side.
export function initGamesAdmin(){
  state.games = state.games.map(name => ({ name, active: true }));
  renderGamesTable();
  renderGameSelect();
  initAddGameModal();
}
