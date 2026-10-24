/* ============ beasts.js — catálogo de mascotas bestia (v1, hasta id 161) ============
 * Nombres de marcador, inventados aquí. No son la lista oficial de mascotas
 * de ningún juego. El dibujo lo pone G.Sprites (PLACEHOLDER_PETS).
 * El selector de inicio enseña un subconjunto (STARTERS). El resto existe
 * para que el hueco activePetId quepa en 1..161. El catálogo de ~400 queda
 * para más adelante.
 */
G.Beasts = (() => {
  const MAX_ID = 161;
  const A = ['bru', 'mi', 'ka', 'lu', 'no', 'sa', 'ri', 'te', 'vo', 'pa', 'zu', 'ne'];
  const B = ['mox', 'lin', 'gar', 'sha', 'tuk', 'nel', 'vix', 'dor', 'pek', 'wun', 'fen', 'qo'];
  const KIND = ['fang', 'wing', 'scale', 'horn', 'paw', 'tail'];
  const ALL = [];
  for (let id = 1; id <= MAX_ID; id++) {
    const stem = A[id % A.length] + B[(id * 5) % B.length];
    ALL.push({
      id,
      name: stem.charAt(0).toUpperCase() + stem.slice(1) + '-' + String(id).padStart(3, '0'),
      kind: KIND[id % KIND.length],
      starter: id <= 12
    });
  }
  const BY = {};
  for (const b of ALL) BY[b.id] = b;
  const STARTERS = ALL.filter(b => b.starter);
  return { ALL, BY, STARTERS, MAX_ID };
})();
