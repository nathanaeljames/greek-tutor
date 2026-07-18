import App from "./App.svelte";
import "./app.css";
import { migrateLegacyAudioCaches } from "./lib/downloads.js";

// One-time cleanup of any legacy/duplicate audio cache from earlier deploys
// (A1 migration). Fire-and-forget; never blocks app startup.
migrateLegacyAudioCaches();

const app = new App({ target: document.getElementById("app") });
export default app;
