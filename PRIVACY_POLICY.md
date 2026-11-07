# Privacy Policy for TabSaver

*Last updated: November 2026*

**TabSaver** ("we", "our", or "the extension") values and respects your privacy. This Privacy Policy explains how our browser extension operates, what data is processed, and our strict commitment to keeping your data private and local.

---

## 1. Summary: 100% Local & Privacy-First

* **No Tracking or Analytics:** TabSaver does not include analytics, tracking pixels, tracking scripts, or telemetry.
* **No External Servers:** TabSaver does not operate any backend servers. None of your data is ever transmitted to us or any third party.
* **100% Local Storage:** All your tab backups, preferences, categories, and settings are saved exclusively on your own device using the browser's native local storage.

---

## 2. Information We Handle

### A. Tab Information
When an automatic or manual backup is performed, TabSaver temporarily accesses:
* URL and Title of currently open tabs
* Window and tab arrangement (pinned status, window index)

This information is saved directly to your local browser storage (`chrome.storage.local` / `browser.storage.local`). It never leaves your machine.

### B. User Settings & Preferences
We store your preferences (theme color, dark mode, backup interval, excluded domain blacklist, sound settings, language choice) locally on your device to personalize your experience.

### C. Optional Encrypted Vault
If you use the PIN/Password protection feature, your backup is encrypted locally on your device. We do not have access to your PIN or your encrypted data.

---

## 3. Permissions Justification

TabSaver requests only the minimum necessary permissions required to provide its core functionality:

* **`tabs`**: Used solely to read the URLs and titles of open tabs when taking a backup, and to open tabs when restoring a backup.
* **`storage`**: Used to save your backups and user settings locally on your computer.
* **`alarms`**: Used to schedule the periodic auto-backup timer (only active if an interval is chosen; completely disabled when set to 0).
* **`notifications`**: Used exclusively to show a local desktop notification when a backup is successfully completed (can be disabled in Settings).

---

## 4. Optional Third-Party Services (GitHub Gist Sync)

TabSaver includes an **optional** cross-device cloud sync feature:
* This feature is **off by default** and entirely optional.
* If you choose to enable it, TabSaver communicates directly from your browser to GitHub's official API (`https://api.github.com`) using your own personal GitHub Access Token.
* Your backup data is pushed only to your personal private GitHub Gist.
* TabSaver has no intermediary server and has zero access to your GitHub credentials or Gist data.

---

## 5. Data Retention & Deletion

* You have complete control over your data.
* You can delete individual backups, perform bulk deletions, or clear all data at any time from within the extension.
* Uninstalling TabSaver immediately removes all locally stored data created by the extension.

---

## 6. Children's Privacy & Policy Compliance

TabSaver complies with all applicable privacy regulations including GDPR, CCPA, and the **Google Chrome Web Store Developer Program Policies** (Single Purpose and User Data FAQ). We do not collect or solicit any personal data from anyone, including children under 13.

---

## 7. Changes to This Policy

If we update this Privacy Policy, the revised version will be posted in this repository with an updated revision date.

---

## 8. Contact & Issues

If you have any questions, feedback, or concerns regarding this Privacy Policy, please open an issue on the official GitHub repository:
- **GitHub:** [https://github.com/furkantecir/Tab-Saver-v2](https://github.com/furkantecir/Tab-Saver-v2)
