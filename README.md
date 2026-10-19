# Colgate Luminous White Color Correct — Landing conceptual

> **Trabajo académico.** Pieza conceptual para el pitch de una campaña 360°. No es un sitio oficial de Colgate-Palmolive; la página lleva `noindex` y un aviso visible.

Landing mobile-first de awareness y consideración para hombres de 18 a 30 años. El QR pegado a los **testers en el punto de venta** (Farmacity, boliches, supermercados) lleva a la landing. Ahí el usuario entiende cómo funciona la tecnología violeta y se anota en el sorteo de una camiseta firmada por Julián Álvarez.

## Estructura

```
docs/                 ← el sitio (GitHub Pages sirve esta carpeta)
  index.html          ← la landing
  styles.css          ← paleta tomada del pack + tipografía
  app.js              ← demo interactiva, antes/después, form, analytics
  config.js           ← URLs y claves (lo único que hay que editar)
  assets/             ← pack del producto + QR del pitch
  qr/                 ← QR por punto de venta (SVG para imprenta, PNG) + imprimir.html
apps-script/Code.gs   ← backend del sorteo (Google Sheets)
scripts/generar-qr.mjs← generador de QR
```

## Secciones y el insight que responde cada una

| # | Sección | Insight |
|---|---|---|
| ① | Hero "No te prometemos nada. Te lo mostramos." (cambia según el punto de venta) | Desconfianza en la eficacia (52%) |
| ② | Demo interactiva: el violeta neutraliza el amarillo | Mostrar, no prometer; parte didáctica |
| ③ | Antes / después de "gente como vos" | 69% confía en el antes/después de alguien conocido |
| ④ | Aval de odontólogos, flúor, efecto al instante | Odontólogo = fuente n.º 1; miedo al esmalte (42%) |
| ⑤ | Momentos (humor seco) | Sonrisa como carta de presentación, sin sumar pasos |
| ⑥ | Preguntas frecuentes | Abandono: 2 de cada 3 lo dejan si esperan otra cosa |
| ⑦ | Sorteo + compartir por WhatsApp | Gatillo de conversión + recomendación entre pares |

## Correr en local

```bash
npm install
npm run dev          # http://localhost:5173
# probar la versión de un punto de venta:
# http://localhost:5173/?pdv=farmacity   (o boliche / supermercado)
```

Sin `APPS_SCRIPT_URL` configurada, el formulario funciona en **modo demo**: guarda las participaciones en el navegador (`localStorage`, clave `cc_demo_entries`).

## Publicar en GitHub Pages

1. Hacé público el repo (Settings → General → Danger Zone → Change visibility).
2. Settings → Pages → *Build and deployment* → Source: **Deploy from a branch** → elegí la rama y la carpeta **`/docs`** → Save.
3. En 1 o 2 minutos queda en `https://paddymurray1.github.io/austral/`.
4. Si la URL final es otra, cambiá `SITE_URL` en `docs/config.js` y regenerá los QR (`npm run qr`).

## Conectar Google Sheets (sorteo)

1. Creá una Google Sheet nueva → Extensiones → **Apps Script**.
2. Pegá el contenido de `apps-script/Code.gs` y guardá.
3. **Implementar → Nueva implementación** → tipo **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
4. Autorizá los permisos y copiá la URL que termina en `/exec`.
5. Pegala en `APPS_SCRIPT_URL` dentro de `docs/config.js`, y hacé commit y push.

Cada participación entra como una fila en la hoja *Participantes* (fecha, nombre, email, edad, punto de venta elegido, punto de venta del QR, origen). Los emails repetidos no se duplican. La landing muestra el contador "N ya se anotaron".

## Conectar Google Analytics 4

1. En analytics.google.com: Admin → Crear propiedad → Flujo de datos **Web** con la URL de GitHub Pages.
2. Copiá el **ID de medición** (`G-XXXXXXXXXX`) en `GA_MEASUREMENT_ID` dentro de `docs/config.js`.
3. Admin → Definiciones personalizadas → crear dimensiones de evento: `pdv`, `section`, `cta`, `pregunta`, `persona`, `pdv_elegido`.
4. Durante el pitch: **Informes → Tiempo real** muestra las visitas y los eventos en vivo.

Eventos que manda la landing:

| Evento | Cuándo |
|---|---|
| `section_view` | Se vio cada sección (arma el embudo) |
| `demo_start` / `demo_complete` | Empezó o terminó la demo del violeta |
| `ba_slide` / `ba_persona` | Usó el antes/después o cambió de persona |
| `faq_open` | Abrió una pregunta |
| `cta_click` | Tocó un botón (`cta` indica cuál) |
| `sorteo_submit` | Se anotó en el sorteo |
| `share_whatsapp` | Compartió con un amigo |

Todos llevan el parámetro `pdv` (farmacity / boliche / supermercado / directo). Los QR también llevan UTM (`utm_source=qr`, `utm_medium=pos`, `utm_content=<pdv>`).

## QR

```bash
npm run qr
```

Genera:
- `docs/qr/qr-farmacity|boliche|supermercado.svg` (vector para imprenta) y `.png` (1200 px)
- `docs/qr/imprimir.html`: una hoja lista para imprimir con los tres QR
- `docs/assets/qr-pitch.svg`: el QR que aparece en la versión de escritorio de la landing (para proyectarla)

## Reemplazar las imágenes del antes/después

Hoy la sección ③ usa sonrisas ilustradas. Para usar fotos (IA o reales), dejá estos archivos y la landing los toma solos:

```
docs/assets/personas/antes-1.jpg   docs/assets/personas/despues-1.jpg
docs/assets/personas/antes-2.jpg   docs/assets/personas/despues-2.jpg
docs/assets/personas/antes-3.jpg   docs/assets/personas/despues-3.jpg
```

Formato 4:3, mismo encuadre en el antes y el después. Los nombres se cambian en `PEOPLE` dentro de `docs/app.js`.

## Marca

Los colores salen del render oficial del pack (`#D9221F` rojo, `#673D98` violeta Color Correct, `#EAE8F2` lavanda). La tipografía de Colgate (Colgate Ready) es propietaria, así que se usa **Archivo** para títulos e **Inter** para texto (Google Fonts).
