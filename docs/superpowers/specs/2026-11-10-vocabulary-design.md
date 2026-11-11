# Spotlight Pocket design
Approved in chat: mobile vocabulary site for Spotlight 8 modules 1 and 2, including offline access.

Use the complete existing section-specific dictionaries, ready audio files, short sessions of 10 words, recognition, English spelling and listening, error review, searchable dictionary, local progress. Download the app and audio explicitly for travel; show download progress and complete status only after verification. No accounts inside the app, no external learning API. Hosted audience defaults to owner-private per Sites.

Approaches: ordinary online static site is smallest but depends on connectivity; selected installable static PWA caches content and recordings. Native mobile app is unnecessary.

Implementation decisions: buildless ES modules, semantic HTML, CSS, Service Worker, Cache Storage and localStorage. Calm white and indigo UI with large touch targets. Source data copied with source references and existing generated Microsoft Zira audio, clearly identified as synthesized pronunciation. Preserve duplicate headwords with distinct meanings.
