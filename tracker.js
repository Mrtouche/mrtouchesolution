// tracker.js — suivi des visiteurs (présence, visites, notification de connexion)
// <script type="module" src="./tracker.js"></script>
// Présence et pages vues : seulement si le visiteur a cliqué sur « Accepter » (voir cookies.js).
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, push, remove, onDisconnect, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const DB_URL = "https://mrtouchesolution-default-rtdb.firebaseio.com";
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app, DB_URL);

const device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Mobile" : "Ordinateur";
let pageLogged = false, courant = null;

const accepte = () => { try { return localStorage.getItem("consent") === "oui"; } catch (e) { return false; } };

async function suivre(u) {
  const info = { email: u.email || null, page: location.pathname, device };

  if (accepte()) {
    const presenceRef = ref(db, "presence/" + u.uid);
    try {
      await onDisconnect(presenceRef).remove();
      await set(presenceRef, { ...info, since: serverTimestamp() });
    } catch (e) { console.warn("presence", e); }
    if (!pageLogged) {
      pageLogged = true;
      push(ref(db, "events"), { ...info, type: "pageview", ts: serverTimestamp() }).catch(() => {});
    }
  }

  // Notification de connexion (sécurité), une fois par session
  if (!u.isAnonymous && !sessionStorage.getItem("loginLogged")) {
    sessionStorage.setItem("loginLogged", "1");
    push(ref(db, "events"), { ...info, type: "login", ts: serverTimestamp() }).catch(() => {});
  }
}

onAuthStateChanged(auth, (u) => {
  if (!u) { signInAnonymously(auth).catch(() => {}); return; }
  courant = u; suivre(u);
});

window.addEventListener("consent-change", (e) => {
  if (!courant) return;
  if (e.detail === "oui") suivre(courant);
  else remove(ref(db, "presence/" + courant.uid)).catch(() => {});
});