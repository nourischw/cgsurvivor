/* ============ pet.js — la mascota que pelea sola ============
 * Sigue al humano y muerde al enemigo más cercano. No lee el teclado:
 * el jugador no la dirige. El dibujo es el marcador de G.Sprites.
 */
G.Pet = class Pet {
  constructor(beast, owner) {
    this.beast = beast;
    this.owner = owner;
    this.id = beast.id;
    this.name = beast.name;
    this.x = owner.x - 28;
    this.y = owner.y + 10;
    this.r = 11;
    this.bodyH = 28;
    this.anim = new G.Sprites.Animator(beast.id, 0.9, false);
    this.cd = 0.4;
    this.aim = 0;
    this.walking = false;
    this.dead = false;
    this.hits = 0;
    this.dmgDealt = 0;
    this.controlled = false;
  }

  update(dt) {
    const o = this.owner;
    this.anim.update(dt);
    if (!o) return;
    if (o.dead) {
      this.walking = false;
      this.anim.loop('Idle');
      return;
    }
    const face = o.walking ? o.moveAngle : o.aim;
    const back = (face || 0) + Math.PI;
    const tx = o.x + Math.cos(back) * 34;
    const ty = o.y + Math.sin(back) * 24;
    const dx = tx - this.x, dy = ty - this.y;
    const dist = Math.hypot(dx, dy) || 0;
    const spd = Math.max(140, (o.spd || 100) * 1.2);
    if (dist > 160) { this.x = tx; this.y = ty; this.walking = false; }
    else if (dist > 3) {
      const step = Math.min(dist, spd * dt);
      this.x += dx / dist * step;
      this.y += dy / dist * step;
      this.walking = true;
      this.anim.dir = G.Sprites.dirFromAngle(Math.atan2(dy, dx));
    } else this.walking = false;

    const all = G.EnemyMgr.all();
    let best = null, bd = 128 * 128;
    for (const e of all) {
      if (!e || e.dead) continue;
      const d2 = G.U.dist2(this.x, this.y, e.x, e.y);
      if (d2 < bd) { bd = d2; best = e; }
    }
    this.cd -= dt;
    if (best) {
      this.aim = Math.atan2(best.y - this.y, best.x - this.x);
      this.anim.dir = G.Sprites.dirFromAngle(this.aim);
      if (this.cd <= 0 && bd <= 72 * 72) {
        this.cd = 0.68;
        const dmg = 7 + Math.max(0, (o.char && o.char.level || 1) - 1) * 0.45;
        const before = best.hp;
        best.hurt(dmg, '#ffd27a', best.x - this.x, best.y - this.y, 26);
        this.dmgDealt += Math.max(0, before - best.hp);
        this.hits++;
        this.anim.play('Attack');
        G.FX.slash(this.x, this.y - 8, this.aim, 28, 1.4, '#ffd27a');
      } else if (!this.anim.busy()) this.anim.loop(this.walking ? 'Walk' : 'Idle');
    } else if (!this.anim.busy()) {
      this.anim.loop(this.walking ? 'Walk' : 'Idle');
    }
  }

  draw(ctx) {
    G.Sprites.drawShadow(ctx, this.id, this.x, this.y, 0.9);
    this.anim.draw(ctx, this.x, this.y);
    ctx.save();
    ctx.font = '700 7px Pixelify,"Segoe UI",sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,.7)';
    ctx.strokeText(this.name, this.x, this.y - this.bodyH - 2);
    ctx.fillStyle = '#ffe7a8';
    ctx.fillText(this.name, this.x, this.y - this.bodyH - 2);
    ctx.restore();
  }
};
