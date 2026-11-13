/* Net Worth — a personal account monitor. All data is stored locally on the device. */
(() => {
  'use strict';

  // ---------------------------------------------------------------- constants
  const STORE_KEY = 'networth.v1';
  const TYPES = {
    brokerage:  { label: 'Brokerage',   color: '#7C5CFF' },
    retirement: { label: 'Retirement',  color: '#00D4FF' },
    crypto:     { label: 'Crypto',      color: '#FFB020' },
    checking:   { label: 'Checking',    color: '#00E096' },
    savings:    { label: 'Savings',     color: '#4D7CFF' },
    property:   { label: 'Property',    color: '#2EE6D6' },
    other:      { label: 'Other asset', color: '#C64DFF' },
    credit:     { label: 'Credit card',  color: '#FF4D9D', liability: true },
    mortgage:   { label: 'Mortgage',     color: '#FF8A3D', liability: true },
    auto:       { label: 'Auto loan',    color: '#FFC23D', liability: true },
    student:    { label: 'Student loan', color: '#B44DFF', liability: true },
    loan:       { label: 'Other loan',   color: '#FF3B5C', liability: true },
  };
  const SWATCHES = ['#7C5CFF', '#00D4FF', '#00E096', '#FFB020', '#FF4D9D', '#FF6B3D', '#4D7CFF', '#C64DFF', '#2EE6D6', '#FF3B5C'];
  const RANGES = ['1W', '1M', '3M', 'YTD', '1Y', 'ALL'];
  const DAY = 86400000;

  const ICONS = {
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 4.1-5.1M9.9 5.2A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M2 2l20 20"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/></svg>',
    face: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2M17 21h2a2 2 0 0 0 2-2v-2M9 9v1.5M15 9v1.5M12 9v4.5h-1M9.2 16.2a4 4 0 0 0 5.6 0"/></svg>',
    bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M7 15l4-4 3 3 6-7"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>',
    sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M3 21v-5h5"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  };

  // ---------------------------------------------------------------- helpers
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const pad2 = (n) => String(n).padStart(2, '0');
  const isoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const today = () => isoDate(new Date());
  const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const ms = (s) => parseDate(s).getTime();
  const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return isoDate(d); };

  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const compact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
  const fmtDate = (s, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => parseDate(s).toLocaleDateString('en-US', opts);

  const money = (v) => (state.settings.hide ? '$••••••' : currency.format(v));
  const moneyShort = (v) => (state.settings.hide ? '$•••' : compact.format(v));
  const signed = (v) => (state.settings.hide ? '••••' : (v >= 0 ? '+' : '−') + currency.format(Math.abs(v)));
  const pct = (v) => (isFinite(v) ? (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(2) + '%' : '—');
  const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const parseMoney = (s) => { const n = parseFloat(String(s).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : NaN; };

  // ---------------------------------------------------------------- state
  let state = load();
  let range = state.settings.range || '3M';
  let reordering = false;

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        s.accounts ||= []; s.settings ||= {}; s.plaid ||= { items: [], lastSync: 0 };
        return s;
      }
    } catch (e) { /* ignore */ }
    return freshState();
  }
  function freshState() { return { accounts: [], settings: { hide: false }, plaid: { items: [], lastSync: 0 } }; }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (e) { toast('Could not save — storage is full or blocked'); }
  }

  const isLiab = (a) => !!TYPES[a.type]?.liability;
  const signedBal = (a, v) => (isLiab(a) ? -Math.abs(v) : v);
  const latest = (a) => a.history[a.history.length - 1];

  function balanceAt(a, date) {
    let v = null;
    for (const h of a.history) { if (h.date <= date) v = h.balance; else break; }
    return v;
  }
  function netAt(date) {
    let sum = 0;
    for (const a of state.accounts) { const v = balanceAt(a, date); if (v != null) sum += signedBal(a, v); }
    return sum;
  }
  function setBalance(a, date, balance) {
    const i = a.history.findIndex((h) => h.date === date);
    if (i >= 0) a.history[i].balance = balance; else a.history.push({ date, balance });
    a.history.sort((x, y) => (x.date < y.date ? -1 : 1));
  }
  function firstDate() {
    let d = null;
    for (const a of state.accounts) if (a.history.length && (!d || a.history[0].date < d)) d = a.history[0].date;
    return d;
  }
  function rangeStart(r) {
    const t = today();
    switch (r) {
      case '1W': return addDays(t, -7);
      case '1M': return addDays(t, -30);
      case '3M': return addDays(t, -91);
      case 'YTD': return `${t.slice(0, 4)}-01-01`;
      case '1Y': return addDays(t, -365);
      default: return firstDate() || t;
    }
  }

  /** Net-worth series inside a range, starting with the carried-forward value at range start. */
  function netSeries(r) {
    const start = rangeStart(r), end = today();
    const dates = new Set([end]);
    for (const a of state.accounts) for (const h of a.history) if (h.date >= start && h.date <= end) dates.add(h.date);
    const fd = firstDate();
    if (fd && fd < start) dates.add(start);
    return [...dates].sort().map((d) => ({ d, t: ms(d), v: netAt(d) }));
  }
  function accountSeries(a, r) {
    const start = rangeStart(r), end = today();
    const pts = [];
    const atStart = balanceAt(a, start);
    if (atStart != null && !a.history.some((h) => h.date === start)) pts.push({ d: start, v: atStart });
    for (const h of a.history) if (h.date >= start && h.date <= end) pts.push({ d: h.date, v: h.balance });
    if (pts.length) pts.push({ d: end, v: pts[pts.length - 1].v });
    return pts.map((p) => ({ ...p, t: ms(p.d) }));
  }

  // ---------------------------------------------------------------- charts
  let chartSeq = 0;
  function areaChart(svg, pts, { height = 200, colors = ['#FF4D9D', '#7C5CFF', '#00D4FF'], onScrub, axis = true } = {}) {
    const W = Math.max(280, Math.round(svg.getBoundingClientRect().width || svg.parentNode.clientWidth || 340));
    const H = height;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('height', H);
    if (!pts.length) { svg.innerHTML = ''; return; }
    if (pts.length === 1) pts = [{ ...pts[0], t: pts[0].t - DAY }, pts[0]];

    const padT = 18, padB = axis ? 24 : 8, padX = 4;
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    let lo = Math.min(...pts.map((p) => p.v)), hi = Math.max(...pts.map((p) => p.v));
    if (hi === lo) { hi += Math.abs(hi) * 0.05 || 1; lo -= Math.abs(lo) * 0.05 || 1; }
    const span = hi - lo; lo -= span * 0.1; hi += span * 0.08;
    const x = (t) => padX + ((t - t0) / (t1 - t0 || 1)) * (W - padX * 2);
    const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
    const xy = pts.map((p) => [x(p.t), y(p.v)]);
    const line = xy.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join('');
    const base = H - padB;
    const area = `${line}L${xy[xy.length - 1][0].toFixed(1)},${base}L${xy[0][0].toFixed(1)},${base}Z`;
    const id = `c${++chartSeq}`;
    const last = xy[xy.length - 1];
    const stops = colors.map((c, i) => `<stop offset="${colors.length > 1 ? i / (colors.length - 1) : 0}" stop-color="${c}"/>`).join('');
    const grid = [0.25, 0.5, 0.75].map((f) => {
      const gy = padT + f * (H - padT - padB);
      return `<line x1="0" x2="${W}" y1="${gy}" y2="${gy}" stroke="rgba(255,255,255,.06)" stroke-dasharray="3 5"/>`;
    }).join('');
    const labels = axis
      ? `<text x="${padX + 10}" y="${H - 6}">${fmtDate(pts[0].d || isoDate(new Date(t0)), { month: 'short', day: 'numeric' })}</text>
         <text x="${W - padX - 10}" y="${H - 6}" text-anchor="end">Today</text>`
      : '';
    const len = Math.ceil(xy.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - xy[i - 1][0], p[1] - xy[i - 1][1]) : 0), 0));

    svg.innerHTML = `
      <defs>
        <linearGradient id="${id}s" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">${stops}</linearGradient>
        <linearGradient id="${id}f" gradientUnits="userSpaceOnUse" x1="0" y1="${padT}" x2="0" y2="${base}">
          <stop offset="0" stop-color="${colors[Math.floor(colors.length / 2)]}" stop-opacity=".42"/>
          <stop offset="1" stop-color="${colors[colors.length - 1]}" stop-opacity="0"/>
        </linearGradient>
        <filter id="${id}g" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      ${grid}
      <path d="${area}" fill="url(#${id}f)" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".9s" fill="freeze"/></path>
      <path d="${line}" fill="none" stroke="url(#${id}s)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" filter="url(#${id}g)"
        stroke-dasharray="${len}" stroke-dashoffset="${len}"><animate attributeName="stroke-dashoffset" from="${len}" to="0" dur="1s" fill="freeze" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1"/></path>
      <circle cx="${last[0]}" cy="${last[1]}" r="4" fill="${colors[colors.length - 1]}" class="pulse"/>
      <circle cx="${last[0]}" cy="${last[1]}" r="4" fill="#fff" stroke="${colors[colors.length - 1]}" stroke-width="2"/>
      ${labels}
      <g class="cursor" style="display:none">
        <line y1="${padT - 8}" y2="${base}" stroke="rgba(255,255,255,.35)" stroke-width="1"/>
        <circle r="6" fill="#fff" stroke="${colors[1] || colors[0]}" stroke-width="3"/>
      </g>`;

    if (!onScrub) return;
    const cursor = svg.querySelector('.cursor');
    const cl = cursor.querySelector('line'), cc = cursor.querySelector('circle');
    const move = (e) => {
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * W;
      let best = 0;
      for (let i = 1; i < xy.length; i++) if (Math.abs(xy[i][0] - px) < Math.abs(xy[best][0] - px)) best = i;
      const [bx, by] = xy[best];
      cursor.style.display = '';
      cl.setAttribute('x1', bx); cl.setAttribute('x2', bx);
      cc.setAttribute('cx', bx); cc.setAttribute('cy', by);
      onScrub(pts[best], pts[0]);
    };
    const end = () => { cursor.style.display = 'none'; onScrub(null); };
    svg.onpointerdown = (e) => { svg.setPointerCapture?.(e.pointerId); move(e); };
    svg.onpointermove = (e) => { if (e.pointerType === 'mouse' || e.buttons || e.pressure) move(e); };
    svg.onpointerup = svg.onpointercancel = svg.onpointerleave = end;
  }

  function sparkline(pts, color) {
    if (pts.length < 2) return `<svg class="acct-spark" viewBox="0 0 64 30"><line x1="2" x2="62" y1="15" y2="15" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity=".6"/></svg>`;
    const lo = Math.min(...pts.map((p) => p.v)), hi = Math.max(...pts.map((p) => p.v));
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const d = pts.map((p, i) => {
      const x = 2 + ((p.t - t0) / (t1 - t0 || 1)) * 60;
      const y = hi === lo ? 15 : 26 - ((p.v - lo) / (hi - lo)) * 22;
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join('');
    return `<svg class="acct-spark" viewBox="0 0 64 30"><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="filter:drop-shadow(0 0 4px ${color})"/></svg>`;
  }

  function donut(svg, segs, centerTop, centerBottom) {
    const R = 66, C = 2 * Math.PI * R, total = segs.reduce((s, x) => s + x.value, 0);
    let off = 0;
    const gap = segs.length > 1 ? 3 : 0;
    const rings = segs.map((s) => {
      const len = (s.value / total) * C;
      const dash = Math.max(len - gap, 0.5);
      const el = `<circle class="seg" cx="90" cy="90" r="${R}" fill="none" stroke="${s.color}" stroke-width="20" stroke-linecap="butt"
        stroke-dasharray="0 ${C}" data-dash="${dash} ${C - dash}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)" style="filter:drop-shadow(0 0 6px ${s.color}88)"/>`;
      off += len;
      return el;
    }).join('');
    svg.innerHTML = `
      <circle cx="90" cy="90" r="${R}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="20"/>
      ${rings}
      <text x="90" y="86" text-anchor="middle" font-size="11" fill="#9a9ab8" style="fill:#9a9ab8">${esc(centerTop)}</text>
      <text x="90" y="106" text-anchor="middle" font-size="18" font-weight="800">${esc(centerBottom)}</text>`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      svg.querySelectorAll('.seg').forEach((c) => c.setAttribute('stroke-dasharray', c.dataset.dash));
    }));
  }

  function barChart(svg, data) {
    const W = Math.max(280, Math.round(svg.getBoundingClientRect().width || 320)), H = 170;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('height', H);
    const padT = 10, padB = 22;
    const max = Math.max(1, ...data.map((d) => Math.abs(d.v)));
    const hasNeg = data.some((d) => d.v < 0), hasPos = data.some((d) => d.v > 0);
    const zero = hasNeg && hasPos ? padT + (H - padT - padB) / 2 : hasNeg ? padT : H - padB;
    const scale = (hasNeg && hasPos ? (H - padT - padB) / 2 : H - padT - padB) / max;
    const slot = W / data.length, bw = Math.min(26, slot * 0.6);
    const bars = data.map((d, i) => {
      const h = Math.max(2, Math.abs(d.v) * scale);
      const x = i * slot + (slot - bw) / 2;
      const y0 = d.v >= 0 ? zero - h : zero;
      const fill = d.v >= 0 ? 'url(#barUp)' : 'url(#barDown)';
      return `<rect x="${x.toFixed(1)}" y="${y0.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="6" fill="${fill}">
          <animate attributeName="height" from="0" to="${h.toFixed(1)}" dur=".7s" fill="freeze" begin="${i * 0.04}s" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1"/>
          ${d.v >= 0 ? `<animate attributeName="y" from="${zero}" to="${y0.toFixed(1)}" dur=".7s" fill="freeze" begin="${i * 0.04}s" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1"/>` : ''}
        </rect>
        <text x="${(x + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${d.label}</text>`;
    }).join('');
    svg.innerHTML = `
      <defs>
        <linearGradient id="barUp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00E096"/><stop offset="1" stop-color="#00D4FF" stop-opacity=".6"/></linearGradient>
        <linearGradient id="barDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF4D9D" stop-opacity=".6"/><stop offset="1" stop-color="#FF3B5C"/></linearGradient>
      </defs>
      <line x1="0" x2="${W}" y1="${zero}" y2="${zero}" stroke="rgba(255,255,255,.12)"/>
      ${bars}`;
  }

  function monthlyChanges() {
    const fd = firstDate();
    if (!fd) return [];
    const now = new Date();
    const out = [];
    for (let i = 11; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const prevEnd = isoDate(new Date(mStart.getTime() - DAY));
      if (prevEnd < fd) continue; // no baseline for this month
      const end = i === 0 ? today() : isoDate(mEnd);
      out.push({ label: mStart.toLocaleDateString('en-US', { month: 'narrow' }), v: netAt(end) - netAt(prevEnd) });
    }
    return out;
  }

  // ---------------------------------------------------------------- render
  let shownTotal = 0;
  let animToken = 0;
  function animateTotal(el, to) {
    const token = ++animToken;
    if (state.settings.hide) { el.textContent = money(to); shownTotal = to; return; }
    const from = shownTotal, t0 = performance.now(), dur = 700;
    const step = (now) => {
      if (token !== animToken) return;
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = currency.format(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    shownTotal = to;
  }

  function changeHTML(delta, base, label) {
    const cls = delta >= 0 ? 'up' : 'down';
    const p = base ? delta / Math.abs(base) : NaN;
    return `<span class="${cls}">${signed(delta)}</span><span class="badge ${cls}">${pct(p)}</span><span class="muted small">${esc(label)}</span>`;
  }

  const rangeLabel = (r) => ({ '1W': 'past week', '1M': 'past month', '3M': 'past 3 months', YTD: 'this year', '1Y': 'past year', ALL: 'all time' }[r]);

  function render() {
    state.plaid ||= { items: [], lastSync: 0 };
    const has = state.accounts.length > 0;
    $('#emptyState').hidden = has;
    for (const sel of ['.hero', '#stats', '.accounts']) $(sel).hidden = !has;
    document.querySelectorAll('main > .card:not(.empty)').forEach((c) => (c.hidden = !has));
    $('#fab').hidden = !has;
    $('#btnHide').innerHTML = state.settings.hide ? ICONS.eyeOff : ICONS.eye;
    renderSyncRow();
    if (!has) return;
    ensureOrder();

    // Hero
    const series = netSeries(range);
    const total = netAt(today());
    const first = series[0]?.v ?? total;
    animateTotal($('#netTotal'), total);
    $('#heroLabel').textContent = 'Total net worth';
    $('#netChange').innerHTML = changeHTML(total - first, first, rangeLabel(range));
    const up = total >= first;
    areaChart($('#mainChart'), series, {
      height: 210,
      colors: up ? ['#7C5CFF', '#00D4FF', '#00E096'] : ['#FFB020', '#FF4D9D', '#FF3B5C'],
      onScrub: (p, p0) => {
        if (!p) {
          $('#netTotal').textContent = money(total);
          $('#heroLabel').textContent = 'Total net worth';
          $('#netChange').innerHTML = changeHTML(total - first, first, rangeLabel(range));
          return;
        }
        animToken++;
        $('#netTotal').textContent = money(p.v);
        $('#heroLabel').textContent = fmtDate(p.d);
        $('#netChange').innerHTML = changeHTML(p.v - p0.v, p0.v, `since ${fmtDate(p0.d, { month: 'short', day: 'numeric' })}`);
      },
    });
    $('#ranges').innerHTML = RANGES.map((r) => `<button data-range="${r}" class="${r === range ? 'active' : ''}">${r}</button>`).join('');

    // Stats
    let assets = 0, liabs = 0;
    for (const a of state.accounts) { const l = latest(a); if (!l) continue; if (isLiab(a)) liabs += Math.abs(l.balance); else assets += l.balance; }
    let best = null;
    const start = rangeStart(range);
    for (const a of state.accounts) {
      if (isLiab(a) || !latest(a)) continue;
      const b0 = balanceAt(a, start) ?? a.history[0].balance;
      const g = b0 ? (latest(a).balance - b0) / Math.abs(b0) : 0;
      if (!best || g > best.g) best = { a, g };
    }
    $('#stats').innerHTML = `
      <div class="stat glass" style="--accent:#00E096"><div class="k">Assets</div><div class="v">${moneyShort(assets)}</div></div>
      <div class="stat glass" style="--accent:#FF4D9D"><div class="k">Liabilities</div><div class="v">${moneyShort(liabs)}</div></div>
      <div class="stat glass" style="--accent:${best ? best.a.color : '#7C5CFF'}"><div class="k">Top mover</div>
        <div class="v ${best && best.g < 0 ? 'down' : 'up'}" title="${esc(best?.a.name)}">${best ? pct(best.g) : '—'}</div></div>`;

    // Breakdown donuts: assets and liabilities by type
    breakdown(state.accounts.filter((a) => !isLiab(a)), assets, '#donut', '#legend', '#allocNote', 'Assets', 'No assets yet');
    breakdown(state.accounts.filter(isLiab), liabs, '#donutL', '#legendL', '#liabNote', 'Owed', 'No liabilities — nice!');

    // Monthly bars
    const months = monthlyChanges();
    $('#bars').style.display = months.length ? '' : 'none';
    $('#barsEmpty').hidden = months.length > 0;
    if (months.length) barChart($('#bars'), months);

    // Account list: collapsible Assets / Liabilities groups, in the user's own order
    $('#btnReorder').textContent = reordering ? 'Done' : 'Reorder';
    $('#btnReorder').classList.toggle('on', reordering);
    $('#accountList').classList.toggle('reordering', reordering);
    $('#accountList').innerHTML =
      groupHTML('assets', 'Assets', state.accounts.filter((a) => !isLiab(a)), money(assets), 'linear-gradient(180deg,#00E096,#00D4FF)') +
      groupHTML('liabilities', 'Liabilities', state.accounts.filter(isLiab), (liabs ? '−' : '') + money(liabs), 'linear-gradient(180deg,#FF4D9D,#FF8A3D)');
  }

  function breakdown(list, total, donutSel, legendSel, noteSel, centerLabel, emptyText) {
    const byType = {};
    for (const a of list) {
      const l = latest(a); if (!l || Math.abs(l.balance) <= 0) continue;
      byType[a.type] = (byType[a.type] || 0) + Math.abs(l.balance);
    }
    const segs = Object.entries(byType).sort((x, y) => y[1] - x[1])
      .map(([t, v]) => ({ label: TYPES[t]?.label || t, value: v, color: TYPES[t]?.color || '#888' }));
    if (segs.length) {
      donut($(donutSel), segs, centerLabel, moneyShort(total));
      $(legendSel).innerHTML = segs.map((s) => `<li><span class="dot" style="background:${s.color};color:${s.color}"></span><span class="name">${esc(s.label)}</span><span class="pct">${((s.value / total) * 100).toFixed(1)}%</span></li>`).join('');
    } else {
      donut($(donutSel), [{ value: 1, color: 'rgba(255,255,255,.08)' }], centerLabel, '$0');
      $(legendSel).innerHTML = `<li class="muted">${emptyText}</li>`;
    }
    $(noteSel).textContent = segs.length ? `${segs.length} categor${segs.length === 1 ? 'y' : 'ies'}` : '';
  }

  function groupHTML(key, label, list, totalText, accent) {
    if (!list.length) return '';
    const open = reordering || !state.settings.collapsed?.[key];
    return `<div class="group glass ${open ? 'open' : ''}" data-group="${key}">
      <button class="group-head" data-toggle="${key}" aria-expanded="${open}">
        <span class="g-bar" style="background:${accent}"></span>
        <span class="g-title">${label}</span><span class="g-count">${list.length}</span>
        <span class="g-total">${totalText}</span>${ICONS.chev}
      </button>
      <div class="group-body"><div class="group-inner"><div class="group-list" data-list="${key}">${list.map(accountRow).join('')}</div></div></div>
    </div>`;
  }

  /** Accounts are displayed in array order. Older data was shown sorted by balance, so keep that look once. */
  function ensureOrder() {
    if (state.settings.ordered) return;
    state.accounts.sort((a, b) => (latest(b)?.balance || 0) - (latest(a)?.balance || 0));
    state.settings.ordered = true;
    save();
  }

  /** Drag-to-reorder within one group, driven by the grip handle (works with touch, pen and mouse). */
  function startDrag(e, handle) {
    e.preventDefault();
    const row = handle.closest('.acct'), list = row.parentNode;
    const rows = [...list.children];
    const from = rows.indexOf(row);
    const rects = rows.map((r) => r.getBoundingClientRect());
    const gap = rows.length > 1 ? rects[1].top - rects[0].bottom : 0;
    const shift = rects[from].height + gap;
    const minDy = rects[0].top - rects[from].top;
    const maxDy = rects[rects.length - 1].bottom - rects[from].bottom;
    const y0 = e.clientY;
    let to = from;
    row.classList.add('dragging');
    list.classList.add('is-dragging');
    handle.setPointerCapture?.(e.pointerId);

    const move = (ev) => {
      const dy = Math.max(minDy, Math.min(maxDy, ev.clientY - y0));
      row.style.transform = `translateY(${dy}px) scale(1.03)`;
      const center = rects[from].top + rects[from].height / 2 + dy;
      to = rows.filter((r, i) => i !== from && rects[i].top + rects[i].height / 2 < center).length;
      rows.forEach((r, i) => {
        if (i === from) return;
        const s = i < from && i >= to ? shift : i > from && i <= to ? -shift : 0;
        r.style.transform = s ? `translateY(${s}px)` : '';
      });
    };
    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      if (to !== from) {
        const ids = rows.map((r) => r.dataset.acct);
        ids.splice(to, 0, ids.splice(from, 1)[0]);
        applyOrder(ids);
        navigator.vibrate?.(8);
      }
      render();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  function applyOrder(groupIds) {
    const rank = new Map(groupIds.map((id, i) => [id, i]));
    const inGroup = state.accounts.filter((a) => rank.has(a.id)).sort((a, b) => rank.get(a.id) - rank.get(b.id));
    let k = 0;
    state.accounts = state.accounts.map((a) => (rank.has(a.id) ? inGroup[k++] : a));
    save();
  }

  function accountRow(a) {
    const l = latest(a);
    const pts = accountSeries(a, range);
    const b0 = pts[0]?.v ?? l?.balance ?? 0;
    const delta = (l?.balance ?? 0) - b0;
    // For debts, a falling balance is good news.
    const good = isLiab(a) ? delta <= 0 : delta >= 0;
    const sub = [a.institution, a.plaid?.mask ? '••' + a.plaid.mask : TYPES[a.type]?.label].filter(Boolean).join(' · ');
    const bad = a.plaid && state.plaid.items.find((i) => i.id === a.plaid.itemId)?.error;
    const badge = a.plaid ? `<span class="auto ${bad ? 'bad' : ''}" title="${bad ? 'Needs reconnecting' : 'Updates automatically'}">${ICONS.link}</span>` : '';
    return `<div class="acct" role="button" tabindex="0" data-acct="${a.id}">
      <div class="acct-icon" style="background:linear-gradient(135deg, ${a.color}, ${a.color}88);box-shadow:0 4px 16px ${a.color}55">${esc(initials(a.name))}</div>
      <div class="acct-main"><div class="acct-name">${esc(a.name)}</div><div class="acct-sub">${badge}${esc(sub)}</div></div>
      ${reordering ? '' : sparkline(pts, a.color)}
      <div class="acct-right">
        <div class="acct-bal">${isLiab(a) ? '−' : ''}${money(Math.abs(l?.balance ?? 0))}</div>
        <div class="acct-chg ${good ? 'up' : 'down'}">${delta === 0 ? '<span class="muted">no change</span>' : signed(delta)}</div>
      </div>
      ${reordering ? `<span class="grip" aria-label="Drag to reorder">${ICONS.grip}</span>` : ''}
    </div>`;
  }

  // ---------------------------------------------------------------- sheets
  const sheet = $('#sheet'), sheetBody = $('#sheetBody');
  function openSheet(html, onMount) {
    sheetBody.innerHTML = `<div class="sheet-body">${html}</div>`;
    sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false');
    $('.sheet-panel').scrollTop = 0;
    onMount && onMount(sheetBody);
  }
  function closeSheet() { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); document.activeElement?.blur(); }
  sheet.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) closeSheet(); });

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function accountForm(a) {
    const editing = !!a;
    a = a || { name: '', institution: '', type: 'brokerage', color: SWATCHES[state.accounts.length % SWATCHES.length] };
    const typeOpts = Object.entries(TYPES).map(([k, t]) => `<option value="${k}" ${k === a.type ? 'selected' : ''}>${t.label}${t.liability ? ' (debt)' : ''}</option>`).join('');
    openSheet(`
      <h3>${editing ? 'Edit account' : 'Add account'}</h3>
      <div class="field"><label for="fName">Account name</label><input id="fName" placeholder="e.g. Robinhood Individual" value="${esc(a.name)}" autocomplete="off"/></div>
      <div class="field"><label for="fInst">Institution</label><input id="fInst" placeholder="e.g. Robinhood, Chase, Fidelity" value="${esc(a.institution)}" autocomplete="off"/></div>
      <div class="field"><label for="fType">Type</label><select id="fType">${typeOpts}</select></div>
      ${editing ? '' : `<div class="field"><label for="fBal">Current balance</label><div class="money-input"><input id="fBal" inputmode="decimal" placeholder="0.00"/></div>
        <p class="hint">For credit cards and loans, enter the amount you owe.</p></div>`}
      <div class="field"><label>Color</label><div class="swatches" id="fSw">${SWATCHES.map((c) => `<button type="button" class="swatch ${c === a.color ? 'sel' : ''}" data-c="${c}" style="background:${c};color:${c}"></button>`).join('')}</div></div>
      <button class="primary-btn" id="fSave">${editing ? 'Save changes' : 'Add account'}</button>
    `, (root) => {
      let color = a.color;
      $('#fSw', root).onclick = (e) => {
        const b = e.target.closest('.swatch'); if (!b) return;
        color = b.dataset.c; root.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('sel', s === b));
      };
      $('#fSave', root).onclick = () => {
        const name = $('#fName', root).value.trim();
        if (!name) { toast('Give the account a name'); $('#fName', root).focus(); return; }
        const fields = { name, institution: $('#fInst', root).value.trim(), type: $('#fType', root).value, color };
        if (editing) {
          Object.assign(a, fields);
        } else {
          const bal = parseMoney($('#fBal', root).value);
          const acct = { id: uid(), ...fields, history: [] };
          setBalance(acct, today(), isFinite(bal) ? Math.abs(bal) * (TYPES[fields.type].liability ? 1 : Math.sign(bal) || 1) : 0);
          state.accounts.push(acct);
        }
        save(); closeSheet(); render(); toast(editing ? 'Saved' : 'Account added');
      };
      if (!editing) setTimeout(() => $('#fName', root).focus(), 350);
    });
  }

  function accountDetail(id) {
    const a = state.accounts.find((x) => x.id === id); if (!a) return;
    const l = latest(a);
    const hist = [...a.history].reverse();
    openSheet(`
      <div class="detail-top">
        <div class="acct-icon" style="background:linear-gradient(135deg, ${a.color}, ${a.color}88)">${esc(initials(a.name))}</div>
        <div class="acct-main"><div class="acct-name">${esc(a.name)}</div><div class="acct-sub">${esc([a.institution, TYPES[a.type]?.label].filter(Boolean).join(' · '))}</div></div>
      </div>
      <div><div class="detail-bal">${isLiab(a) ? '−' : ''}${money(Math.abs(l?.balance ?? 0))}</div>
        <div class="muted small">Updated ${l ? fmtDate(l.date) : 'never'}</div></div>
      ${a.plaid ? `<div class="linked-note">${ICONS.link}<span>Connected with Plaid${a.plaid.mask ? ` · ••${esc(a.plaid.mask)}` : ''}. Updates automatically — you can still type a balance below.</span></div>` : ''}
      <div class="detail-chart"><svg id="dChart" class="chart"></svg></div>
      <div class="field"><label for="dBal">New balance</label><div class="money-input"><input id="dBal" inputmode="decimal" placeholder="${l ? l.balance.toFixed(2) : '0.00'}"/></div></div>
      <div class="field"><label for="dDate">As of</label><input id="dDate" type="date" value="${today()}" max="${today()}"/></div>
      <button class="primary-btn" id="dSave">Update balance</button>
      <h2 style="margin-top:6px">History</h2>
      <ul class="history">${hist.map((h) => `<li><span>${fmtDate(h.date)}</span><span><span class="h-val">${money(h.balance)}</span><button class="del" data-del="${h.date}" aria-label="Delete entry">×</button></span></li>`).join('')}</ul>
      ${a.plaid ? '<button class="ghost-btn" id="dUnlink">Stop automatic updates</button>' : ''}
      <div class="btn-row"><button class="ghost-btn" id="dEdit">Edit</button><button class="danger-btn" id="dDelete">Delete</button></div>
    `, (root) => {
      if (a.plaid) $('#dUnlink', root).onclick = () => {
        if (!confirm(`Stop updating “${a.name}” automatically? It stays as a manual account with its history.`)) return;
        delete a.plaid; save(); render(); accountDetail(a.id); toast('Now a manual account');
      };
      requestAnimationFrame(() => areaChart($('#dChart', root), accountSeries(a, 'ALL'), { height: 150, colors: [a.color + 'aa', a.color, a.color], axis: true }));
      $('#dSave', root).onclick = () => {
        const v = parseMoney($('#dBal', root).value);
        if (!isFinite(v)) { toast('Enter a balance'); return; }
        const d = $('#dDate', root).value || today();
        setBalance(a, d, isLiab(a) ? Math.abs(v) : v);
        save(); render(); accountDetail(a.id); toast('Balance updated');
      };
      root.querySelector('.history').onclick = (e) => {
        const b = e.target.closest('[data-del]'); if (!b) return;
        if (a.history.length === 1) { toast('An account needs at least one balance'); return; }
        a.history = a.history.filter((h) => h.date !== b.dataset.del);
        save(); render(); accountDetail(a.id);
      };
      $('#dEdit', root).onclick = () => accountForm(a);
      $('#dDelete', root).onclick = () => {
        if (!confirm(`Delete “${a.name}” and all of its history?`)) return;
        state.accounts = state.accounts.filter((x) => x.id !== a.id);
        save(); closeSheet(); render(); toast('Account deleted');
      };
    });
  }

  function quickUpdate() {
    const rows = state.accounts.map((a) => `
      <div class="quick-row">
        <div class="acct-icon" style="background:linear-gradient(135deg, ${a.color}, ${a.color}88)">${esc(initials(a.name))}</div>
        <div class="q-name">${esc(a.name)}<div class="acct-sub">${esc(a.institution || TYPES[a.type]?.label)}</div></div>
        <div class="money-input"><input data-q="${a.id}" inputmode="decimal" value="${latest(a) ? latest(a).balance.toFixed(2) : ''}"/></div>
      </div>`).join('');
    openSheet(`
      <h3>Update balances</h3>
      <p class="hint">Open Robinhood (and your other apps), then type in today’s totals. Only changed values are recorded.</p>
      <div class="field"><label for="qDate">As of</label><input id="qDate" type="date" value="${today()}" max="${today()}"/></div>
      ${rows}
      <button class="primary-btn" id="qSave">Save all</button>
    `, (root) => {
      root.querySelectorAll('[data-q]').forEach((inp) => inp.addEventListener('focus', () => inp.select()));
      $('#qSave', root).onclick = () => {
        const d = $('#qDate', root).value || today();
        let n = 0;
        root.querySelectorAll('[data-q]').forEach((inp) => {
          const a = state.accounts.find((x) => x.id === inp.dataset.q);
          const v = parseMoney(inp.value);
          if (!a || !isFinite(v)) return;
          const cur = balanceAt(a, d);
          const nv = isLiab(a) ? Math.abs(v) : v;
          if (cur == null || Math.abs(cur - nv) > 0.004) { setBalance(a, d, nv); n++; }
        });
        save(); closeSheet(); render();
        toast(n ? `Updated ${n} account${n > 1 ? 's' : ''}` : 'No changes');
      };
    });
  }

  function settingsSheet() {
    const on = !!state.settings.faceId;
    openSheet(`
      <h3>Settings</h3>
      <div class="glass setting-row" style="border-radius:18px">
        <div class="sr-text">
          <div class="sr-title">${ICONS.face}Require Face ID</div>
          <p class="hint" id="fidHint">Ask for Face ID every time you open the app.</p>
        </div>
        <label class="switch"><input type="checkbox" id="sFace" ${on ? 'checked' : ''} aria-label="Require Face ID"/><span></span></label>
      </div>
      <div class="glass card" style="padding:14px">
        <h2 style="margin-bottom:8px">Install on iPhone</h2>
        <ol class="install-steps">
          <li>Open this page in <b>Safari</b></li>
          <li>Tap the <b>Share</b> button</li>
          <li>Choose <b>Add to Home Screen</b></li>
        </ol>
      </div>
      <button class="glass setting-row plaid-row" id="sPlaid" style="border-radius:18px;width:100%;text-align:left">
        <div class="sr-text">
          <div class="sr-title">${ICONS.bank}Bank connections</div>
          <p class="hint">${plaidReady() ? `${state.plaid.items.length} connected with Plaid` : 'Set up Plaid to update balances automatically'}</p>
        </div>${ICONS.chev}
      </button>
      <div class="settings-list">
        <button class="ghost-btn" id="sExport">Back up data (JSON)</button>
        <button class="ghost-btn" id="sImport">Restore from backup</button>
        <button class="ghost-btn" id="sCsv">Import balances from CSV</button>
        <p class="hint">CSV columns: <code>date,account,balance</code> (optional 4th column: type such as brokerage, retirement, crypto, checking, savings, credit, loan). Dates as YYYY-MM-DD.</p>
        <button class="ghost-btn" id="sDemo">Load demo data</button>
        <button class="danger-btn" id="sClear">Erase all data</button>
      </div>
      <input type="file" id="sFile" accept=".json,application/json" hidden/>
      <input type="file" id="sCsvFile" accept=".csv,text/csv,text/plain" hidden/>
    `, (root) => {
      const sw = $('#sFace', root);
      faceIdAvailable().then((ok) => {
        if (ok || state.settings.faceId) return;
        sw.disabled = true;
        $('#fidHint', root).textContent = "Face ID isn't available here. Open the app from your iPhone home screen (iOS 16 or later).";
      });
      sw.onchange = async () => {
        sw.disabled = true;
        try {
          if (sw.checked) { await enableFaceId(); toast('Face ID lock is on'); }
          else { await verifyFaceId(); state.settings.faceId = null; save(); toast('Face ID lock is off'); }
        } catch (e) {
          sw.checked = !sw.checked;
          if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') toast("Couldn't set up Face ID");
        } finally { sw.disabled = false; }
      };
      $('#sPlaid', root).onclick = plaidSettings;
      $('#sExport', root).onclick = exportData;
      $('#sImport', root).onclick = () => $('#sFile', root).click();
      $('#sCsv', root).onclick = () => $('#sCsvFile', root).click();
      $('#sFile', root).onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try {
          const data = JSON.parse(await f.text());
          if (!Array.isArray(data.accounts)) throw new Error('bad file');
          if (!confirm('Replace all current data with this backup?')) return;
          const keep = { faceId: state.settings.faceId, plaidUrl: state.settings.plaidUrl, plaidCode: state.settings.plaidCode };
          state = {
            accounts: data.accounts,
            settings: { ...state.settings, ...(data.settings || {}), ...keep },
            plaid: data.plaid?.items ? { items: data.plaid.items, lastSync: 0 } : state.plaid,
          };
          save(); closeSheet(); render(); toast('Backup restored');
        } catch { toast('That file is not a valid backup'); }
      };
      $('#sCsvFile', root).onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        const n = importCSV(await f.text());
        save(); closeSheet(); render(); toast(n ? `Imported ${n} balance${n > 1 ? 's' : ''}` : 'Nothing imported');
      };
      $('#sDemo', root).onclick = () => {
        if (state.accounts.length && !confirm('Replace your data with demo data?')) return;
        loadDemo(); closeSheet();
      };
      $('#sClear', root).onclick = () => {
        if (!confirm('Erase all accounts and history from this device?')) return;
        eraseAll(); closeSheet(); render(); toast('All data erased');
      };
    });
  }

  async function exportData() {
    const json = JSON.stringify({ app: 'networth', version: 1, exported: new Date().toISOString(), ...state,
      settings: { ...state.settings, plaidCode: undefined, faceId: undefined } }, null, 2);
    const name = `networth-backup-${today()}.json`;
    const file = new File([json], name, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Net Worth backup' }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(file);
    const link = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function importCSV(text) {
    let n = 0;
    for (const raw of text.split(/\r?\n/)) {
      const cols = raw.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(cols[0])) continue; // skips header + junk
      const [date, name, balStr, typeStr] = cols;
      const bal = parseMoney(balStr);
      if (!name || !isFinite(bal)) continue;
      let a = state.accounts.find((x) => x.name.toLowerCase() === name.toLowerCase());
      if (!a) {
        const type = TYPES[typeStr?.toLowerCase()] ? typeStr.toLowerCase() : 'other';
        a = { id: uid(), name, institution: '', type, color: SWATCHES[state.accounts.length % SWATCHES.length], history: [] };
        state.accounts.push(a);
      }
      setBalance(a, date, isLiab(a) ? Math.abs(bal) : bal);
      n++;
    }
    return n;
  }

  function loadDemo() {
    const defs = [
      ['Robinhood Individual', 'Robinhood', 'brokerage', '#00E096', 24500, 0.004, 0.025],
      ['Robinhood Roth IRA', 'Robinhood', 'retirement', '#00D4FF', 18200, 0.003, 0.018],
      ['Crypto', 'Robinhood', 'crypto', '#FFB020', 4200, 0.004, 0.07],
      ['Checking', 'Chase', 'checking', '#4D7CFF', 6800, 0, 0.05],
      ['High-Yield Savings', 'Ally', 'savings', '#C64DFF', 15000, 0.0008, 0.002],
      ['Sapphire Card', 'Chase', 'credit', '#FF4D9D', 1900, 0, 0.18],
      ['Car Loan', 'Ally', 'auto', '#FFC23D', 18500, -0.006, 0],
    ];
    const t = today();
    state.accounts = defs.map(([name, institution, type, color, startBal, drift, vol]) => {
      const a = { id: uid(), name, institution, type, color, history: [] };
      let v = startBal;
      for (let d = 400; d >= 0; d -= 7) {
        const shock = (Math.random() - 0.5) * 2 * vol;
        v = Math.max(50, v * (1 + drift + shock));
        if (type === 'savings') v += 120;
        setBalance(a, addDays(t, -d), Math.round(v * 100) / 100);
      }
      return a;
    });
    state.settings.ordered = true;
    save(); render(); toast('Demo data loaded');
  }

  // ---------------------------------------------------------------- events
  $('#btnSettings').innerHTML = ICONS.gear;
  $('#btnSettings').onclick = settingsSheet;
  $('#btnHide').onclick = () => { state.settings.hide = !state.settings.hide; save(); render(); };
  $('#fab').onclick = addChooser;
  $('#btnFirst').onclick = addChooser;
  $('#syncRow').onclick = () => syncPlaid({ force: true, quiet: false });
  $('#btnDemo').onclick = loadDemo;
  $('#btnQuick').onclick = quickUpdate;
  $('#ranges').onclick = (e) => {
    const b = e.target.closest('[data-range]'); if (!b) return;
    range = b.dataset.range; state.settings.range = range; save(); render();
  };
  $('#btnReorder').onclick = () => { reordering = !reordering; render(); if (reordering) toast('Drag ⋮⋮ to move accounts'); };
  $('#accountList').onclick = (e) => {
    const t = e.target.closest('[data-toggle]');
    if (t) {
      if (reordering) return;
      const key = t.dataset.toggle;
      state.settings.collapsed = { ...(state.settings.collapsed || {}), [key]: !state.settings.collapsed?.[key] };
      save();
      const g = t.closest('.group');
      g.classList.toggle('open', !state.settings.collapsed[key]);
      t.setAttribute('aria-expanded', String(!state.settings.collapsed[key]));
      return;
    }
    if (reordering) return;
    const b = e.target.closest('[data-acct]'); if (b) accountDetail(b.dataset.acct);
  };
  $('#accountList').addEventListener('pointerdown', (e) => {
    const h = e.target.closest('.grip');
    if (h && reordering) startDrag(e, h);
  });
  $('#accountList').addEventListener('keydown', (e) => {
    const b = e.target.closest('[data-acct]');
    if (b && (e.key === 'Enter' || e.key === ' ') && !reordering) { e.preventDefault(); accountDetail(b.dataset.acct); }
  });

  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(render, 200); });
  // Re-render when returning to the app (e.g. the next day, so "Today" stays current).
  // ---------------------------------------------------------------- Plaid (automatic balances)
  // The app talks to your own small server (worker/), which holds the Plaid keys.
  const SYNC_EVERY_MS = 30 * 60 * 1000;
  const plaidReady = () => !!(state.settings.plaidUrl && state.settings.plaidCode);
  const KINDS = {
    bank: { icon: 'card', title: 'Bank account or credit card', text: 'Checking, savings and credit cards' },
    investments: { icon: 'chart', title: 'Investments', text: 'Robinhood, brokerage, 401(k), IRA, crypto' },
    loans: { icon: 'home', title: 'Loans', text: 'Mortgage, student and auto loans' },
  };

  async function plaidApi(path, body, cfg = state.settings) {
    let res;
    try {
      res = await fetch(cfg.plaidUrl.replace(/\/+$/, '') + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.plaidCode },
        body: JSON.stringify(body || {}),
      });
    } catch { throw new Error("Can't reach your Plaid server — check the address"); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || `Server error (${res.status})`), { code: data.code });
    return data;
  }

  let plaidScript = null;
  function loadPlaidLink() {
    if (window.Plaid) return Promise.resolve();
    return (plaidScript ||= new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      s.onload = ok;
      s.onerror = () => { plaidScript = null; s.remove(); fail(new Error("Couldn't load Plaid — check your connection")); };
      document.head.appendChild(s);
    }));
  }

  /** Opens Plaid Link. Resolves with {public_token, metadata}, or null if the user closed it. */
  function openLink(token) {
    return new Promise((resolve, reject) => {
      let h;
      h = window.Plaid.create({
        token,
        onSuccess: (public_token, metadata) => { resolve({ public_token, metadata }); h?.destroy?.(); },
        onExit: (err) => {
          h?.destroy?.();
          err ? reject(Object.assign(new Error(err.display_message || err.error_message || 'Plaid was closed'), { code: err.error_code })) : resolve(null);
        },
      });
      h.open();
    });
  }

  function mapPlaidType({ type, subtype }) {
    const st = String(subtype || '').toLowerCase();
    if (type === 'credit') return 'credit';
    if (type === 'loan') return /mortgage|home equity/.test(st) ? 'mortgage' : st === 'auto' ? 'auto' : st === 'student' ? 'student' : 'loan';
    if (type === 'investment' || type === 'brokerage') {
      if (/crypto/.test(st)) return 'crypto';
      if (/401|403|457|ira|roth|retirement|pension|keogh|sep|simple|thrift|profit sharing|rrsp|tfsa|rrif|lira/.test(st)) return 'retirement';
      return 'brokerage';
    }
    if (type === 'depository') return /checking|paypal|prepaid|cash management/.test(st) ? 'checking' : 'savings';
    return 'other';
  }

  /** Writes today's Plaid balances into matching accounts; optionally creates new ones. Returns # created. */
  function applyPlaidAccounts(item, accounts, addNew) {
    let created = 0;
    for (const pa of accounts) {
      let a = state.accounts.find((x) => x.plaid?.accountId === pa.id);
      if (!a && !addNew) continue;
      if (!a) {
        a = {
          id: uid(), name: pa.name || pa.official_name || 'Account', institution: item.institution,
          type: mapPlaidType(pa), color: SWATCHES[state.accounts.length % SWATCHES.length], history: [],
          plaid: { itemId: item.id, accountId: pa.id, mask: pa.mask || '' },
        };
        state.accounts.push(a);
        created++;
      }
      const v = pa.current ?? pa.available;
      if (v == null || !isFinite(v)) continue;
      setBalance(a, today(), isLiab(a) ? Math.abs(v) : v);
    }
    return created;
  }

  async function connectPlaid(kind) {
    closeSheet();
    try {
      toast('Opening Plaid…');
      const [{ link_token }] = await Promise.all([plaidApi('/link-token', { kind }), loadPlaidLink()]);
      const r = await openLink(link_token);
      if (!r) return;
      toast('Connecting…');
      const { item, accounts } = await plaidApi('/exchange', { public_token: r.public_token });
      const rec = { id: item.id, enc: item.enc, institution: r.metadata?.institution?.name || 'Bank', kind, error: null };
      state.plaid.items = state.plaid.items.filter((i) => i.id !== rec.id).concat(rec);
      const n = applyPlaidAccounts(rec, accounts, true);
      state.plaid.lastSync = Date.now();
      save(); render();
      toast(n ? `Added ${n} account${n === 1 ? '' : 's'} from ${rec.institution}` : `${rec.institution} is connected`);
    } catch (e) { toast(e.message || 'Plaid connection failed'); }
  }

  async function reconnectPlaid(item) {
    try {
      const [{ link_token }] = await Promise.all([plaidApi('/link-token', { item: item.enc }), loadPlaidLink()]);
      const r = await openLink(link_token);
      if (!r) return;
      item.error = null; save();
      await syncPlaid({ force: true, quiet: false });
    } catch (e) { toast(e.message); }
  }

  async function removePlaid(item) {
    if (!confirm(`Disconnect ${item.institution}? Its accounts stay in the app as manual accounts.`)) return;
    try { await plaidApi('/remove', { item: item.enc }); }
    catch (e) { if (!confirm(`${e.message}\n\nRemove it from this app anyway?`)) return; }
    state.plaid.items = state.plaid.items.filter((i) => i !== item);
    for (const a of state.accounts) if (a.plaid?.itemId === item.id) delete a.plaid;
    save(); render(); toast(`${item.institution} disconnected`);
  }

  let syncing = false;
  async function syncPlaid({ force = false, quiet = true } = {}) {
    if (!plaidReady() || !state.plaid.items.length || syncing) return;
    if (!force && Date.now() - (state.plaid.lastSync || 0) < SYNC_EVERY_MS) return;
    syncing = true; renderSyncRow();
    try {
      const { results } = await plaidApi('/accounts', { items: state.plaid.items.map((i) => i.enc) });
      results.forEach((r, i) => {
        const item = state.plaid.items[i];
        if (!item) return;
        if (r.ok) { item.error = null; applyPlaidAccounts(item, r.accounts, false); }
        else item.error = r.error;
      });
      state.plaid.lastSync = Date.now();
      save();
      const bad = state.plaid.items.filter((i) => i.error);
      if (bad.length) toast(`${bad[0].institution} needs to be reconnected — see Settings`);
      else if (!quiet) toast('Balances updated');
    } catch (e) { if (!quiet) toast(e.message); }
    finally { syncing = false; if (!isLocked()) render(); else renderSyncRow(); }
  }

  function ago(ts) {
    const m = Math.round((Date.now() - ts) / 60000);
    if (!ts) return 'never';
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    return h < 24 ? `${h} hr ago` : `${Math.round(h / 24)} d ago`;
  }

  function renderSyncRow() {
    const row = $('#syncRow');
    row.hidden = !(plaidReady() && state.plaid.items.length);
    if (row.hidden) return;
    const bad = state.plaid.items.some((i) => i.error);
    row.classList.toggle('spinning', syncing);
    row.classList.toggle('bad', bad);
    row.innerHTML = `${ICONS.sync}<span>${syncing ? 'Updating balances…' : bad ? 'A bank needs reconnecting — open Settings' : `Bank balances updated ${ago(state.plaid.lastSync)}`}</span>${syncing || bad ? '' : '<b>Refresh</b>'}`;
  }

  function addChooser() {
    openSheet(`
      <h3>Add account</h3>
      <button class="choice" id="cPlaid"><span class="choice-icon" style="--c1:#00E096;--c2:#00D4FF">${ICONS.bank}</span>
        <span><b>Connect automatically</b><span>Link a bank, card, loan or brokerage with Plaid. Balances update on their own.</span></span></button>
      <button class="choice" id="cManual"><span class="choice-icon" style="--c1:#7C5CFF;--c2:#FF4D9D">${ICONS.pencil}</span>
        <span><b>Add manually</b><span>Type in a balance and update it whenever you like.</span></span></button>
    `, (r) => {
      $('#cManual', r).onclick = () => accountForm();
      $('#cPlaid', r).onclick = () => (plaidReady() ? kindChooser() : plaidSettings());
    });
  }

  function kindChooser() {
    openSheet(`
      <h3>What are you connecting?</h3>
      ${Object.entries(KINDS).map(([k, v]) => `<button class="choice" data-kind="${k}"><span class="choice-icon">${ICONS[v.icon]}</span>
        <span><b>${v.title}</b><span>${v.text}</span></span></button>`).join('')}
      <p class="hint">Plaid opens in a secure window. You sign in to your bank there — this app never sees your password.</p>
    `, (r) => r.querySelectorAll('[data-kind]').forEach((b) => (b.onclick = () => connectPlaid(b.dataset.kind))));
  }

  function plaidSettings() {
    const items = state.plaid.items;
    openSheet(`
      <h3>Bank connections</h3>
      <p class="hint">Plaid links your accounts so balances update automatically. It needs your own small Plaid server — the README in your GitHub repo walks you through setting it up.</p>
      <div class="field"><label for="pUrl">Server address</label><input id="pUrl" type="url" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="https://networth-plaid.yourname.workers.dev" value="${esc(state.settings.plaidUrl || '')}"/></div>
      <div class="field"><label for="pCode">Access code</label><input id="pCode" type="password" autocomplete="off" placeholder="The APP_TOKEN you chose" value="${esc(state.settings.plaidCode || '')}"/></div>
      <button class="primary-btn" id="pSave">Save &amp; test</button>
      <p class="hint" id="pStatus"></p>
      ${items.length ? `<h2 style="margin-top:4px">Connected</h2>
        <ul class="conns">${items.map((it, i) => `<li>
          <span class="choice-icon small">${ICONS[KINDS[it.kind]?.icon || 'bank']}</span>
          <span class="c-main"><b>${esc(it.institution)}</b><span class="${it.error ? 'down' : 'muted'}">${it.error ? esc(it.error.message || 'Needs attention') : `${state.accounts.filter((a) => a.plaid?.itemId === it.id).length} accounts`}</span></span>
          ${it.error ? `<button class="chip-btn" data-fix="${i}">Reconnect</button>` : ''}
          <button class="chip-btn alt" data-rm="${i}">Remove</button></li>`).join('')}</ul>
        <button class="ghost-btn" id="pSync">${ICONS.sync} Refresh balances now</button>` : ''}
      ${plaidReady() ? '<button class="primary-btn" id="pAdd">Connect an account</button>' : ''}
    `, (r) => {
      $('#pSave', r).onclick = async () => {
        const cfg = { plaidUrl: $('#pUrl', r).value.trim(), plaidCode: $('#pCode', r).value.trim() };
        const st = $('#pStatus', r);
        if (!/^https:\/\/.+/i.test(cfg.plaidUrl)) { st.className = 'hint down'; st.textContent = 'Enter the full https:// address of your server.'; return; }
        if (!cfg.plaidCode) { st.className = 'hint down'; st.textContent = 'Enter your access code.'; return; }
        st.className = 'hint'; st.textContent = 'Testing…';
        try {
          const res = await plaidApi('/ping', {}, cfg);
          Object.assign(state.settings, cfg); save();
          toast(`Connected to your Plaid server (${res.env})`);
          plaidSettings();
        } catch (e) { st.className = 'hint down'; st.textContent = e.message; }
      };
      r.querySelectorAll('[data-fix]').forEach((b) => (b.onclick = () => { closeSheet(); reconnectPlaid(items[+b.dataset.fix]); }));
      r.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = async () => { await removePlaid(items[+b.dataset.rm]); plaidSettings(); }));
      if ($('#pSync', r)) $('#pSync', r).onclick = () => { closeSheet(); syncPlaid({ force: true, quiet: false }); };
      if ($('#pAdd', r)) $('#pAdd', r).onclick = kindChooser;
    });
  }

  /** Wipes local data; also asks the server to disconnect banks so Plaid stops billing for them. */
  function eraseAll() {
    if (plaidReady()) for (const it of state.plaid.items) plaidApi('/remove', { item: it.enc }).catch(() => {});
    const keep = { plaidUrl: state.settings.plaidUrl, plaidCode: state.settings.plaidCode };
    state = freshState();
    Object.assign(state.settings, keep);
    save();
  }

  // ---------------------------------------------------------------- Face ID lock
  // Uses a passkey (WebAuthn) stored on this iPhone; iOS asks for Face ID (or the passcode) to use it.
  const LOCK_GRACE_MS = 60 * 1000; // re-lock after the app has been in the background this long
  const root = document.documentElement;
  const rand = (n) => crypto.getRandomValues(new Uint8Array(n));
  const b64u = {
    enc: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    dec: (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0)),
  };

  async function faceIdAvailable() {
    try {
      return !!(window.isSecureContext && window.PublicKeyCredential &&
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
    } catch { return false; }
  }

  async function enableFaceId() {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: rand(32),
        rp: { name: 'Net Worth', id: location.hostname },
        user: { id: rand(16), name: 'Net Worth app lock', displayName: 'Net Worth' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
        attestation: 'none',
        timeout: 60000,
      },
    });
    state.settings.faceId = { id: b64u.enc(cred.rawId) };
    state.settings.faceIdOffered = true;
    save();
  }

  async function verifyFaceId(signal) {
    const fid = state.settings.faceId;
    if (!fid) return true;
    const a = await navigator.credentials.get({
      signal,
      publicKey: {
        challenge: rand(32),
        rpId: location.hostname,
        allowCredentials: [{ type: 'public-key', id: b64u.dec(fid.id), transports: ['internal'] }],
        userVerification: 'required',
        timeout: 60000,
      },
    });
    // Byte 32 of authenticatorData holds the flags; 0x04 = user verified (Face ID / passcode).
    if (!(new Uint8Array(a.response.authenticatorData)[32] & 0x04)) throw new Error('Not verified');
    return true;
  }

  const isLocked = () => root.classList.contains('locked');
  function lock() {
    if (!state.settings.faceId) return;
    closeSheet();
    $('#lockMsg').textContent = '';
    $('#lockHelp').hidden = true;
    root.classList.add('locked');
  }
  function unlock() { root.classList.remove('locked', 'shield'); render(); }

  let pending = null; // AbortController of the Face ID request in flight
  async function tryUnlock() {
    if (!isLocked()) return;
    pending?.abort(); // a tap replaces any prompt that is still waiting
    const ctl = pending = new AbortController();
    $('#lockMsg').textContent = '';
    try {
      await verifyFaceId(ctl.signal);
      if (ctl === pending) unlock();
    } catch (e) {
      if (ctl !== pending || e.name === 'AbortError') return;
      $('#lockMsg').textContent = e.name === 'NotAllowedError' ? 'Tap the button to try again.' : "Couldn't verify — try again.";
    } finally { if (ctl === pending) pending = null; }
  }

  function offerFaceId() {
    state.settings.faceIdOffered = true; save();
    openSheet(`
      <div class="sheet-body offer">
        <div class="empty-icon">${ICONS.face}</div>
        <h3 style="margin:6px 0 0">Lock with Face ID?</h3>
        <p class="muted" style="margin:0">Require Face ID each time you open Net Worth, so nobody else can see your balances. You can change this any time in Settings.</p>
        <button class="primary-btn face-btn" id="oOn">${ICONS.face}<span>Turn on Face ID</span></button>
        <button class="ghost-btn" id="oLater">Not now</button>
      </div>`, (r) => {
      $('#oLater', r).onclick = closeSheet;
      $('#oOn', r).onclick = async () => {
        try { await enableFaceId(); closeSheet(); toast('Face ID lock is on'); }
        catch (e) { if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') toast("Couldn't set up Face ID"); }
      };
    });
  }

  $('#btnUnlock').onclick = tryUnlock;
  $('#btnLockHelp').onclick = () => { $('#lockHelp').hidden = !$('#lockHelp').hidden; };
  $('#btnLockReset').onclick = () => {
    if (!confirm('Erase all accounts and history on this device and turn off the Face ID lock?')) return;
    eraseAll(); unlock(); toast('Data erased — restore a backup from Settings');
  };

  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      if (state.settings.faceId && !isLocked()) root.classList.add('shield'); // blur the app-switcher snapshot
      return;
    }
    root.classList.remove('shield');
    if (state.settings.faceId && !isLocked() && Date.now() - hiddenAt > LOCK_GRACE_MS) { lock(); tryUnlock(); return; }
    if (!isLocked()) render();
    syncPlaid();
  });

  render();
  syncPlaid();
  if (state.settings.faceId) { lock(); tryUnlock(); }
  else if (!state.settings.faceIdOffered && state.accounts.length) {
    faceIdAvailable().then((ok) => { if (ok) offerFaceId(); });
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
