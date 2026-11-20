// tracker.js — à charger sur TOUTES les pages publiques
// <script type="module" src="./tracker.js"></script>
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, push, onDisconnect, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

// ⚠️ Copie l'URL exacte affichée en haut de l'onglet "Données" de Realtime Database
const DB_URL = "https://mrtouchesolution-default-rtdb.firebaseio.com";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app, DB_URL);

const device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Mobile" : "Ordinateur";
let pageLogged = false;

onAuthStateChanged(auth, async (u) => {
  // Visiteur sans compte : connexion anonyme pour pouvoir être compté
  if (!u) { signInAnonymously(auth).catch(() => {}); return; }

  const info = { email: u.email || null, page: location.pathname, device };

  // Présence : disparaît automatiquement quand la personne ferme le site
  const presenceRef = ref(db, "presence/" + u.uid);
  try {
    await onDisconnect(presenceRef).remove();
    await set(presenceRef, { ...info, since: serverTimestamp() });
  } catch (e) { console.warn("presence", e); }

  if (!pageLogged) {
    pageLogged = true;
    push(ref(db, "events"), { ...info, type: "pageview", ts: serverTimestamp() }).catch(() => {});
  }

  // Notification de connexion (compte réel), une fois par session
  if (!u.isAnonymous && !sessionStorage.getItem("loginLogged")) {
    sessionStorage.setItem("loginLogged", "1");
    push(ref(db, "events"), { ...info, type: "login", ts: serverTimestamp() }).catch(() => {});
  }
})