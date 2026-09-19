// Entry point. Order matters here: games must be seeded before the key
// generator's dropdown and the freeze list can render, so admin/games.js
// runs before admin/keys.js and admin/rewards.js.

import { initNav } from './nav.js';
import { initAuth } from './auth.js';
import { initDashboard } from './dashboard.js';
import { initChat } from './chat.js';
import { initGamesAdmin } from './admin/games.js';
import { initKeysAdmin } from './admin/keys.js';
import { initRewardsAdmin } from './admin/rewards.js';
import { initLauncherAdmin } from './admin/launcher.js';

initNav();
initAuth();
initDashboard();
initChat();
initGamesAdmin();
initKeysAdmin();
initRewardsAdmin();
initLauncherAdmin();
