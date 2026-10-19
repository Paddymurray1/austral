// Genera los QR de cada punto de venta (SVG para imprenta + PNG) y la hoja para imprimir.
// Uso: npm run qr   (toma SITE_URL de docs/config.js)
import QRCode from "qrcode";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const root = new URL("../docs/", import.meta.url);
const config = await readFile(new URL("config.js", root), "utf8");
const SITE_URL = config.match(/SITE_URL:\s*"([^"]+)"/)[1];

const PUNTOS = [
  { id: "farmacity", nombre: "Farmacity" },
  { id: "boliche", nombre: "Boliches" },
  { id: "supermercado", nombre: "Supermercados" }
];

const url = (params) => `${SITE_URL}?${new URLSearchParams(params)}`;
const opts = { errorCorrectionLevel: "M", margin: 2, color: { dark: "#1A1420", light: "#FFFFFF" } };

await mkdir(new URL("qr/", root), { recursive: true });

// QR del pitch / desktop (sin punto de venta)
await writeFile(
  new URL("assets/qr-pitch.svg", root),
  await QRCode.toString(url({ utm_source: "qr", utm_medium: "pitch", utm_campaign: "color_correct" }), { ...opts, type: "svg" })
);

const cards = [];
for (const p of PUNTOS) {
  const target = url({ pdv: p.id, utm_source: "qr", utm_medium: "pos", utm_campaign: "color_correct", utm_content: p.id });
  const svg = await QRCode.toString(target, { ...opts, type: "svg" });
  await writeFile(new URL(`qr/qr-${p.id}.svg`, root), svg);
  await QRCode.toFile(new URL(`qr/qr-${p.id}.png`, root).pathname, target, { ...opts, width: 1200 });
  cards.push({ ...p, svg, target });
  console.log(`✓ ${p.nombre.padEnd(14)} ${target}`);
}

const html = `<!doctype html>
<html lang="es-AR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>QR para testers — Color Correct</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@800;900&family=Inter:wght@500;600&display=swap" rel="stylesheet">
<style>
  body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #EAE8F2; color: #1A1420; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; padding: 24px; }
  .card { background: #fff; border-radius: 18px; padding: 22px; text-align: center; border-top: 10px solid #673D98; break-inside: avoid; }
  .card h2 { font: 900 26px/1.05 Archivo, sans-serif; margin: 0 0 6px; }
  .card p { margin: 0; }
  .card svg { width: 100%; max-width: 300px; height: auto; margin: 14px auto; display: block; }
  .pdv { font: 800 12px/1 Archivo, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #673D98; margin-bottom: 12px !important; }
  .url { font-size: 10px; color: #4B4356; word-break: break-all; margin-top: 8px !important; }
  .note { padding: 0 24px 24px; font-size: 13px; color: #4B4356; }
  @media print { body { background: #fff; } .note { display: none; } .card { border: 1px solid #ddd; } }
</style></head><body>
<div class="grid">
${cards.map((c) => `  <div class="card">
    <p class="pdv">Tester · ${c.nombre}</p>
    <h2>Probalo. Mirate al espejo.</h2>
    <p>Escaneá y participá por una camiseta firmada por Julián Álvarez.</p>
    ${c.svg}
    <p class="url">${c.target}</p>
  </div>`).join("\n")}
</div>
<p class="note">Imprimí con Ctrl/Cmd + P. Cada QR identifica su punto de venta en Google Analytics y en la planilla del sorteo.</p>
</body></html>
`;
await writeFile(new URL("qr/imprimir.html", root), html);
console.log("✓ docs/qr/imprimir.html y docs/assets/qr-pitch.svg");
