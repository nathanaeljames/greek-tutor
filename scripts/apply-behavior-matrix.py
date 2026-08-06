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

The script also applies the two typographic rules that are data-side:
D2 (no displayed double hyphen) and the removal of any lingering
`autoAdvanceMs`.

Only rows whose Status is CONFIRMED are applied. TO FILL rows are for
chapters whose DOSBox pass has not happened yet; they are skipped, and
their absence is reported so a chapter cannot ship unstamped by
accident.

Idempotent: running it twice changes nothing the second time.
"""
import csv
import json
import re
import sys
import unicodedata

VALID_TIMING = {'beforeGuess', 'afterGuess', 'afterTap', 'afterCheck', 'none'}
VALID_CLASS = {'none', 'autoBoth', 'manualOnIncorrect', 'retryUntilRight'}
PRONOUNCE_CHECKBOXES = ('Pronounce Each Drill', 'Pronounce Each Exercise')
EM = '\u2014'


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
    word characters or after a word - never inside a key, a markup tag,
    an id, or a legacy field, since `_legacy` records the TBK's own
    bytes and must stay byte-exact.
    """
    if isinstance(obj, dict):
        return {k: (v if k.startswith('_legacy') else
                    dehyphen(v, log, f'{path}.{k}'))
                for k, v in obj.items()}
    if isinstance(obj, list):
        return [dehyphen(v, log, f'{path}[{i}]') for i, v in enumerate(obj)]
    if isinstance(obj, str) and '--' in obj:
        new = re.sub(r'(?<=\w)--(?=\w)', EM, obj)
        new = re.sub(r'(?<=\w)--(?=\s|$)', EM, new)
        if new != obj:
            log.append((path, obj, new))
        return new
    return obj


# 5E-SPEC2 §5.3, kept data-side. The two accent rules carry no
# structural signal a renderer could key on, so the underline is
# authored here beside D2 rather than inferred at render time.
UNDERLINE = [
    ('Nouns are retentive', '[[u]]Nouns are retentive[[/u]]'),
    ('Verbs are recessive', '[[u]]Verbs are recessive[[/u]]'),
]


def underline(obj, log, path='$'):
    if isinstance(obj, dict):
        return {k: (v if k.startswith('_legacy') else
                    underline(v, log, f'{path}.{k}'))
                for k, v in obj.items()}
    if isinstance(obj, list):
        return [underline(v, log, f'{path}[{i}]') for i, v in enumerate(obj)]
    if isinstance(obj, str):
        new = obj
        for needle, marked in UNDERLINE:
            if needle in new and '[[u]]' + needle not in new:
                new = new.replace(needle, marked)
        if new != obj:
            log.append((path, obj[:60], new[:60]))
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
                if spec['advanceClass'] == 'retryUntilRight':
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

    hyphens = []
    data = dehyphen(data, hyphens)
    report['hyphens'] += [(path, p, a, b) for p, a, b in hyphens]

    marks = []
    data = underline(data, marks)
    report['underlines'] += [(path, p) for p, _a, _b in marks]

    blob = json.dumps(data, ensure_ascii=False, indent=1) + '\n'
    if unicodedata.normalize('NFC', blob) != blob:
        raise SystemExit(f'STOP: {path} is not NFC after stamping')
    open(path, 'w', encoding='utf-8').write(blob)
    return touched


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
        print(f'  accent-rule underlines applied: {len(report["underlines"])}')
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
