# Magical Survivor（魔力生存）

Fork de PokéSurvivor hacia un survival de navegador (mascotas, baldosas, hambre).
Este corte no es un MMO, no copia Magical Online / Cross Gate y no mete arte
oficial de Square Enix. El código upstream sigue bajo PolyForm Noncommercial
1.0.0 después del commit `b297089`. `LICENSE` y `LICENSE-NONCOMMERCIAL.md`
(incluido el Required Notice) no se reescriben. Esto no es una cesión de marcas.

Nombre de producto de este fork: **Magical Survivor**, subtítulo **魔力生存**.

## Cómo abrirlo

Hace falta un servidor estático. `file://` a veces arranca, pero el service
worker y Firebase sólo se registran por http(s).

```bash
python3 -m http.server 8765
```

Abre `http://127.0.0.1:8765/index.html` (o `dev.html`, la página fuente).
Los dos cargan los mismos `js/` sueltos. `js/app.min.js` es el bundle anterior
y **esta página ya no lo pide**. `node tools/build.js` volvería a generar
`index.html` con ese bundle; no hace falta para este humo.

Entra como invitado (o con una cuenta local), crea un personaje y pulsa **Jugar**.
El detalle de fichas, oficios y la mascota está en `docs/V1-CHARACTERS.md`.
`WASD` o las flechas mueven al humano. La mascota sigue sola. `Esc` pausa. La barra **Hambre** está bajo la vida.

## Arranque y bucle

1. `index.html` / `dev.html` pintan las pantallas. En el `<head>`: `js/core/locales.js`, `js/noframe.js`.
2. `js/boot.js` pone el texto de carga. El bloque `scripts:begin` … `scripts:end` carga el juego en orden y acaba en `js/game.js` y `js/main.js`.
3. `js/main.js` espera el DOM, comprueba que `G` tenga los módulos (`NEED`) y llama a `G.Flow.boot()`.
4. `G.Flow` (`js/game.js`) inicia la UI, `G.Game.init()` (canvas + `requestAnimationFrame`) y `G.DB.ready()`.
5. Tras el primer gesto (pantalla «Pulsa para empezar» si el navegador no deja sonar), sin personaje se abre crear/elegir; si ya hay uno, al menú. El test de personalidad ya no es el camino.
6. **Jugar** llama a `G.Game.startRun()`: mundo nuevo, humano (`G.Player`) y mascota (`G.Pet`), estado `playing`.
7. Cada frame, `update(dt)` mueve al jugador, enemigos, disparos y hambre. Si `pl.dead` y no es cooperativo, a los ~1,3 s `endRun()` vuelve al menú.

`G` en `dev.html` / este `index.html` está en `window` (sirve para mirar la partida en la consola). El bundle ofuscado lo escondía.

## Guardado

`js/core/db.js` (`G.DB`):

- Invitado: partida en memoria. Al salir no se guarda.
- Cuenta local: `localStorage` (`ps.accounts`, `ps.session`, `ps.save.<clave>`).
- Si hay red y `G.FIREBASE_CONFIG` (el proyecto upstream `pokesurvivor-free`), también puede usar Firebase. Este fork no cambia esas claves ni Identity Platform.
- La hambre es de la run: no entra en el save.
- `js/core/updater.js` mira `version.json` en la web publicada. Aquí no se regeneró el bundle, así que esa huella no cambia.

## Mapa de `js/`

| Carpeta | Qué es |
|---|---|
| `core/` | Util, idioma, ajustes, `db` (save), audio, input, mando, táctil, **sprites**, cámara, updater |
| `world/` | `tiles.js` (suelo pintado en código), `world.js` (chunks, choques, agua/lava) |
| `entities/` | Jugador, enemigos, disparos, orbes, efectos |
| `systems/` | Combate, spawner, niveles, gacha, grietas, clima, cooperativo de reglas, hambre no vive aquí |
| `ui/` | Menú, login, HUD, tienda, ajustes |
| `data/` | Pokédex, movimientos, metas de sprites, changelog, textos |
| `net/` | Amigos, WebRTC, ranking. Fuera de este corte |
| `lang/` | Diccionarios que pide `locales.js` |
| `game.js` | Estados de la run y `G.Flow` |
| `main.js` | Arranque |
| `boot.js` | Texto de la pantalla de carga |

## Qué dependía de arte Pokémon, y qué hace este corte

| Pieza | Antes | Ahora |
|---|---|---|
| Hojas `assets/pokemon/{dex}/{Anim}.png` y `s/` (SpriteCollab / PMD) | Las pedía `G.Sprites.sheet` | **No se piden.** `PLACEHOLDER_PETS` en `js/core/sprites.js` dibuja una mascota de 32×32 (4 fotogramas, 8 direcciones). `G.Sprites.placeholders === true` |
| Tamaño real de cada animación (`js/data/sprites-meta.js`) | Recorte de la hoja | El dibujo usa una geometría fija. El meta sigue cargado sólo para `hasShiny` y `hovers` |
| Suelo | Ya era pixel art en `js/world/tiles.js` | Igual. No hay tileset externo |
| Nombres, tipos, movimientos, gacha, tienda Kecleon | Datos y UI upstream | **Siguen.** La colección puede enseñar nombres de Pokémon. El interior de la tienda no se ha rehecho. Las páginas `pokedex/`, `guia/`, `en/` tampoco |
| `assets/og-image.jpg`, iconos, fuente Pixelify | Compartir / PWA | No se han sustituido. No se han añadido assets de Square Enix |
| `js/app.min.js` | Lo cargaba `index.html` | Sigue en el repo; `index.html` no lo referencia |

Para volver a las hojas PMD: en `js/core/sprites.js`, `PLACEHOLDER_PETS = false`. Hace falta el árbol `assets/pokemon/`.

## Hambre

En `js/entities/player.js`, durante la run:

- Quieto: 0,65 por segundo (~2,5 min hasta vacío).
- Caminando: 2,1 por segundo (~48 s).
- A 0, daño puro (~14 % de la vida cada 0,8 s) por el mismo `hurt()` que un golpe. La run acaba como siempre.
- Un orbe de cura llama a `feed(40)` además de curar (`js/game.js`).
- El HUD pinta la barra (`js/ui/hud.js`).
- No se sincroniza en cooperativo (el protocolo no lleva el campo). En solitario es la que cuenta.
- Revivir en grupo deja al menos un 45 % de hambre.

## Qué queda a medias

- El camino de juego es el personaje (ver `docs/V1-CHARACTERS.md`). El test de personalidad sigue en el código y ya no abre al entrar.
- Gacha, grietas, legendarios, nombres de ataques y la tienda por dentro son el juego anterior.
- El hambre en grupo no viaja por la red.
- `node tools/build.js` no se ha lanzado: ofuscar `app.min.js` no aporta al humo y pisa el `index.html` de este corte.
- La SEO en otros idiomas (`en/index.html`, etc.) sigue con el título anterior.

## Comprobado en este corte

Servidor: `python3 -m http.server 8765`. Página: `http://127.0.0.1:8765/index.html` en Chromium, ventana 1280×800, idioma del navegador en inglés.

- El boot desaparece, invitado, test y menú **Magical Survivor / 魔力生存**.
- Jugar entra en `state === 'playing'`. `G.Sprites.placeholders === true`. La hoja del jugador tiene `src` vacío (canvas, no PNG).
- Mantener `D` ~1,5 s mueve al jugador de x=0 a x≈162. La hambre pasa de 100 a ~96,8, que cuadra con 2,1 por segundo.
- Cero peticiones a `/assets/pokemon/`. Cero errores de consola. El único aviso es el de Firestore del SDK upstream («overriding the original host»); no corta el bucle.
- Con la hambre forzada a 0, la run llega a `state === 'over'` y sale «Has caído…» / «You fell…». No hay crash.

`document.title` lo pisa `js/core/i18n.js` al arrancar; queda en Magical Survivor, no en el título anterior.
