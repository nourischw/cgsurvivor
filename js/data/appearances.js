/* ============ appearances.js — 30 apariencias (sólo el aspecto) ============
 * Nombres 1–28: lista pública de fans (https://www.molibaike.com/role).
 * No es arte oficial ni una cesión: el dibujo es un muñeco original en canvas.
 * 29 y 30 son relleno original para cerrar la plantilla en 30.
 */
G.Appear = (() => {
  const NAMES = [
    '阿咪', '艾露', '巴乌·哇呜', '贝堤特', '彼特', '伯克', '菲特', '福尔蒂雅',
    '葛蕾丝', '荷蜜', '卡伊', '卡兹', '凯', '兰斯洛特', '丽', '绫女',
    '梅古', '萌子', '尼尔森', '萍萍', '莎拉', '托布', '威斯凯尔', '乌噜',
    '夏菈', '谢堤', '辛', '左藏', '旅人', '學徒'
  ];
  const SKIN = ['#f3d2b5', '#e0b08a', '#c68642', '#8d5524', '#f6e0c8', '#a56b45'];
  const STYLE = ['short', 'long', 'tuft', 'bun', 'hood', 'spike'];
  const ALL = NAMES.map((name, i) => {
    const id = i + 1;
    const hue = (i * 37) % 360;
    return {
      id, name,
      skin: SKIN[i % SKIN.length],
      hair: `hsl(${hue} 52% ${26 + (i % 4) * 9}%)`,
      outfit: `hsl(${(hue + 150) % 360} 46% 40%)`,
      pants: `hsl(${(hue + 210) % 360} 18% 24%)`,
      style: STYLE[i % STYLE.length],
      source: i < 28 ? 'fan-list' : 'original'
    };
  });
  const BY = {};
  for (const a of ALL) BY[a.id] = a;

  function draw(ctx, app, x, y, opts = {}) {
    if (!app) return;
    const sc = opts.scale || 2;
    const bob = opts.walking ? Math.sin(performance.now() / 140) * 1.4 : 0;
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
    ctx.ellipse(0, 0, 7, 2.6, 0, 0, 6.2832);
    ctx.fill();
    const leg = opts.walking ? (Math.floor(performance.now() / 140) % 2 ? 1 : -1) : 0;
    ctx.fillStyle = app.pants;
    ctx.fillRect(-4, -9, 3, 8 + (leg > 0 ? 1 : 0));
    ctx.fillRect(1, -9, 3, 8 + (leg < 0 ? 1 : 0));
    ctx.fillStyle = app.outfit;
    ctx.fillRect(-5, -20 - bob * 0.15, 10, 12);
    ctx.fillStyle = app.skin;
    ctx.fillRect(-4, -29 - bob, 8, 9);
    ctx.fillStyle = app.hair;
    hair(ctx, app.style, bob, faceU);
    if (!faceU) {
      ctx.fillStyle = '#1c140e';
      const ox = faceR ? 1 : faceL ? -1 : 0;
      ctx.fillRect(-2 + ox, -25 - bob, 1, 1);
      ctx.fillRect(1 + ox, -25 - bob, 1, 1);
    }
    weapon(ctx, opts.job, faceR, faceL, bob, opts.swing || 0);
    if (opts.flash) {
      ctx.globalAlpha *= 0.55;
      ctx.fillStyle = '#fff';
      ctx.fillRect(-6, -30 - bob, 12, 28);
    }
    ctx.restore();
  }

  function hair(ctx, style, bob, faceU) {
    const y = -30 - bob;
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
    } else {
      ctx.fillRect(-4, y, 8, 4);
    }
  }

  function weapon(ctx, job, faceR, faceL, bob, swing) {
    const s = swing > 0 ? -3 : 0;
    const x = faceL ? -8 : 5;
    ctx.save();
    ctx.translate(x, -16 - bob + s);
    if (faceL) ctx.scale(-1, 1);
    if (job === 'axe') {
      ctx.fillStyle = '#8a5a32';
      ctx.fillRect(0, -6, 2, 12);
      ctx.fillStyle = '#c5ccd6';
      ctx.fillRect(1, -8, 5, 4);
    } else if (job === 'bow') {
      ctx.strokeStyle = '#d8c39a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(2, 0, 6, -1.2, 1.2);
      ctx.stroke();
    } else if (job === 'ninja') {
      ctx.fillStyle = '#d7dde8';
      ctx.fillRect(0, -2, 5, 1);
      ctx.fillRect(2, -4, 1, 5);
    } else if (job === 'brawl') {
      ctx.fillStyle = '#e7b89a';
      ctx.fillRect(0, -2, 3, 3);
    } else if (job === 'mage' || job === 'wizard' || job === 'priest' || job === 'curse') {
      ctx.fillStyle = job === 'priest' ? '#ffe08a' : job === 'curse' ? '#b07cff' : '#9fd0ff';
      ctx.fillRect(0, -8, 2, 12);
      ctx.fillRect(-1, -8, 4, 2);
    } else {
      ctx.fillStyle = '#d5dbe6';
      ctx.fillRect(0, -8, 2, 14);
    }
    ctx.restore();
  }

  return { ALL, BY, draw, MAX: 30 };
})();
