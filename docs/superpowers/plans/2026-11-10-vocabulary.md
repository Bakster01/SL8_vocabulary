# Spotlight Pocket Implementation Plan

Goal: publish a mobile offline vocabulary trainer in C:/ai/vocabulary.
Architecture: buildless static PWA with copied dictionaries/audio, local study state and explicit verified offline download.
Tech Stack: HTML, CSS, ES modules, Service Worker, Node verification.
Spec: ../specs/2026-11-10-vocabulary-design.md

## Global constraints
Complete modules 1 and 2; section-specific meanings retained. Audio is generated Microsoft Zira pronunciation. No remote language API. Progress stays on device.

## Review focus
Interrupted downloads must resume and must not claim readiness. Missing audio must fail verification. Corrupt localStorage must recover. Multiple meanings must not make choices ambiguous. Corrections and assisted answers must not award independent successes.

### Task 1: Data and audio
- [ ] Import source modules into dist/data; map speechCatalogue IDs to recordings; verify every entry and asset.
### Task 2: Practice
- [ ] Implement core.mjs selection, normalization, distractors, scoring and restore; exercise corruption, ambiguous choices and assisted answers with Node assertions.
- [ ] Implement app.js with home, practice, dictionary and downloads views, mobile CSS and accessible controls.
### Task 3: Offline
- [ ] Implement sw.js cache-first shell and audio with Range responses; downloads.js explicit resumable audio download with progress and integrity counts.
- [ ] Test first-load registration, reload without connection, audio offline, interrupted download and persistent progress.
### Task 4: Publication
- [ ] Register Sites identity once; package exact source using Sites helper; publish and inspect terminal deployment state.
