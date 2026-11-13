# Net Worth — account dashboard for iPhone

A dark, colorful app for keeping track of all your accounts (Robinhood, banks, 401k, crypto, credit cards, loans) in one place. It runs as a **Progressive Web App**: you add it to your iPhone home screen, it gets its own **$** icon, and it opens full screen like a native app, even offline.

## Features
- **Net worth hero chart.** A glowing gradient area chart. Drag a finger across it to see the value on any date. Ranges: 1W · 1M · 3M · YTD · 1Y · ALL.
- **Assets / Liabilities / Top mover** tiles.
- **Assets and Liabilities donuts** showing each broken down by type (brokerage, retirement… / credit card, mortgage, auto, student loan…).
- **Monthly change** bar chart covering the last 12 months.
- **Collapsible Assets and Liabilities drop-downs** with totals. Tap **Reorder** and drag the ⋮⋮ handle to put accounts in any order you like.
- **Account cards** with sparklines and change over the selected range. Tap one for its own chart, its balance history and editing.
- **Automatic balances with Plaid** (optional): connect banks, cards, loans and brokerages so balances refresh on their own. Manual accounts still work side by side.
- **Update balances** fills in every account on one screen. It's quick to do weekly while you look at Robinhood.
- **Face ID lock** (optional): offered the first time you open the app, and switchable in Settings → Require Face ID. It locks on launch and again after the app has been in the background for a minute. It works by saving a passkey on the iPhone, and iOS uses Face ID (or your passcode) to unlock it.
- **Privacy toggle** (eye icon) hides every dollar amount.
- **Backup / restore** as JSON and **CSV import** (`date,account,balance[,type]`).
- No servers and no logins. Data stays in the phone's local storage.

## Put it on your iPhone
1. Host the folder. The easiest option is GitHub Pages: merge this branch into `main`, then in the repo go to **Settings → Pages → Build and deployment → Source: GitHub Actions**. The included workflow (`.github/workflows/pages.yml`) publishes the app to `https://<your-username>.github.io/<repo>/`.
   (On a free GitHub plan, Pages requires the repository to be public. The code is public but **your balances are not**, because they never leave your phone. Any static host such as Netlify or Cloudflare Pages also works.)
2. On your iPhone, open that URL in **Safari**.
3. Tap **Share → Add to Home Screen → Add**.

## Automatic balances with Plaid

Plaid's secret keys can't live inside the app, because the app's code is public. So the repo includes a tiny server in `worker/`, a free **Cloudflare Worker**. GitHub deploys it for you, so you can do all of this from your phone. The server stores nothing. Each bank connection's Plaid key is encrypted, and only your server can decrypt it.

### 1. Get Plaid keys
1. Sign up at **dashboard.plaid.com**.
2. Open **Developers → Keys** and copy your **client_id** and **Sandbox secret**.
3. Sandbox uses Plaid's test banks (sign in with `user_good` / `pass_good`). To connect your real accounts, request **Production** access in the Plaid dashboard, then use the **Production secret** instead. Plaid may charge for each connected account in Production, so check Plaid's pricing first.

### 2. Get Cloudflare keys (free)
1. Sign up at **dash.cloudflare.com** and open **Workers & Pages** once, so Cloudflare sets up your `workers.dev` address.
2. Copy your **Account ID**. It's shown on the Workers & Pages overview page.
3. Go to **My Profile → API Tokens → Create Token**, use the **Edit Cloudflare Workers** template, and copy the token.

### 3. Choose an access code
Make up a long password, for example four random words. The app sends it to prove the request is coming from you.

### 4. Add the secrets to GitHub
In this repo, go to **Settings → Secrets and variables → Actions → New repository secret** and add these five secrets:

| Name | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | the Cloudflare token |
| `CLOUDFLARE_ACCOUNT_ID` | the Cloudflare account ID |
| `PLAID_CLIENT_ID` | Plaid client_id |
| `PLAID_SECRET` | Plaid Sandbox (or Production) secret |
| `APP_TOKEN` | your access code |

For real accounts, also add a **variable** (on the **Variables** tab) named `PLAID_ENV` with the value `production`.

### 5. Deploy
Go to **Actions → Deploy Plaid server → Run workflow**. When it finishes, your server is at
`https://networth-plaid.<your-subdomain>.workers.dev`. The full address appears in the workflow's log and in Cloudflare.

### 6. Connect the app
In the app, go to **Settings → Bank connections**, enter the server address and your access code, then tap **Save & test**. After that, the **+** button offers **Connect automatically** as well as **Add manually**.

Connected accounts show a small link icon. They refresh when you open the app (at most every 30 minutes) or when you tap **Refresh**. If a bank asks you to sign in again, the app tells you, and **Settings → Bank connections → Reconnect** fixes it. Disconnecting a bank keeps its accounts and history as manual accounts.

If you change `PLAID_SECRET` later, existing connections stop working, so remove them and connect again.

## About Robinhood
Robinhood has no official public API for personal account data, and unofficial ones require handing your password and 2FA to third-party code. You can connect Robinhood through Plaid's investments connection (see above) if Plaid supports your account. Otherwise, open Robinhood, then tap **Update balances** here and type in the totals. Each update becomes a point on your charts.

## Backups
iOS keeps home-screen app data separate from Safari. Use **Settings (gear) → Back up data** now and then. The file can be saved to Files or iCloud Drive.

## Local development
```sh
python3 -m http.server 8000   # then open http://localhost:8000
```
Files: `index.html`, `styles.css`, `app.js` (all logic and hand-built SVG charts, no dependencies), `sw.js` (offline cache), `manifest.webmanifest`, `icons/`.
