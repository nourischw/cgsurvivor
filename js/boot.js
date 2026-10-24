/* ============ boot.js — lo primero que corre (antes estaba dentro del HTML) ============
 * Fuera del HTML para que la política de seguridad (CSP, en dev.html) pueda
 * prohibir todo el código metido en la página: así, aunque algún día se
 * colara texto con código en algo que se pinta, el navegador no lo ejecuta.
 *   - PS_PAGES: hay guía y Pokédex (no con --sin-seo, ver tools/build.js).
 *   - El idioma de la pantalla de carga, antes de que cargue el juego.
 */
window.PS_PAGES = !!document.querySelector('meta[name="ps-pages"]');
(function () {
  // El idioma lo elige locales.js (en el <head>).
  var copy = {
    es: ['Magical Survivor（魔力生存）: explora, cuida el hambre y sobrevive.', 'Cargando…'],
    en: ['Magical Survivor（魔力生存）: explore, watch your hunger, survive.', 'Loading…'],
    fr: ['Magical Survivor（魔力生存）: explore, surveille la faim, survis.', 'Chargement…'],
    it: ['Magical Survivor（魔力生存）: esplora, tieni d’occhio la fame, sopravvivi.', 'Caricamento…'],
    'pt-BR': ['Magical Survivor（魔力生存）: explore, cuide da fome e sobreviva.', 'Carregando…'],
    'zh-Hans': ['Magical Survivor（魔力生存）：探索、留意饥饿、活下去。', '加载中…'],
    'zh-Hant': ['Magical Survivor（魔力生存）：探索、留意飢餓、活下去。', '載入中…']
  }[window.PS_LOCALES && window.PS_LOCALES.lang];
  if (!copy) return;
  var p = document.querySelectorAll('#boot p');
  p[0].textContent = copy[0]; p[1].textContent = copy[1];
})();

