# Personajes v1

Un personaje es el humano que mueves. La mascota es otra entidad: te sigue y pega sola.
Esto no es un MMO. No usa arte de Square Enix ni hojas de `assets/pokemon/` en este camino.
Los nombres de apariencia 1–28 salen de la lista pública [molibaike.com/role](https://www.molibaike.com/role). El dibujo es un muñeco de canvas. Los dos últimos nombres (`旅人`, `學徒`) son relleno original para llegar a 30. No hay cesión de marca.

## Cómo abrirlo

```bash
python3 -m http.server 8765
```

`http://127.0.0.1:8765/index.html` (o `dev.html`). Invitado, o una cuenta de este navegador si la nube no arranca.

1. Elige un hueco vacío (máximo 2).
2. Apariencia → oficio → reparte 30 puntos → una bestia de inicio.
3. En el menú, **Jugar**. `WASD` mueve al humano. La mascota no responde al teclado.
4. La barra **Hambre** sigue en el humano. A cero, la run cae como antes.

`Personajes` vuelve a los huecos. Con puntos sin gastar, **Repartir puntos**.

## Save (`G.DB.save`)

```js
chars: [ {
  id,                  // string
  appearanceId,        // 1..30
  jobId,               // sword | axe | brawl | bow | ninja | mage | priest | wizard | curse
  level,               // 1..120
  exp,                 // hacia el siguiente nivel
  unspent,             // puntos sin gastar
  stats: { vit, str, def, spd, mag },  // 體力 力量 強度 速度 魔法
  activePetId,         // 1..161
  created
} ],
activeChar             // índice, o null
```

Al crear, la suma de los cinco stats es 30 y `unspent` es 0. Cada nivel da +4 (`G.Chars.PER_LEVEL`). En el 120 no se gana más experiencia ni puntos.

Invitado: la ficha vive en memoria (`commit` no escribe). Cuenta local: `localStorage` `ps.save.<clave>`. La hambre no se guarda.

`G.DB.createChar` rechaza un tercer personaje.

## Qué hace cada stat en la run

| Stat | Efecto |
|---|---|
| 體力 vit | Vida: `64 + vit×8 + (nivel−1)×3` |
| 力量 str | Daño de habilidades físicas |
| 魔法 mag | Daño de habilidades mágicas |
| 強度 def | Menos daño recibido (hasta un 48 %) |
| 速度 spd | Más velocidad y recargas más cortas |

Cada oficio trae 2 o 3 habilidades. Salen solas (el grupo activo de `G.Combat`). El jugador no elige el blanco de la mascota: `G.Pet` no lee `G.Input`.

El catálogo de bestias es `G.Beasts.ALL` (id 1..161, nombres de marcador). El alta enseña las 12 primeras. El dibujo es `PLACEHOLDER_PETS`.

## Qué queda a medias

- Gacha, Pokédex, tienda, grietas y el test de personalidad siguen en el menú o en el código, fuera de este camino.
- El cooperativo no reparte los puntos al subir de nivel (se quedan en `unspent` para el menú) y la mascota no viaja por la red.
- El ranking de la run anterior no recibe partidas de personaje (el `dex` ya no es una ficha de esa colección).
- Las 400 mascotas no están. No hay arte oficial.

## Comprobado

Humo en Chromium el 24-10-2026 contra `http://127.0.0.1:8765/index.html` (servidor estático, viewport 1280×800). Las peticiones a `gstatic` / Firebase se cortaron a propósito para no crear una cuenta en el proyecto de producción: `G.DB.mode` quedó en `local` (`localReason` `error`, el script de Firebase no cargó). No hubo errores de página. Ninguna petición ni recurso de `performance` apuntó a `/assets/pokemon/`, Square Enix o Cross Gate. El idioma del navegador era inglés, así que el traductor del DOM pasó algunos botones a Save / Quit run; los títulos de apariencia y oficio siguieron en chino.

**Invitado.** Hueco vacío → aspecto por defecto → 劍士 → 30 puntos con los `+` (6 / 10 / 4 / 6 / 4) → Minel-001 → el botón dorado (Save). El menú mostró `阿咪 · 劍士` y `Nv. 1 · Minel-001`. Jugar: `dex` 0, habilidades `job-slash`, `job-thrust`, `job-wave`, `G.Sprites.placeholders === true`, `pet.controlled === false`.

**Moverse y hambre.** Con `KeyD` el humano pasó de x 0 a x 86. La mascota quedó detrás (x ≈ 50). La hambre bajó de 78.02 a 76.24 en ese tramo; antes, quieto, ya había bajado de 100 a ~78. A mitad del paso la run subió de nivel sola y el juego se paró en la carta, así que no fueron 1,5 s enteros andando.

**Subir de nivel.** La experiencia de los enemigos abrió `#scr-char-lv` sin soltar orbes a mano: `阿咪 · Nv. 2 · 4 puntos libres (+4 por Level, tope 120).` Seguir estaba desactivado. Cuatro `+` en 力量 y Seguir: fuerza 10 → 14, `unspent` 0, vida máxima 115 (64 + 6×8 + 1×3). Un segundo nivel (Nv. 3, otros 4 puntos) dejó la fuerza en 18. En memoria, `G.Chars.gain` con nivel 119 y 999999 de exp devuelve 1 nivel, queda en 120 con 4 puntos y exp 0; un segundo `gain` devuelve 0 y no mueve nada.

**Mascota.** Con la run en `playing`, un enemigo quieto de 9000 PV junto a la mascota: en 2,5 s `pet.hits` 0 → 2 y `pet.dmgDealt` +16 (7 + 2×0,45 por el nivel 3, dos mordiscos). Su vida bajó a 8798 porque las habilidades del espadachín también le dieron. La mascota no lee el teclado.

**Tope de 2.** `createChar` del segundo (艾露, 魔術師) ok; el tercero responde `{ ok:false, error:'Máximo 2 personajes.' }`. En Personajes hay dos celdas, el aviso «Máximo 2 personajes. Borra uno para crear otro.» y las fichas `阿咪 · 劍士 · Nv.3` y `艾露 · 魔術師 · Nv.1`. No hay tercer hueco.

**Cuenta local.** Crear cuenta `mslocal24` → 魔術師, 4/2/4/4/16 (magia 16), Kafen-002. `localStorage` `ps.save.mslocal24`: 1 personaje, suma de stats 30, `activeChar` 0. Tras recargar, el menú volvió a `阿咪 · 魔術師` / `Nv. 1 · Kafen-002` sin pasar por el alta. Jugar: habilidades `job-bolt`, `job-ice`, `job-burst`. `KeyD` 0,9 s: +85 en x, la mascota detrás, hambre −1,9, `controlled === false`, placeholders activos.
