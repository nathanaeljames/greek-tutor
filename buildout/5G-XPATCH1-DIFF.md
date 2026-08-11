# 5G-XPATCH1-DIFF.md — the cross-patch's diff

Base: `daf89b0` ("phase 5G opus wins, uploading xpatch and verify
generation task"), which is the accepted 5G-SPEC1 Opus tree as
committed.

This is the complete 5G-XPATCH1 implementation: the two ports and their
assertions, plus the §9 amendment to `5G-SPEC1-RESULTS.md`. It excludes
the supplied `buildout/5G-XPATCH1.md` input, this file itself (which
cannot contain its own diff), and `buildout/VERIFY-5G.md`, which is the
separate VERIFY-5G-TASK deliverable and not part of this patch. No
`src/data/*.json` content changed. Nothing is committed and nothing is
pushed.

## Summary

```
buildout/5G-SPEC1-RESULTS.md             | 132 ++++++++++++++++++++++
 scripts/ui-behavior.mjs                  | 188 +++++++++++++++++++++++++++++++
 src/components/SelectActivity.svelte     |  26 ++++-
 src/components/SpellVerseActivity.svelte |  18 ++-
 src/lib/audio.js                         |  43 +++++--
 5 files changed, 390 insertions(+), 17 deletions(-)
```

## The diff

```diff
diff --git a/buildout/5G-SPEC1-RESULTS.md b/buildout/5G-SPEC1-RESULTS.md
index 2da6b55..ea4d3ff 100644
--- a/buildout/5G-SPEC1-RESULTS.md
+++ b/buildout/5G-SPEC1-RESULTS.md
@@ -488,3 +488,135 @@ cohort.
 4. **§2.4 of the spec describes a drill the chapter does not have**
    (§5.1 above). Worth correcting in the next spec so the next reader
    does not go looking for the voice stage.
+
+---
+
+## 9. XPATCH1 (cross-patch from the parallel Sol run)
+
+Two ports requested, one taken as code and one taken as assertions. The
+rest of the Opus base stands as shipped, as the patch directs — the six
+§4 data fixes, D-40/D-41/D-42, `ui:offline`, the zero-padding and
+cohort-gate harness fixes and the popup-walk assertions are untouched.
+
+### 9.1 `playThrough()` reports HOW playback ended — TAKEN
+
+`src/lib/audio.js` now resolves `true` only when the clip reached its
+own end, and `false` when it was paused, errored, failed to start or was
+superseded. The never-reject contract is unchanged.
+
+**The obvious implementation of that sentence is wrong, and the
+assertion is what caught it.** Resolving `true` from the `ended`
+listener and `false` from the `pause` listener reads correctly and fails
+in practice: a clip that finishes fires `pause` AND `ended` — the spec
+pauses the element on the way out and Chrome delivers them in that
+order — so every completed clip resolved `false` from whichever landed
+first, and the repeat pass then never cleared anything. Written that
+way, shipped, and caught within the hour by the acceptance assertion the
+patch asked for; the probe that diagnosed it recorded one clip with
+`started`, `ended` AND `stopped` all true.
+
+What the listeners settle on now is the `ended` ATTRIBUTE, not which
+event arrived. It is positional rather than event-ordered: already true
+when that trailing pause fires, still false when `stop()` pauses
+mid-clip. Only a real `error` resolves false on its own account. The
+early-exit path (the clip was already over before we could listen)
+answers the same way.
+
+Every other caller races the promise against a minimum timer and ignores
+the value (`SelectActivity`, `SpellActivity`, `DivideActivity`,
+`PlaceAccentActivity`), so nothing else moves.
+
+`SpellVerseActivity`'s repeat pass now clears the slate only when all
+four hold: the clip finished, the checkbox is still ticked, the
+component is still mounted (`destroyed`), and no Restart or later
+attempt has bumped the token. Sol's stale-completion guard is included —
+`destroyed` is set in `onDestroy` alongside the existing token bump.
+
+The reasoning matters more than the diff: D-42 wipes what the learner
+typed, and it does that on the strength of a checkbox they ticked. A
+verse cut off by a route exit, a screen lock or a superseding tap is not
+the learner hearing their verse, and the old contract could not tell the
+two apart.
+
+**Assertions** (ui-behavior, "5G-X1", on chapter 9's SM speller; chapter
+10 mounts the same component):
+
+- repeat OFF: a solved verse plays and the slate is left alone.
+- repeat ON, clip reaches its own end: the slate clears AND completion
+  is recorded and stays recorded.
+- repeat ON, verse INTERRUPTED mid-clip: the slate is NOT wiped. The
+  interruption is a superseding Pronounce tap rather than a route exit,
+  deliberately — it leaves the component mounted so the field is still
+  readable, which is what makes this the assertion that discriminates.
+  Under the old contract it would have cleared.
+- repeat ON, page left mid-clip: completion still stands.
+
+The verse clip is seeded into the audio store the app already reads (the
+route §6.2's long-clip cases use), short for the natural-end case and
+five seconds for the interruption case, because the preview ships no
+audio.
+
+### 9.2 The N-stage commit order — INSPECTED, no code change, assertions added
+
+XPATCH1 §2 anticipated this outcome and asked for the code path if it
+held. It holds.
+
+`chooseStage()` in `SelectActivity.svelte` (the only place a staged
+guess commits) reads:
+
+```js
+    stagePicks = stagePicks.map((pick, at) => (at === index ? opt.id : pick));
+    if (stagePicks.some(pick => pick == null)) return;   // tuple incomplete
+    commit(current.accepted.has(pairKey(stagePicks)));
+```
+
+The guard returns while any pick is still null, so the only click that
+can reach `commit` is the one that filled the last empty stage — and
+that is also the click after which every stage holds a value. "Every
+stage now holds a value" and "this click filled the last empty stage"
+name the SAME click, at any stage count; once committed, `answered`
+closes the grid, so no later click can re-open a full tuple. A separate
+`stages.length <= 2` branch would be two code paths that cannot produce
+two answers.
+
+The reading that WOULD differ is "commit only when the last stage BY
+INDEX is clicked" — and XPATCH1's own acceptance criteria rule it out
+("a revision to stage 1 after stages 2+3 are filled still commits on the
+stage-1 click"). So the split is not needed and adding it would ship a
+distinction without a difference.
+
+What IS durable is the fill order, and it is asserted (ui-behavior,
+"5G-X2"), exactly as the patch asks:
+
+- ch10 parsing, fill order 3 -> 1 -> 2: neither the stage-3 nor the
+  stage-1 click judges anything; the stage-2 click commits.
+- ch10 parsing, fill order 2 -> 3 -> 1: the stage-1 click commits, even
+  though it is not the last stage by index.
+- ch8 case drill, person then case: still commits on the second value
+  (VERIFY-5F item 7). §2.9's existing case-then-person assertion is
+  unchanged and still passes, so the two-stage drill is pinned in both
+  orders.
+
+The commit site carries a comment recording why the two readings of
+§4.1 cannot diverge here, so the next reader of that sentence does not
+have to re-derive it.
+
+### 9.3 Acceptance
+
+Re-run in full after the patch:
+
+| check | result |
+|---|---|
+| `npm run check:shapes` | PASS, ten chapters |
+| `npm run build` | clean; 37 precache entries |
+| `npm run check:lazy-chunk` | PASS, ten chapter + ten lexicon chunks |
+| `npm run ui:behavior` | 856/856 behavior checks passed |
+| `npm run ui:walk` | walked 219 stops x 2 widths, all ten chapters: no overflow, no rail errors, no interaction errors, no console errors |
+| `npm run ui:modals` | 115/115 modal states clean |
+| `npm run ui:offline` | offline: 44 stops rendered, 0 missing, refresh OK |
+
+All four G1 paths re-run green, and so does every assertion the round
+already had.
+
+Diff: `5G-XPATCH1-DIFF.md` (this patch alone, against the 5G-SPEC1
+tree).
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index 876b860..4ef4db1 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -3585,6 +3585,194 @@ for (const [chapterId, activityId] of [
 }
 
 
+
+// ===================================================================
+// 5G-XPATCH1: the two cross-ported pieces
+// ===================================================================
+
+// ---- X1 the repeat lifecycle only fires on a clip that FINISHED ---------
+// D-42 clears what the learner typed once the verse has been spoken. "Spoken"
+// has to mean ENDED: a clip cut off by a route exit, a screen lock or a
+// superseding tap is not the learner hearing their verse, and wiping the slate
+// on the strength of one would be the worst possible reading of a checkbox
+// they ticked. playThrough now reports which happened; this pins all three
+// paths on chapter 9's SM speller (chapter 10 mounts the same component).
+{
+  const HASH = '#/activity/chapt_9/c9_ex_scripture_speller';
+  const activity = activityById(ch9, 'c9_ex_scripture_speller');
+  const verseWords = stripAccents((activity.answerWords || []).join(' '));
+  const repeatBox = () => page.locator('.spell-checks [data-repeat-exercise] input');
+  const completedIn = () => page.evaluate(() => {
+    try { return JSON.parse(localStorage.getItem('greek-tutor-progress-v1') || '{}').completed || {}; }
+    catch { return {}; }
+  });
+  // The preview ships no audio, so the verse clip is seeded into the store the
+  // app already reads (the same route §6.2's long-clip cases use). A SHORT one
+  // here: the point is a clip that reaches its own `ended` quickly.
+  const versePath = audioPath(activity.audio);
+  const solveIt = async () => {
+    await setAccents(false);
+    await typeAccented(verseWords);
+    await stepper('Check Answer').click();
+  };
+
+  // (c) REPEAT OFF is unchanged: the verse is spoken and what was typed STAYS.
+  await go(HASH);
+  await seedLongClip([versePath], 0.4);
+  await go(HASH);
+  await solveIt();
+  await page.waitForTimeout(1200);
+  check('5G-X1 repeat OFF: a solved verse plays and the slate is left alone',
+    await feedbackKind() === 'ok' && normalizeText(await typed()).length > 0
+      && !await repeatBox().isChecked(),
+    `feedback ${await feedbackKind()}, field ${JSON.stringify((await typed()).slice(0, 24))}`);
+
+  // (a) REPEAT ON, clip plays to its natural end -> the slate clears for
+  // another pass, and completion is recorded and STAYS recorded.
+  await go(HASH);
+  await repeatBox().check();
+  await solveIt();
+  await page.waitForTimeout(1600);
+  {
+    const completed = await completedIn();
+    check('5G-X1 repeat ON, clip reaches its end: the slate clears and completion stands',
+      normalizeText(await typed()) === '' && completed.c9_ex_scripture_speller === true
+        && await repeatBox().isChecked(),
+      `field ${JSON.stringify(await typed())}, completed ${completed.c9_ex_scripture_speller}`);
+  }
+
+  // (b) REPEAT ON, but the clip is CUT OFF. This is the assertion that
+  // discriminates: under the old contract playThrough resolved the same way
+  // whether a clip ended or was interrupted, so an interrupted verse cleared
+  // the slate exactly as a finished one did.
+  //
+  // The interruption used here is a SUPERSEDING TAP — Pronounce, mid-verse —
+  // because it leaves the component mounted and the field readable. A route
+  // exit and a screen lock reach the same pause; a route exit additionally
+  // unmounts, which the `destroyed` guard covers and which is checked below
+  // for the thing that IS observable across it, completion.
+  await go(HASH);
+  await seedLongClip([versePath], 5);          // long enough to interrupt
+  await go(HASH);
+  await repeatBox().check();
+  await solveIt();
+  await page.waitForTimeout(300);
+  const typedMidClip = normalizeText(await typed());
+  await stepper('Pronounce').click();          // supersedes the verse mid-play
+  await page.waitForTimeout(900);
+  check('5G-X1 repeat ON, verse INTERRUPTED mid-clip: the slate is NOT wiped',
+    typedMidClip.length > 0 && normalizeText(await typed()).length > 0,
+    `field mid-clip ${JSON.stringify(typedMidClip.slice(0, 24))}, field after the interruption ${JSON.stringify((await typed()).slice(0, 24))}`);
+
+  // ...and leaving the page mid-clip does not un-complete the exercise. The
+  // clear itself is unobservable across an unmount (the page comes back
+  // freshly mounted either way); completion is the state that survives, and
+  // it is what D-42 says the repeat pass must not touch.
+  await go(HASH);
+  await repeatBox().check();
+  await solveIt();
+  await page.waitForTimeout(250);
+  await go('#/activity/chapt_9/c9_learn_scripture');      // route exit mid-clip
+  await page.waitForTimeout(600);
+  const completedAfter = await completedIn();
+  check('5G-X1 repeat ON, page left mid-clip: completion still stands',
+    completedAfter.c9_ex_scripture_speller === true,
+    `completed ${completedAfter.c9_ex_scripture_speller}`);
+  await seedLongClip([versePath], 0.4);
+}
+
+// ---- X2 the N-stage commit order --------------------------------------
+// 5G-SPEC1 §4.1 says both "commits on the final stage's click" and "exactly as
+// the two-stage c8_drill_case behaves" (device-verified either-order,
+// VERIFY-5F item 7). XPATCH1 §2 asked whether N > 2 needs its own rule. It
+// does not, and this is what says so: the commit guard in chooseStage()
+// returns while any pick is null, so the only click that can reach `commit` is
+// the one that filled the last empty stage — which is also the click after
+// which every stage holds a value. The two readings name the same click. What
+// is durable is the FILL ORDER, pinned here in both of the orders XPATCH1's
+// acceptance criteria name.
+{
+  const activity = activityById(ch10, 'c10_drill_parsing');
+  const HASH = '#/activity/chapt_10/c10_drill_parsing';
+  const stage = index => page.locator(`[data-stage="${index}"]`);
+  const clickStage = async (index, label) => {
+    await stage(index).locator('.tile', { hasText: label }).first().click();
+    await page.waitForTimeout(120);
+  };
+  const answerFor = async () => {
+    const prompt = await promptOnScreen();
+    const hits = activity.items.filter(i => normalizeText(i.greek) === prompt);
+    const unique = new Set(hits.map(i => i.answer.join('|')));
+    return unique.size === 1 ? hits[0].answer : null;
+  };
+
+  // FILL ORDER 3 -> 1 -> 2. Neither the stage-3 click nor the stage-1 click
+  // may judge anything; the stage-2 click commits, because it filled the last
+  // empty stage.
+  {
+    await go(HASH);
+    const answer = await answerFor();
+    if (!answer) {
+      check('5G-X2 fill order 3->1->2 commits on the stage-2 click, and not before', false, 'ambiguous prompt');
+    } else {
+      await clickStage(2, answer[2]);
+      const afterThird = await feedbackKind();
+      await clickStage(0, answer[0]);
+      const afterFirst = await feedbackKind();
+      await clickStage(1, answer[1]);
+      await page.waitForTimeout(180);
+      check('5G-X2 fill order 3->1->2 commits on the stage-2 click, and not before',
+        afterThird === 'none' && afterFirst === 'none' && await feedbackKind() === 'ok',
+        `after stage 3 ${afterThird}, after stage 1 ${afterFirst}, after stage 2 ${await feedbackKind()}`);
+    }
+  }
+
+  // FILL ORDER 2 -> 3 -> 1. The stage-1 click commits even though it is not
+  // the last stage BY INDEX — the literal "final stage" reading that would
+  // refuse this is the one XPATCH1's acceptance criteria rule out.
+  {
+    await go(HASH);
+    const answer = await answerFor();
+    if (!answer) {
+      check('5G-X2 fill order 2->3->1 commits on the stage-1 click (last EMPTY, not last INDEX)', false, 'ambiguous prompt');
+    } else {
+      await clickStage(1, answer[1]);
+      await clickStage(2, answer[2]);
+      const beforeLast = await feedbackKind();
+      await clickStage(0, answer[0]);
+      await page.waitForTimeout(180);
+      check('5G-X2 fill order 2->3->1 commits on the stage-1 click (last EMPTY, not last INDEX)',
+        beforeLast === 'none' && await feedbackKind() === 'ok',
+        `after two stages ${beforeLast}, after stage 1 ${await feedbackKind()}`);
+    }
+  }
+
+  // And the two-stage drill keeps the device-verified either-order contract,
+  // which is the half of §4.1 a device pass has pinned. §2.9 above already
+  // asserts case-then-person; this is person-then-case on the same items, so
+  // the pair of orders is covered on the two-stage drill as well.
+  {
+    const caseDrill = activityById(ch8, 'c8_drill_case');
+    await go('#/activity/chapt_8/c8_drill_case');
+    const prompt = await promptOnScreen();
+    const hit = caseDrill.items.find(i => normalizeText(i.greek) === prompt);
+    const pair = hit && hit.answer;
+    if (!pair) {
+      check('5G-X2 ch8 two-stage: person-then-case still commits on the second value (VERIFY-5F item 7)', false, 'no item match');
+    } else {
+      await page.locator('[data-stage="0"]').locator('.tile', { hasText: pair[0] }).first().click();
+      await page.waitForTimeout(120);
+      const midKind = await feedbackKind();
+      await page.locator('[data-stage="1"]').locator('.tile', { hasText: pair[1] }).first().click();
+      await page.waitForTimeout(180);
+      check('5G-X2 ch8 two-stage: person-then-case still commits on the second value (VERIFY-5F item 7)',
+        midKind === 'none' && await feedbackKind() !== 'none',
+        `after the person ${midKind}, after the case ${await feedbackKind()}`);
+    }
+  }
+}
+
+
 await browser.close();
 const failed = results.filter(r => !r.ok);
 console.log(`\n${results.length - failed.length}/${results.length} behavior checks passed`);
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 84354c5..49a8a21 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -347,14 +347,30 @@
     Promise.all([minimum, spoken]).then(() => { if (token === advanceToken) advance(); });
   }
 
-  // §2.9: a stage click. Any stage but the last only RECORDS — no attempt is
-  // counted, no feedback appears, nothing advances — so changing the person is
-  // free. Filling the last stage completes the pair and commits it, which is
-  // where the ordinary scoring path below takes over.
+  // §2.9: a stage click. A click that leaves any stage empty only RECORDS — no
+  // attempt is counted, no feedback appears, nothing advances — so changing an
+  // earlier stage is free. The click that fills the LAST EMPTY stage completes
+  // the tuple and commits it, which is where the ordinary scoring path below
+  // takes over.
+  //
+  // 5G-XPATCH1 §2 asked whether N > 2 needs a separate rule, because
+  // 5G-SPEC1 §4.1 says both "commits on the final stage's click" and "exactly
+  // as the two-stage c8_drill_case behaves" (device-verified either-order,
+  // VERIFY-5F item 7). The two readings cannot diverge HERE, whatever the
+  // stage count: the guard below returns while any pick is still null, so the
+  // only click that can reach `commit` is the one that filled the last empty
+  // stage — "every stage now holds a value" and "this click filled the last
+  // empty one" are the same click, and once committed `answered` closes the
+  // grid so no later click can re-open a full tuple. A separate N > 2 branch
+  // would be two code paths that cannot produce two answers. The literal
+  // reading that WOULD differ — commit only when the last stage BY INDEX is
+  // clicked — is the one XPATCH1's own acceptance criteria rule out ("a
+  // revision to stage 1 after stages 2+3 are filled still commits on the
+  // stage-1 click"). ui-behavior G1 pins both fill orders.
   function chooseStage(index, opt) {
     if (answered || finished || current.pending) return;
     stagePicks = stagePicks.map((pick, at) => (at === index ? opt.id : pick));
-    if (stagePicks.some(pick => pick == null)) return;   // pair incomplete: record only
+    if (stagePicks.some(pick => pick == null)) return;   // tuple incomplete: record only
     commit(current.accepted.has(pairKey(stagePicks)));
   }
 
diff --git a/src/components/SpellVerseActivity.svelte b/src/components/SpellVerseActivity.svelte
index 416e704..4e488ed 100644
--- a/src/components/SpellVerseActivity.svelte
+++ b/src/components/SpellVerseActivity.svelte
@@ -75,9 +75,13 @@
   // and gain none here. `repeatToken` cancels a pending replay-then-clear the
   // way advanceToken does in SelectActivity: Restart, a route change or an
   // unmount must not have the slate cleared out from under it a clip later.
+  // `destroyed` says the same thing for the unmount case in its own right,
+  // because clearing state on a dead component is worth refusing explicitly
+  // rather than by side effect (5G-XPATCH1 §1).
   $: repeatCheckbox = activity.repeatCheckbox === true;
   let repeatExercise = false;
   let repeatToken = 0;
+  let destroyed = false;
 
   $: audioTiming = activity.audioTiming || 'afterGuess';
 
@@ -119,8 +123,19 @@
           // The verse is spoken in FULL before the slate clears — clearing it
           // under the clip would leave the learner listening to a verse that
           // is no longer on screen.
+          //
+          // AND ONLY IF IT ACTUALLY FINISHED (5G-XPATCH1 §1). playThrough
+          // resolves false for a clip cut off by a route exit, a screen lock
+          // or a superseding tap, and none of those is the learner hearing
+          // their verse — wiping what they typed on the strength of a clip
+          // that never played would be the worst possible reading of a
+          // checkbox they ticked. The token and `destroyed` cover the other
+          // half: a Restart or an unmount BETWEEN the success and the clip's
+          // end, and the checkbox being unticked while it played.
           const token = ++repeatToken;
-          playThrough(activity.audio).then(() => { if (token === repeatToken) clearSlate(); });
+          playThrough(activity.audio).then(finished => {
+            if (finished && repeatExercise && !destroyed && token === repeatToken) clearSlate();
+          });
         } else {
           play(activity.audio);
         }
@@ -170,6 +185,7 @@
   onMount(() => window.addEventListener('keydown', onKey));
   onDestroy(() => {
     window.removeEventListener('keydown', onKey);
+    destroyed = true;
     repeatToken += 1;                              // no clear after unmount
     stopAudio();                                   // §3.1
   });
diff --git a/src/lib/audio.js b/src/lib/audio.js
index baa4867..7247a5e 100644
--- a/src/lib/audio.js
+++ b/src/lib/audio.js
@@ -134,22 +134,43 @@ export function stop() {
 // immediately instead of parking the caller for the length of a clip that is
 // no longer playing. It NEVER rejects — a caller's advance must not be lost to
 // a missing file.
+//
+// IT ALSO REPORTS HOW PLAYBACK ENDED (5G-XPATCH1 §1): `true` only when the
+// clip reached its own `ended`, `false` when it was paused, errored, failed to
+// start, or was superseded by a newer play. Every advance caller races this
+// against a minimum timer and ignores the value — an interrupted clip should
+// release the wait either way. The caller that needs the distinction is the
+// whole-verse speller's repeat pass (D-42): it clears what the learner typed
+// once the verse has been spoken, and a clip cut off by a route exit, a screen
+// lock or a superseding tap must NOT go on to wipe the slate.
+// WHICH EVENT FIRED IS NOT THE ANSWER — `audio.ended` IS. A clip that reaches
+// its end fires `pause` AND `ended` (the spec pauses the element on the way
+// out, and Chrome delivers them in that order), so a listener that resolved
+// false from `pause` would call every completed clip an interruption. The
+// `ended` ATTRIBUTE is positional: it is already true by the time that pause
+// arrives, and false when stop() pauses mid-clip. So both listeners settle on
+// the attribute, and only a real `error` is false on its own account.
 export async function playThrough(id) {
   const ok = await play(id);
   const audio = currentAudio;
-  if (!ok || !audio || audio.ended || audio.paused) return !!ok;
-  await new Promise(resolve => {
-    const done = () => {
-      audio.removeEventListener('ended', done);
-      audio.removeEventListener('pause', done);
-      audio.removeEventListener('error', done);
-      resolve();
+  // Already over before we could listen: `ended` is a natural finish; nothing
+  // to play, or superseded so `currentAudio` moved on, is not.
+  if (!ok || !audio) return false;
+  if (audio.ended || audio.paused) return audio.ended === true;
+  return await new Promise(resolve => {
+    const settle = value => () => {
+      audio.removeEventListener('ended', onEnded);
+      audio.removeEventListener('pause', onPause);
+      audio.removeEventListener('error', onError);
+      resolve(value === null ? audio.ended === true : value);
     };
-    audio.addEventListener('ended', done);
-    audio.addEventListener('pause', done);      // stop(), screen-off, new tap
-    audio.addEventListener('error', done);
+    const onEnded = settle(null);
+    const onPause = settle(null);               // stop(), screen-off, new tap
+    const onError = settle(false);
+    audio.addEventListener('ended', onEnded);
+    audio.addEventListener('pause', onPause);
+    audio.addEventListener('error', onError);
   });
-  return true;
 }
 
 // AUDIO STOPS WHEN THE SCREEN GOES OFF (5E-SPEC2 §3.2, rule A6) and does not
```
