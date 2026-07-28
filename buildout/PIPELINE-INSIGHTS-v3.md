# PIPELINE-INSIGHTS-v3.md — Greek Tutor extraction pipeline

Supersedes PIPELINE-INSIGHTS-v2.md (chapter-1 pilot, 2026-07-12/19 + the
phase-4 closeout audit + the punch-list session). Revised 2026-07-27 at
chapter-2 closeout; AMENDED 2026-07-28 at 5C closeout (Stage 3 status,
Stage 4 Hebrew model, NEW Stage 4b rich-text parsing, §VIII ceiling).

**What changed from v2, in one paragraph.** v2 carried both the extraction
mechanics AND the data contract the app consumes. CHAT-HANDOFF.md now owns the
data contract and updates it every round, so v2's §III/§IV/§V had silently gone
stale — its "Complete mode inventory" was missing `topicPages`, its block-type
list was missing three blocks, and its unknown-font-code list had been resolved
by chapter 2. Two documents claiming the same authority is the actual hazard, so
v3 hands the contract to CHAT-HANDOFF and keeps what only this document knows:
how to get bytes out of the ISO and turn them into correct Unicode. Everything
v2 said about stages 1-2 and 5-7, the environment, the chapter-1 corrections and
the tool list is carried over intact.

**What the 5C amendment changed, in one paragraph.** Three things. First, `$`
and `!` moved from unknown to verified (rough+circumflex and rough+acute) on
chapter 3-8 word evidence — `!` is a REVERSAL of the chapter-2 exclusion, with
both findings compatible. Second, the Hebrew-contamination tell-tale list was
wrong in an expensive direction: `Hebrew*` FIELD NAMES belong to the shared
drill engine and appear inside legitimate Greek drills, so keying regions on
them over-flags ~25% of every TBK; the corrected tell-tales are in Stage 4.
Third and largest: the bounded rich-text parser experiment SUCCEEDED, so the
"~75% format ceiling" this document used to declare is retired — Stage 4b
documents the record structure and `scripts/tbk_richtext.py`.

---

## 0. Scope and authority (read this before using anything below)

| Question | Authoritative document |
| --- | --- |
| How do I get a chapter's TBK and audio out of the ISO? | **this file** |
| What does a legacy ASCII code mean in Greek? | **`src/data/font-map.json` in the repo**, which this file describes but does not restate |
| What `mode` / block type / activity type may a chapter use? | **CHAT-HANDOFF.md**, "Pipeline contracts for chapters 3+" |
| Which audio id does a surface play? | **CHAT-HANDOFF.md**, "Audio semantics cheat-sheet" |
| What are the standing UI/pedagogy directives? | **CHAT-HANDOFF.md**, "Standing directives" |
| What is the round-by-round build process? | **CHAT-HANDOFF.md**, "Buildout process v2" |
| How are implementer rounds graded? | **GRADER-PROMPT.md** (the grading chat's standing prompt) |
| Where do marks get positioned, and how is the Greek font built? | **CHAT-HANDOFF.md**, "Typography and mark-rendering canon" — app-side, generated, not a pipeline concern |

If this file and CHAT-HANDOFF disagree about a contract, **CHAT-HANDOFF wins**
and this file has a bug. Say so rather than reconciling silently.

PROCESS RULE (2026-07-18, after a near-miss reversion, unchanged): the GitHub
repo is the source of truth for data files, not project-knowledge mirrors. After
ANY repo-side data edit, the committed file must be uploaded to project
knowledge immediately. Chat regenerates data only from the committed copy and
can self-verify against the public repo:
`https://raw.githubusercontent.com/nathanaeljames/greek-tutor/main/src/data/chapt-01.json`

---

## I. Architecture overview

The pipeline converts legacy ParsonsTech Greek Tutor assets (Asymetrix ToolBook
.TBK files + WAV audio, distributed inside a DOSBox bundle as an ISO inside a
RAR) into a modern Unicode-first JSON data model consumed by a Svelte PWA. Two
execution environments:

    CHAT-SIDE (Claude's environment):
      parsonstech.rar -> GreekTutor.iso -> .TBK files -> JSON data files
      OR: GreekTutor.iso uploaded directly (preferred -- smaller, simpler)
      Tools: libarchive-c (RAR only), pycdlib, fonttools, Pillow, stdlib,
             scripts/tbk_richtext.py (rich-text records, since 5C)
      Output: chapt-NN.json, lexicon-chaptNN.json, toc.json, intro.json,
              font-map.json

    USER-SIDE (local machine):
      GreekTutor.iso -> GKTUTOR/ -> transcode_audio.py -> .m4a files
      Tools: Python 3.9+, ffmpeg
      Output: public/audio/ tree + audio-manifest.json (8,521 entries)

The two sides never exchange intermediate artifacts. They share only the NAMING
CONTRACT (audio id = lowercased path with `/` -> `_`, e.g. `chapt_1_a_alpha`)
and the finished JSON data files.

NAMING CORRECTION from v2: emit **`lexicon-chaptNN.json`** — no dash before the
number. v2 wrote `lexicon-chapt-XX.json`. The content glob tolerates both
current spellings, but new chapters use the undashed form.

---

## II. Pipeline stages (in execution order)

### Stage 1: RAR -> ISO extraction (OR direct ISO upload)

PREFERRED: upload `GreekTutor.iso` directly (~290 MB). This eliminates Stage 1
entirely and saves the ~2 min foreground extraction.

If only the RAR is available:

    INPUT:  /mnt/user-data/uploads/parsonstech.rar (~286 MB)
    OUTPUT: /home/claude/GreekTutor.iso (~277 MB)

```python
import libarchive
target = 'parsonstech/GreekTutor.iso'
with libarchive.file_reader('/mnt/user-data/uploads/parsonstech.rar') as arc:
    for entry in arc:
        if entry.pathname == target:
            with open('GreekTutor.iso', 'wb') as out:
                for block in entry.get_blocks():
                    out.write(block)
            break
```

CRITICAL: must run in FOREGROUND (timeout ~1-2 min). Background jobs (nohup, &)
die silently in this environment.

Failures encountered, chronologically:

1. `unrar-cffi` `RarFile.read()` — OOM killed. Buffers the entire 277 MB
   decompressed file in RAM before writing.
2. `unrar-cffi` `RarFile.open()` streaming — also OOM. Despite the streaming
   API, the library decompresses internally.
3. `libarchive-c` with nohup background — silently died.
4. `libarchive-c` FOREGROUND — SUCCESS. C-native streaming, constant memory.

LESSON: `libarchive-c` is the ONLY reliable RAR library in this environment
(`pip install libarchive-c`; depends on system libarchive, pre-installed).
Always foreground. Never `unrar-cffi` for files over ~50 MB.

### Stage 2: ISO -> TBK extraction

```python
import pycdlib
iso = pycdlib.PyCdlib()
iso.open('/mnt/user-data/uploads/GreekTutor.iso')

for child in iso.list_children(iso_path='/GKTUTOR'):
    name = child.file_identifier().decode()
    if name not in ('.', '..'):
        print(name, 'DIR' if child.is_dir() else child.get_data_length())

# Paths WITHOUT the ';1' version suffix -- pycdlib resolves without it.
iso.get_file_from_iso(
    local_path='/home/claude/1_ALPHAB.TBK',
    iso_path='/GKTUTOR/CHAPT_1/1_ALPHAB.TBK'
)
iso.close()
```

ISO directory structure (confirmed):

    /GKTUTOR/CHAPT_1/  through  /GKTUTOR/CHAPT_28/
    /GKTUTOR/INTRO/
    /GKTUTOR/INDEX/
    /GKTUTOR/JOHN/       Gospel of John readings
    /GKTUTOR/REV_PAR/    Review parsing
    /GKTUTOR/REV_VOC/    Review vocabulary
    /GKTUTOR/VOCAB/      Vocabulary index
    root: GREEKTH.TTF, GKTRANS.TTF, GRK.BMP, LAMP.ICO, ...

`pip install pycdlib` (pure Python, no system deps).

### Stage 3: Font mapping (legacy ASCII -> Unicode Greek)

**`src/data/font-map.json` in the repo is the authoritative map. Do not restate
it here and do not re-derive it.** This section records only how it was built
and what is still open.

Method: render each ASCII glyph with Pillow + fontTools, identify the Greek
letter, cross-check against TBK word strings, confirm against user screenshots.

The base letter map (a=alpha … z=zeta, uppercase parallel) is STABLE and was
verified three ways: glyph rendering, TBK word cross-reference, and the Greek
Keyboard dialog screenshot — which turned out to be the Rosetta Stone for the
diacritics, because the physical QWERTY keys type the legacy codes 1:1 and the
shifted number row carries the marks.

STATUS AFTER 5C RECON (chapters 3-8, 2026-07-28):

- **Resolved by chapter-2 word evidence:** `#` = smooth breathing + circumflex
  (ἦλθεν, ἦν); `[` = rough breathing, **second slot**; `;` = Greek question mark
  (store NFC, which is ASCII `;`); `:` = Greek raised-dot colon / ano teleia
  (store NFC, which is U+00B7); `v` = nu, second slot.
- **Resolved by 5C word evidence (chapters 3-8):** `$` = rough breathing +
  circumflex — `w$rai` = ὧραι in the ch5 hōra paradigm chart, `ou$toj` = οὗτος
  in a ch7 Lk 2:25 sentence; exactly the gap v3 predicted. `!` = rough
  breathing + acute — clean ch5 witnesses `w!ra` ὥρα, `w!raj` ὥρας, `w!raij`
  ὥραις, `w!ran` ὥραν, `w!r%` ὥρᾳ. This REVERSES the chapter-2 exclusion of
  `!`; both findings are compatible (chapter 2's only `!` hits really were in
  Hebrew regions, and no ch2 Greek word carries rough+acute on one letter).
  `!` ALSO occurs inside Hebrew-font regions — Stage 4 region exclusion runs
  BEFORE conversion, always.
- **Still unknown:** `{ } ~ | \ ` =`. `{ } | ~` witnessed only inside
  font-metric binary junk, `\` only in DOS paths, `=` only in OpenScript
  comparisons/assignments (5C re-confirmed: `="lo<goj"`-style answer-check
  literals — themselves a useful answer-extraction source). Most likely none
  are font codes. **Never convert a string containing these silently.**

TRAP, and it cost time: **the book uses BOTH `"` and `[` for rough breathing.**
Chapter 1 evidence gave `"` (υἱός), chapter 2 teaching text prints
"Rough breathing ( [ )" and uses `[` throughout. Both slots are correct. Do not
"fix" one into the other; `font-map.json` records both deliberately. Expect
more second-slot duplicates in later chapters and add them rather than choosing.
The `!` reversal above is the same lesson in another form: absence in one
chapter's Greek is not absence from the font.

LESSON (unchanged from v2, reinforced by chapter 2): font mapping needs THREE
independent evidence sources — glyph rendering, TBK word cross-reference, and a
device/DOSBox screenshot. No single source has ever been sufficient. (`$` and
`!` currently carry two of three — rendering + word evidence; a DOSBox
screenshot of the ch5 hōra chart rides along with 5E recon as the third.)

### Stage 4: TBK string extraction (content text)

```python
import re
data = open('2_ACCENT.TBK', 'rb').read()
runs = re.findall(rb'[\x20-\x7e]{8,}', data)
```

WHAT WORKS WELL: activity and page names; instruction and feedback strings;
English text (proverb answers, name lists, bibliography); legacy-font Greek
(convertible via font-map); audio filenames referenced in OpenScript
(`play waveFile...`); script logic fragments (shuffle algorithms, draw-pool
patterns, the `SayWord` dispatch tables, and — 5C's find — `="…"` OpenScript
answer-check literals); and, since 5C, DRILL POOL FIELDS: chapters 3+ store
prompt pools, per-item option columns, gloss pools and Scripture-reference
pools as parallel CRLF-line list fields that plain string runs reach directly
(the chapter-2-era assumption that exercise word lists were unreachable was a
chapter-2 artifact, not a format fact).

WHAT PLAIN STRINGS STILL DO NOT GIVE: line-level FORMATTING (underline spans,
Greek-vs-English font runs), which is exactly what Stage 4b's parser recovers;
page storage order (never the pedagogical order — that stays a recon item).

**HEBREW CONTAMINATION — MODEL CORRECTED AT 5C (supersedes the v3 original).**
The TBKs embed shared resources from the same publisher's Hebrew tutor, and an
extractor must exclude those regions or it will invent font codes (the original
`!` confusion). BUT: the tell-tale list matters. `HebrewWord`, `HebrewWords`,
`HebrewWordCounter`, `HideHebrew` and similar are FIELD NAMES OF THE SHARED
DRILL ENGINE and occur inside fully legitimate GREEK drills — the chapter-2
part-of-speech pool lives in a field literally named "HebrewWord", and ch5's
Greek spelling pools sit adjacent to "HebrewWordCounter". Keying exclusion
regions on `Hebrew*` names over-flags roughly a quarter of every TBK. Reliable
tell-tales for ACTUAL Hebrew-content regions are:

- `(Hi)` / `(Ni)` (Hiphil/Niphal) stem labels;
- Hebrew glosses ("to sacrifice", "to depart") with no Greek anywhere nearby;
- the Attributive/Predicate/Substantive "Hints" popups whose agreement list
  includes "Definiteness" — a Hebrew agreement category (Greek agrees in
  case). These popups sit near many chapters' drill pages and are excluded
  from the port wholesale.

Exclude regions around THOSE; treat `Hebrew*` field names as engine plumbing.

EXTRACTION CEILING, RETIRED. v3 originally declared "roughly 75%, a format
limit". After 5C: plain strings reach the pools, and Stage 4b's parser reaches
the rich-text records (formatting included). The residual MANUAL share is now:
sequence/menu order, screen-layout confirmation for NEW modes, behavior only a
running program shows (timing, scoring, shuffle), and spot-checks of
rule-derived answers. That is a per-chapter recon list measured in a dozen-odd
items, not a quarter of the content.

USEFUL HABIT: print 20 lines of context around each hit rather than raw grep
output. Page structure is legible in the neighbourhood and invisible in the
match.

### Stage 4b: Rich-text record parsing (NEW at 5C — scripts/tbk_richtext.py)

ToolBook stores field text with per-span formatting as two adjacent
structures. Empirically derived from chapter-2 ground truth (DOSBox-verified
underline data), validated on chapter 1, blind-tested on chapters 5 and 3:

    TEXT RECORD:   [b0:1] [len:u16 LE] [text: len bytes]
      b0 observed 0x01/0x02/0x04, meaning unknown, not needed.
      CRLF line breaks; Greek is legacy font-coded.

    FORMAT-RUN TABLE (follows its text, near but not adjacent):
      [nruns:u16] [nruns:u16] [00 00] [01 00] [7 bytes]
      then (nruns - 1) records of 11 bytes each:
          [charOffset:u16 LE] [formatId:u16 LE] [7 aux bytes]
      Run 0 is IMPLICIT (offset 0, default format). charOffset is a
      plain BYTE offset into the field text (CRLF counts 2).

`formatId` values are file-scoped format-record references. The parser
classifies them per file by anchoring: spans whose text contains legacy
diacritic codes between letters vote "greek"; unambiguous English spans vote
"english"; the map then propagates to every span. Underline surfaces the same
way (a distinct formatId on the underlined span) — multiple formatIds can all
mean underline within one field, so treat "non-default" as the signal and the
anchored map as the classifier.

VALIDATION RECORD (the honesty section): every underline span in the
chapter-2 part-of-speech pool decoded to exactly the device-verified
{sentence, underline} data. The blind chapter-5 test recovered the complete
hōra and doxa paradigm charts (row/column labels, Greek cells, the Mounce
citation), the First Declension Noun Drill sentence pool WITH underlined-word
spans, four parallel Greek option columns, the gloss pool and the per-item
Scripture reference pool. Chapter 3 recovers both Present Active paradigm
surfaces and the vocab chart. Recovered pairs per chapter: 23-37 across
ch1/2/3/5.

KNOWN LIMITS (declared): field NAMES are located by proximity heuristics, not
an object-tree walk; adjacent fields can abut with no separator and a few
boundaries stay ambiguous — report, don't guess; the 7 aux bytes per run are
not understood; formatId -> concrete style is anchored per file, never decoded
from the format records themselves; fields with uniform formatting have no run
table (and are plain-string-reachable anyway). Isolated single letters cannot
anchor (the ch1 alphabet grid classifies as the default map) — harmless, since
letter grids are known content.

USAGE: `python3 scripts/tbk_richtext.py <chapter>.TBK [limit]` prints each
recovered record with classified spans. Import `associate`,
`build_format_map`, `classify_spans` for pipeline use. The script lives in the
repo for provenance and is a CHAT-PIPELINE tool — it is not part of the app
build and has no runtime footprint.

### Stage 5: Legacy Greek -> Unicode conversion

Character-by-character substitution for base letters; diacritics applied as
Unicode combining marks; then **NFC normalize**. Diacritic codes FOLLOW the
vowel they modify.

    "a]rx^?" -> alpha + smooth breathing + rho + chi + eta-with-circumflex
             -> NFC -> ἀρχῇ

Three rules that are the pipeline's, not the renderer's:

1. **Isolated diacritics must be SPACING codepoints, not combining ones.** A
   diacritic shown outside a word — "Acute ( ´ )", a chart cell reading
   "´ or ῀" — has no base to sit on, and a combining mark after a space or a
   paren renders as a hairline or a dotted circle. Author U+1FBF / U+1FFE /
   U+1FC0 / U+00B4 / U+0060 / U+00A8 in those positions. (Chapter 2 shipped
   this wrong once and it was visible on device.) Stage 4b helps here: the
   parser marks isolated marks as Greek-font spans, confirming they are marks
   and not ASCII punctuation.
2. **NFC everywhere**, including the two punctuation marks that normalize into
   something other than themselves: the Greek question mark U+037E becomes
   ASCII `;`, and the ano teleia U+0387 becomes U+00B7 MIDDLE DOT. Store the
   normalized form.
3. **Typographic normalization is authorized** alongside scholar-name spellfixes
   (typo policy A1, third extension): double hyphens become em dashes,
   data-side, applied by the pipeline to every future chapter.

PITFALL: strings containing a code from the unknown set must be flagged with a
`_verify` marker AND must carry the raw legacy string alongside the best-effort
conversion. `_legacy` fields exist for exactly this and have repeatedly paid for
themselves.

### Stage 6: Audio pipeline (user-side)

`transcode_audio.py`, delivered. AAC `.m4a` at 32 kbps mono 11025 Hz. Run once
over all 8,521 files. Idempotent, collision-safe (path-based ids),
cross-platform.

PER-CHAPTER SELF-CONTAINMENT: a chapter's audio pack must be complete on its
own. Where a chapter reuses an earlier chapter's word, the ISO itself ships a
duplicate WAV inside the later chapter's folder (chapter 2 duplicates all ten
chapter-1 vocabulary clips as `CHAPT_2/A_VOC*`; chapters 4-8 duplicate every
earlier Scripture Memory clip forward for the cumulative review), and the data
references the LOCAL copy. Follow the ISO; do not cross-reference packs to
save bytes. (5C noted `I_RM623B.WAV` — chapter 9's verse — pre-shipped inside
CHAPT_8: follow the ISO there too.)

### Stage 7: JSON assembly

The synthesis stage. Chapter 1 took four passes; see §VIII for what to expect
now.

Assemble against **CHAT-HANDOFF's "Pipeline contracts for chapters 3+"**, which
is the live list of modes, RichContent blocks, activity types and their required
fields. It is deliberately not duplicated here — v2 duplicated it and the copy
went stale within one chapter.

Validation before delivery (programmatic, every chapter):

- `sequence` covers every activity id exactly once, and nothing else.
- Every audio id resolves in `audio-manifest.json`.
- Every `mode` is in the known vocabulary; every content block `type` has a
  renderer (the repo's `npm run check:shapes` enforces this at build time and
  fails loudly on an unknown block).
- No `c1_`-prefixed references anywhere outside chapter 1.
- All Greek is NFC-normalized.
- Isolated marks are spacing codepoints (grep the data for combining marks
  preceded by a space or a paren).

---

## III. The data contract lives in CHAT-HANDOFF

v2 carried the mode inventory, the RichContent block list, the audio semantics
and the Greek-tap rule here. They now live in **CHAT-HANDOFF.md** and change
every implementer round. Read them there.

The one thing worth repeating, because it is a pipeline habit rather than a
contract: **dispatch is mode-keyed, never id-keyed.** Every `contentAudio`
activity carries an explicit `mode`. There are zero chapter-prefixed string
comparisons in component code and there must continue to be zero. A new chapter
that needs a new visual arrangement gets a NEW MODE registered in
CHAT-HANDOFF and PHASE5-PLAN, not a special case keyed on its id.

Likewise: **field names are frozen.** The chapter-1 pilot went through three
naming rounds (`audioName` -> `audioShort`, `soundHint` -> `sound`) before
stabilizing. Reuse the chapter-1 schema; do not re-derive names.

---

## IV. Data integrity rules the PIPELINE enforces

These are authoring rules — they are the pipeline's to get right, and a renderer
cannot rescue them.

- **glossShort vs gloss.** Abbreviated for drills ("Christ"), full for review
  charts ("Christ, Messiah"). Both required on every lemma.
- **Lexicon buckets.** Three: `lemmas` (the chapter's own vocabulary),
  `exampleWords` (teaching-page words), and `ch1_lemma_mirror` (earlier-chapter
  words this chapter reuses, re-audioed to this chapter's pack per Stage 6).
  Lookup searches all three with chapter preference, so a ref existing in two
  loaded chapters resolves to the ACTIVE chapter's copy.
- **`sequence` is pedagogy-derived**, DOSBox-verified per chapter. TBK storage
  order is never the answer.
- **`greekTaps`** marks the first STANDALONE occurrence of a Greek substring in
  an item's text. Keys match only where the neighbours are not Greek letters
  (Greek and Greek Extended ranges).
- **`biblist` items are plain strings.** Object-form entries are valid JSON,
  valid block type, and render `[object Object]` — chapter 2 shipped five of
  them. Build-guarded now.
- **`division[]` (divide activities) is 1-BASED GAP INDICES** between grapheme
  clusters at `Intl.Segmenter` granularity: gap *i* sits between cluster *i* and
  cluster *i+1*. A one-syllable word is the empty array.
- **`redMarkCluster` (select drills) must point at a cluster that actually
  carries the mark the item asks about.** Chapter 2 shipped a `φαρισαῖος` item
  pointing at a bare alpha for two rounds; it rendered with nothing red at all,
  asking "which mark is red?" of a page with no red on it. Build-guarded now —
  `npm run check:shapes` fails on an index past the end of the word, on a
  cluster with no mark, and on a cluster with no mark-geometry row.
- **`optionValues` (static option sets)** match answers by VALUE, not index. A
  `null` answer renders a pending state with Skip, which is the honest way to
  ship an unverified item.
- **Every new chart is tested at 320px.** Overflow is CLIPPED, not scrolled
  (app-wide `overflow-x: hidden`), so a too-wide chart is deleted rather than
  swipeable, and nothing errors.

---

## V. Environment constraints (hard-won, unchanged)

1. **Background jobs die silently.** All long-running work must be foreground
   with a timeout guard.
2. **Working directory resets between sessions.** Only uploads, project
   knowledge and `present_files` outputs persist.
3. The ISO/RAR persists within a conversation but NOT across conversations. A
   new chat must re-upload.
4. ISO extraction takes ~1-2 minutes foreground.
5. `pip install` needs `--break-system-packages`.
6. The ISO can be uploaded directly (~290 MB) — preferred over the RAR, since
   it skips Stage 1 entirely.

---

## VI. Chapter-1 corrections log (history — do not re-derive)

Every correction made during the pilot, so the pipeline does not repeat them:

- Bibliography names: Moulton (not Mouton), Colin Brown (not Collin), Rienecker
  (not Rieneker). All other text stays verbatim, including feedback strings like
  "Its not that bad" (typo policy A1: scholar names only).
- Sequence order: Learn Iota Subscripts precedes Diphthong Drill; Learn
  Bibliography is the FINAL page, after both Quick Review charts.
- Iota subscript examples are tappable: σκοτίᾳ (darkness, Jn 1:5), ἀρχῇ
  (beginning, Jn 1:1), αὐτῷ (him, Jn 1:4). Each carries `exampleAudio`.
- Ναζαρέθ ends in theta.
- Letter-name spellings from TBK extraction: `eyilon` = epsilon (not eysilon),
  `uyilon` = upsilon.
- Pronounce Letters exercise order is SHUFFLED per visit (TBK shuffle script +
  DOSBox observation).
- Speller tile inventory: 25 letters + 11 diacritic marks + 3 composites = 39
  tiles, including all six breathing+accent combinations.
- Reading exercise audio plays only on Answer, not on item appearance.
- Vowel tiles ARE clickable and play `audioShort`.
- Intro audio: `a_intro1..4` narrate the Win 3.1 navigation pages and are UNUSED
  by design; `a_welcom` is the Welcome page Play.
- Diphthongs / Iota Subscripts: the definition text is `lead` (core lesson
  material above the chart), not a green note banner.
- Review Letters Quick Chart: Pronounce column removed; four columns remain.
- `audioFull`'s ONLY consumer is the Learn Letters stepper. Everything else uses
  `audioShort`. This was corrected TWICE (the Capitals drill, then the Letter
  Names and Sounds drill) — assume `audioShort` and require evidence for the
  other.
- `A_NAME_1..24` are PERSONAL names and `A_PLAC_1..11` are place names, both for
  the Reading exercise pools. They are not letter audio; this was an early
  mistake that cost a round.

---

## VII. Chapter-2 corrections log

- The accent-placement exercise pool is **not the vocabulary list**. It is two
  root words (Βαπτίζω ×10, ἄνθρωπος ×10), each item showing the root plus its
  gloss and an UNACCENTED inflected form with a Scripture reference. Grave is
  not offered as an option in the original — only Acute and Circumflex.
- `b_ex2_1..20` are those inflected forms in order. **`b_ex2_21` is the vocative
  ἄνθρωπε**, unreferenced by the twenty items — it was assumed to be a root
  recitation for two rounds before the device pass identified it.
- `b_ex2_11..20` double as the Rule-chart row audio in Learn 3 Accents.
- `B_VOC1..10` = chapter-2 vocabulary, SCRIPT-verified via the TBK `SayWord`
  dispatch table (`b_voc4` = ἔχω by elimination, later listen-confirmed).
- `b_egoei` and `b_egoeim` are identical recordings; `b_moses` and `b_mosesx`
  are the same word accented on different syllables and the drill needs the
  second.
- Syllable divisions come from the original's own charts, not from modern
  practice: κύριος divides κύρ-ι-ος per an explicit chart note, Πέτρος =
  Πέτ-ρος, Χριστός = Χρισ-τός.
- The Syllable Counting Drill has only buttons 1-4 — no one-syllable bar (καί
  answers "1").
- The Marking Recognition score dialog in the original says "Drills Available:
  35" but both DOSBox passes yielded the same 25 items. That is an original bug;
  the port uses 25.
- Chart ditto marks: the original's `"` under a chart column means *idem./ibid.*
  Flattening a chart into rows turns it into a literal quote character opening
  every gloss. Print the translation instead.
- Chapter 2 authorized one content DEPARTURE from the original: a five-item
  circumflex extension merged and interleaved into the twenty-item accent
  placement pool, unlabelled, `extended: true` for provenance only. Kept after
  device verification.

---

## VIII. Scale-out protocol (chapters 3-28)

**The round-by-round process is CHAT-HANDOFF's "Buildout process v2"** —
automated extraction produces a RECON-TASKS list, Nathanael's manual recon
returns RECON-RESULTS, chat writes a COMPLETE spec, both implementer models
build it in isolated copies, a grading chat picks a winner and may emit an
XPATCH, and the round ends with a VERIFY device pass. v2 of this document
described an earlier, simpler loop; that loop is superseded.

What remains this document's, per chapter:

1. **EXTRACT** the chapter's `.TBK` from the ISO (Stage 2).
2. **DUMP STRINGS** with context windows (Stage 4), excluding Hebrew regions
   per the CORRECTED tell-tale model.
3. **PARSE RICH-TEXT RECORDS** with `scripts/tbk_richtext.py` (Stage 4b) —
   paradigm charts, underline spans, Greek-font runs, drill pools.
4. **INVENTORY** the chapter's audio from the ISO directory.
5. **CONVERT** via `font-map.json`, flagging unknown codes (Stages 3 and 5).
6. **ASSEMBLE** against CHAT-HANDOFF's contracts (Stage 7).
7. **VALIDATE** programmatically (Stage 7 checklist).
8. **DERIVE SCORED-DRILL ANSWERS BY RULE before asking a human.** Chapter 2's
   answer keys were all deterministic from the chapter's own taught rules and
   charts, and every derived answer survived device verification. Chapter 3+
   parsing/translation answers are equally rule-determined. Route only
   SPOT-CHECKS of derived answers to recon — plus what only a running program
   shows: sequence order, new-mode layout, timing/scoring behavior.
9. **LIST WHAT COULD NOT BE REACHED** — this becomes the cohort's RECON-TASKS
   document. Post-5C this is a confirmations list, not a data-collection list.

CONVERGENCE, honestly stated. v2 predicted "1-2 passes per chapter". Chapter 2
took four implementer rounds — but **three of those were typography, not
content**, now standing infrastructure. The content itself converged in roughly
the predicted span. Do not budget chapters 3+ against chapter 2's round count;
do budget for the fact that the FIRST chapter to need a new activity type will
pay a similar one-time cost — per the 5C recon that chapter is CHAPTER 3
(paradigm mode + parse/translate variants + the Scripture Memory family), after
which chapters 4-8 are reuse.

Also settled and no longer a plan: **lazy chapter loading shipped in 5A**
(2026-07-23). Chapters load as per-chapter JS chunks via `import.meta.glob` over
a loaded-chapters registry, awaited once at the route level; vite-plugin-pwa
precaches the emitted chunks. The trap v2 flagged is real and still guarded in
CI: the glob map must be reachable from executed code or the chunk is
tree-shaken and no output is emitted, silently.

---

## IX. Tool reference

```bash
# Chat-side
pip install libarchive-c --break-system-packages   # RAR streaming (foreground!)
pip install pycdlib      --break-system-packages   # ISO9660 reads
pip install fonttools    --break-system-packages   # TTF glyph inspection
pip install Pillow       --break-system-packages   # glyph rendering
python3 scripts/tbk_richtext.py <ch>.TBK           # rich-text records (5C)

# User-side
brew install ffmpeg         # macOS
winget install Gyan.FFmpeg  # Windows
# transcode_audio.py needs no pip packages
```

Repo-side build scripts (NOT this pipeline's, but the same `fonttools`
dependency, and listed so nobody re-derives them): `scripts/make-greek-font.py`
derives the bundled Greek face, and `scripts/make-mark-geometry.py` generates
`src/lib/mark-geometry.json` from it. They are a matched pair — rebuild one and
regenerate the other in the same commit. See CHAT-HANDOFF's typography canon.
`scripts/tbk_richtext.py` is extraction-side only (chat pipeline provenance);
it has no build or runtime role.
