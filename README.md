# HORIZON Dashboard

Front-end prototype for the HORIZON launcher dashboard (member area + admin panel).
Static site — no build step, no dependencies to install. Everything runs in the browser
as native ES modules.

## Structure

```
horizon-dashboard/
├── index.html
├── css/
│   ├── base.css          # design tokens (:root), reset, body
│   ├── sidebar.css        # sidebar nav + account footer
│   ├── layout.css         # main content area, action row, game cards
│   ├── components.css     # buttons, badges, forms, tables, toggles, admin tabs
│   ├── modals.css         # generic modal + toast styling
│   ├── chat.css           # support chat widget
│   ├── login.css          # login screen + SSO simulation overlay
│   └── responsive.css     # small-screen overrides
├── js/
│   ├── main.js             # entry point — imports and initializes every module
│   ├── state.js            # single shared app state object
│   ├── utils.js            # showToast, timeNow, modal + stepper helpers
│   ├── nav.js               # sidebar + admin tab switching
│   ├── auth.js               # login screen, simulated SSO, role switch, sign out
│   ├── dashboard.js          # game cards: pause/resume, download, Add key modal
│   ├── chat.js                # support widget, synced with the admin inbox
│   └── admin/
│       ├── games.js           # games catalog (add/enable/disable/remove)
│       ├── keys.js             # key generation (duration, quantity, table)
│       ├── rewards.js          # HWID reset, reward time, maintenance freeze
│       └── launcher.js         # launcher .exe version/URL + toggles
└── README.md
```

Each module does one thing and exports only what other modules actually need
(e.g. `dashboard.js` exports `getCardsByGameName`/`addDaysToCard` because
`admin/rewards.js` operates on the same card elements). `js/main.js` is the
only file that wires everything together, in the order that matters
(games are seeded before the key generator and freeze list read them).

## Running it locally

Because `index.html` loads `js/main.js` as an ES module (`type="module"`),
opening the file directly (`file://...`) will **not** work — browsers block
module imports over `file://`. Run a local server instead:

```bash
# Python
python3 -m http.server 8080

# Node (if you have it)
npx serve .
```

Then visit `http://localhost:8080`.

## Hosting on GitHub Pages

1. Create a new repository on GitHub (e.g. `horizon-dashboard`).
2. Push this folder as the repo root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → Deploy from a branch → `main` / `root`** → Save.
4. Your site goes live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.
   (GitHub Pages serves over HTTPS, so ES modules work fine there — no extra config needed.)

If you want it on your own domain (e.g. `dash.novacommunity.gg`), add a `CNAME` file at the repo
root containing just that domain, then point a `CNAME` DNS record at `<your-username>.github.io`.

## What's real vs. simulated

This is a **front-end only** prototype — there is no backend, database, or real authentication yet.
Everything below currently runs on the in-memory `state` object in `js/state.js` and resets on
page reload:

- Login / role switch (User vs Admin) — simulated SSO handshake, no real session (`js/auth.js`)
- Pause / resume, freeze / unfreeze, HWID reset, reward time — all mutate the DOM + `state` directly
  (`js/dashboard.js`, `js/admin/rewards.js`)
- Key generation — creates random codes client-side, not persisted anywhere (`js/admin/keys.js`)
- Support chat — messages only exist in the current browser tab (`js/chat.js`)

Every file above that needs a backend has a `// TODO (backend): ...` comment at the top marking
exactly what to swap in — e.g. the SSO redirect, the key-mint endpoint, the download URL.

## Customizing

- Colors, fonts, spacing: `css/base.css`, CSS variables at the top (`:root`)
- Business rules (pause limits, HWID cost, key durations): search each admin module in `js/admin/`
- Games catalog seed data: `js/state.js`
