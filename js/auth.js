// Login screen + simulated SSO handshake with the main Nova Community site.
//
// TODO (backend): replace the setInterval "steps" animation below with a
// real redirect to the Nova Community OAuth/SSO endpoint, and read the
// returned role from the token/session instead of the role picker.

import { state } from './state.js';
import { showToast } from './utils.js';
import { switchView } from './nav.js';

function applyRole(){
  const isAdmin = state.role === 'admin';
  document.getElementById('adminNavGroup').style.display = isAdmin ? 'block' : 'none';
  const tag = document.getElementById('accountRoleTag');
  tag.textContent = isAdmin ? 'ADMIN' : 'USER';
  tag.className = 'role-tag ' + (isAdmin ? 'admin' : 'user');
}

function runLoginFlow(){
  const overlay = document.getElementById('loginOverlay');
  const stepText = document.getElementById('loginStepText');
  const stepSub = document.getElementById('loginStepSub');
  overlay.classList.add('show');

  const steps = [
    ['Redirecting to novacommunity.gg...', 'Please wait'],
    ['Authenticating account...', 'Checking Nova Community session'],
    ['Authorization granted', 'Returning to HORIZON...'],
  ];
  let i = 0;
  stepText.textContent = steps[0][0]; stepSub.textContent = steps[0][1];

  const interval = setInterval(() => {
    i++;
    if(i < steps.length){
      stepText.textContent = steps[i][0];
      stepSub.textContent = steps[i][1];
      return;
    }
    clearInterval(interval);
    setTimeout(() => {
      overlay.classList.remove('show');
      document.getElementById('loginScreen').classList.add('hide');
      document.getElementById('appShell').classList.add('show');
      applyRole();
      showToast('Signed in as foxy@novacommunity.gg');
    }, 500);
  }, 1000);
}

export function initAuth(){
  // Role picker on the login screen (demo-only stand-in for a real SSO response)
  document.querySelectorAll('.role-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.role-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.role = opt.dataset.role;
    });
  });

  document.getElementById('loginBtn').addEventListener('click', runLoginFlow);

  document.getElementById('signOutBtn').addEventListener('click', () => {
    document.getElementById('appShell').classList.remove('show');
    document.getElementById('loginScreen').classList.remove('hide');
    switchView('dashboard');
    showToast('Signed out');
  });
}
