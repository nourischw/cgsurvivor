/* ============ appearances.js — 30 looks (appearance only) ============
 * Names: Traditional Chinese `tc` is what the UI shows. `sc` is the
 * simplified alias from the same public checklist. 旅人 and 學徒 are original
 * fillers (not on that checklist). Drawing is an original canvas figure.
 * skyey / molibaike were used as a name and animation checklist only.
 * No official frames, no ripped sheets.
 */
G.Appear = (() => {
  const ROWS = [
    { id: 1, sc: '阿咪', tc: '艾咪' },
    { id: 2, sc: '艾露', tc: '依露' },
    { id: 3, sc: '巴乌·哇呜', tc: '鮑' },
    { id: 4, sc: '贝堤特', tc: '貝堤特' },
    { id: 5, sc: '彼特', tc: '彼特' },
    { id: 6, sc: '伯克', tc: '博克' },
    { id: 7, sc: '菲特', tc: '貝依' },
    { id: 8, sc: '福尔蒂雅', tc: '福爾蒂雅' },
    { id: 9, sc: '葛蕾丝', tc: '葛蕾絲' },
    { id: 10, sc: '荷蜜', tc: '荷蜜' },
    { id: 11, sc: '卡伊', tc: '凱茵' },
    { id: 12, sc: '卡兹', tc: '凱茲' },
    { id: 13, sc: '凯', tc: '凱' },
    { id: 14, sc: '兰斯洛特', tc: '蘭斯洛特' },
    { id: 15, sc: '丽', tc: '麗' },
    { id: 16, sc: '绫女', tc: '綾女' },
    { id: 17, sc: '梅古', tc: '梅古' },
    { id: 18, sc: '萌子', tc: '萌子' },
    { id: 19, sc: '尼尔森', tc: '尼爾森' },
    { id: 20, sc: '萍萍', tc: '萍萍' },
    { id: 21, sc: '莎拉', tc: '莎拉' },
    { id: 22, sc: '托布', tc: '托普' },
    { id: 23, sc: '威斯凯尔', tc: '威斯凱爾' },
    { id: 24, sc: '乌噜', tc: '烏嚕' },
    { id: 25, sc: '夏拉', tc: '夏菈' },
    { id: 26, sc: '谢堤', tc: '謝堤' },
    { id: 27, sc: '辛', tc: '西恩' },
    { id: 28, sc: '左藏', tc: '左藏' },
    { id: 29, sc: '旅人', tc: '旅人' },
    { id: 30, sc: '學徒', tc: '學徒' }
  ];
  const SKIN = ['#f3d2b5', '#e0b08a', '#c68642', '#8d5524', '#f6e0c8', '#a56b45'];
  const STYLE = ['short', 'long', 'tuft', 'bun', 'hood', 'spike'];
  const STATES = ['idle', 'walk', 'attack', 'cast', 'down'];
  const WEAPONS = [
    { id: 'axe', label: '持斧' },
    { id: 'bow', label: '舉弓' },
    { id: 'fist', label: '空手' },
    { id: 'sword', label: '執劍' },
    { id: 'staff', label: '拿杖' },
    { id: 'spear', label: '用槍' }
  ];
  const JOB_WEAPON = {
    sword: 'sword', axe: 'axe', brawl: 'fist', bow: 'bow', ninja: 'fist',
    mage: 'staff', priest: 'staff', wizard: 'staff', curse: 'staff'
  };

  const ALL = ROWS.map((row, i) => {
    const hue = (i * 37) % 360;
    return {
      id: row.id,
      sc: row.sc,
      tc: row.tc,
      name: row.tc,
      skin: SKIN[i % SKIN.length],
      hair: `hsl(${hue} 52% ${26 + (i % 4) * 9}%)`,
      outfit: `hsl(${(hue + 150) % 360} 46% 40%)`,
      pants: `hsl(${(hue + 210) % 360} 18% 24%)`,
      style: STYLE[i % STYLE.length],
      source: i < 28 ? 'checklist' : 'original'
    };
  });
  const BY = {};
  for (const a of ALL) BY[a.id] = a;

  function weaponOf(jobId) { return JOB_WEAPON[jobId] || null; }

  function draw(ctx, app, x, y, opts = {}) {
    if (!app) return;
    const sc = opts.scale || 2;
    const pose = opts.pose || (opts.walking ? 'walk' : 'idle');
    const weaponId = opts.weapon || weaponOf(opts.job) || 'fist';
    const bob = pose === 'walk' ? Math.sin(performance.now() / 140) * 1.6 : 0;
    const dir = opts.dir || 0;
    const faceR = dir === 1 || dir === 2 || dir === 3;
    const faceL = dir === 5 || dir === 6 || dir === 7;
    const faceU = dir === 4;
    const alpha = opts.alpha == null ? 1 : opts.alpha;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.beginPath();
    ctx.ellipse(0, pose === 'down' ? -3 : 0, pose === 'down' ? 9 : 7, 2.6, 0, 0, 6.2832);
    ctx.fill();
    if (pose === 'down') bodyDown(ctx, app);
    else if (pose === 'walk') bodyWalk(ctx, app, bob, faceU, faceR, faceL);
    else if (pose === 'attack') bodyAttack(ctx, app, faceU, faceR, faceL, weaponId);
    else if (pose === 'cast') bodyCast(ctx, app, faceU, faceR, faceL, weaponId);
    else bodyIdle(ctx, app, faceU, faceR, faceL, weaponId);
    if (opts.flash && pose !== 'down') {
      ctx.globalAlpha *= 0.55;
      ctx.fillStyle = '#fff';
      ctx.fillRect(-6, -30, 12, 28);
    }
    ctx.restore();
  }

  function hair(ctx, style, y, faceU) {
    ctx.fillStyle = ctx.fillStyle;
    if (style === 'long') {
      ctx.fillRect(-5, y, 10, 6);
      ctx.fillRect(-5, y + 5, 2, 10);
      ctx.fillRect(3, y + 5, 2, 10);
    } else if (style === 'tuft') {
      ctx.fillRect(-4, y, 8, 4);
      ctx.fillRect(-1, y - 3, 3, 4);
    } else if (style === 'bun') {
      ctx.fillRect(-4, y, 8, 4);
      ctx.fillRect(-2, y - 4, 4, 4);
    } else if (style === 'hood') {
      ctx.fillRect(-5, y - 1, 10, 3);
      ctx.fillRect(-5, y + 2, 2, 5);
      ctx.fillRect(3, y + 2, 2, 5);
    } else if (style === 'spike') {
      ctx.fillRect(-4, y, 8, 4);
      ctx.fillRect(-4, y - 3, 2, 3);
      ctx.fillRect(-1, y - 4, 2, 4);
      ctx.fillRect(2, y - 3, 2, 3);
    } else ctx.fillRect(-4, y, 8, 4);
    if (!faceU) return;
  }

  function face(ctx, app, y, faceU, faceR, faceL) {
    if (faceU) return;
    ctx.fillStyle = '#1c140e';
    const ox = faceR ? 1 : faceL ? -1 : 0;
    ctx.fillRect(-2 + ox, y + 4, 1, 1);
    ctx.fillRect(1 + ox, y + 4, 1, 1);
  }

  function head(ctx, app, y, faceU, faceR, faceL) {
    ctx.fillStyle = app.skin;
    ctx.fillRect(-4, y, 8, 9);
    ctx.fillStyle = app.hair;
    hair(ctx, app.style, y - 1, faceU);
    face(ctx, app, y, faceU, faceR, faceL);
  }

  function bodyIdle(ctx, app, faceU, faceR, faceL, weaponId) {
    ctx.fillStyle = app.pants;
    ctx.fillRect(-4, -9, 3, 8);
    ctx.fillRect(1, -9, 3, 8);
    ctx.fillStyle = app.outfit;
    ctx.fillRect(-5, -20, 10, 12);
    ctx.fillStyle = app.skin;
    ctx.fillRect(-7, -18, 2, 6);
    ctx.fillRect(5, -18, 2, 6);
    head(ctx, app, -29, faceU, faceR, faceL);
    glyph(ctx, weaponId, faceL ? -9 : 7, -16, 0.2);
  }

  function bodyWalk(ctx, app, bob, faceU, faceR, faceL) {
    const step = Math.floor(performance.now() / 140) % 2 ? 1 : -1;
    ctx.fillStyle = app.pants;
    ctx.fillRect(-5, -8, 3, 9);
    ctx.fillRect(2 + step, -10, 3, 10);
    ctx.fillStyle = app.outfit;
    ctx.fillRect(-5, -20 - bob * 0.2, 10, 12);
    ctx.fillStyle = app.skin;
    ctx.fillRect(-8, -16 - bob, 2, 7);
    ctx.fillRect(6, -19 - bob, 2, 7);
    head(ctx, app, -29 - bob, faceU, faceR, faceL);
  }

  function bodyAttack(ctx, app, faceU, faceR, faceL, weaponId) {
    const lean = faceL ? -2 : 2;
    ctx.fillStyle = app.pants;
    ctx.fillRect(-5, -8, 3, 8);
    ctx.fillRect(2, -8, 3, 7);
    ctx.fillStyle = app.outfit;
    ctx.fillRect(-5 + lean, -19, 11, 11);
    ctx.fillStyle = app.skin;
    ctx.fillRect(lean + (faceL ? -10 : 6), -16, 6, 2);
    head(ctx, app, -28, faceU, faceR, faceL);
    glyph(ctx, weaponId, faceL ? -12 : 10, -15, faceL ? 2.4 : 0.6);
  }

  function bodyCast(ctx, app, faceU, faceR, faceL, weaponId) {
    ctx.fillStyle = app.pants;
    ctx.fillRect(-3, -9, 2, 8);
    ctx.fillRect(1, -9, 2, 8);
    ctx.fillStyle = app.outfit;
    ctx.fillRect(-4, -20, 8, 12);
    ctx.fillStyle = app.skin;
    ctx.fillRect(-8, -26, 2, 7);
    ctx.fillRect(6, -26, 2, 7);
    head(ctx, app, -30, faceU, faceR, faceL);
    ctx.fillStyle = '#fff6c8';
    ctx.fillRect(-2, -34, 2, 2);
    ctx.fillRect(3, -33, 2, 2);
    if (weaponId === 'staff' || weaponId === 'spear') glyph(ctx, weaponId, faceL ? -8 : 8, -22, -0.4);
  }

  function bodyDown(ctx, app) {
    ctx.fillStyle = app.pants;
    ctx.fillRect(2, -6, 8, 3);
    ctx.fillRect(2, -2, 8, 3);
    ctx.fillStyle = app.outfit;
    ctx.fillRect(-8, -7, 12, 6);
    ctx.fillStyle = app.skin;
    ctx.fillRect(-14, -8, 7, 6);
    ctx.fillStyle = app.hair;
    ctx.fillRect(-15, -9, 8, 3);
    ctx.fillStyle = '#1c140e';
    ctx.fillRect(-12, -6, 2, 1);
  }

  /** Original stick-figure weapon cue. `id` may be spear even though no v1 job uses it. */
  function glyph(ctx, id, x, y, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    if (id === 'axe') {
      ctx.fillStyle = '#8a5a32';
      ctx.fillRect(-1, -7, 2, 12);
      ctx.fillStyle = '#c5ccd6';
      ctx.fillRect(0, -9, 6, 4);
    } else if (id === 'bow') {
      ctx.strokeStyle = '#d8c39a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 6, -1.2, 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -5); ctx.lineTo(0, 5);
      ctx.stroke();
    } else if (id === 'staff') {
      ctx.fillStyle = '#9fd0ff';
      ctx.fillRect(-1, -12, 2, 16);
      ctx.beginPath();
      ctx.arc(0, -13, 2.2, 0, 6.2832);
      ctx.fill();
    } else if (id === 'spear') {
      ctx.fillStyle = '#c4a574';
      ctx.fillRect(-1, -14, 2, 18);
      ctx.fillStyle = '#e8eef8';
      ctx.beginPath();
      ctx.moveTo(0, -18); ctx.lineTo(3, -12); ctx.lineTo(-3, -12);
      ctx.fill();
    } else if (id === 'fist') {
      ctx.fillStyle = '#e7b89a';
      ctx.fillRect(-2, -2, 4, 4);
    } else {
      ctx.fillStyle = '#d5dbe6';
      ctx.fillRect(-1, -11, 2, 14);
      ctx.fillRect(-3, -12, 6, 2);
    }
    ctx.restore();
  }

  return { ALL, BY, draw, weaponOf, STATES, WEAPONS, JOB_WEAPON, MAX: 30 };
})();
