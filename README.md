# Greek Tutor

An offline-first Progressive Web App port of Dr. Ted Hildebrandt's **ParsonsTech Greek Tutor**, a Koine Greek course originally written in
Asymetrix ToolBook for Windows 3.1.

The original is a complete 28-chapter introductory grammar with recorded pronunciation for every word, paradigm and memory verse — thousands of
audio clips, all of them still good. What it no longer has is a machine that will run it. This project moves the whole course onto a phone or iPad as a modern web app.

## Why offline-first

The design target is a phone with **no reliable internet**: missionaries, students, and rural users who may go days between connections.

That constraint drives nearly every technical decision here. The entire course — text, charts, drills and all 8,500-odd audio clips — installs to the device and runs with the network switched off, indefinitely. There is no login, no sync, no server call in the learning path. Audio is not streamed; it is downloaded once, per chapter, and stored locally. Nothing degrades when the signal goes.

The primary user is on an iPhone, so Safari and WebKit are the reference platform rather than an afterthought.

## Goals

- **Fidelity to the original.** The port reproduces what the original teaches and how it behaves, screen by screen, rather than reinterpreting it. Where the original is idiosyncratic, the port is idiosyncratic with it; where it is wrong, the departure is recorded rather than made silently.
- **Offline, permanently.** Install once, then nothing needs a network.
- **Phone-first.** The original was a 640×480 desktop program. Every screen is re-laid-out for a phone, down to a 320px floor.
- **Preserve the audio.** The recordings are the part of the course that cannot be recreated. They are carried across intact.

## Installing on a phone or tablet

Nothing to buy, nothing to find in an app store, and no developer tools needed. It installs straight from the web.

**On an iPhone or iPad:**

1. Open **Safari** and go to the app's address (https://greektutorv1.netlify.app). It has to be Safari — Chrome on iOS cannot install web apps.
2. Tap the **Share** button: the square with an arrow pointing up, at the bottom of the screen.
3. Scroll down the list and tap **Add to Home Screen**.
4. Tap **Add**. A Greek Tutor icon appears on your home screen. Open the course from that icon from now on, not from Safari.

**On an Android phone or tablet:** open the address in Chrome, tap the three-dot menu, and choose **Install app** or **Add to Home screen**.

### Downloading the audio for offline use

Do this **while you still have wifi** — the recordings are the bulk of the course. Two ways to do this:

1. **One chapter at a time.** Open a chapter and tap **Download audio** in its header. The button tells you how many files it is about to fetch, and a progress bar replaces it while it works; you can Cancel and pick up later with **Resume download**. When it finishes the button becomes **Audio available offline**, and that chapter is done.
2. **Everything at once.** Tap the **Storage & downloads** button in the top bar, then **Download all audio**. That fetches every chapter's recordings in one pass. The same screen lists each chapter with its own download state, shows how much space the app is using, and has a Clear action if you ever need the space back.

Once a chapter is downloaded, the text, the drills and every recording work with the device in airplane mode, on a plane, or a long way from any signal, for as long as the app stays installed. There is no expiry and nothing to re-authorise.

### Updates

The app updates itself. When new chapters or corrections are published, the next time you open it **with a wifi or data connection** it fetches them quietly in the background, and they are there the time after. You never install anything again, and an update never removes audio you have already downloaded. Offline, it simply keeps working with what it has, and picks the update up whenever you next connect.

## Tech stack

| | |
| --- | --- |
| Framework | Svelte 4 |
| Build | Vite 5 |
| PWA / service worker | `vite-plugin-pwa` + Workbox (`rangeRequests: true`, required for iOS audio) |
| Local storage | IndexedDB via `idb` — audio blobs and progress |
| Fonts | Original GREEKTH/GKTRANS converted to Unicode; Noto Serif polytonic bundled and precached |
| UI testing | `playwright-core`, driving the real browser |
| Hosting | Netlify, continuous deploy from `main` |

No runtime dependencies beyond `idb`. No backend.

## Running it locally

```bash
npm install
npm run dev
```

Open the printed localhost URL. To reach it from a phone on the same
network:

```bash
npm run dev -- --host
```

To produce a build for deployment:

```bash
npm run build      # then deploy dist/
```

Service workers need HTTPS or localhost, so installing to a home screen can only be tested against a deployed URL, not against `npm run dev`.

## Layout

| Path | Contents |
| --- | --- |
| `src/components/` | Svelte components — activity hosts, charts, drills, dialogs |
| `src/lib/` | Audio store, download manager, navigation, answer checking, Greek text handling, popup and progress state |
| `src/data/` | `chapt-NN.json`, `lexicon-chaptNN.json`, `toc.json`, `font-map.json` |
| `scripts/` | Extraction and assembly pipeline, plus the `check:*` and `ui:*` harnesses |
| `public/audio/` | Transcoded audio packs and the manifest |
| `buildout/` | Specs, plans, verification records, living process documents |

Chapter content is **data, not code**: each chapter is a JSON document
extracted from the original ToolBook file by `scripts/assemble_chNN.py`
and rendered by generic components. Adding a chapter means adding data.

## Checks

```bash
npm run verify          # docs + content shapes + build + lazy-chunk
npm run ui:walk         # load every page in a real browser
npm run ui:offline      # airplane-mode simulation
```

`npm run check:shapes` validates every chapter's data against the
renderer contract and is the gate that must pass before any round of work
closes.

## Documentation

Everything about the port's history and rules lives in
[buildout/](buildout/). Start from
[buildout/CHAT-HANDOFF.md](buildout/CHAT-HANDOFF.md), which is the live
bootstrap document and points at the rest: the disclosure rules governing
how original screens are adapted, the drill behaviour rules and ledger,
the divergence log recording every deliberate departure from the
original, and the extraction pipeline's accumulated findings.

## Credit and license

The course — text, structure, pedagogy and recordings — is the work of **Dr. Ted Hildebrandt**, and is used here with his permission. This repository is the port, not the course.
