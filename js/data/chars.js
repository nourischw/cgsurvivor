/* ============ chars.js — reglas del personaje de v1 ============
 * Cuenta → como mucho 2 fichas. Cada una: aspecto, oficio, nivel 1–120,
 * cinco stats, puntos sin gastar, mascota activa y experiencia.
 * Crear reparte 30 puntos. Cada nivel da +4. El tope es 120.
 */
G.Chars = (() => {
  const MAX = 2;
  const CAP = 120;
  const CREATE = 30;
  const PER_LEVEL = 4;
  const KEYS = ['vit', 'str', 'def', 'spd', 'mag'];
  const LABEL = {
    vit: '體力 Vitalidad',
    str: '力量 Fuerza',
    def: '強度 Defensa',
    spd: '速度 Velocidad',
    mag: '魔法 Magia'
  };

  function blank() { return { vit: 0, str: 0, def: 0, spd: 0, mag: 0 }; }

  /** Experiencia para pasar de `level` al siguiente. En el 120 ya no hay. */
  function expFor(level) {
    const lv = Math.max(1, level | 0);
    if (lv >= CAP) return Infinity;
    return Math.floor(22 + lv * 6 + Math.pow(lv, 1.55) * 2.2);
  }

  function sumStats(stats) {
    let n = 0;
    for (const k of KEYS) n += Math.floor(+((stats || {})[k]) || 0);
    return n;
  }

  /** null si el alta es válida; si no, el motivo. */
  function invalid(spec) {
    if (!spec) return 'Faltan los datos.';
    const app = G.Appear && G.Appear.BY[spec.appearanceId | 0];
    if (!app) return 'Elige una apariencia.';
    const job = G.Jobs && G.Jobs.BY[spec.jobId];
    if (!job) return 'Elige un oficio.';
    const petId = spec.activePetId | 0;
    const pet = G.Beasts && G.Beasts.BY[petId];
    if (!pet || petId < 1 || petId > G.Beasts.MAX_ID) return 'Elige una mascota.';
    const stats = spec.stats || {};
    for (const k of KEYS) {
      const v = stats[k];
      if (!Number.isInteger(v) && !(typeof v === 'number' && v === Math.floor(v))) return 'Los puntos tienen que ser enteros.';
      if (v < 0) return 'Un stat no puede quedar por debajo de cero.';
    }
    if (sumStats(stats) !== CREATE) return 'Reparte los ' + CREATE + ' puntos.';
    return null;
  }

  /**
   * Suma experiencia al personaje (el objeto del save). Devuelve cuántos
   * niveles ha subido. En el 120 la experiencia sobrante se tira.
   */
  function gain(ch, amount) {
    if (!ch) return 0;
    ch.level = G.U.clamp(ch.level | 0, 1, CAP);
    ch.exp = Math.max(0, +ch.exp || 0);
    ch.unspent = Math.max(0, ch.unspent | 0);
    if (ch.level >= CAP) { ch.exp = 0; return 0; }
    const add = +amount;
    if (!Number.isFinite(add) || add <= 0) return 0;
    ch.exp += add;
    let n = 0;
    while (ch.level < CAP && ch.exp >= expFor(ch.level) && n < 80) {
      ch.exp -= expFor(ch.level);
      ch.level++;
      ch.unspent += PER_LEVEL;
      n++;
    }
    if (ch.level >= CAP) ch.exp = 0;
    return n;
  }

  function clampChar(ch) {
    if (!ch || typeof ch !== 'object') return null;
    const stats = blank();
    for (const k of KEYS) stats[k] = G.U.clamp(Math.floor(+((ch.stats || {})[k]) || 0), 0, CREATE + PER_LEVEL * (CAP - 1));
    let appearanceId = ch.appearanceId | 0;
    if (!G.Appear || !G.Appear.BY[appearanceId]) appearanceId = 1;
    let jobId = ch.jobId;
    if (!G.Jobs || !G.Jobs.BY[jobId]) jobId = G.Jobs ? G.Jobs.ALL[0].id : 'sword';
    let activePetId = ch.activePetId | 0;
    if (!G.Beasts || !G.Beasts.BY[activePetId]) activePetId = 1;
    return {
      id: typeof ch.id === 'string' && ch.id ? ch.id.slice(0, 40) : ('c' + Math.floor(Math.random() * 1e9).toString(36)),
      appearanceId,
      jobId,
      level: G.U.clamp(ch.level | 0, 1, CAP),
      exp: Math.max(0, Math.floor(+ch.exp || 0)),
      unspent: G.U.clamp(ch.unspent | 0, 0, PER_LEVEL * CAP),
      stats,
      activePetId,
      created: Math.max(0, Math.floor(+ch.created || 0))
    };
  }

  return { MAX, CAP, CREATE, PER_LEVEL, KEYS, LABEL, blank, expFor, sumStats, invalid, gain, clampChar };
})();
