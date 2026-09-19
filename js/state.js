// Single source of truth for in-memory app state.
// Everything here is a front-end simulation — swap these mutations for real
// API calls once a backend exists (see comments in each module for exactly
// where that wiring goes).
export const state = {
  role: 'user',              // 'user' | 'admin' — set by the login screen role picker
  games: ['Genshin Impact', 'Honkai: Star Rail', 'Wuthering Waves', 'Zenless Zone Zero'],
  keys: [],                  // issued license keys: { code, game, days, status, created }
  selectedDuration: 30,      // days — currently selected duration chip for key generation
  forceUpdate: false,
  maintenance: false,
  hwidResets: 0,             // resets used this month (1st is free, then -3 days each)
};
