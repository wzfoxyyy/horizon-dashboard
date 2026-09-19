// Admin → Launcher Config: version/URL fields + force-update and
// maintenance toggles that the desktop .exe would read on startup.
//
// TODO (backend): "Save configuration" should PUT this to the API that the
// launcher polls, instead of just updating the Downloads page label.

import { state } from '../state.js';
import { showToast } from '../utils.js';

function wireToggle(id, onChange){
  const el = document.getElementById(id);
  el.addEventListener('click', () => {
    el.classList.toggle('on');
    onChange(el.classList.contains('on'));
  });
}

export function initLauncherAdmin(){
  wireToggle('toggleForceUpdate', (on) => { state.forceUpdate = on; });
  wireToggle('toggleMaintenance', (on) => { state.maintenance = on; });

  document.getElementById('saveConfigBtn').addEventListener('click', () => {
    const version = document.getElementById('cfgVersion').value.trim();
    document.getElementById('launcherMeta').textContent = 'Windows · v' + version + ' · 84 MB';
    showToast('Launcher configuration saved (v' + version + ')');
  });
}
