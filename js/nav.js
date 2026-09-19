// Sidebar nav (Dashboard / Downloads / How to Use / Admin) and the
// Generate Keys / Manage Games / HWID & Rewards / Launcher Config / Support
// Inbox tabs inside the Admin Panel.

export function switchView(viewName){
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const navItem = document.querySelector('.nav-item[data-view="' + viewName + '"]');
  if(navItem) navItem.classList.add('active');

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + viewName);
  if(target) target.classList.add('active');
}

export function initNav(){
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => switchView(item.dataset.view));
  });

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
      document.getElementById('admin-' + tab.dataset.admin).classList.add('active');
    });
  });
}
