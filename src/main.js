import App from "./App.svelte";
import "./app.css";
import { migrateLegacyAudioCaches } from "./lib/downloads.js";

// Startup instrumentation (device pass): mark when our JS begins executing and
// when the app is constructed, so the debug card can show — via Navigation
// Timing — whether the cold-start hang is BEFORE our code runs (the SW/platform
// bringing up a large Cache Storage to serve the shell) or IN our code. See
// startupReport() in downloads.js.
try { performance.mark("gt-js-start"); } catch (_) { /* no-op */ }

const app = new App({ target: document.getElementById("app") });

try { performance.mark("gt-app-created"); } catch (_) { /* no-op */ }

// One-time cleanup of any legacy/duplicate audio cache from earlier deploys
// (A1 migration). DEFERRED off startup: the first CacheStorage touch after a
// cold launch is expensive on WebKit once the whole audio library is cached,
// and nothing on first paint depends on this cleanup. Runs when the main
// thread is idle so it never contributes to the app-load hang.
if (typeof requestIdleCallback === "function") {
  requestIdleCallback(() => migrateLegacyAudioCaches(), { timeout: 3000 });
} else {
  setTimeout(() => migrateLegacyAudioCaches(), 1500);
}

export default app;
