import App from "./App.svelte";
import "./app.css";
import { migrateLegacyAudioCaches } from "./lib/downloads.js";

const app = new App({ target: document.getElementById("app") });

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
