/**
 * Net Worth — Plaid bridge (Cloudflare Worker).
 *
 * Keeps the Plaid client ID and secret off the phone. The app calls this Worker with a
 * private access code; the Worker calls Plaid. It stores nothing: each Plaid access token
 * is encrypted with a key only this Worker can derive and handed back to the app, which
 * sends it again when it wants fresh balances.
 *
 * Secrets (set with `wrangler secret put` or the GitHub workflow):
 *   PLAID_CLIENT_ID, PLAID_SECRET, APP_TOKEN (the access code typed into the app)
 * Vars (wrangler.toml): PLAID_ENV = sandbox | production, ALLOWED_ORIGIN = comma-separated origins
 */

const PLAID_HOSTS = {
  sandbox: 'https://sandbox.plaid.com',
  production: 'https://production.plaid.com',
};

// What each "kind" of connection asks Plaid for. Balances come with every product.
const PRODUCTS = {
  bank: ['transactions'],        // checking, savings, credit cards
  investments: ['investments'],  // brokerage, 401(k), IRA, crypto
  loans: ['liabilities'],        // mortgage, student, auto
};

const MAX_ITEMS = 25;

class PlaidError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
    const originOk = !origin || allowed.length === 0 || allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': origin && originOk ? origin : allowed[0] || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const { pathname } = new URL(request.url);
    if (request.method === 'GET' && pathname === '/') {
      return json({ ok: true, service: 'networth-plaid' });
    }
    if (request.method !== 'POST') return json({ error: 'Not found' }, 404);
    if (!originOk) return json({ error: 'This app is not allowed to use the server' }, 403);
    if (!env.APP_TOKEN || !(await safeEqual(bearer(request), env.APP_TOKEN))) {
      return json({ error: 'Wrong access code' }, 401);
    }
    if (!env.PLAID_CLIENT_ID || !env.PLAID_SECRET) {
      return json({ error: 'The server is missing its Plaid keys' }, 500);
    }

    let body = {};
    try { body = await request.json(); } catch { /* empty body is fine */ }

    try {
      switch (pathname) {
        case '/ping':
          return json({ ok: true, env: plaidEnv(env) });

        case '/link-token': {
          const payload = {
            client_name: 'Net Worth',
            language: 'en',
            country_codes: ['US'],
            user: { client_user_id: 'networth-owner' },
          };
          if (body.item) {
            // Update mode: re-authenticate an existing connection.
            payload.access_token = (await openItem(env, body.item)).t;
          } else {
            payload.products = PRODUCTS[body.kind] || PRODUCTS.bank;
          }
          const r = await plaid(env, '/link/token/create', payload);
          return json({ link_token: r.link_token });
        }

        case '/exchange': {
          if (typeof body.public_token !== 'string') return json({ error: 'Missing public_token' }, 400);
          const ex = await plaid(env, '/item/public_token/exchange', { public_token: body.public_token });
          const acc = await plaid(env, '/accounts/get', { access_token: ex.access_token });
          return json({
            item: { id: ex.item_id, enc: await sealItem(env, { t: ex.access_token, i: ex.item_id }) },
            accounts: acc.accounts.map(slim),
          });
        }

        case '/accounts': {
          const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
          const results = await Promise.all(items.map(async (enc) => {
            try {
              const { t, i } = await openItem(env, enc);
              const acc = await plaid(env, '/accounts/get', { access_token: t });
              return { ok: true, item_id: i, accounts: acc.accounts.map(slim) };
            } catch (e) {
              return { ok: false, error: { code: e.code || 'ERROR', message: e.message } };
            }
          }));
          return json({ results });
        }

        case '/remove': {
          const { t } = await openItem(env, body.item);
          try {
            await plaid(env, '/item/remove', { access_token: t });
          } catch (e) {
            if (e.code !== 'ITEM_NOT_FOUND' && e.code !== 'INVALID_ACCESS_TOKEN') throw e;
          }
          return json({ ok: true });
        }

        default:
          return json({ error: 'Not found' }, 404);
      }
    } catch (e) {
      if (e instanceof PlaidError) return json({ error: e.message, code: e.code }, e.status || 502);
      return json({ error: 'Server error' }, 500);
    }
  },
};

// ------------------------------------------------------------------ Plaid
function plaidEnv(env) {
  return env.PLAID_ENV === 'production' ? 'production' : 'sandbox';
}

async function plaid(env, path, payload) {
  const res = await fetch(PLAID_HOSTS[plaidEnv(env)] + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: env.PLAID_CLIENT_ID, secret: env.PLAID_SECRET, ...payload }),
  });
  let data = {};
  try { data = await res.json(); } catch { /* non-JSON error */ }
  if (!res.ok) {
    throw new PlaidError(
      data.error_code || 'PLAID_ERROR',
      data.display_message || data.error_message || `Plaid request failed (${res.status})`,
      502,
    );
  }
  return data;
}

function slim(a) {
  return {
    id: a.account_id,
    name: a.name,
    official_name: a.official_name || null,
    mask: a.mask || null,
    type: a.type,
    subtype: a.subtype || null,
    current: a.balances?.current ?? null,
    available: a.balances?.available ?? null,
    currency: a.balances?.iso_currency_code || null,
  };
}

// ------------------------------------------------------------------ auth + sealing
function bearer(request) {
  const h = request.headers.get('Authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

/** Constant-time comparison (hash both sides so lengths always match). */
async function safeEqual(a, b) {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function sealKey(env) {
  const raw = await sha256(`networth-item-seal-v1|${env.PLAID_SECRET}`);
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

const b64u = {
  enc: (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0)),
};

async function sealItem(env, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, await sealKey(env), new TextEncoder().encode(JSON.stringify(obj)),
  ));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv); out.set(ct, iv.length);
  return b64u.enc(out);
}

async function openItem(env, enc) {
  try {
    const bytes = b64u.dec(String(enc));
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytes.slice(0, 12) }, await sealKey(env), bytes.slice(12),
    );
    return JSON.parse(new TextDecoder().decode(pt));
  } catch {
    throw new PlaidError('BAD_ITEM', 'This connection is no longer valid. Remove it and connect again.', 400);
  }
}
