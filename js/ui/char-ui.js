/* ============ char-ui.js — crear y elegir personaje (máximo 2) ============
 * Apariencia → oficio → 30 puntos → mascota inicial → hueco.
 * El test de personalidad ya no es el camino de entrada.
 */
G.CharUI = (() => {
  const $ = id => document.getElementById(id);
  let step = 'slots';
  let draft = null;
  let pool = G.Chars ? G.Chars.CREATE : 30;
  let lvDone = null;

  function ensure() {
    if ($('scr-chars')) return;
    const host = document.createElement('div');
    host.innerHTML =
      `<section id="scr-chars" class="scr dim hidden" translate="no">
        <div class="box wide char-box">
          <h2 id="char-title">Characters</h2>
          <p class="sub" id="char-sub"></p>
          <div id="char-steps" class="char-steps"></div>
          <div id="char-body"></div>
          <p id="char-err" class="err"></p>
          <div class="row between" id="char-nav" style="margin-top:12px"></div>
        </div>
      </section>
      <section id="scr-char-lv" class="scr dim hidden" translate="no">
        <div class="box" style="width:min(480px,100%)">
          <h2>Level up</h2>
          <p class="sub" id="clv-sub"></p>
          <div id="clv-stats"></div>
          <p id="clv-err" class="err"></p>
          <button id="clv-ok" class="btn gold" type="button" style="width:100%;margin-top:8px">Continue</button>
        </div>
      </section>`;
    while (host.firstChild) document.body.appendChild(host.firstChild);
  }

  function init() {
    ensure();
    $('clv-ok').onclick = confirmLevel;
  }

  function fresh() {
    return {
      appearanceId: 1,
      jobId: G.Jobs.ALL[0].id,
      stats: G.Chars.blank(),
      activePetId: G.Beasts.STARTERS[0].id
    };
  }

  function open() {
    ensure();
    step = 'slots';
    draft = null;
    G.UI.chrome(true);
    G.UI.show('scr-chars');
    render();
  }

  function err(msg) {
    const el = $('char-err');
    if (el) el.textContent = msg || '';
  }

  function render() {
    err('');
    const title = $('char-title'), sub = $('char-sub'), body = $('char-body'), nav = $('char-nav'), steps = $('char-steps');
    const labels = { look: 'Appearance', job: 'Job', stats: 'Points', pet: 'Pet' };
    steps.innerHTML = step === 'slots' ? '' : ['look', 'job', 'stats', 'pet'].map(k =>
      `<i class="${k === step ? 'on' : ''}">${labels[k]}</i>`).join('');
    body.innerHTML = '';
    nav.innerHTML = '';
    if (step === 'slots') renderSlots(title, sub, body, nav);
    else if (step === 'look') renderLook(title, sub, body, nav);
    else if (step === 'job') renderJob(title, sub, body, nav);
    else if (step === 'stats') renderStatsStep(title, sub, body, nav);
    else if (step === 'pet') renderPet(title, sub, body, nav);
  }

  function renderSlots(title, sub, body, nav) {
    const list = (G.DB.save && G.DB.save.chars) || [];
    title.textContent = 'Choose a character';
    sub.textContent = `Up to ${G.Chars.MAX} per account. The job is separate from the look.`;
    const grid = document.createElement('div');
    grid.className = 'grid';
    for (let i = 0; i < G.Chars.MAX; i++) {
      const ch = list[i];
      const cell = document.createElement('div');
      cell.className = 'cell' + (ch && G.DB.save.activeChar === i ? ' on' : '');
      if (ch) {
        const app = G.Appear.BY[ch.appearanceId] || G.Appear.ALL[0];
        const job = G.Jobs.BY[ch.jobId];
        const pet = G.Beasts.BY[ch.activePetId];
        const cv = document.createElement('canvas');
        cv.width = 96; cv.height = 78;
        const ctx = cv.getContext('2d');
        G.Appear.draw(ctx, app, 48, 68, { scale: 2.2, job: ch.jobId });
        cell.appendChild(cv);
        cell.insertAdjacentHTML('beforeend', `<b>${app.name}</b><small>${job ? job.name : ''} · Lv.${ch.level}</small>`);
        cell.title = pet ? pet.name : '';
        cell.onclick = () => {
          const r = G.DB.selectChar(i);
          if (!r.ok) { err(r.error); return; }
          G.Audio.sfx('confirm');
          G.Flow.goMenu();
        };
        const del = document.createElement('button');
        del.className = 'btn small ghost';
        del.type = 'button';
        del.textContent = 'Delete';
        del.onclick = ev => {
          ev.stopPropagation();
          if (!confirm('Delete this character?')) return;
          G.DB.deleteChar(i);
          render();
        };
        cell.appendChild(del);
      } else {
        cell.insertAdjacentHTML('beforeend', `<b>Slot ${i + 1}</b><small>Empty</small>`);
        cell.onclick = () => {
          if (list.length >= G.Chars.MAX) { err('Maximum of 2 characters.'); return; }
          draft = fresh();
          pool = G.Chars.CREATE;
          step = 'look';
          render();
        };
      }
      grid.appendChild(cell);
    }
    body.appendChild(grid);
    if (list.length >= G.Chars.MAX) {
      const note = document.createElement('p');
      note.className = 'note';
      note.textContent = 'Maximum of 2 characters. Delete one to create another.';
      body.appendChild(note);
    }
    const back = document.createElement('button');
    back.className = 'btn ghost';
    back.type = 'button';
    back.textContent = list.length ? 'Back to menu' : 'Back';
    back.onclick = () => { if (list.length) G.Flow.goMenu(); else G.Flow.toLogin(); };
    nav.appendChild(back);
    if (list.length) {
      const play = document.createElement('button');
      play.className = 'btn gold';
      play.type = 'button';
      play.textContent = 'Play';
      play.onclick = () => G.Flow.play();
      nav.appendChild(play);
    }
  }

  function renderLook(title, sub, body, nav) {
    title.textContent = 'Appearance';
    sub.textContent = 'Look only. The job comes next. Placeholder drawing, no official art.';
    const grid = document.createElement('div');
    grid.className = 'grid';
    for (const a of G.Appear.ALL) {
      const cell = document.createElement('div');
      cell.className = 'cell' + (draft.appearanceId === a.id ? ' on' : '');
      const cv = document.createElement('canvas');
      cv.width = 72; cv.height = 64;
      G.Appear.draw(cv.getContext('2d'), a, 36, 56, { scale: 1.7 });
      cell.appendChild(cv);
      cell.insertAdjacentHTML('beforeend', `<b>${a.name}</b>`);
      cell.onclick = () => { draft.appearanceId = a.id; render(); };
      grid.appendChild(cell);
    }
    body.appendChild(grid);
    nav.appendChild(backBtn(() => { step = 'slots'; render(); }));
    nav.appendChild(nextBtn('Job', () => { step = 'job'; render(); }));
  }

  function renderJob(title, sub, body, nav) {
    title.textContent = 'Job';
    sub.textContent = 'Skills fire on their own during the run. Strength or magic changes how hard they hit.';
    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
    for (const j of G.Jobs.ALL) {
      const cell = document.createElement('div');
      cell.className = 'cell' + (draft.jobId === j.id ? ' on' : '');
      cell.style.textAlign = 'left';
      cell.style.padding = '8px';
      const stat = j.stat === 'mag' ? '魔法 Magic' : '力量 Strength';
      cell.innerHTML = `<b>${j.name}</b><small>${j.gloss} · ${stat}</small><small>${j.blurb}</small><small>${j.skills.map(s => s.name).join(' · ')}</small>`;
      cell.onclick = () => { draft.jobId = j.id; render(); };
      grid.appendChild(cell);
    }
    body.appendChild(grid);
    nav.appendChild(backBtn(() => { step = 'look'; render(); }));
    nav.appendChild(nextBtn('Points', () => { step = 'stats'; pool = G.Chars.CREATE - G.Chars.sumStats(draft.stats); render(); }));
  }

  function renderStatsStep(title, sub, body, nav) {
    title.textContent = 'Spend 30 points';
    sub.textContent = '體力 health · 力量 physical damage · 強度 less damage taken · 速度 movement and cooldowns · 魔法 magic damage.';
    body.appendChild(statBlock(draft.stats, () => pool, d => { pool -= d; }, () => render()));
    const left = document.createElement('p');
    left.innerHTML = `<b class="gold">${pool}</b> points left.`;
    body.appendChild(left);
    nav.appendChild(backBtn(() => { step = 'job'; render(); }));
    const ok = nextBtn('Pet', () => {
      if (pool !== 0 || G.Chars.sumStats(draft.stats) !== G.Chars.CREATE) { err('Spend all 30 points.'); return; }
      step = 'pet';
      render();
    });
    ok.disabled = pool !== 0;
    nav.appendChild(ok);
  }

  function renderPet(title, sub, body, nav) {
    title.textContent = 'Starting pet';
    sub.textContent = `Placeholder beasts. The catalog goes up to id ${G.Beasts.MAX_ID}; pick a starter here. It attacks on its own.`;
    const grid = document.createElement('div');
    grid.className = 'grid';
    for (const b of G.Beasts.STARTERS) {
      const cell = document.createElement('div');
      cell.className = 'cell' + (draft.activePetId === b.id ? ' on' : '');
      cell.appendChild(G.UI.spriteCanvas(b.id, 88, 72, { scale: 1.4 }));
      cell.insertAdjacentHTML('beforeend', `<b>${b.name}</b>`);
      cell.onclick = () => { draft.activePetId = b.id; render(); };
      grid.appendChild(cell);
    }
    body.appendChild(grid);
    nav.appendChild(backBtn(() => { step = 'stats'; render(); }));
    const ok = nextBtn('Save', saveDraft);
    nav.appendChild(ok);
  }

  function saveDraft() {
    const r = G.DB.createChar(draft);
    if (!r.ok) { err(r.error || 'Could not create.'); return; }
    G.Audio.sfx('confirm');
    G.UI.toast(G.Appear.BY[r.char.appearanceId].name + ' is ready');
    G.Flow.goMenu();
  }

  function backBtn(fn) {
    const b = document.createElement('button');
    b.className = 'btn ghost';
    b.type = 'button';
    b.textContent = 'Back';
    b.onclick = fn;
    return b;
  }
  function nextBtn(text, fn) {
    const b = document.createElement('button');
    b.className = 'btn gold';
    b.type = 'button';
    b.textContent = text;
    b.onclick = fn;
    return b;
  }

  /** Bloque +/- . `poolLeft` y `take` llevan la cuenta de puntos libres. */
  function statBlock(base, poolLeft, take, redraw) {
    const box = document.createElement('div');
    for (const k of G.Chars.KEYS) {
      const row = document.createElement('div');
      row.className = 'stepper';
      const minus = document.createElement('button');
      minus.className = 'btn small';
      minus.type = 'button';
      minus.textContent = '−';
      minus.disabled = (base[k] | 0) <= 0;
      minus.onclick = () => { if (base[k] > 0) { base[k]--; take(-1); redraw(); } };
      const plus = document.createElement('button');
      plus.className = 'btn small';
      plus.type = 'button';
      plus.textContent = '+';
      plus.disabled = poolLeft() <= 0;
      plus.onclick = () => { if (poolLeft() > 0) { base[k]++; take(1); redraw(); } };
      const name = document.createElement('span');
      name.textContent = G.Chars.LABEL[k];
      name.style.flex = '1';
      const val = document.createElement('b');
      val.textContent = String(base[k] | 0);
      row.append(name, minus, val, plus);
      box.appendChild(row);
    }
    return box;
  }

  /** Al subir de nivel: gasta los puntos libres (+4 por nivel). */
  let addDraft = null, lvEnt = null;
  function showLevelUp(ent, done) {
    ensure();
    lvEnt = ent;
    lvDone = done;
    const ch = ent.char;
    addDraft = G.Chars.blank();
    const who = (G.Appear.BY[ch.appearanceId] || G.Appear.ALL[0]).name;
    $('clv-sub').textContent = `${who} · Lv. ${ch.level} · ${ch.unspent} points left (+${G.Chars.PER_LEVEL} per level, cap ${G.Chars.CAP}).`;
    $('clv-err').textContent = '';
    paintLevel(ch);
    G.UI.show('scr-char-lv');
  }

  function paintLevel(ch) {
    const box = $('clv-stats');
    box.innerHTML = '';
    const left = () => (ch.unspent | 0) - G.Chars.sumStats(addDraft);
    for (const k of G.Chars.KEYS) {
      const row = document.createElement('div');
      row.className = 'stepper';
      const name = document.createElement('span');
      name.style.flex = '1';
      name.textContent = G.Chars.LABEL[k];
      const minus = document.createElement('button');
      minus.className = 'btn small';
      minus.type = 'button';
      minus.textContent = '−';
      minus.disabled = addDraft[k] <= 0;
      minus.onclick = () => { if (addDraft[k] > 0) { addDraft[k]--; paintLevel(ch); } };
      const plus = document.createElement('button');
      plus.className = 'btn small';
      plus.type = 'button';
      plus.textContent = '+';
      plus.disabled = left() <= 0;
      plus.onclick = () => { if (left() > 0) { addDraft[k]++; paintLevel(ch); } };
      const val = document.createElement('b');
      val.textContent = String((ch.stats[k] | 0) + addDraft[k]);
      row.append(name, minus, val, plus);
      box.appendChild(row);
    }
    const note = document.createElement('p');
    note.innerHTML = `Unspent: <b class="gold">${left()}</b>`;
    box.appendChild(note);
    $('clv-ok').disabled = left() !== 0;
  }

  function confirmLevel() {
    const ent = lvEnt;
    const ch = ent && ent.char;
    if (!ch) { finishLevel(); return; }
    const left = (ch.unspent | 0) - G.Chars.sumStats(addDraft);
    if (left !== 0) { $('clv-err').textContent = 'Spend all the points.'; return; }
    const r = G.DB.allocStats(addDraft);
    if (!r.ok) { $('clv-err').textContent = r.error || 'Could not save.'; return; }
    if (ent.applyCharBuild) ent.applyCharBuild(false);
    G.Audio.sfx('confirm');
    finishLevel();
  }

  function finishLevel() {
    G.UI.hide('scr-char-lv');
    const done = lvDone;
    lvDone = null;
    lvEnt = null;
    if (done) done();
  }

  /** Desde el menú, si quedaron puntos sin gastar. */
  function openAlloc(done) {
    const ch = G.DB.activeChar();
    if (!ch || !(ch.unspent > 0)) { if (done) done(); return; }
    showLevelUp({ char: ch, applyCharBuild(full) {
      const p = G.Game.player;
      if (p && p.char === ch && p.applyCharBuild) p.applyCharBuild(full);
    } }, done);
  }

  return { init, open, showLevelUp, openAlloc, ensure };
})();
