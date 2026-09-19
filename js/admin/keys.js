// Admin → Generate Keys: duration chips (1/7/14/30/60/90 days), quantity
// stepper, and the issued-keys table.
//
// TODO (backend): randomKey() fakes a code client-side and state.keys never
// leaves the browser tab. A real version should ask the API to mint the
// key(s) and return the real codes.

import { state } from '../state.js';
import { showToast, wireStepper } from '../utils.js';

function randomKey(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segs = [];
  for(let s = 0; s < 3; s++){
    let seg = '';
    for(let c = 0; c < 4; c++) seg += chars[Math.floor(Math.random() * chars.length)];
    segs.push(seg);
  }
  return 'HORZ-' + segs.join('-');
}

function renderKeysTable(){
  const body = document.getElementById('keysTableBody');
  if(state.keys.length === 0){
    body.innerHTML = '<tr><td colspan="6" class="empty-row">No keys generated yet</td></tr>';
    return;
  }
  body.innerHTML = '';
  state.keys.slice().reverse().forEach(k => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="key-code">${k.code}</td>
      <td>${k.game}</td>
      <td>${k.days} day${k.days > 1 ? 's' : ''}</td>
      <td><span class="badge unused">${k.status}</span></td>
      <td>${k.created}</td>
      <td style="text-align:right;">
        <button class="icon-btn copy-key" data-code="${k.code}" title="Copy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
        </button>
      </td>`;
    body.appendChild(tr);
  });
  body.querySelectorAll('.copy-key').forEach(b => b.addEventListener('click', () => {
    const code = b.dataset.code;
    if(navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
    showToast('Copied ' + code);
  }));
}

export function initKeysAdmin(){
  document.querySelectorAll('.duration-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.duration-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      state.selectedDuration = parseInt(chip.dataset.days, 10);
    });
  });

  const qtyInput = wireStepper({ inputId: 'qtyInput', minusId: 'qtyMinus', plusId: 'qtyPlus', min: 1, max: 50 });

  document.getElementById('generateKeysBtn').addEventListener('click', () => {
    const game = document.getElementById('keyGameSelect').value;
    if(!game){ showToast('Add a game to the catalog first'); return; }
    const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
    const now = new Date();
    const created = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
    for(let i = 0; i < qty; i++){
      state.keys.push({ code: randomKey(), game, days: state.selectedDuration, status: 'Unused', created });
    }
    renderKeysTable();
    showToast(qty + ' key' + (qty > 1 ? 's' : '') + ' generated for ' + game);
  });
}
