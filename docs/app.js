(function () {
  "use strict";

  var CFG = window.CC_CONFIG || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Punto de venta (viene en el QR: ?pdv=farmacity) ---------- */
  var PDV_COPY = {
    farmacity: ["¿Recién lo probaste en Farmacity?", "Mirate al espejo. Eso es Color Correct, al instante."],
    boliche: ["¿Lo probaste en el baño del boliche?", "Mirate al espejo. Después volvé a la pista."],
    supermercado: ["¿Lo probaste en el súper?", "Buscá un reflejo. La puerta de la heladera sirve."]
  };

  var pdv = (function () {
    var fromUrl = new URLSearchParams(location.search).get("pdv");
    try {
      if (fromUrl) sessionStorage.setItem("cc_pdv", fromUrl);
      return (fromUrl || sessionStorage.getItem("cc_pdv") || "").toLowerCase();
    } catch (e) { return (fromUrl || "").toLowerCase(); }
  })();

  /* ---------- Analytics (GA4) ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  if (CFG.GA_MEASUREMENT_ID) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CFG.GA_MEASUREMENT_ID);
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", CFG.GA_MEASUREMENT_ID, { pdv: pdv || "directo" });
  }

  function track(name, params) {
    params = params || {};
    params.pdv = pdv || "directo";
    if (CFG.GA_MEASUREMENT_ID) gtag("event", name, params);
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") console.info("[track]", name, params);
  }

  $$("[data-track]").forEach(function (el) {
    el.addEventListener("click", function () {
      track(el.getAttribute("data-track"), { cta: el.getAttribute("data-cta") || "" });
    });
  });

  // Qué secciones se vieron: arma el embudo de awareness → consideración en GA4
  if ("IntersectionObserver" in window) {
    var seen = {};
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !seen[e.target.id]) {
          seen[e.target.id] = true;
          track("section_view", { section: e.target.id });
        }
      });
    }, { threshold: 0.4 });
    $$("main > section").forEach(function (sec) { secObs.observe(sec); });
  }

  /* ---------- Hero según punto de venta ---------- */
  if (PDV_COPY[pdv]) {
    var lead = $("[data-hero-lead]");
    lead.textContent = PDV_COPY[pdv][0];
    var sub = document.createElement("small");
    sub.textContent = PDV_COPY[pdv][1];
    lead.appendChild(sub);
  }

  $$("[data-farmaonline]").forEach(function (a) { a.href = CFG.FARMAONLINE_URL || "https://www.farmaonline.com/"; });

  /* ---------- Sonrisa ilustrada (SVG) ---------- */
  var uid = 0;
  function smileSVG(opts) {
    var id = "m" + (++uid);
    var skin = opts.skin, lip = opts.lip;
    var mouth = "M70 120 C130 95 270 95 330 120 C310 215 250 240 200 240 C150 240 90 215 70 120 Z";
    var upper = [[44, 66], [38, 62], [32, 56], [26, 50], [22, 46]];
    var teeth = [];
    var x = 200;
    upper.forEach(function (t) { teeth.push([x + 1.5, 108, t[0] - 3, t[1]]); x += t[0]; });
    x = 200;
    upper.forEach(function (t) { x -= t[0]; teeth.push([x + 1.5, 108, t[0] - 3, t[1]]); });
    for (var i = 0; i < 10; i++) teeth.push([80 + i * 24 + 1.5, 186, 21, 48]);

    function rects(cls) {
      return teeth.map(function (r) {
        return '<rect class="' + cls + '" x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="9"/>';
      }).join("");
    }
    var shine = teeth.map(function (r) {
      return '<rect x="' + (r[0] + 4) + '" y="' + (r[1] + 8) + '" width="' + (r[2] * 0.22) + '" height="' + (r[3] * 0.55) + '" rx="3" fill="#fff" opacity=".28"/>';
    }).join("");

    return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sonrisa ilustrada">' +
      '<defs><clipPath id="' + id + '"><path d="' + mouth + '"/></clipPath>' +
      '<radialGradient id="' + id + 'g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient></defs>' +
      '<rect width="400" height="300" fill="' + skin + '"/>' +
      '<rect width="400" height="300" fill="url(#' + id + 'g)"/>' +
      '<g clip-path="url(#' + id + ')">' +
        '<rect width="400" height="300" fill="#3B1216"/>' +
        '<rect x="0" y="90" width="400" height="30" fill="#C9606F"/>' +
        rects("tooth") + rects("veil") + shine +
      '</g>' +
      '<path d="M70 120 C130 95 270 95 330 120" fill="none" stroke="' + lip + '" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="M70 120 C90 215 150 240 200 240 C250 240 310 215 330 120" fill="none" stroke="' + lip + '" stroke-width="18" stroke-linecap="round"/>' +
      '</svg>';
  }

  function hexToRgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, t) {
    var A = hexToRgb(a), B = hexToRgb(b);
    return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(A[i] + (B[i] - A[i]) * t); }).join(",") + ")";
  }

  var YELLOW = "#E6C980", WHITE = "#F4F3FA";

  /* ---------- ② Demo interactiva ---------- */
  var demo = $('[data-smile="demo"]');
  var demoRange = $("[data-demo-range]");
  var readout = $("[data-demo-readout]");
  var demoNext = $("[data-demo-next]");
  if (demo && demoRange) {
    demo.innerHTML = smileSVG({ skin: "#E3B08F", lip: "#B5646A" });
    var started = false, completed = false;

    var renderDemo = function () {
      var t = demoRange.value / 100;
      demo.style.setProperty("--tooth", mix(YELLOW, WHITE, t));
      // El "velo" violeta aparece en el medio del cepillado y se disuelve al neutralizar
      demo.style.setProperty("--veil", (Math.sin(Math.PI * t) * 0.55).toFixed(3));
      var msg;
      if (t === 0) msg = "Arrastrá para cepillar →";
      else if (t < 0.4) msg = "El violeta se deposita sobre el diente…";
      else if (t < 0.97) msg = "…y cancela el amarillo.";
      else msg = "Eso. Esa es toda la ciencia.";
      readout.textContent = msg;

      if (!started && t > 0) { started = true; track("demo_start"); }
      if (!completed && t >= 0.97) { completed = true; track("demo_complete"); }
      demoNext.hidden = t < 0.97;
    };
    demoRange.addEventListener("input", renderDemo);
    renderDemo();
  }

  /* ---------- ③ Antes / después ---------- */
  // Para usar fotos (IA o reales): dejá antes-N.jpg y despues-N.jpg en assets/personas/
  var PEOPLE = [
    { name: "Tomás, 23 · Palermo", skin: "#E3B08F", lip: "#B5646A", before: "#DDBB6E" },
    { name: "Nico, 19 · Morón", skin: "#C48A64", lip: "#97504D", before: "#E2C27A" },
    { name: "Facu, 27 · Lanús", skin: "#8A5A3E", lip: "#6A3A33", before: "#D9B565" }
  ];

  var ba = $("[data-ba]");
  if (ba) {
    var frame = $(".ba__frame", ba);
    var before = $("[data-ba-before]", ba);
    var after = $("[data-ba-after]", ba);
    var range = $("[data-ba-range]", ba);
    var nameEl = $("[data-ba-name]", ba);
    var dots = $("[data-ba-dots]", ba);
    var slid = {};
    var current = 0;

    var layer = function (el, src, svg, tooth) {
      el.innerHTML = svg;
      el.style.setProperty("--tooth", tooth);
      var img = new Image();
      img.alt = "";
      img.onload = function () { el.innerHTML = ""; el.appendChild(img); };
      img.src = src;
    };

    var showPerson = function (i) {
      current = i;
      var p = PEOPLE[i];
      var svg = smileSVG(p);
      before.classList.add("smile"); after.classList.add("smile");
      layer(before, "assets/personas/antes-" + (i + 1) + ".jpg", svg, p.before);
      layer(after, "assets/personas/despues-" + (i + 1) + ".jpg", svg, WHITE);
      nameEl.textContent = p.name;
      range.value = 50;
      frame.style.setProperty("--pos", "50%");
      $$("button", dots).forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); });
    };

    PEOPLE.forEach(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.textContent = p.name.split(",")[0];
      b.addEventListener("click", function () { showPerson(i); track("ba_persona", { persona: i + 1 }); });
      dots.appendChild(b);
    });

    range.addEventListener("input", function () {
      frame.style.setProperty("--pos", range.value + "%");
      if (!slid[current]) { slid[current] = true; track("ba_slide", { persona: current + 1 }); }
    });

    showPerson(0);
  }

  /* ---------- ⑥ FAQ ---------- */
  $$(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) track("faq_open", { pregunta: d.getAttribute("data-faq") });
    });
  });

  /* ---------- ⑦ Sorteo ---------- */
  var form = $("[data-form]");
  var done = $("[data-done]");
  var errorEl = $("[data-form-error]");
  var submitBtn = $("[data-submit]");
  var counter = $("[data-counter]");
  var counterN = $("[data-counter-n]");
  var count = null;

  var pdvSelect = $("#f-pdv");
  if (pdvSelect && $('option[value="' + pdv + '"]', pdvSelect)) pdvSelect.value = pdv;

  var showCount = function (n) {
    count = n;
    counterN.textContent = n.toLocaleString("es-AR");
    counter.hidden = n < 1;
  };

  if (CFG.APPS_SCRIPT_URL) {
    fetch(CFG.APPS_SCRIPT_URL + "?action=count")
      .then(function (r) { return r.json(); })
      .then(function (d) { if (typeof d.count === "number") showCount(d.count); })
      .catch(function () {});
  }

  var fail = function (msg, field) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
  };

  form.addEventListener("input", function (e) { e.target.removeAttribute("aria-invalid"); errorEl.hidden = true; });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;
    var f = form.elements;
    var nombre = f.nombre.value.trim();
    var email = f.email.value.trim();
    var edad = parseInt(f.edad.value, 10);

    if (f.website.value) return; // bot
    if (nombre.length < 2) return fail("Poné tu nombre.", f.nombre);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail("Ese email no parece válido.", f.email);
    if (!edad || edad < 18 || edad > 99) return fail("El sorteo es para mayores de 18.", f.edad);
    if (!f.pdv.value) return fail("Contanos dónde lo probaste.", f.pdv);
    if (!f.acepto.checked) return fail("Tenés que aceptar las bases para participar.", f.acepto);

    var data = {
      nombre: nombre,
      email: email.toLowerCase(),
      edad: edad,
      pdv: f.pdv.value,
      pdv_qr: pdv || "directo",
      ref: new URLSearchParams(location.search).get("ref") || "",
      fecha: new Date().toISOString()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Anotando…";

    var send = CFG.APPS_SCRIPT_URL
      // text/plain evita el preflight CORS que Apps Script no responde
      ? fetch(CFG.APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) })
      : new Promise(function (resolve) {
          try {
            var list = JSON.parse(localStorage.getItem("cc_demo_entries") || "[]");
            list.push(data);
            localStorage.setItem("cc_demo_entries", JSON.stringify(list));
          } catch (err) { /* sin storage: seguimos igual */ }
          setTimeout(resolve, 500);
        });

    send.then(function () {
      track("sorteo_submit", { pdv_elegido: data.pdv });
      if (count !== null) showCount(count + 1);
      form.hidden = true;
      done.hidden = false;
      $("[data-last-call]").hidden = true;
      $$('[href="#sorteo"]').forEach(function (a) { if (a.closest(".prize")) a.textContent = "Ya estás participando ✓"; });
      done.focus();
    }).catch(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = "Quiero participar";
      fail("No pudimos anotarte. Revisá tu conexión y probá de nuevo.");
      track("sorteo_error");
    });
  });

  var share = $("[data-share]");
  var site = CFG.SITE_URL || (location.origin + location.pathname);
  var shareText = "Mirá esto: una pasta que corrige el amarillo de los dientes al instante. " +
    "Y sortean una camiseta firmada por Julián Álvarez 👉 " + site + "?ref=whatsapp";
  share.href = "https://wa.me/?text=" + encodeURIComponent(shareText);
  share.addEventListener("click", function () { track("share_whatsapp"); });

  /* ---------- CTA fija en mobile ---------- */
  var sticky = $("[data-sticky]");
  if (sticky && "IntersectionObserver" in window) {
    // Aparece apenas se pierde de vista la tarjeta del premio del hero
    var prizeVisible = true, sorteoVisible = false, footerVisible = false;
    var update = function () { sticky.classList.toggle("is-off", prizeVisible || sorteoVisible || footerVisible || !done.hidden); };
    new IntersectionObserver(function (en) { prizeVisible = en[0].isIntersecting; update(); }).observe($("[data-prize]"));
    new IntersectionObserver(function (en) { sorteoVisible = en[0].isIntersecting; update(); }, { threshold: 0.1 }).observe($("#sorteo"));
    new IntersectionObserver(function (en) { footerVisible = en[0].isIntersecting; update(); }).observe($(".footer"));
  }
})();
