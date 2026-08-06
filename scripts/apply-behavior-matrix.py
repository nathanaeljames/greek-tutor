#!/usr/bin/env python3
"""apply-behavior-matrix.py -- stamp DRILL-BEHAVIOR-LEDGER.csv onto the
chapter data files.

The ledger is the SOURCE OF TRUTH for drill and exercise behavior:
`audioTiming`, `answerPolicy.advanceClass`, the Pronounce-Each default,
and Previous/Next presence. Its rows come from Nathanael's DOSBox pass,
not from inference.

Run this AFTER any assemble_chNN.py, so a regenerated chapter cannot
silently revert to whatever the assembler happened to hard-code:

    python3 scripts/assemble_ch4.py ... src/data
    python3 scripts/apply-behavior-matrix.py \
        buildout/DRILL-BEHAVIOR-LEDGER.csv src/data

The script also applies the typographic rules that are data-side:
D2 (no displayed double hyphen), the two underlined accent rules in a
HINT (5E-SPEC2 §5.3), and the removal of any lingering
`autoAdvanceMs`.

Only rows whose Status is CONFIRMED are applied. TO FILL rows are for
chapters whose DOSBox pass has not happened yet; they are skipped, and
their absence is reported so a chapter cannot ship unstamped by
accident.

Idempotent: running it twice changes nothing the second time.
"""
import csv
import json
import os
import re
import sys
import unicodedata

# The report echoes the strings it changed, and some of them are Greek. On
# Windows the console defaults to cp1252, which raises rather than mangling —
# the script did its work and then died printing what it had done. Say UTF-8
# out loud, and fall back to replacement characters rather than an exception.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

VALID_TIMING = {'beforeGuess', 'afterGuess', 'afterTap', 'afterCheck', 'none'}
VALID_CLASS = {'none', 'autoBoth', 'manualOnIncorrect', 'retryUntilRight',
               'manualCorrectAutoIncorrect', 'spellUntilRight'}
PRONOUNCE_CHECKBOXES = ('Pronounce Each Drill', 'Pronounce Each Exercise')
EM = '\u2014'

# 5E-SPEC2 section 5.3. The first two of the six accent rules NAME the behavior
# they teach, and the original underlines those names. The renderer has no
# way to know which sentence is a rule name, and it must not be taught to
# guess (a "first sentence of a multi-sentence item" heuristic would
# underline half of chapter 3), so this is a data-side typographic rule
# alongside D2 - and it lives here rather than in a hand edit so a
# regenerated chapter 2 cannot lose it.
#
# Scoped to HINT content on purpose. The same two sentences also appear in
# the Learn topic list, in an expander LABEL ("Rule 1: Nouns are
# retentive") and in the Quick Review chart; underlining a summary hotword
# or a device-verified teaching page is not what the rule asks for.
HINT_UNDERLINES = ('Nouns are retentive.', 'Verbs are recessive.')

# Non-underscore keys whose values are provenance rather than copy.
PROVENANCE_KEYS = ('audioInventory',)

# Data files nothing renders. font-map.json is the extraction pipeline's own
# reference table (no runtime import anywhere in src/), so its prose is
# documentation and its double hyphens are not "displayed".
NON_RENDERED = {'font-map.json'}


def load_ledger(path):
    rows = {}
    skipped = []
    with open(path, encoding='utf-8-sig') as fh:
        for row in csv.DictReader(fh):
            if row['Status'].strip() != 'CONFIRMED':
                skipped.append((row['Chapter'], row['Drill / Exercise']))
                continue
            aid = row['Activity id'].strip()
            if not aid:
                raise SystemExit(
                    f'STOP: CONFIRMED row {row["#"]} has no Activity id')
            t, c = row['TARGET audioTiming'], row['TARGET advanceClass']
            if t not in VALID_TIMING:
                raise SystemExit(f'STOP: {aid} audioTiming {t!r}')
            if c not in VALID_CLASS:
                raise SystemExit(f'STOP: {aid} advanceClass {c!r}')
            rows[aid] = {
                'audioTiming': t,
                'advanceClass': c,
                'prevNext': row['TARGET Prev/Next?'].strip().lower(),
                'pronounceEach': row['TARGET pronounceEach default'].strip().lower(),
            }
    return rows, skipped


def dehyphen(obj, log, path='$'):
    """D2: a displayed double hyphen becomes an em dash.

    Only touches STRING VALUES, and only where the hyphens sit between
    word characters, after a word, or SPACED between two words - never
    inside a key, a markup tag or an id.

    PROVENANCE IS SKIPPED ENTIRELY: every underscore-prefixed key, plus
    `audioInventory`, whose values are role notes keyed by audio id.
    `_legacy` records the TBK's own bytes and must stay byte-exact, and
    `_comment`/`_note`/`_verify` are pipeline provenance that no screen
    ever shows; the rule is about what is DISPLAYED, so rewriting them
    would only churn the diff and blur where a mark came from.

    The spaced form was added in 5E-SPEC2 section 5.4: it is the form
    the Introduction uses ("WELCOME -- Greek Tutor...", "... -- ENJOY"),
    and it was invisible to the two tight patterns.
    """
    if isinstance(obj, dict):
        return {k: (v if k.startswith('_') or k in PROVENANCE_KEYS else
                    dehyphen(v, log, f'{path}.{k}'))
                for k, v in obj.items()}
    if isinstance(obj, list):
        return [dehyphen(v, log, f'{path}[{i}]') for i, v in enumerate(obj)]
    if isinstance(obj, str) and '--' in obj:
        new = re.sub(r'(?<=\w)--(?=\w)', EM, obj)
        new = re.sub(r'(?<=\w)--(?=\s|$)', EM, new)
        new = re.sub(r'(?<=\s)--(?=\s)', EM, new)
        if new != obj:
            log.append((path, obj, new))
        return new
    return obj


def underline_hint(obj, log, path='$'):
    """Wrap the named accent rules in the [[u]]...[[/u]] the renderer draws.

    Idempotent: a phrase already inside an underline span is skipped,
    because the tag characters break the plain-text match.
    """
    if isinstance(obj, dict):
        return {k: underline_hint(v, log, f'{path}.{k}') for k, v in obj.items()}
    if isinstance(obj, list):
        return [underline_hint(v, log, f'{path}[{i}]')
                for i, v in enumerate(obj)]
    if isinstance(obj, str):
        new = obj
        for phrase in HINT_UNDERLINES:
            if phrase in new and f'[[u]]{phrase}' not in new:
                new = new.replace(phrase, f'[[u]]{phrase}[[/u]]')
        if new != obj:
            log.append((path, obj, new))
        return new
    return obj


def apply_chapter(path, ledger, report):
    data = json.load(open(path, encoding='utf-8'))
    touched = 0
    for section in ('drill', 'exercise'):
        for act in data.get(section, []):
            spec = ledger.get(act['id'])
            if spec is None:
                report['unstamped'].append(act['id'])
                continue
            touched += 1
            act['audioTiming'] = spec['audioTiming']

            policy = act.setdefault('answerPolicy', {})
            policy.pop('autoAdvanceMs', None)
            if spec['advanceClass'] == 'none':
                act.pop('answerPolicy', None)
            else:
                policy['advanceClass'] = spec['advanceClass']
                policy.setdefault('attemptsPerItem', 1)
                if spec['advanceClass'] in ('retryUntilRight', 'spellUntilRight'):
                    policy['attemptsPerItem'] = 'retry'

            ui = act.setdefault('ui', {})
            buttons = ui.get('buttons')
            if isinstance(buttons, list):
                has = 'Previous' in buttons and 'Next' in buttons
                if spec['prevNext'] == 'no' and has:
                    ui['buttons'] = [b for b in buttons
                                     if b not in ('Previous', 'Next')]
                    report['buttons'].append(act['id'])
                elif spec['prevNext'] == 'yes' and not has:
                    report['missing_buttons'].append(act['id'])
            if spec['pronounceEach'] == 'yes':
                boxes = ui.get('checkboxes') or []
                if any(b in boxes for b in PRONOUNCE_CHECKBOXES):
                    defaults = ui.setdefault('defaults', {})
                    if defaults.get('pronounceEach') is not True:
                        report['pronounce'].append(act['id'])
                    defaults['pronounceEach'] = True

            if isinstance(act.get('hint'), dict):
                act['hint'] = underline_hint(act['hint'], report['underlines'],
                                             f'{act["id"]}.hint')

    hyphens = []
    data = dehyphen(data, hyphens)
    report['hyphens'] += [(path, p, a, b) for p, a, b in hyphens]

    blob = json.dumps(data, ensure_ascii=False, indent=1) + '\n'
    if unicodedata.normalize('NFC', blob) != blob:
        raise SystemExit(f'STOP: {path} is not NFC after stamping')
    open(path, 'w', encoding='utf-8').write(blob)
    return touched


def indent_of(text, default=1):
    """The file's own indent width, so rewriting one string does not
    reformat the whole file. The chapter files are written at indent 1
    and intro.json at indent 2; a two-character typographic fix that
    reflows 120 lines is a diff nobody can review."""
    for line in text.split('\n')[1:]:
        stripped = line.lstrip(' ')
        if stripped and stripped != '}':
            return len(line) - len(stripped) or default
    return default


def apply_plain(path, report):
    """The typographic pass only, for the rendered data files that carry
    no drills or exercises (intro.json, toc.json, the lexicons). The file
    is left byte-identical when there is nothing to fix."""
    try:
        text = open(path, encoding='utf-8').read()
    except OSError:
        return
    data = json.loads(text)
    hyphens = []
    data = dehyphen(data, hyphens)
    if not hyphens:
        return
    report['hyphens'] += [(path, p, a, b) for p, a, b in hyphens]
    blob = json.dumps(data, ensure_ascii=False, indent=indent_of(text)) + '\n'
    if unicodedata.normalize('NFC', blob) != blob:
        raise SystemExit(f'STOP: {path} is not NFC after stamping')
    open(path, 'w', encoding='utf-8').write(blob)


def main():
    ledger_path, datadir = sys.argv[1], sys.argv[2]
    ledger, skipped = load_ledger(ledger_path)
    report = {'unstamped': [], 'buttons': [], 'missing_buttons': [],
              'pronounce': [], 'hyphens': [], 'underlines': []}
    total = 0
    for n in range(1, 29):
        path = f'{datadir}/chapt-{n:02d}.json'
        try:
            open(path).close()
        except OSError:
            continue
        total += apply_chapter(path, ledger, report)
    # D2 is an APP-WIDE rule, not a chapter one. Every rendered data file
    # gets the typographic pass, not just chapt-NN.json: the last displayed
    # double hyphens were in intro.json ("WELCOME --", "-- ENJOY") and in
    # two chapter-1 lexicon glosses, none of which this loop had ever opened.
    for name in sorted(os.listdir(datadir)):
        if (name.endswith('.json') and not re.fullmatch(r'chapt-\d\d\.json', name)
                and name not in NON_RENDERED):
            apply_plain(f'{datadir}/{name}', report)
    print(f'stamped {total} activities from {len(ledger)} confirmed rows')
    if skipped:
        chs = sorted({c for c, _ in skipped})
        print(f'  {len(skipped)} TO FILL rows skipped (chapters {", ".join(chs)})')
    for key, label in (('unstamped', 'NO LEDGER ROW (behavior left as-is)'),
                       ('buttons', 'Previous/Next removed'),
                       ('missing_buttons', 'ledger wants Previous/Next but data has none'),
                       ('pronounce', 'pronounceEach default corrected to true')):
        if report[key]:
            print(f'  {label}: {", ".join(report[key])}')
    if report['underlines']:
        print(f'  hint underlines applied: {len(report["underlines"])}')
        for p, a, b in report['underlines']:
            print(f'    {p}: {a[:40]!r} -> {b[:52]!r}')
    if report['hyphens']:
        print(f'  em dashes applied: {len(report["hyphens"])}')
        for path, p, a, b in report['hyphens']:
            print(f'    {path} {p}: {a!r} -> {b!r}')
    if report['unstamped']:
        raise SystemExit(
            'STOP: the activities above have no CONFIRMED ledger row. Fill '
            'their rows from DOSBox before shipping the chapter.')


if __name__ == '__main__':
    main()
