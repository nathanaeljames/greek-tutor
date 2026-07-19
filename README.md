# Greek Tutor PWA -- Walking Skeleton (Phase 3)

Project docs (specs, phase handoffs, plans, verification records) live in
[buildout/](buildout/). Start a new working session from
[buildout/CHAT-HANDOFF.md](buildout/CHAT-HANDOFF.md) -- it is the live
bootstrap doc and points at everything else.

Offline-first PWA port of the ParsonsTech Greek Tutor. This skeleton has:
chapter navigation (all 28 chapters listed, Chapter 1 active), the
contentAudio component (charts, explore grids, letter stepper, flashcards,
self-check exercises, text pages), and the select component (all four
scored letter exercises + both vocabulary drills), wired to verified
Chapter 1 data. Original feedback strings included ("Swing and a miss").

## Run it

    npm install
    npm run dev

Open the printed localhost URL. To view from other devices on your LAN:

    npm run dev -- --host

## Audio

The app expects the transcoded audio pack (from transcode_audio.py) at:

    public/audio/chapt_1/a_alpha.m4a  etc.

Copy your transcode output folder in as public/audio/. Without it the app
works fine but shows a toast naming any missing file it tries to play.

## iPhone / PWA testing

Service workers require HTTPS (or localhost), so for the real
install-to-home-screen offline test, deploy to Netlify:

    npm run build   ->  deploy the dist/ folder

Then on the iPhone: open the URL in Safari, Share -> Add to Home Screen.
Audio files fetched while browsing are cached automatically (CacheFirst)
and replay offline. The full "download whole audio pack" flow is Phase 5.

## Roadmap

- Phase 4: match / spell / translate-flashcard-drill / parse / audioPlayer
  components; chapters 2-28 + special sections content.
- Phase 5: audio pack download UX, IndexedDB progress, polish.
- Phase 6: deploy.
