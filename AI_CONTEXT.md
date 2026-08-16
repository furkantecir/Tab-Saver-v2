# AI Project Context (Tab Saver v3)

## Purpose
Browser extension (Firefox / Chrome WebExtension) for automatic and manual tab saving, restoring, and export/import.

## Technology
- WebExtensions API (Manifest V3)
- HTML, JavaScript (ES6+), Vanilla CSS
- Typography: Retro Pixel Arcade Fonts (Google Fonts 'Press Start 2P', 'VT323')

## Completed Tasks
- Fixed missing locale loading error (`NS_ERROR_FILE_NOT_FOUND` for `_locales/en/messages.json`).
- Fixed `ReferenceError: window is not defined` in `background.js`.
- Fixed Auto-Backup alarm logic in `background.js`: added top-level initialization and `onStartup` event listener for persistent alarm scheduling across browser restarts.
- Fixed `hasTabsChanged()`: replaced volatile browser window ID comparisons with URL set comparisons.
- Completely removed Analytics tab (`#analyticsTab` / `#analyticsContent`) and analytics tracking from `popup.html`, `popup.js`, and `background.js`.
- Fixed Settings Tab controls and Theme Color customizer:
  - Dynamic Theme Color switching (Green Arcade, Crimson Red, Retro Cyber Blue, Synth 16-Bit Purple, GameBoy Amber, Matrix Cyan) with full UI palette transformation (`--pixel-accent` & `--secondary-accent`).
  - Replaced all lonely OS emojis with custom 16x16 pixel SVG icons + explicit localized text labels for all action buttons (İncele/Preview, Adlandır/Rename, Seçili/Selective, Geri Yükle/Restore, Sil/Delete, Şimdilik Yedekle/Backup Now, Dışa Aktar/Export, vb.).
  - Live Light Mode / Dark Mode switching support for retro pixel theme (Retro Paper Light vs Chiptune Arcade Dark).
  - Status confirmation feedback ("Ayarlar güncellendi!" / "Settings updated!") for all settings switches and selectors.
- Fixed Modal Form Layout & Translation Keys:
  - Updated `getMessage` helper in `popup.js` to support nested dot notation paths (resolving `categories.personal` to "Kişisel" / "Personal").
  - Formatted modal `.form-group` inputs, textareas, selects, and labels with clean pixel spacing and 100% box-sizing.
  - Set `.modal-cancel` button to a neutral dark charcoal style so Cancel buttons no longer stay green when Yellow/Amber theme is active.
- Added Manual Custom Interval Adder & Expanded Presets:
  - Expanded preset interval list (15 Dakika, 30 Dakika, 1 Saat, 2 Saat, 6 Saat, 12 Saat, 24 Saat).
  - Added **Manuel Özel Süre (Custom Interval)** input in Settings tab allowing users to add any custom minute interval (e.g. 45 dak, 90 dak) to the auto-backup dropdown list and automatically activate it.
- Fixed Invalid Date & Added Single Window Restoration:
  - Updated `formatDate` in `popup.js` to parse numeric timestamps (`backup.timestamp`) and localized date formats safely, resolving the `Invalid Date` display bug.
  - Added **"Sadece Bu Pencereyi Aç" (Open Window Only)** button in the **ÖNİZLE (Preview)** modal for 1-click single-window restoration.
- Fixed Merge Backups Crash & Layout:
  - Removed dead `updateAnalytics()` calls in `background.js` and `popup.js` that caused `ReferenceError` during backup creation and merging.
  - Redesigned `showMergeDialog` checkbox list into a clean vertical block layout so backup options and form labels never overlap.
- Replaced Native Browser Confirm Dialog & Added Bulk Delete:
  - Removed browser default ugly `confirm()` popup. Built reusable `showConfirmModal` matching the retro pixel arcade theme.
  - Removed bottom `#storageInfo` card container for a clean UI layout.
  - Added **Toplu Sil (Bulk Delete)** button & modal allowing users to check multiple backups at once with "Select All" / "Select None" and perform multi-backup deletion.
  - Added `Ctrl+F` shortcut binding to focus search bar immediately inside the extension popup.
- Implemented 5 Power Features & Pixel Aesthetics Fix:
  1. **Smart Auto-Categorization**: Auto-assigns categories based on tab domain analysis.
  2. **Domain Exclusion Blacklist**: Filter out unwanted sites (`localhost`, `127.0.0.1`, etc.) from backups via Settings.
  3. **Password-Protected Encrypted Vault**: PIN/Password encryption for sensitive backups with retro PIN unlock modal.
  4. **Auto-Pruning Old Backups**: Automatic cleanup of expired auto-backups based on retention settings (7 to 90 days).
  5. **GitHub Gist Cloud Sync**: Cross-device cloud sync (Push & Pull) via GitHub Personal Access Token.
  6. **Pixel Design & Localization Polish**: Fixed un-translated labels (`excludedDomains` -> "Hariç Tutulan Domainler", `autoPrune` -> "Eski Yedekleri Otomatik Sil") and styled all settings text/password inputs in dark retro pixel theme (`#121418` dark background, gold text, 3D step border).
- Added Multi-language Expansion & Manifest Logo Fix:
  - Added full translation dictionaries & manifest locales for 6 languages (TR, EN, KO, ZH, RU, AR with automatic RTL layout).
  - Updated `manifest.json` `action.default_icon` and `icons` to point directly to `icons/logo.svg`.
- Fixed Auto Backup Disabled Bug & Complete Instant UI Re-translation:
  - Fixed JS `0 || 300` falsy bug where setting interval to `0` ("Disabled") fell back to `300` (5 minutes). Explicit nullish/undefined check now properly disables alarms and displays `"Otomatik yedekleme devre dışı"`.
  - Expanded `updateLocalizedText()` to translate static labels, input placeholders, interval options, category filters, auto-backup status, and instantly re-render all backup cards in the new language.
- Implemented 4 New Power Features:
  1. **8-Bit Web Audio Synth Sound Effects**: Chiptune audio cues for backup, restore, delete, and clicks (toggleable in Settings).
  2. **Lazy Tab Restore (RAM Saver)**: Opens restored backup tabs suspended (`discarded: true`) to prevent RAM/CPU spikes.
  3. **Duplicate Tab Cleaner**: One-click scanner & cleaner for duplicate open URLs across browser windows (`"🧹 Kopya Temizle"`).
  4. **Markdown Reading List Export**: One-click export of any backup to Markdown reading list format (`[Title](URL)`).
- Project Audit & Code Base Optimization:
  - Deleted dead unreferenced files `backup-management.js` and `enhanced-search.js`.
  - Stripped unused `getAnalytics()` and `loadAnalytics()` functions from `background.js` and `popup.js`.
  - Verified security posture and RAM/Memory footprint.
- Updated Version & Created Screenshots Folder:
  - Created `screenshots/` directory in project root.
  - Bumped version to `3.0.0` in `manifest.json`, `popup.html`, and `popup.js`.

## Current State
- Extension is fully functional, bug-free, optimized, cleaned of all dead code, and styled in a custom pixel arcade theme with custom confirmation modals, bulk delete, single-window restoration, fixed backup merging, in-popup shortcuts, PIN encrypted vault, smart auto-categorization, domain blacklist, auto-prune, GitHub Gist Cloud Sync, 6-language switcher (TR, EN, KO, ZH, RU, AR), fixed auto-backup disabling, 8-bit chiptune sound effects, lazy RAM saver restore, duplicate tab cleaner, Markdown exporter, `screenshots/` directory, and version `v3.0.0`.

## Known Issues
- None.
