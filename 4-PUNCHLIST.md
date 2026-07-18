# 4-PUNCHLIST.md — Phase 4 final punch list (Claude Code work order)

Prerequisites: HANDOFF-4.md (Opus Part A session). Ordering note: if
AUDIT-4.md (Part B) has NOT yet run, do this punch list first (it is
small and behavioral) and the audit after; if it HAS run, apply this on
top of the audit unit. Commit the current tree before starting either
way. Output: append a "§7 Punch list (2026-07-18)" section to
HANDOFF-4.md with per-item fix notes and the P1 diagnosis findings.

Nine items from Fable's device pass. P1 and P2 are REPEAT failures —
the previous fixes (A1 cache unification, A4 touch-action on html/body
+ interactive selectors) did not resolve them on device, so both are
diagnose-first: instrument, identify the actual mechanism, then fix.
Do not re-apply the previous theory harder.

## 0. Data drop-in

  src/data/chapt-01.json   One field: c1_drill_letter_names play →
                           "audioShort" (item P3, user-verified: the
                           drill speaks the letter NAME only). audioFull
                           now remains ONLY on the Learn Letters
                           stepper. Everything else unchanged.

## P1. Storage grows on every download cycle, never shrinks (REPEAT of A1)

Observed: download raises usage; Clear does not lower it; clear +
re-download raises it AGAIN (monotonic growth across cycles). The A1
fix (single cache name, belt-and-braces clear, migration) did not stop
it, so the duplicate-CACHE theory is dead. Two remaining suspects, in
order of likelihood:

  Suspect 1 — duplicate ENTRIES inside the one cache (Vary-key
  duplication). Every downloads.js fetch(src) is intercepted by the SW
  CacheFirst /audio/ route, which caches the network response itself;
  the page then cache.put()s the SAME url a second time. Two writers,
  one URL — normally the second put replaces the first, BUT Cache API
  matching honors the response's Vary header. If the host serves audio
  with (e.g.) Vary: Accept-Encoding and the two writers' request
  objects differ in those headers, put() does NOT replace — both
  entries persist. Every cycle adds another set. This exactly produces
  monotonic growth that caches.delete should still clear... unless
  Clear looks fine but usage is read before deletion settles — which is
  Suspect 2.

  Suspect 2 — WebKit lazy reclamation reporting. On iOS/iPadOS,
  storage.estimate() is known to keep reporting freed Cache Storage
  bytes until the storage process compacts (sometimes only after the
  app process restarts). This alone CANNOT explain growth beyond the
  first-download level, but combined with Suspect 1 it explains the
  full picture: real duplication growing the cache + lazy reporting
  hiding the drop after Clear.

Diagnose (desktop Chrome first — its estimate() is prompt):
  1. Add a diagnostic function (dev-only or hidden in Settings):
     iterate the audio cache, report entry COUNT and summed
     response bytes (clone().blob()).size), plus caches.keys().
  2. Run download → report → clear → report → download → report.
  3. Inspect duplicate keys: cache.keys() entries with the same URL —
     if present, dump their request headers and the response Vary
     header. That confirms or kills Suspect 1 in one look.

Fix (apply what the diagnosis confirms):
  - Single-writer discipline: downloads.js becomes the only deliberate
    writer for pack downloads. Before each put:
    `await cache.delete(url, { ignoreVary: true })` then put — one
    entry per URL, guaranteed, regardless of Vary.
  - Give the SW route matchOptions `{ ignoreVary: true }` (workbox
    CacheFirst supports matchOptions) so playback matches whatever
    entry exists instead of missing-and-refetching a "different-vary"
    copy (that refetch path is itself a duplicator).
  - The lazy reconciliation pass and skip-if-cached checks also use
    { ignoreVary: true }.
  - Settings: alongside the browser-reported estimate, show ground
    truth the app controls: "{N} audio files stored" from the cache
    itself, updating after download/clear. Label the estimate line
    "reported by the browser" with a note that iOS may update it
    lazily. This gives Fable a trustworthy "did Clear work" signal
    (N drops to 0 instantly) independent of WebKit's accounting.
Acceptance: desktop Chrome — entry count and summed bytes return to
zero after Clear and to the same (not doubled) level after re-download;
estimate drops after Clear. Device — file count behaves correctly;
record whether the estimate figure follows immediately or lazily and
write the observed iOS behavior into the handoff. Remove or gate the
diagnostic before commit (keep it behind a ?debug flag or a
triple-tap, note which).

## P2. Double-tap zoom still fires (REPEAT of A4)

Why the A4 fix was insufficient: touch-action does NOT inherit. Setting
it on html/body and on interactive selectors leaves every plain
element (headings, panes, padding, the yellow bands) at touch-action
auto — and iOS decides the double-tap gesture by the element under the
finger. Tapping "anywhere in the app" hits those.
Fix: apply `touch-action: manipulation` universally —
  `*, *::before, *::after { touch-action: manipulation; }`
(pinch-zoom is preserved; panning is preserved; only double-tap-zoom
and the tap delay are dropped). Keep the existing explicit rules; the
universal rule is the umbrella. Check nothing in the app relies on
double-tap (nothing should).
If — and only if — a real iOS device still zooms after this (some older
WebKit builds ignore touch-action for the double-tap heuristic outside
standalone mode), add the minimal JS fallback: a touchend listener that
preventDefault()s a second tap within 300px/350ms on NON-interactive
targets, and document it as a WebKit workaround. Do not use
user-scalable=no.
Acceptance (device, Fable): rapid same-tile speller taps, rapid
Backspace, and double-taps on empty page areas produce no zoom;
pinch-zoom still works.

## P3. Letter Names and Sounds Drill speaks name+sound (data fix)

Drop-in data changes play to audioShort. Verify the grid honors it
(tap Α tile → /audio/chapt_1/a_alphan.m4a, name only). With this,
audioFull's ONLY remaining consumer is the Learn Letters stepper —
assert that in the handoff (it is the new cheat-sheet fact).

## P4-P9. The Greek-tap rule (new standing directive) + per-page wiring

STANDING RULE (record in the handoff): any DISPLAYED Greek — prompts,
flashcard words, reading panes, chart glyphs — is tappable and plays
its audio (blue, per the A6 color rule). English translations and
transliterations are not. The rule covers displayed/prompt Greek, NOT
answer-option buttons (tapping an option is answering; adding audio
there would leak answers). Exceptions, explicit: the Phonetic Reading
Exercise (its "Greek" is phonetic English; no audio exists — leave
untappable), on-screen keyboard tiles in the spelling exercise (tiles
input letters, they do not pronounce), and the Review Letters Quick
Chart which stays EXACTLY as it is today (row-tap behavior unchanged;
do not restyle or rewire it).

Wiring, per item:
  P4  Reading People, Places and Letters: the Greek pane is tappable
      and pronounces the current item (personal/place = readingLists
      audio; letter names = that letter's audioShort). The Answer
      behavior (reveal + audio) stays as is.
  P5  Learn Vocabulary flashcard, two changes: (a) when the mode is
      Hide Greek, do NOT autoplay the lemma on Next (it gives the
      answer away) — autoplay resumes when the Greek is revealed or
      the mode shows it; tapping "reveal" MAY play it (that is the
      learner asking). (b) The visible Greek word is tappable to
      pronounce again.
  P6  Vocabulary Greek-to-English Drill: the Greek PROMPT word is
      tappable, plays the lemma audio (content.js buildSelectQuestions
      already carries promptAudio for vocab pools — wire the tap; if
      the field is missing for vocab generators, add it from the
      lexicon lemma audio). English options remain answer-only. The
      EN-to-GK drill's English prompt stays untappable; its Greek
      OPTIONS stay answer-only per the rule.
  P7  Pronounce Letters Exercise: the displayed letter is tappable,
      plays audioShort (same clip Check Answer uses).
  P8  Letter-to-Name Exercise: the Greek prompt letter is tappable,
      plays audioShort. Name-to-Letter's ENGLISH prompt stays
      untappable; its Greek options stay answer-only.
  P9  Transliterate the Letter: the Greek prompt letter is tappable,
      plays audioShort. (Transcribe to Greek's English prompt stays
      untappable.)
Implementation note: P6-P9 are all SelectActivity prompts — implement
ONCE: when the current question carries promptAudio AND the prompt is
Greek (a flag from the generator, not a heuristic on glyphs), the
prompt renders as a tappable blue element. One change, four items.
The tap must not advance, answer, or re-shuffle anything.

## Acceptance checklist

  [ ] P1 Chrome cycle: count/bytes zero after Clear, single level after
      re-download; duplicate-key inspection documented; Settings shows
      the file-count ground truth; diagnostic gated.
  [ ] P2: universal touch-action in place; build clean; device sign-off
      is Fable's (note it as the remaining device item).
  [ ] P3: name-only audio on the drill; audioFull consumer list = Learn
      Letters stepper only.
  [ ] P4-P9: each tap target plays the right clip and is blue; answer
      options unchanged; Phonetic Reading, speller tiles, and Review
      Letters Quick Chart untouched; taps never advance/answer.
  [ ] Full 26-item rail walk after all changes: no regressions, content
      matches banner (the {#key} behavior intact).
  [ ] npm run build clean; airplane-mode regression pass (standing
      directive 4).
  [ ] HANDOFF-4.md gains §7 with per-item notes, the P1 findings +
      observed iOS reporting behavior, the new standing rule text, and
      the updated audioFull fact.

## Out of scope

Vertical buildout (phase 5), audit items not listed here, any visual
redesign, IndexedDB, webfont.
