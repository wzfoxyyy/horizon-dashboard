// Small, dependency-free helpers shared by every module.

export function showToast(msg){
  const toast = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

export function timeNow(){
  const d = new Date();
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if(h === 0) h = 12;
  return h + ':' + String(m).padStart(2, '0') + ' ' + ampm;
}

export function openModal(overlay){ overlay.classList.add('show'); }
export function closeModal(overlay){ overlay.classList.remove('show'); }

// Wires the common "click outside closes it" behaviour for a modal overlay.
export function wireBackdropClose(overlay){
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) closeModal(overlay);
  });
}

// Generic numeric stepper (the − / input / + controls used for quantity
// and reward-days pickers). Clamps the value between min and max.
export function wireStepper({ inputId, minusId, plusId, min = 1, max = 99 }){
  const input = document.getElementById(inputId);
  document.getElementById(minusId).addEventListener('click', () => {
    input.value = Math.max(min, parseInt(input.value || String(min), 10) - 1);
  });
  document.getElementById(plusId).addEventListener('click', () => {
    input.value = Math.min(max, parseInt(input.value || String(min), 10) + 1);
  });
  return input;
}
