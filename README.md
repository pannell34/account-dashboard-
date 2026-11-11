# Net Worth — account dashboard for iPhone

A dark, colorful app for keeping track of all your accounts (Robinhood, banks, 401k, crypto, credit cards, loans) in one place. It runs as a **Progressive Web App**: you add it to your iPhone home screen, it gets its own **$** icon, and it opens full screen like a native app, even offline.

## Features
- **Net worth hero chart.** A glowing gradient area chart. Drag a finger across it to see the value on any date. Ranges: 1W · 1M · 3M · YTD · 1Y · ALL.
- **Assets / Debts / Top mover** tiles.
- **Allocation donut** by account type.
- **Monthly change** bar chart covering the last 12 months.
- **Account cards** with sparklines and change over the selected range. Tap one for its own chart, its balance history and editing.
- **Update balances** fills in every account on one screen. It's quick to do weekly while you look at Robinhood.
- **Privacy toggle** (eye icon) hides every dollar amount.
- **Backup / restore** as JSON and **CSV import** (`date,account,balance[,type]`).
- No servers and no logins. Data stays in the phone's local storage.

## Put it on your iPhone
1. Host the folder. The easiest option is GitHub Pages: merge this branch into `main`, then in the repo go to **Settings → Pages → Build and deployment → Source: GitHub Actions**. The included workflow (`.github/workflows/pages.yml`) publishes the app to `https://<your-username>.github.io/<repo>/`.
   (On a free GitHub plan, Pages requires the repository to be public. The code is public but **your balances are not**, because they never leave your phone. Any static host such as Netlify or Cloudflare Pages also works.)
2. On your iPhone, open that URL in **Safari**.
3. Tap **Share → Add to Home Screen → Add**.

## About Robinhood
Robinhood has no official public API for personal account data, and unofficial ones require handing your password and 2FA to third-party code. This app therefore does **not** log in to Robinhood. Instead, open Robinhood, then tap **Update balances** here and type in the totals. Each update becomes a point on your charts.

## Backups
iOS keeps home-screen app data separate from Safari. Use **Settings (gear) → Back up data** now and then. The file can be saved to Files or iCloud Drive.

## Local development
```sh
python3 -m http.server 8000   # then open http://localhost:8000
```
Files: `index.html`, `styles.css`, `app.js` (all logic and hand-built SVG charts, no dependencies), `sw.js` (offline cache), `manifest.webmanifest`, `icons/`.
