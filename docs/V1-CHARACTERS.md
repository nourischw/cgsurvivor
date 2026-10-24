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

Pendiente del humo en navegador de este corte. Se rellena al cerrar la prueba.
