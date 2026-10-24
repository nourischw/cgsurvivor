/* ============ jobs.js — 9 oficios, 2 o 3 habilidades cada uno ============
 * Se lanzan solas (bullet heaven). El daño físico escala con 力量 y el
 * mágico con 魔法 (lo aplica Player.atkFor cuando hay personaje).
 * Los objetos imitan un movimiento de G.Moves para que combat.js los ejecute.
 */
G.Jobs = (() => {
  function mk(partial) {
    const s = Object.assign({
      t: 0.2, lvl: 1, cat: 'physical', count: 1, pierce: 0, knock: 24,
      size: 7, life: 0.55, speed: 340, spread: 0.35, radius: 52, arc: 1.7,
      width: 18, dmg: 12, cd: 0.8, poison: 0, drain: 0
    }, partial);
    if (G.Moves && G.Moves.BY_ID) G.Moves.BY_ID[s.id] = s;
    return s;
  }

  const ALL = [
    { id: 'sword', name: '劍士', gloss: 'Espadachín', stat: 'str',
      blurb: 'Corta cerca y suelta un tajo que atraviesa.',
      skills: [
        mk({ id: 'job-slash', name: '斬擊', type: 'fighting', kind: 'melee', cat: 'physical', cd: 0.46, dmg: 15, radius: 56, arc: 1.9, knock: 80 }),
        mk({ id: 'job-thrust', name: '突刺', type: 'steel', kind: 'projectile', cat: 'physical', cd: 0.72, dmg: 11, speed: 440, life: 0.42, size: 5, pierce: 1 }),
        mk({ id: 'job-wave', name: '劍氣', type: 'steel', kind: 'beam', cat: 'physical', cd: 1.2, dmg: 13, radius: 200, width: 16 })
      ] },
    { id: 'axe', name: '戰斧鬥士', gloss: 'Hacha', stat: 'str',
      blurb: 'Golpes lentos y anchos. Pega más si tienes fuerza.',
      skills: [
        mk({ id: 'job-axe', name: '揮斧', type: 'ground', kind: 'melee', cat: 'physical', cd: 0.78, dmg: 24, radius: 64, arc: 2.4, knock: 120 }),
        mk({ id: 'job-slam', name: '砸地', type: 'ground', kind: 'aura', cat: 'physical', cd: 1.35, dmg: 16, radius: 78 })
      ] },
    { id: 'brawl', name: '格鬥士', gloss: 'Peleador', stat: 'str',
      blurb: 'Puños rápidos y una entrada que te lanza hacia el blanco.',
      skills: [
        mk({ id: 'job-punch', name: '拳打', type: 'fighting', kind: 'melee', cat: 'physical', cd: 0.34, dmg: 11, radius: 46, arc: 1.3, knock: 40 }),
        mk({ id: 'job-rush', name: '衝拳', type: 'fighting', kind: 'dash', cat: 'physical', cd: 1.15, dmg: 16, radius: 108, width: 32, knock: 50 }),
        mk({ id: 'job-kick', name: '迴旋踢', type: 'fighting', kind: 'melee', cat: 'physical', cd: 0.9, dmg: 14, radius: 58, arc: 6.2, knock: 30 })
      ] },
    { id: 'bow', name: '弓箭手', gloss: 'Arquero', stat: 'str',
      blurb: 'Se queda atrás y dispara. Casi no pega cuerpo a cuerpo.',
      skills: [
        mk({ id: 'job-arrow', name: '射箭', type: 'flying', kind: 'projectile', cat: 'physical', cd: 0.42, dmg: 10, speed: 480, life: 0.7, size: 4, pierce: 0 }),
        mk({ id: 'job-volley', name: '連射', type: 'flying', kind: 'projectile', cat: 'physical', cd: 1.05, dmg: 7, count: 3, spread: 0.28, speed: 420, life: 0.55, size: 4 }),
        mk({ id: 'job-pierce', name: '穿透箭', type: 'steel', kind: 'beam', cat: 'physical', cd: 1.25, dmg: 12, radius: 260, width: 10 })
      ] },
    { id: 'ninja', name: '忍者', gloss: 'Ninja', stat: 'str',
      blurb: 'Shuriken rápidos y un paso que cruza a los enemigos.',
      skills: [
        mk({ id: 'job-star', name: '手裏劍', type: 'dark', kind: 'projectile', cat: 'physical', cd: 0.32, dmg: 8, count: 2, spread: 0.35, speed: 460, life: 0.5, size: 4 }),
        mk({ id: 'job-step', name: '影步', type: 'ghost', kind: 'dash', cat: 'physical', cd: 1.05, dmg: 13, radius: 120, width: 28, knock: 20 })
      ] },
    { id: 'mage', name: '魔術師', gloss: 'Mago', stat: 'mag',
      blurb: 'Bolas y una ráfaga. Escala con magia, no con fuerza.',
      skills: [
        mk({ id: 'job-bolt', name: '魔彈', type: 'fire', kind: 'projectile', cat: 'special', cd: 0.55, dmg: 13, speed: 300, life: 0.7, size: 8 }),
        mk({ id: 'job-ice', name: '冰粒', type: 'ice', kind: 'projectile', cat: 'special', cd: 0.7, dmg: 9, count: 3, spread: 0.4, speed: 280, life: 0.6, size: 6 }),
        mk({ id: 'job-burst', name: '爆裂', type: 'fire', kind: 'nova', cat: 'special', cd: 1.35, dmg: 11, count: 10, speed: 220, life: 0.45, size: 7, pierce: 0 })
      ] },
    { id: 'priest', name: '傳教士', gloss: 'Clérigo', stat: 'mag',
      blurb: 'Luz que cura y un círculo que pega a quien se acerca.',
      skills: [
        mk({ id: 'job-holy', name: '聖彈', type: 'fairy', kind: 'projectile', cat: 'special', cd: 0.6, dmg: 11, speed: 320, life: 0.6, size: 7 }),
        mk({ id: 'job-heal', name: '治癒', type: 'fairy', kind: 'buff', cat: 'special', cd: 2.4, dmg: 0, stat: 'regen', amount: 2.2, dur: 4, stacks: 3 }),
        mk({ id: 'job-halo', name: '聖環', type: 'fairy', kind: 'aura', cat: 'special', cd: 0.85, dmg: 8, radius: 70, drain: 2 })
      ] },
    { id: 'wizard', name: '巫師', gloss: 'Hechicero', stat: 'mag',
      blurb: 'Un rayo largo y meteoritos. Lento, y duele si hay magia.',
      skills: [
        mk({ id: 'job-ray', name: '雷擊', type: 'electric', kind: 'beam', cat: 'special', cd: 0.95, dmg: 18, radius: 240, width: 22 }),
        mk({ id: 'job-meteor', name: '隕石', type: 'rock', kind: 'meteor', cat: 'special', cd: 1.45, dmg: 16, count: 3, radius: 36, knock: 40 })
      ] },
    { id: 'curse', name: '咒術師', gloss: 'Maldecidor', stat: 'mag',
      blurb: 'Veneno y una nube. El daño sigue un rato después del golpe.',
      skills: [
        mk({ id: 'job-curse', name: '詛咒', type: 'ghost', kind: 'projectile', cat: 'special', cd: 0.7, dmg: 9, speed: 260, life: 0.75, size: 7, poison: 2 }),
        mk({ id: 'job-fog', name: '毒霧', type: 'poison', kind: 'aura', cat: 'special', cd: 0.8, dmg: 7, radius: 76, poison: 1 }),
        mk({ id: 'job-hex', name: '虛弱', type: 'ghost', kind: 'nova', cat: 'special', cd: 1.4, dmg: 8, count: 8, speed: 180, life: 0.5, size: 6, pierce: 0 })
      ] }
  ];

  const BY = {};
  for (const j of ALL) BY[j.id] = j;

  /** Copias con la recarga a cero: cada run lleva la suya. */
  function instances(job) {
    return (job.skills || []).map((s, i) => Object.assign({}, s, { t: 0.15 + i * 0.18 }));
  }

  return { ALL, BY, instances };
})();
