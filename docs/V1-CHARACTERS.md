# Characters v1

A character is the human you move. The pet is a separate entity: it follows you and attacks on its own.
This is not an MMO. This path does not use Square Enix art or `assets/pokemon/` sheets.
Appearance names 1–28 come from the public list [molibaike.com/role](https://www.molibaike.com/role). The drawing is a canvas figure. The last two names (`旅人`, `學徒`) are original fillers so the list reaches 30. There is no trademark clearance.

The fork starts in English. Another language is used only when `ps.lang` was saved from Settings.

## How to open it

```bash
python3 -m http.server 8765
```

`http://127.0.0.1:8765/index.html` (or `dev.html`). Guest, or an account in this browser if the cloud does not start.

1. Pick an empty slot (maximum 2).
2. Appearance → job → spend 30 points → a starter beast.
3. On the menu, **Play**. `WASD` moves the human. The pet does not answer the keyboard.
4. The **Hunger** bar stays on the human. At zero, the run falls as before.

**Characters** returns to the slots. With unspent points, **Spend points**.

## Save (`G.DB.save`)

```js
chars: [ {
  id,                  // string
  appearanceId,        // 1..30
  jobId,               // sword | axe | brawl | bow | ninja | mage | priest | wizard | curse
  level,               // 1..120
  exp,                 // toward the next level
  unspent,             // unspent points
  stats: { vit, str, def, spd, mag },  // 體力 力量 強度 速度 魔法
  activePetId,         // 1..161
  created
} ],
activeChar             // index, or null
```

On create, the five stats sum to 30 and `unspent` is 0. Each level gives +4 (`G.Chars.PER_LEVEL`). At 120 you gain no more experience or points.

Guest: the record lives in memory (`commit` does not write). Local account: `localStorage` `ps.save.<key>`. Hunger is not saved.

`G.DB.createChar` rejects a third character (`Maximum of 2 characters.`).

## What each stat does in a run

| Stat | Effect |
|---|---|
| 體力 vit | HP: `64 + vit×8 + (level−1)×3` |
| 力量 str | Damage of physical skills |
| 魔法 mag | Damage of magic skills |
| 強度 def | Less damage taken (up to 48%) |
| 速度 spd | More speed and shorter cooldowns |

Each job brings 2 or 3 skills. They fire on their own (the active group in `G.Combat`). The player does not aim the pet: `G.Pet` does not read `G.Input`.

The beast catalog is `G.Beasts.ALL` (id 1..161, placeholder names). Create shows the first 12. Drawing is `PLACEHOLDER_PETS`.

Job names stay the Chinese product names (劍士, 戰斧鬥士, 格鬥士, 弓箭手, 忍者, 魔術師, 傳教士, 巫師, 咒術師). The gloss next to each name is English.

## Still stubbed

- Gacha, Pokédex, the shop, rifts, and the personality test remain in the menu or in the code, off this path.
- Co-op does not spend level-up points (they stay in `unspent` for the menu) and the pet is not sent over the network.
- The old run ranking does not receive character runs (the `dex` is no longer a card from that collection).
- The full 400 pets are not here. There is no official art.

## Verified

Chromium smoke on 24 Oct 2026 against `http://127.0.0.1:8765/index.html` (static server, viewport 1280×800). Requests to gstatic / Firebase were blocked on purpose so no production account was created: `G.DB.mode` stayed `local` (`localReason` `error`, the Firebase script did not load). No page errors. No request or `performance` resource pointed at `/assets/pokemon/`, Square Enix, or Cross Gate.

**Guest.** Empty slot → default look → 劍士 → 30 points on the `+` buttons (6 / 10 / 4 / 6 / 4) → Minel-001 → Save. The menu showed `阿咪 · 劍士` and `Nv. 1 · Minel-001` (that build still used the Spanish level tag). Play: `dex` 0, skills `job-slash`, `job-thrust`, `job-wave`, `G.Sprites.placeholders === true`, `pet.controlled === false`.

**Move and hunger.** With `KeyD` the human went from x 0 to x 86. The pet stayed behind (x ≈ 50). Hunger fell from 78.02 to 76.24 on that stretch; before that, standing still, it had already fallen from 100 to about 78. Mid-move the run leveled on its own and the game stopped on the card, so it was not a full 1.5 s of walking.

**Level-up.** Enemy experience opened `#scr-char-lv` without a hand-placed orb: `阿咪 · Nv. 2 · 4 puntos libres (+4 por Level, tope 120).` Continue was disabled. Four `+` on 力量 and Continue: strength 10 → 14, `unspent` 0, max HP 115 (`64 + 6×8 + 1×3`). A second level (Lv. 3, another 4 points) left strength at 18. In memory, `G.Chars.gain` at level 119 with 999999 exp returns 1 level and lands on 120 with 4 points and exp 0; a second `gain` returns 0 and changes nothing.

**Pet.** With the run `playing`, a still enemy at 9000 HP next to the pet: in 2.5 s `pet.hits` 0 → 2 and `pet.dmgDealt` +16 (`7 + 2×0.45` at level 3, two bites). Its HP fell to 8798 because the swordsman’s skills also hit it. The pet does not read the keyboard.

**Cap of 2.** A second `createChar` (艾露, 魔術師) succeeded; the third returned `{ ok:false, error:'Máximo 2 personajes.' }` on that build. The screen had two cells, the notice to delete one before creating another, and the cards `阿咪 · 劍士 · Nv.3` and `艾露 · 魔術師 · Nv.1`. There is no third slot. The error string is now `Maximum of 2 characters.`

**Local account.** Sign-up `mslocal24` → 魔術師, 4/2/4/4/16 (magic 16), Kafen-002. `localStorage` `ps.save.mslocal24`: 1 character, stat sum 30, `activeChar` 0. After reload the menu was still `阿咪 · 魔術師` / `Nv. 1 · Kafen-002` without creating again. Play: skills `job-bolt`, `job-ice`, `job-burst`. `KeyD` for 0.9 s: +85 on x, pet behind, hunger −1.9, `controlled === false`, placeholders on.

**English UI (25 Oct 2026).** Fresh Chromium load of `index.html` with `localStorage` cleared and gstatic/Firebase blocked. `ps.lang` was null, `document.documentElement.lang` and `G.I18n.lang` were `en`. Boot copy: “explore, watch your hunger, survive.” / “Loading…”. Title: `Magical Survivor（魔力生存）– browser survival`. Login tab “Log in”, button “Play as guest”.

Character create, in order: “Choose a character” / “Up to 2 per account. The job is separate from the look.” / “Slot 1” “Empty”. Then “Appearance” / “Look only. The job comes next. Placeholder drawing, no official art.” / button “Job”. Job card: `劍士` / “Swordsman · 力量 Strength” / “Cuts up close and sends a slash through the line.” / `斬擊 · 突刺 · 劍氣`. Points: “Spend 30 points”, labels `體力 Vitality`, `力量 Strength`, `強度 Defense`, `速度 Speed`, `魔法 Magic`, “0” left. Pet: “Starting pet” and “Save”. Menu: `阿咪 · 劍士`, `Lv. 1 · Minel-001`, button “Characters”, “Play / Enter the dungeon”. Level-up card: “Level up”, `阿咪 · Lv. 2 · 4 points left (+4 per level, cap 120).`, “Unspent: 4”, “Continue” disabled until the points are spent. No `/assets/pokemon/` request. A saved `ps.lang` still overrides this default; this pass did not click another language in Settings.
