/* cookies.js — bandeau de consentement.
   À ajouter avant </body> de chaque page : <script src="./cookies.js" defer></script> */
(function () {
  var GA_ID = ""; // Optionnel : "G-XXXXXXXXXX" (Google Analytics 4). Chargé SEULEMENT après « Accepter ».
  var KEY = "consent";

  function lire() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function ga() {
    if (!GA_ID || document.getElementById("ga-s")) return;
    var s = document.createElement("script");
    s.id = "ga-s"; s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", GA_ID, { anonymize_ip: true });
  }
  function choisir(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    var b = document.getElementById("bandeau-cookies"); if (b) b.remove();
    if (v === "oui") ga();
    window.dispatchEvent(new CustomEvent("consent-change", { detail: v }));
  }

  var c = lire();
  if (c === "oui") ga();
  if (c) return;

  var css = document.createElement("style");
  css.textContent = "#bandeau-cookies{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);width:min(620px,calc(100% - 24px));z-index:2000;background:#0a2147;color:#eef3ff;border:1px solid rgba(0,234,255,.35);border-radius:16px;padding:16px 18px;box-shadow:0 12px 40px rgba(0,0,0,.5);font:15px/1.5 system-ui,Segoe UI,Arial,sans-serif}#bandeau-cookies p{margin:0 0 12px}#bandeau-cookies a{color:#00eaff}#bandeau-cookies .b{display:flex;gap:10px;flex-wrap:wrap}#bandeau-cookies button{flex:1;min-width:130px;padding:11px 16px;border-radius:999px;font:inherit;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff}#bandeau-cookies button.ok{border:0;background:linear-gradient(90deg,#00a0ff,#00eaff);color:#04122c}#bandeau-cookies button:focus-visible{outline:2px solid #00eaff;outline-offset:2px}";
  document.head.appendChild(css);

  var d = document.createElement("div");
  d.id = "bandeau-cookies"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Cookies et statistiques");
  d.innerHTML = '<p>Nous utilisons le stockage de votre navigateur pour la connexion (nécessaire) et, avec votre accord, pour mesurer l’audience du site. <a href="confidentialite.html">En savoir plus</a></p><div class="b"><button type="button" class="ok" id="c-oui">Accepter</button><button type="button" id="c-non">Refuser</button></div>';
  document.body.appendChild(d);
  document.getElementById("c-oui").onclick = function () { choisir("oui"); };
  document.getElementById("c-non").onclick = function () { choisir("non"); };
})();