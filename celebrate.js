/* Net Worth — 16-bit celebration that takes over the screen when money moves.
 * Four separate animations; each celebration plays the next one in turn:
 *   coins:  gold coins rain down  ("cha-ching!")
 *   god:    a pocket-sized sky god lands with a thunderclap, says "OH YA!",
 *           puts on shades and rides off in a chariot pulled by rainbow unicorns
 *   rocket: he rides a rocket to the moon
 *   sumo:   two sumo wrestlers collide in an explosion, faint, and coins pour out of their belly buttons
 * Everything is drawn on a tiny canvas and scaled up with crisp pixels; all sounds are
 * synthesized with Web Audio, so there are no files to download. Tap to skip.
 */
(() => {
  'use strict';

  const W = 160;                                   // art width in "pixels"; height follows the screen

  // ------------------------------------------------------------------ palette + sprites
  const PAL = {
    k: '#1a1020', w: '#ffffff', W: '#dfe6f2', g: '#c3cad6', G: '#6b7480',
    y: '#ffd23f', Y: '#fff3a0', o: '#c98a10', s: '#f4c49c', S: '#d99a6c',
    b: '#ffd84a', B: '#c9922a', r: '#e0303f', R: '#8e1a2b', u: '#3566d6', U: '#1f3d8a',
    n: '#7a4a25', m: '#111111', p: '#ff9fc4',
    v: '#1f6b3a', V: '#34a35a', O: '#ff9a1f', q: '#c86a10', x: '#19c24f',
    1: '#ff3b3b', 2: '#ff9f1c', 3: '#ffe23b', 4: '#38d96b', 5: '#3b8bff', 6: '#a64dff',
  };
  const RAINBOW = ['#ff3b3b', '#ff9f1c', '#ffe23b', '#38d96b', '#3b8bff', '#a64dff'];

  function sprite(rows) {
    const w = Math.max(...rows.map((r) => r.length));
    const c = document.createElement('canvas');
    c.width = w; c.height = rows.length;
    const x = c.getContext('2d');
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(i, j, 1, 1); }
    }));
    return c;
  }

  let S = null; // sprites, built on first use
  function build() {
    if (S) return;
    S = {
      god: sprite([
        '..w..........w..',
        '.ww...gggg...ww.',
        '.www.gggggg.www.',
        '..wwggggggggww..',
        '....kggggggk....',
        '...bbssssssbb...',
        '...bsksssskSb...',
        '...bssssssssb...',
        '...bbsbbbbsbb...',
        '....bbbbbbbb....',
        '.....bbbbbb.....',
        '...rruuyyuurr...',
        '..rruuuyyuuurr..',
        '.rrsuuuuuuuusrr.',
        '.rrsuuyyyyuusrr.',
        '.rr.uuuuuuuu.rr.',
        '.rr.UUUUUUUU.rr.',
        '.rr.UUU..UUU.rr.',
        '..r.UUU..UUU.r..',
        '....ggg..ggg....',
        '...gggg..gggg...',
      ]),
      hammer: sprite([
        'kkkkkkkk',
        'kgggggGk',
        'kgwggGGk',
        'kgggggGk',
        'kkkkkkkk',
        '...nn...',
        '...nn...',
        '...nn...',
        '...yy...',
      ]),
      shades: sprite([
        'mmmmmmmm',
        '.mwm.mwm'.replace(/w/g, 'm'),
        '.mm...mm',
      ]),
      unicornA: sprite([
        '..............y.....',
        '.............yy.....',
        '...........12www....',
        '..........123wwkw...',
        '.........1234wwwww..',
        '........12345wwwwpp.',
        '...123..2345wwww....',
        '..1234.wwwwwwwww....',
        '.12345wwwwwwwwww....',
        '.2345.wwwwwwwwwW....',
        '..456.wwwwwwwwwW....',
        '.......w.w....w.w...',
        '.......w.w....w.w...',
        '.......k.k....k.k...',
      ]),
      unicornB: sprite([
        '..............y.....',
        '.............yy.....',
        '...........12www....',
        '..........123wwkw...',
        '.........1234wwwww..',
        '........12345wwwwpp.',
        '...123..2345wwww....',
        '..1234.wwwwwwwww....',
        '.12345wwwwwwwwww....',
        '.2345.wwwwwwwwwW....',
        '..456.wwwwwwwwwW....',
        '......w...w..w...w..',
        '.....w.....w.w....w.',
        '.....k.....k.k....k.',
      ]),
      chariot: sprite([
        'kkkkkkkkkk......',
        'kyyyyyyyyyk.....',
        'kyYYyyyyyyyk....',
        'kyyyyyyyyyyyk...',
        'koooooooooooookk',
        '.kyyyyyyyyyyk...',
        '..kkkkkkkkkk....',
      ]),
      wheelA: sprite([
        '..kkkk..',
        '.k..y.k.',
        'k...y..k',
        'kyyyyyyk',
        'k...y..k',
        '.k..y.k.',
        '..kkkk..',
      ]),
      wheelB: sprite([
        '..kkkk..',
        '.ky..yk.',
        'k.y..y.k',
        'k..yy..k',
        'k.y..y.k',
        '.ky..yk.',
        '..kkkk..',
      ]),
      rocket: sprite([
        '.....rr.....',
        '....rrrr....',
        '...rrrrrr...',
        '...wwwwww...',
        '..wwwwwwww..',
        '..wwgGGgww..',
        '..wgUuuUgw..',
        '..wgUuuUgw..',
        '..wwgGGgww..',
        '..wwwwwwww..',
        '..wwwwwwww..',
        '..wwrrrrww..',
        '..wwwwwwww..',
        '..wwwwwwww..',
        '.rwwwwwwwwr.',
        'rrwwwwwwwwrr',
        'rr.gGGGGg.rr',
        'r...gGGg...r',
      ]),
      coins: [8, 6, 4, 2, 4, 6].map(coinFrame),
      duckGreen: duckSprite('x'),
      duckGold: duckSprite('y'),
      sumoBlueA: sumoSprite('u', 0), sumoBlueB: sumoSprite('u', 1),
      sumoRedA: sumoSprite('r', 0), sumoRedB: sumoSprite('r', 1),
      faintBlue: faintSprite('u'), faintRed: faintSprite('r'),
    };
  }

  /** Our rich duck, facing you: green top hat with a gold band, bow tie, and $ signs for eyes. */
  function duckSprite(eye) {
    const dollar = ['.x.', 'xxx', 'x..', 'xxx', '..x', 'xxx', '.x.'].map((r) => r.replace(/\./g, 'w').replace(/x/g, eye));
    return sprite([
      '......kkkkkkkkkk......',
      '......kvVvvvvvvk......',
      '......kvVvvvvvvk......',
      '......kvVvvvvvvk......',
      '......kyyyyyyyyk......',
      '...kkkkkkkkkkkkkkkk...',
      '....kwwwwwwwwwwwwk....',
      '...kwwwwwwwwwwwwwwk...',
      '..kwkkkkkkkkkkkkkkwk..',
      ...dollar.map((d) => `..kwkw${d}wkkw${d}wkwk..`),
      '..kwkkkkkkkkkkkkkkwk..',
      '..kwwwOOOOOOOOOOwwwk..',
      '...kwOOOOOOOOOOOOwk...',
      '...kwwkqqqqqqqqkwwk...',
      '....kwwkkkkkkkkwwk....',
      '...kwwwwrrkrrwwwwk....',
      '..kWwwwwwwwwwwwwwwWk..',
      '.kWwwwwwwwwwwwwwwwwWk.',
      '.kWwwwwwwwwwwwwwwwwWk.',
    ]);
  }

  /** Sumo wrestler, side view facing right. `belt` colours the mawashi; `step` alternates the legs. */
  function sumoSprite(belt, step) {
    const legs = step
      ? ['...sMMMM...MMMMs...', '...sss.......sss...', '....sss.....sss....', '...SSSS.....SSSS...']
      : ['..ssMMMM...MMMMss..', '..ssss.......ssss..', '..ssss.......ssss..', '.SSSSS.......SSSSS.'];
    return sprite([
      '.......kk..........',
      '......kkkk.........',
      '....kkkkkks........',
      '...kkkssssss.......',
      '...kksssssksS......',
      '...ksssssssss......',
      '....sssssssSS......',
      '..SSsssssssssss....',
      '.SssssssssssssssS..',
      'SsssssssssssssssssS',
      'Ssssssssssssssssssss',
      'SssssssssssssskssssS',
      '.SsssssssssssssssS.',
      '.MMMMMMMMMMMMMMMMM.',
      '..MMMMMMMMMMMMMMM..',
      ...legs,
    ].map((r) => r.replace(/M/g, belt)));
  }

  /** Fainted sumo lying on his back, head on the left; belly button at (13, 2). */
  function faintSprite(belt) {
    return sprite([
      '...........SSSSS..........',
      '.........SSsssssSS........',
      '........SssssksssssS......',
      '..kk...SsssssssssssS......',
      '.kkkk.SsssssssssssssS..SS.',
      'kkssSssssssssssssssssSSss.',
      'kssssssssssssssssssssssss.',
      'ksssssMMMMMMMMMMMMMsssss..',
      '.sssSsMMMMMMMMMMMMMSsss...',
      '..SS...SSSSSSSSSSS...SS...',
    ].map((r) => r.replace(/M/g, belt)));
  }

  function coinFrame(w) {
    const c = document.createElement('canvas');
    c.width = 8; c.height = 8;
    const x = c.getContext('2d');
    const inside = (i, j) => {
      const rx = Math.max(w / 2, 0.6);
      return ((i + 0.5 - 4) / rx) ** 2 + ((j + 0.5 - 4) / 4) ** 2 <= 1;
    };
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
      if (!inside(i, j)) continue;
      const edge = !inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1);
      x.fillStyle = edge ? PAL.o : PAL.y;
      x.fillRect(i, j, 1, 1);
    }
    if (w >= 4) { x.fillStyle = PAL.Y; x.fillRect(4 - Math.floor(w / 4), 2, 1, 2); }
    return c;
  }

  // ------------------------------------------------------------------ pixel font (5x7)
  const FONT = {
    A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
    C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
    E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
    H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
    K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
    M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
    O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
    T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
    '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
    '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
    ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  };
  const textWidth = (str, s) => str.length * 6 * s - s;
  /** color can be a string or (charIndex) => string; wave(charIndex) gives a y offset. */
  function text(ctx, str, x, y, s, color, { outline = '#1a1020', wave } = {}) {
    [...str].forEach((ch, i) => {
      const g = FONT[ch] || FONT[' '];
      const gx = Math.round(x + i * 6 * s);
      const gy = Math.round(y + (wave ? wave(i) : 0));
      for (const [ox, oy, col] of [[-1, 0, outline], [1, 0, outline], [0, -1, outline], [0, 1, outline], [1, 1, outline], [0, 0, null]]) {
        ctx.fillStyle = col || (typeof color === 'function' ? color(i) : color);
        g.forEach((row, j) => [...row].forEach((p, k) => {
          if (p === '#') ctx.fillRect(gx + k * s + ox, gy + j * s + oy, s, s);
        }));
      }
    });
  }

  // ------------------------------------------------------------------ small drawing helpers
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const easeOut = (k) => 1 - (1 - k) ** 3;
  const easeIn = (k) => k ** 3;
  function draw(ctx, spr, x, y, s = 1) { ctx.drawImage(spr, Math.round(x), Math.round(y), spr.width * s, spr.height * s); }
  function drawFlipped(ctx, spr, x, y, s = 1) {
    ctx.save();
    ctx.translate(Math.round(x) + spr.width * s, Math.round(y));
    ctx.scale(-1, 1);
    ctx.drawImage(spr, 0, 0, spr.width * s, spr.height * s);
    ctx.restore();
  }
  function rect(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function disc(ctx, cx, cy, r, c) {
    ctx.fillStyle = c;
    for (let j = -r; j <= r; j++) {
      const half = Math.floor(Math.sqrt(r * r - j * j));
      ctx.fillRect(Math.round(cx - half), Math.round(cy + j), half * 2 + 1, 1);
    }
  }
  function spark(ctx, x, y, size, c) {
    rect(ctx, x - size, y, size * 2 + 1, 1, c);
    rect(ctx, x, y - size, 1, size * 2 + 1, c);
  }
  function line(ctx, x0, y0, x1, y1, c, w = 1) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0;
    ctx.fillStyle = c;
    for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, w);
  }
  function bands(ctx, H, top, cols, alpha = 1) {
    ctx.globalAlpha = alpha;
    const h = Math.ceil(top / cols.length);
    cols.forEach((c, i) => rect(ctx, 0, i * h, W, h + 1, c));
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ scenes
  function makeScenes(H) {
    // Coin rain: lots of coins that land on a pile (a height per 4px column), so the
    // screen fills up with a sea of gold. Landed coins are painted once onto `pile`.
    const COLS = W / 4;
    const heights = new Array(COLS + 1).fill(0);
    const maxPile = Math.round(H * 0.55);
    const pile = document.createElement('canvas');
    pile.width = W; pile.height = H;
    const pctx = pile.getContext('2d');
    const coins = Array.from({ length: 950 }, (_, i) => ({
      x: rnd(-4, W - 4), y: rnd(-60, -10), vx: rnd(-10, 10), vy: rnd(40, 110),
      delay: (i / 950) ** 0.8 * 2600 + rnd(0, 120), spin: rnd(0.6, 1.6), phase: Math.floor(rnd(0, 6)), done: false,
    }));
    const surfaceAt = (x) => {
      const c = Math.max(0, Math.min(COLS - 1, Math.floor(x / 4)));
      return H - Math.max(heights[c], heights[c + 1]);
    };
    function land(c) {
      // settle into the lowest spot nearby, like coins sliding down a heap
      let col = Math.max(0, Math.min(COLS - 2, Math.floor((c.x + 4) / 4)));
      let best = col;
      for (let d = -3; d <= 3; d++) {
        const k = col + d;
        if (k < 0 || k > COLS - 2) continue;
        if (Math.max(heights[k], heights[k + 1]) < Math.max(heights[best], heights[best + 1])) best = k;
      }
      const top = Math.max(heights[best], heights[best + 1]);
      pctx.drawImage(S.coins[Math.random() < 0.7 ? 0 : 5], best * 4, H - top - 7);
      // fill any gaps underneath (behind the coins already there) so the pile looks solid
      pctx.globalCompositeOperation = 'destination-over';
      pctx.fillStyle = '#b97c0e';
      pctx.fillRect(best * 4, H - top - 2, 8, top + 2);
      pctx.globalCompositeOperation = 'source-over';
      if (top < maxPile) heights[best] = heights[best + 1] = top + 3;
      c.done = true;
    }
    let splash = [];

    const stars = Array.from({ length: 70 }, () => ({ x: rnd(0, W), y: rnd(0, H), tw: rnd(0, 6.28), big: Math.random() < 0.15 }));
    const sparkles = Array.from({ length: 18 }, () => ({ x: rnd(4, W - 4), y: rnd(4, H * 0.8), p: rnd(0, 6.28) }));
    const clouds = Array.from({ length: 5 }, (_, i) => ({ x: rnd(-20, W), y: 6 + i * 9 + rnd(0, 6), w: rnd(26, 46), v: rnd(3, 8) }));
    let smoke = [];
    let bolt = [], boltAt = -1;

    const gY = Math.round(H * 0.74);          // ground line
    const gx = W / 2 - 16;                     // god x (scale 2 → 32 wide)
    const gy = gY - 42;                        // standing y

    function coinsScene(ctx, t, dt) {
      rect(ctx, 0, 0, W, H, `rgba(24,12,48,${Math.min(0.97, t / 250 * 0.97)})`);
      for (const sp of sparkles) {
        const a = (Math.sin(t / 120 + sp.p) + 1) / 2;
        if (a > 0.6) spark(ctx, sp.x, sp.y, a > 0.85 ? 2 : 1, '#fff3a0');
      }
      // falling coins behind the pile
      for (const c of coins) {
        if (c.done || t < c.delay) continue;
        c.vy += 340 * dt; c.y += c.vy * dt; c.x = Math.max(-2, Math.min(W - 6, c.x + c.vx * dt));
        if (c.y + 8 >= surfaceAt(c.x + 4)) land(c);
        else draw(ctx, S.coins[(Math.floor(t / 70 * c.spin) + c.phase) % 6], c.x, c.y);
      }

      // the duck pops out of the middle and swims around in the coins
      const D0 = 2300;
      if (t > D0) {
        const st = t - D0;
        const swim = clamp01((st - 450) / 400);
        const dx = W / 2 + Math.sin(st / 650) * (W / 2 - 26) * swim;
        const surf = surfaceAt(dx);
        const rise = easeOut(clamp01(st / 450));
        const dy = surf - 44 * rise + 12 * (1 - rise) + Math.sin(st / 140) * 2; // head, beak and bow tie above the coins
        const tilt = Math.cos(st / 650) * swim;
        draw(ctx, Math.floor(t / 150) % 2 ? S.duckGreen : S.duckGold, dx - 22 + tilt * 2, dy, 2);
        // coin splashes: a big one when he surfaces, then a little wake as he swims
        if (st < 60 && !splash.big) {
          splash.big = true;
          for (let i = 0; i < 26; i++) splash.push({ x: dx + rnd(-10, 10), y: surf, vx: rnd(-70, 70), vy: rnd(-200, -90), f: Math.floor(rnd(0, 6)) });
        }
        if (swim > 0 && Math.random() < 0.35) {
          const back = -Math.sign(Math.cos(st / 650)) || 1;
          splash.push({ x: dx + back * 18, y: surf, vx: back * rnd(20, 60), vy: rnd(-110, -50), f: Math.floor(rnd(0, 6)) });
        }
      }
      // the pile itself (drawn over the duck so he sits *in* the coins)
      ctx.drawImage(pile, 0, 0);
      splash = Object.assign(splash.filter((p) => {
        p.vy += 380 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        draw(ctx, S.coins[(p.f + Math.floor(t / 60)) % 6], p.x, p.y);
        return p.y < surfaceAt(p.x + 4) + 2;
      }), { big: splash.big });

      if (t > 120) {
        const k = clamp01((t - 120) / 220);
        const sc = 2;
        const str = 'CHA-CHING!';
        const y = H * 0.11 - 30 * (1 - easeOut(k)) + Math.sin(t / 140) * 2;
        text(ctx, str, (W - textWidth(str, sc)) / 2, y, sc, (i) => ((Math.floor(t / 90) + i) % 2 ? '#ffd23f' : '#fff3a0'));
      }
    }

    function godScene(ctx, t, dt) {
      // sky: stormy, then a sunset once the shades go on
      bands(ctx, H, gY, ['#0b0920', '#151036', '#1f1650', '#2a1d62', '#352470', '#40297a']);
      bands(ctx, H, gY, ['#3b1f6b', '#6b2d86', '#a43a8a', '#e05a7a', '#ff8a5c', '#ffc163'], clamp01((t - 2300) / 900));
      for (const c of clouds) {
        c.x += c.v * dt; if (c.x > W + 10) c.x = -c.w;
        rect(ctx, c.x, c.y, c.w, 4, 'rgba(120,110,170,.55)');
        rect(ctx, c.x + 5, c.y - 3, c.w - 12, 3, 'rgba(140,130,190,.55)');
      }
      // ground with pixel grass
      rect(ctx, 0, gY, W, H - gY, '#2f8f3a');
      rect(ctx, 0, gY, W, 2, '#58c95a');
      for (let x = 0; x < W; x += 6) rect(ctx, x + ((x / 6) % 2) * 2, gY + 5 + ((x * 7) % 9), 2, 1, '#237030');

      // screen shake on landing
      const shaking = t > 650 && t < 900;
      ctx.save();
      if (shaking) ctx.translate(Math.round(rnd(-2, 2)), Math.round(rnd(-2, 2)));

      // lightning strike
      if (t > 300 && t < 780) {
        if (t - boltAt > 60) {
          boltAt = t; bolt = [];
          let x = W / 2 + rnd(-10, 10);
          for (let y = 0; y < gy + 20; y += 8) { bolt.push([x, y]); x += rnd(-7, 7); }
          bolt.push([W / 2, gy + 20]);
        }
        for (let i = 1; i < bolt.length; i++) {
          line(ctx, bolt[i - 1][0] - 1, bolt[i - 1][1], bolt[i][0] - 1, bolt[i][1], '#7fd4ff', 3);
          line(ctx, bolt[i - 1][0], bolt[i - 1][1], bolt[i][0], bolt[i][1], '#ffffff', 1);
        }
      }

      // where is our hero?
      let x = gx, y = gy;
      const enterK = clamp01((t - 3000) / 900), rideK = clamp01((t - 4300) / 1500);
      const chariotStop = gx;
      let cx = -100 + (chariotStop + 100) * easeOut(enterK);
      cx += (W + 140) * easeIn(rideK);
      const seatY = gY - 46;
      if (t < 300) y = -60;
      else if (t < 650) y = -45 + (gy + 45) * easeIn((t - 300) / 350);
      else if (t >= 3900 && t < 4200) { const k = (t - 3900) / 300; y = gy + (seatY - gy) * k - 18 * Math.sin(Math.PI * k); }
      else if (t >= 4200) y = seatY;
      if (t >= 4200) x = cx;

      // the god (drawn before the chariot so his legs are hidden inside it)
      if (t >= 300) {
        draw(ctx, S.god, x, y, 2);
        draw(ctx, S.hammer, x + 26, y - 8 + (t > 650 && t < 3900 ? Math.round(Math.sin(t / 90)) : 0), 2);
        if (t > 650 && t < 1300) for (let i = 0; i < 3; i++) spark(ctx, x + 30 + rnd(0, 16), y - 10 + rnd(0, 12), 1, Math.random() < 0.5 ? '#7fd4ff' : '#ffffff');
        // shades drop onto his face
        if (t > 2300) {
          const k = clamp01((t - 2300) / 350);
          const sy = -10 + (y + 12 + 10) * easeIn(k);
          draw(ctx, S.shades, x + 8, Math.min(sy, y + 12), 2);
          if (t > 2650 && t < 3100) {
            const a = (t - 2650) / 450;
            spark(ctx, x + 24, y + 10, Math.round(3 * Math.sin(Math.PI * a)) + 1, '#ffffff');
          }
        }
      }

      // dust when he lands
      if (t > 650 && t < 1100) {
        const k = (t - 650) / 450;
        for (let i = 0; i < 6; i++) {
          const side = i % 2 ? 1 : -1, d = 6 + k * (16 + i * 4);
          disc(ctx, W / 2 + side * d, gY - 2 - (i >> 1) * 2 - k * 4, Math.max(1, Math.round(4 * (1 - k))), 'rgba(220,210,190,.8)');
        }
      }

      // rainbow trail, chariot and unicorns
      if (t > 2950) {
        const moving = enterK < 1 || rideK > 0;
        const step = Math.floor(t / 90) % 2;
        if (rideK > 0) RAINBOW.forEach((c, i) => rect(ctx, 0, gY - 22 + i * 2, Math.max(0, cx), 2, c));
        const ux = cx + 34, uy = gY - 28;
        draw(ctx, moving && step ? S.unicornA : S.unicornB, ux + 10, uy - 5, 2);
        line(ctx, cx + 30, gY - 18, ux + 22, uy + 14, '#7a4a25');
        draw(ctx, moving && step ? S.unicornB : S.unicornA, ux, uy, 2);
        draw(ctx, S.chariot, cx, gY - 20, 2);
        draw(ctx, moving && Math.floor(t / 70) % 2 ? S.wheelB : S.wheelA, cx + 6, gY - 14, 2);
        if (moving) for (let i = 0; i < 2; i++) spark(ctx, ux + rnd(0, 40), gY - rnd(0, 6), 1, RAINBOW[(i + Math.floor(t / 60)) % 6]);
      }

      // speech bubble
      if (t > 900 && t < 2500) {
        const str = 'OH YA!', s = 2;
        const pop = Math.sin(clamp01((t - 900) / 160) * Math.PI) * -4;
        const bw = textWidth(str, s) + 12, bh = 24;
        const bx = Math.round(W / 2 - bw / 2), by = Math.round(gy - 40 + pop);
        rect(ctx, bx + 1, by, bw - 2, bh, '#1a1020');
        rect(ctx, bx, by + 1, bw, bh - 2, '#1a1020');
        rect(ctx, bx + 2, by + 1, bw - 4, bh - 2, '#ffffff');
        rect(ctx, bx + 1, by + 2, bw - 2, bh - 4, '#ffffff');
        for (let i = 0; i < 4; i++) rect(ctx, W / 2 - 4 + i, by + bh - 1 + i, 4 - i, 1, i === 3 ? '#1a1020' : '#ffffff');
        text(ctx, str, bx + 6, by + 5, s, (i) => (i < 2 ? '#e0303f' : '#3566d6'), { outline: '#ffffff' });
      }
      ctx.restore();

      // lightning flash
      const flash = Math.max(t > 300 ? 1 - (t - 300) / 140 : 0, t > 480 ? 0.7 - (t - 480) / 120 : 0);
      if (flash > 0) rect(ctx, 0, 0, W, H, `rgba(255,255,255,${Math.min(1, flash)})`);
    }

    function rocketScene(ctx, t, dt) {
      const k = clamp01(t / 3200);
      rect(ctx, 0, 0, W, H, '#05040f');
      const speed = 20 + 260 * easeIn(clamp01((t - 900) / 2300));
      for (const s of stars) {
        s.y += speed * dt * (s.big ? 1.4 : 1); if (s.y > H) { s.y = 0; s.x = rnd(0, W); }
        const on = Math.sin(t / 150 + s.tw) > -0.3;
        if (on) rect(ctx, s.x, s.y, 1, s.big ? 2 + Math.round(speed / 120) : 1 + Math.round(speed / 200), s.big ? '#ffffff' : '#9aa6ff');
      }
      // the moon
      disc(ctx, W - 30, 30, 19, 'rgba(255,240,200,.15)');
      disc(ctx, W - 30, 30, 17, '#e9e4cf');
      disc(ctx, W - 36, 24, 4, '#cfc8ad'); disc(ctx, W - 24, 36, 5, '#cfc8ad'); disc(ctx, W - 22, 22, 2, '#cfc8ad');

      const rs = 3, rw = 12 * rs, rh = 18 * rs;
      // lift off into view quickly, hover-rumble for a beat, then blast up past the top
      const pad = H - rh - 30;
      const ry = t < 600 ? H + 10 - (H + 10 - pad) * easeOut(t / 600)
        : pad - (pad + rh + 80) * easeIn(clamp01((t - 900) / 2300));
      const rx = W / 2 - rw / 2 + (t < 2600 ? Math.round(rnd(-1, 1)) : 0);
      // smoke
      if (Math.random() < 0.7) smoke.push({ x: W / 2 + rnd(-8, 8), y: ry + rh + 16, r: rnd(2, 4), v: rnd(10, 30) });
      smoke = smoke.filter((p) => (p.r += 6 * dt, p.y += p.v * dt, p.r < 14));
      for (const p of smoke) disc(ctx, p.x, p.y, Math.round(p.r), 'rgba(170,170,190,.35)');
      // flame
      const fl = 10 + Math.round(rnd(0, 10)) + Math.round(k * 10);
      for (let j = 0; j < fl; j++) {
        const half = Math.max(1, Math.round(8 * (1 - j / fl)) + Math.round(rnd(-1, 1)));
        rect(ctx, W / 2 - half, ry + rh + j, half * 2, 1, j < fl * 0.3 ? '#fff3a0' : j < fl * 0.6 ? '#ffb020' : '#ff4d2e');
      }
      // our hero rides on top
      draw(ctx, S.god, W / 2 - 16, ry - 28, 2);
      draw(ctx, S.shades, W / 2 - 8, ry - 16, 2);
      draw(ctx, S.hammer, W / 2 + 10, ry - 36, 2);
      draw(ctx, S.rocket, rx, ry, rs);

      if (t > 250) {
        const str = 'TO THE MOON!', s = 2;
        const pk = clamp01((t - 250) / 250);
        text(ctx, str, (W - textWidth(str, s)) / 2, H * 0.42 + 24 * (1 - easeOut(pk)), s,
          (i) => RAINBOW[(i + Math.floor(t / 80)) % RAINBOW.length],
          { wave: (i) => Math.round(Math.sin(t / 110 + i * 0.7) * 3) });
      }
    }

    // ---------------- sumo: stomp, charge, KABOOM, faint, coins from belly buttons
    const floorY = Math.round(H * 0.72);
    const Z = 3;                                       // sumo pixel scale
    const SW = 19 * Z, SH = 19 * Z, FW = 26 * Z, FH = 10 * Z;
    const meetL = W / 2 - SW + 3, meetR = W / 2 - 3;   // x where they touch
    const restL = 1, restR = W - FW - 1;               // where they land, fainted
    const crowd = Array.from({ length: 46 }, (_, i) => ({ x: (i * 3.5) % W, y: floorY - 40 - (i % 3) * 7 - rnd(0, 3), c: ['#5a2d3a', '#6b3846', '#4a2533'][i % 3] }));
    let debris = [], puffs = [], bellyCoins = [], lastSpawn = 0;

    function sumoScene(ctx, t, dt) {
      const HIT = 1700;
      // arena: dark red hall, crowd, clay ring with a rope circle
      bands(ctx, H, floorY, ['#1a0a12', '#240d18', '#2e111f', '#3a1626', '#47192d']);
      for (const p of crowd) disc(ctx, p.x, p.y, 3, p.c);
      for (let i = 0; i < 4; i++) { // hanging lanterns
        const lx = 18 + i * 42;
        rect(ctx, lx, 0, 1, 10, '#3a2a1a');
        disc(ctx, lx, 16, 6, (Math.floor(t / 300) + i) % 2 ? '#ff5a3c' : '#ff7a4c');
        rect(ctx, lx - 3, 14, 7, 1, '#ffd23f');
      }
      rect(ctx, 0, floorY, W, H - floorY, '#c9a46b');
      rect(ctx, 0, floorY, W, 2, '#e3c38a');
      for (let x = 0; x < W; x += 5) rect(ctx, x, floorY + 6 + ((x * 13) % 11), 2, 1, '#b08c55');
      for (let a = 0; a < Math.PI * 2; a += 0.02) rect(ctx, W / 2 + Math.cos(a) * 70, floorY + 12 + Math.sin(a) * 7, 2, 1, '#f3ead2');

      ctx.save();
      if (t > HIT && t < HIT + 450) ctx.translate(Math.round(rnd(-3, 3)), Math.round(rnd(-3, 3)));

      if (t < HIT) {
        // stomp in place, then charge
        let xl = 6, xr = W - SW - 6, yl = floorY - SH, yr = floorY - SH;
        const step = Math.floor(t / 110) % 2;
        if (t < 1100) {
          yl -= Math.max(0, Math.sin(Math.min(1, ((t - 200) % 400) / 400) * Math.PI)) * (t > 200 ? 5 : 0);
          yr -= Math.max(0, Math.sin(Math.min(1, ((t - 400) % 400) / 400) * Math.PI)) * (t > 400 ? 5 : 0);
          draw(ctx, S.sumoBlueA, xl, yl, Z);
          drawFlipped(ctx, S.sumoRedA, xr, yr, Z);
        } else {
          const k = easeIn(clamp01((t - 1100) / (HIT - 1100)));
          xl += (meetL - xl) * k; xr += (meetR - xr) * k;
          draw(ctx, step ? S.sumoBlueA : S.sumoBlueB, xl, yl - step, Z);
          drawFlipped(ctx, step ? S.sumoRedB : S.sumoRedA, xr, yr - (1 - step), Z);
          if (Math.random() < 0.35) puffs.push({ x: xl + 8, y: floorY - 2, r: 2, v: -10 }, { x: xr + SW - 8, y: floorY - 2, r: 2, v: -10 });
        }
      } else {
        // blown apart, then fainted on their backs
        const k = clamp01((t - HIT) / 520);
        const flying = k < 1;
        if (flying) {
          const arc = Math.sin(Math.PI * k) * 26;
          const xl = meetL + (restL - meetL) * easeOut(k), xr = meetR + (restR + FW - SW - meetR) * easeOut(k);
          ctx.save(); ctx.translate(xl + SW / 2, floorY - SH / 2 - arc); ctx.rotate(-k * 5);
          draw(ctx, S.sumoBlueA, -SW / 2, -SH / 2, Z); ctx.restore();
          ctx.save(); ctx.translate(xr + SW / 2, floorY - SH / 2 - arc); ctx.rotate(k * 5);
          drawFlipped(ctx, S.sumoRedA, -SW / 2, -SH / 2, Z); ctx.restore();
        } else {
          const bounce = Math.round(Math.abs(Math.sin((t - HIT - 520) / 90)) * 4 * Math.max(0, 1 - (t - HIT - 520) / 500));
          const fy = floorY - FH - bounce;
          draw(ctx, S.faintBlue, restL, fy, Z);
          drawFlipped(ctx, S.faintRed, restR, fy, Z);
          // X eyes
          for (const hx of [restL + 2 * Z, restR + FW - 4 * Z]) {
            for (const [dx, dy] of [[0, 0], [2, 2], [2, 0], [0, 2], [1, 1]]) rect(ctx, hx + dx, fy + 5 * Z + dy, 1, 1, '#1a1020');
          }
          // dizzy stars
          for (const [hx, ph] of [[restL + 3 * Z, 0], [restR + FW - 3 * Z, 1.7]]) {
            for (let i = 0; i < 3; i++) {
              const a = t / 220 + ph + i * 2.09;
              spark(ctx, hx + Math.cos(a) * 11, fy + 3 + Math.sin(a) * 4, 1, i === 1 ? '#ffffff' : '#ffd23f');
            }
          }
          // coins fountain out of their belly buttons
          const navels = [[restL + 13 * Z + 1, fy + 2 * Z + 1], [restR + FW - 13 * Z - 2, fy + 2 * Z + 1]];
          if (t > 2500 && t < 5300 && t - lastSpawn > 22 && bellyCoins.length < 420) {
            lastSpawn = t;
            for (const [nx, ny] of navels) bellyCoins.push({ x: nx - 4, y: ny - 6, vx: rnd(-45, 45), vy: rnd(-260, -170), f: Math.floor(rnd(0, 6)), rest: false });
          }
          for (const [nx, ny] of navels) if (t > 2500 && t < 5300) spark(ctx, nx, ny - 2, Math.random() < 0.5 ? 1 : 2, '#fff3a0');
        }
      }

      // explosion: flash, fireball rings, debris and smoke
      if (t >= HIT && !debris.started) {
        debris.started = true;
        for (let i = 0; i < 46; i++) {
          const a = rnd(0, Math.PI * 2), sp = rnd(60, 190);
          debris.push({ x: W / 2, y: floorY - 20, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, c: ['#ffd23f', '#ff9f1c', '#ff4d2e', '#fff3a0', '#6b7480'][i % 5], life: rnd(0.6, 1.3) });
        }
      }
      if (t >= HIT) {
        const k = (t - HIT) / 650;
        if (k < 1) {
          const cx = W / 2, cy = floorY - 20, R = 6 + 46 * easeOut(k);
          disc(ctx, cx, cy, Math.round(R), `rgba(255,77,46,${1 - k})`);
          disc(ctx, cx, cy, Math.round(R * 0.72), `rgba(255,159,28,${1 - k * 0.8})`);
          disc(ctx, cx, cy, Math.round(R * 0.45), `rgba(255,243,160,${1 - k * 0.6})`);
          if (k < 0.45 && Math.random() < 0.5) puffs.push({ x: cx + rnd(-R, R) * 0.5, y: cy + rnd(-R, R) * 0.3, r: rnd(3, 5), v: rnd(-40, -20) });
        }
        debris = Object.assign(debris.filter((d) => {
          d.life -= dt; d.vy += 260 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
          rect(ctx, d.x, d.y, 2, 2, d.c);
          return d.life > 0;
        }), { started: true });
      }
      puffs = puffs.filter((p) => {
        p.r += 12 * dt; p.y += p.v * dt;
        disc(ctx, p.x, p.y, Math.round(p.r), `rgba(190,180,170,${0.3 * (1 - p.r / 13)})`);
        return p.r < 13;
      });

      // belly coins
      for (const c of bellyCoins) {
        if (!c.rest) {
          c.vy += 380 * dt; c.x += c.vx * dt; c.y += c.vy * dt;
          if (c.x < 0 || c.x > W - 8) c.vx *= -1;
          const fl = floorY + 2 + ((c.x * 7) % 10);
          if (c.y > fl) { c.y = fl; if (c.vy > 80) { c.vy *= -0.3; c.vx *= 0.6; } else c.rest = true; }
        }
        draw(ctx, S.coins[c.rest ? 0 : (c.f + Math.floor(t / 70)) % 6], c.x, c.y);
      }
      ctx.restore();

      // white flash + BOOM!
      if (t >= HIT && t < HIT + 160) rect(ctx, 0, 0, W, H, `rgba(255,255,255,${1 - (t - HIT) / 160})`);
      if (t > HIT + 40 && t < HIT + 1400) {
        const str = 'BOOM!', sc = 3, k = clamp01((t - HIT - 40) / 180);
        const jitter = t < HIT + 600 ? Math.round(rnd(-1, 1)) : 0;
        text(ctx, str, (W - textWidth(str, sc)) / 2 + jitter, H * 0.22 - 20 * (1 - easeOut(k)) + jitter, sc,
          (i) => ['#ffd23f', '#ff9f1c', '#ff4d2e'][(i + Math.floor(t / 70)) % 3]);
      }
    }

    return { coinsScene, godScene, rocketScene, sumoScene };
  }

  // ------------------------------------------------------------------ sound (Web Audio)
  let actx = null, noiseBuf = null;
  function audio() {
    if (actx) return actx;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    actx = new C();
    noiseBuf = actx.createBuffer(1, actx.sampleRate * 2, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return actx;
  }
  /** iPhones only allow sound after a tap, so wake audio up on every tap until it's running. */
  function unlockAudio() {
    const c = audio();
    if (!c || c.state === 'running') return;
    c.resume().catch(() => {});
    const s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0);
  }
  ['touchend', 'click', 'keydown'].forEach((ev) => document.addEventListener(ev, unlockAudio, { capture: true, passive: true }));

  function tone(c, out, t, f0, dur, { type = 'square', vol = 0.2, f1 = f0, attack = 0.005 } = {}) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(c, out, t, dur, { type = 'lowpass', f0 = 1000, f1 = f0, q = 0.7, vol = 0.3, attack = 0.005 } = {}) {
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf; s.loop = true;
    f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(out);
    s.start(t); s.stop(t + dur + 0.05);
  }
  const NOTE = (n) => 440 * 2 ** ((n - 69) / 12); // MIDI note → Hz

  // One sound function per animation; `b` is the start time on the audio clock.
  const SOUNDS = {
    coins(c, out, b) {
      // slot-machine reels: quick ticks stepping up the major scale, octave after octave
      const MAJOR = [0, 2, 4, 5, 7, 9, 11];
      const steps = 24, dur = 3.3;
      for (let i = 0; i < steps; i++) {
        const t = b + dur * (i / steps) ** 0.92;
        const n = 60 + 12 * Math.floor(i / 7) + MAJOR[i % 7];
        noise(c, out, t, 0.025, { type: 'bandpass', f0: 3000, q: 4, vol: 0.18 });
        tone(c, out, t, NOTE(n), 0.11, { vol: 0.11 });
        tone(c, out, t + 0.055, NOTE(n), 0.06, { type: 'triangle', vol: 0.08 });
        if (i % 7 === 0) tone(c, out, t, NOTE(n + 12), 0.25, { type: 'sine', vol: 0.12 });
      }
      // JACKPOT bells
      const j = b + dur + 0.05;
      [96, 100, 103, 108].forEach((n, i) => {
        tone(c, out, j + i * 0.12, NOTE(n), 0.7, { type: 'triangle', vol: 0.22 });
        tone(c, out, j + i * 0.12, NOTE(n) * 2.01, 0.4, { type: 'sine', vol: 0.08 });
      });
      // payout: a shower of coins
      for (let i = 0; i < 28; i++) {
        const t = j + 0.1 + Math.random() * 1.6, f = rnd(2600, 4400);
        tone(c, out, t, f, 0.08, { type: 'triangle', vol: 0.08 });
        tone(c, out, t + 0.01, f * 1.5, 0.05, { type: 'sine', vol: 0.04 });
      }
      // quack when the duck pops up
      [2.3, 2.62].forEach((q) => {
        tone(c, out, b + q, 520, 0.16, { type: 'sawtooth', f1: 300, vol: 0.12 });
        noise(c, out, b + q, 0.14, { type: 'bandpass', f0: 1100, q: 6, vol: 0.1 });
      });
    },
    god(c, out, g) {
      noise(c, out, g + 0.3, 0.18, { type: 'highpass', f0: 2500, vol: 0.7 });
      noise(c, out, g + 0.32, 2.4, { type: 'lowpass', f0: 1400, f1: 90, vol: 0.85, attack: 0.02 });
      tone(c, out, g + 0.32, 70, 0.9, { type: 'sine', f1: 30, vol: 0.6 });
      tone(c, out, g + 0.65, 140, 0.3, { type: 'sine', f1: 40, vol: 0.6 });
      tone(c, out, g + 0.9, 330, 0.13, { f1: 520, vol: 0.13 });
      tone(c, out, g + 1.06, 440, 0.18, { f1: 900, vol: 0.13 });
      tone(c, out, g + 2.65, 2093, 0.3, { type: 'sine', vol: 0.2 });
      tone(c, out, g + 2.73, 3136, 0.45, { type: 'sine', vol: 0.16 });
      for (let t = 3.0; t < 5.8; t += 0.11) noise(c, out, g + t, 0.035, { type: 'bandpass', f0: (t * 100) % 2 < 1 ? 1600 : 2200, q: 3, vol: 0.22 });
      const tune = [72, 76, 79, 84, 79, 84, 88, 91, 88, 84, 91, 96];
      tune.forEach((n, i) => tone(c, out, g + 3.9 + i * 0.14, NOTE(n), 0.13, { vol: 0.08 }));
      [48, 55, 48, 55, 52, 55].forEach((n, i) => tone(c, out, g + 3.9 + i * 0.28, NOTE(n), 0.26, { type: 'triangle', vol: 0.18 }));
    },
    sumo(c, out, s) {
      const thud = (t, v = 0.55) => {
        tone(c, out, t, 95, 0.28, { type: 'sine', f1: 38, vol: v });
        noise(c, out, t, 0.12, { type: 'lowpass', f0: 500, vol: v * 0.5 });
      };
      // ceremonial stomps
      [0.3, 0.5, 0.7, 0.9].forEach((t) => thud(s + t, 0.5));
      // taiko roll speeding up as they charge
      let t = 1.1, gap = 0.12;
      while (t < 1.68) { thud(s + t, 0.35); t += gap; gap = Math.max(0.035, gap * 0.8); }
      // KABOOM
      noise(c, out, s + 1.7, 0.2, { type: 'highpass', f0: 1800, vol: 0.7 });
      noise(c, out, s + 1.7, 1.8, { type: 'lowpass', f0: 2200, f1: 70, vol: 0.95, attack: 0.01 });
      tone(c, out, s + 1.7, 70, 1.1, { type: 'sine', f1: 24, vol: 0.75 });
      for (let i = 0; i < 6; i++) noise(c, out, s + 1.85 + Math.random() * 0.5, 0.05, { type: 'highpass', f0: 3000, vol: 0.25 });
      // wah-wah as they faint, then tweeting birds
      tone(c, out, s + 2.25, 330, 0.3, { type: 'sawtooth', f1: 240, vol: 0.09 });
      tone(c, out, s + 2.6, 262, 0.55, { type: 'sawtooth', f1: 150, vol: 0.09 });
      for (let i = 0; i < 6; i++) {
        const b = s + 2.4 + i * 0.45;
        tone(c, out, b, 2600, 0.06, { type: 'sine', f1: 3400, vol: 0.06 });
        tone(c, out, b + 0.08, 2900, 0.06, { type: 'sine', f1: 3600, vol: 0.06 });
      }
      // coins gushing out: clinks + a rising major-scale ding
      for (let i = 0; i < 46; i++) {
        const b = s + 2.5 + Math.random() * 2.8, f = rnd(2600, 4400);
        tone(c, out, b, f, 0.07, { type: 'triangle', vol: 0.08 });
      }
      const MAJOR = [0, 2, 4, 5, 7, 9, 11];
      for (let i = 0; i < 11; i++) tone(c, out, s + 2.55 + i * 0.25, NOTE(72 + 12 * Math.floor(i / 7) + MAJOR[i % 7]), 0.22, { type: 'triangle', vol: 0.12 });
    },
    rocket(c, out, r) {
      noise(c, out, r, 3.4, { type: 'lowpass', f0: 300, f1: 3500, vol: 0.55, attack: 0.3 });
      tone(c, out, r, 110, 3.2, { type: 'sawtooth', f1: 880, vol: 0.05, attack: 0.3 });
      [67, 72, 76, 79].forEach((n, i) => tone(c, out, r + 0.3 + i * 0.11, NOTE(n), 0.1, { vol: 0.1 }));
      tone(c, out, r + 0.75, NOTE(84), 0.6, { vol: 0.1 });
      tone(c, out, r + 0.75, NOTE(88), 0.6, { type: 'triangle', vol: 0.12 });
    },
  };

  function soundtrack(name) {
    const c = audio();
    if (!c) return null;
    if (c.state !== 'running') c.resume().catch(() => {});
    const out = c.createGain();
    out.gain.value = 0.7;
    out.connect(c.destination);
    SOUNDS[name](c, out, c.currentTime + 0.05);
    return {
      stop() {
        try {
          out.gain.cancelScheduledValues(c.currentTime);
          out.gain.setValueAtTime(out.gain.value, c.currentTime);
          out.gain.linearRampToValueAtTime(0, c.currentTime + 0.12);
          setTimeout(() => out.disconnect(), 300);
        } catch { /* already gone */ }
      },
    };
  }

  // ------------------------------------------------------------------ player
  const ORDER = ['coins', 'god', 'rocket', 'sumo'];
  const LENGTH = { coins: 5400, god: 6000, rocket: 3600, sumo: 5900 }; // ms
  const SCENE = { coins: 'coinsScene', god: 'godScene', rocket: 'rocketScene', sumo: 'sumoScene' };
  const NEXT_KEY = 'networth.nextCelebration';

  /** Which animation plays next: they take turns, remembered between launches. */
  function nextName() {
    let i = 0;
    try { i = (parseInt(localStorage.getItem(NEXT_KEY), 10) || 0) % ORDER.length; } catch { /* private mode */ }
    try { localStorage.setItem(NEXT_KEY, String((i + 1) % ORDER.length)); } catch { /* ignore */ }
    return ORDER[i];
  }

  let running = false;
  /** play() takes the next animation in turn; play('coins' | 'god' | 'rocket' | 'sumo') plays that one. */
  function play(name) {
    if (running) return;
    if (!ORDER.includes(name)) name = nextName();
    running = true;
    build();
    const H = Math.max(200, Math.round(W * innerHeight / innerWidth));
    const cv = document.createElement('canvas');
    cv.className = 'celebrate';
    cv.width = W; cv.height = H;
    cv.style.opacity = '0';
    cv.setAttribute('aria-label', 'Celebration animation. Tap to skip.');
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const sound = soundtrack(name);
    const draw = makeScenes(H)[SCENE[name]];
    const len = LENGTH[name];
    const t0 = performance.now();
    let last = t0, done = false;

    const finish = () => {
      if (done) return;
      done = true;
      sound?.stop();
      cv.classList.add('out');
      setTimeout(() => { cv.remove(); running = false; }, 450);
    };
    cv.addEventListener('pointerdown', finish);

    const frame = (now) => {
      if (done) return;
      const t = now - t0, dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (t >= len) return finish();
      ctx.clearRect(0, 0, W, H);
      draw(ctx, t, dt);
      cv.style.opacity = String(Math.min(clamp01(t / 150), clamp01((len - t) / 400)));
      text(ctx, 'TAP TO SKIP', (W - textWidth('TAP TO SKIP', 1)) / 2, H - 12, 1, 'rgba(255,255,255,.75)');
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return name;
  }

  window.Celebrate = { play, unlockAudio, names: ORDER, get running() { return running; } };
})();
