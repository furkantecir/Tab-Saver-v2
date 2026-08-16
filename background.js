// Background script for tab backup functionality

const extensionApi = typeof globalThis.browser !== "undefined" ? globalThis.browser : (typeof globalThis.chrome !== "undefined" ? globalThis.chrome : null)
var browser = extensionApi
var chrome = extensionApi

let BACKUP_INTERVAL = 300 // Default: 5 minutes (in seconds)
const ALARM_NAME = "tabBackup"
const STORAGE_KEY = "tabBackups"
const SETTINGS_KEY = "tabBackupSettings"
const ANALYTICS_KEY = "tabBackupAnalytics"
const MAX_BACKUPS = 50 // Increased from 10
const ERROR_LOG_KEY = "errorLogs"
const MAX_ERROR_LOGS = 50

// Top-level initialization to ensure alarms are active on service worker / browser startup
async function initBackground() {
  await loadSettings()
  await createBackupAlarm()
}
initBackground()

browser.runtime.onStartup.addListener(async () => {
  await initBackground()
})

browser.runtime.onInstalled.addListener(async () => {
  console.log("Tab Backup Extension installed/updated")
  await initBackground()
  await performBackup()
})

// Analytics disabled

// Load settings from storage
async function loadSettings() {
  try {
    const result = await browser.storage.local.get(SETTINGS_KEY)
    const settings = result[SETTINGS_KEY] || {}

    // Set backup interval from settings or use default
    BACKUP_INTERVAL = (settings.backupInterval !== undefined && settings.backupInterval !== null) ? Number(settings.backupInterval) : 300

    console.log("Loaded settings:", settings)
  } catch (error) {
    console.error("Error loading settings:", error)
    await logError("load_settings_failed", error.message)
  }
}

// Create or update backup alarm
async function createBackupAlarm() {
  try {
    // Clear existing alarm
    await browser.alarms.clear(ALARM_NAME)

    // Only create alarm if auto-backup is enabled (interval > 0)
    if (BACKUP_INTERVAL > 0) {
      await browser.alarms.create(ALARM_NAME, {
        delayInMinutes: BACKUP_INTERVAL / 60,
        periodInMinutes: BACKUP_INTERVAL / 60,
      })
      console.log(`Backup alarm created for ${BACKUP_INTERVAL / 60} minutes`)
    } else {
      console.log("Auto-backup disabled")
    }
  } catch (error) {
    console.error("Error creating backup alarm:", error)
    await logError("create_alarm_failed", error.message)
  }
}

// Handle alarm for periodic backup
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    // Only backup if tabs have changed since last backup
    if (await hasTabsChanged()) {
      await performBackup()

      // Show notification if enabled
      const settings = await getSettings()
      if (settings.showNotifications) {
        browser.notifications.create({
          type: "basic",
          iconUrl: "icons/icon-48.png",
          title: "Tab Backup Pro",
          message: "Automatic backup completed successfully!",
        })
      }
    } else {
      console.log("Skipping backup - no changes detected")
    }
  }
})

// Check if tabs have changed since last backup
async function hasTabsChanged() {
  try {
    const windows = await browser.windows.getAll({ populate: true })
    const currentUrls = windows
      .map((w) => (w.tabs || []).map((t) => t.url).filter(Boolean))
      .filter((tabs) => tabs.length > 0)

    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (backups.length === 0) return true

    const lastBackup = backups[0]
    const lastBackupUrls = (lastBackup.windows || [])
      .map((w) => (w.tabs || []).map((t) => typeof t === "string" ? t : t.url).filter(Boolean))
      .filter((tabs) => tabs.length > 0)

    return JSON.stringify(currentUrls) !== JSON.stringify(lastBackupUrls)
  } catch (error) {
    console.error("Error checking tab changes:", error)
    await logError("check_tabs_changed_failed", error.message)
    return true // Default to performing backup on error
  }
}

// Smart Auto-Categorization Helper
function detectCategory(windows) {
  const counts = { work: 0, entertainment: 0, shopping: 0, research: 0, education: 0, personal: 0 }
  const rules = [
    { cat: "work", pattern: /github\.com|gitlab\.com|bitbucket\.org|atlassian\.net|trello\.com|slack\.com|notion\.so|figma\.com|stackoverflow\.com|stackexchange\.com/i },
    { cat: "entertainment", pattern: /youtube\.com|netflix\.com|twitch\.tv|spotify\.com|disneyplus\.com|steampowered\.com|reddit\.com|twitter\.com|x\.com|instagram\.com|tiktok\.com/i },
    { cat: "shopping", pattern: /amazon|ebay\.com|aliexpress\.com|trendyol\.com|hepsiburada\.com|n11\.com|etsy\.com/i },
    { cat: "research", pattern: /wikipedia\.org|arxiv\.org|researchgate\.net|scholar\.google|sciencedirect\.com/i },
    { cat: "education", pattern: /udemy\.com|coursera\.org|duolingo\.com|edx\.org|khanacademy\.org/i },
  ]

  for (const w of windows) {
    for (const tab of w.tabs || []) {
      for (const r of rules) {
        if (r.pattern.test(tab.url)) {
          counts[r.cat]++
          break
        }
      }
    }
  }

  let topCat = "personal"
  let maxCount = 0
  for (const [cat, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      topCat = cat
    }
  }
  return topCat
}

// Simple PIN Encrypt / Decrypt
function simpleEncrypt(payloadObj, pin) {
  try {
    const jsonStr = JSON.stringify(payloadObj)
    let result = ""
    for (let i = 0; i < jsonStr.length; i++) {
      const charCode = jsonStr.charCodeAt(i) ^ pin.charCodeAt(i % pin.length)
      result += String.fromCharCode(charCode)
    }
    return btoa(unescape(encodeURIComponent(result)))
  } catch (err) {
    return null
  }
}

function simpleDecrypt(encryptedBase64, pin) {
  try {
    const decodedStr = decodeURIComponent(escape(atob(encryptedBase64)))
    let result = ""
    for (let i = 0; i < decodedStr.length; i++) {
      const charCode = decodedStr.charCodeAt(i) ^ pin.charCodeAt(i % pin.length)
      result += String.fromCharCode(charCode)
    }
    return JSON.parse(result)
  } catch (err) {
    return null
  }
}

// Auto-Prune Old Backups
async function autoPruneBackups() {
  try {
    const settings = await getSettings()
    const pruneDays = Number.parseInt(settings.autoPruneDays) || 0
    if (pruneDays <= 0) return

    const result = await browser.storage.local.get(STORAGE_KEY)
    let backups = result[STORAGE_KEY] || []

    const cutoff = Date.now() - (pruneDays * 86400 * 1000)
    const initialCount = backups.length

    backups = backups.filter((b) => {
      if (b.isEncrypted || b.pinned) return true
      return (b.timestamp || 0) >= cutoff
    })

    if (backups.length !== initialCount) {
      await browser.storage.local.set({ [STORAGE_KEY]: backups })
      console.log(`Auto-pruned ${initialCount - backups.length} old backups older than ${pruneDays} days`)
    }
  } catch (err) {
    console.error("Auto prune error:", err)
  }
}

// Perform backup of all tabs
async function performBackup(backupName = null, category = "personal", tags = [], notes = "", pin = null) {
  try {
    const settings = await getSettings()

    // Domain Exclusion / Blacklist
    const excludedDomains = (settings.excludedDomains || "")
      .split(/[\n,]+/)
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean)

    const windows = await browser.windows.getAll({ populate: true })
    const now = new Date()

    const backup = {
      id: generateBackupId(),
      timestamp: Date.now(),
      date: now.toLocaleString(),
      name: backupName || `Backup ${now.toLocaleString()}`,
      category: category,
      tags: tags,
      notes: notes,
      version: 1,
      windows: [],
    }

    for (const window of windows) {
      const windowData = {
        windowId: window.id,
        focused: window.focused,
        tabs: [],
      }

      for (const tab of window.tabs) {
        const urlLower = (tab.url || "").toLowerCase()
        const isExcluded = excludedDomains.some((d) => urlLower.includes(d))

        // Skip extension pages and special URLs
        if (
          !isExcluded &&
          !tab.url.startsWith("moz-extension://") &&
          !tab.url.startsWith("about:") &&
          tab.url !== "chrome://newtab/" &&
          !tab.url.startsWith("chrome-extension://")
        ) {
          windowData.tabs.push({
            url: tab.url,
            title: tab.title,
            active: tab.active,
            pinned: tab.pinned,
            index: tab.index,
          })
        }
      }

      if (windowData.tabs.length > 0) {
        backup.windows.push(windowData)
      }
    }

    if (backup.category === "personal" || !backup.category || backup.category === "auto") {
      backup.category = detectCategory(backup.windows)
    }

    if (pin && String(pin).trim()) {
      const cleanPin = String(pin).trim()
      backup.isEncrypted = true
      backup.encryptedData = simpleEncrypt(backup.windows, cleanPin)
      backup.windows = []
    }

    // Only save if we have tabs to backup
    if (backup.windows.length > 0 || backup.isEncrypted) {
      await saveBackup(backup)
      await autoPruneBackups()
      console.log("Backup completed:", backup.name, backup.date)
    }

    return { success: true, message: "Backup completed successfully" }
  } catch (error) {
    console.error("Error during backup:", error)
    await logError("backup_failed", error.message)
    throw error
  }
}

// Generate unique backup ID
function generateBackupId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Save backup to storage
async function saveBackup(backup) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    let backups = result[STORAGE_KEY] || []

    // Add new backup to the beginning
    backups.unshift(backup)

    // Keep only the most recent backups
    if (backups.length > MAX_BACKUPS) {
      backups = backups.slice(0, MAX_BACKUPS)
    }

    await browser.storage.local.set({ [STORAGE_KEY]: backups })
  } catch (error) {
    console.error("Error saving backup:", error)
    await logError("save_backup_failed", error.message)
    throw error
  }
}

// Restore tabs from backup
async function restoreBackup(backupIndex = 0) {
  try {
    const settings = await getSettings()
    const useLazyRestore = !!settings.lazyRestore

    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (backups.length === 0 || !backups[backupIndex]) {
      throw new Error("No backup found")
    }

    const backup = backups[backupIndex]

    for (const windowData of backup.windows) {
      const windowCreateData = {
        focused: windowData.focused,
      }

      if (windowData.tabs.length > 0) {
        windowCreateData.url = windowData.tabs[0].url
        const newWindow = await browser.windows.create(windowCreateData)

        for (let i = 1; i < windowData.tabs.length; i++) {
          const tab = windowData.tabs[i]
          const tabCreateParams = {
            windowId: newWindow.id,
            url: tab.url,
            pinned: tab.pinned,
            active: false,
          }

          if (useLazyRestore && !tab.pinned) {
            tabCreateParams.discarded = true
          }

          try {
            await browser.tabs.create(tabCreateParams)
          } catch (tabErr) {
            delete tabCreateParams.discarded
            await browser.tabs.create(tabCreateParams)
          }
        }
      }
    }

    return { success: true, message: "Backup restored successfully" }
  } catch (error) {
    console.error("Error restoring backup:", error)
    await logError("restore_backup_failed", error.message)
    throw error
  }
}

// Clean Duplicate Open Tabs
async function cleanDuplicateTabs() {
  try {
    const tabs = await browser.tabs.query({})
    const seenUrls = new Set()
    let closedCount = 0

    for (const tab of tabs) {
      if (!tab.url) continue
      const normUrl = tab.url.trim().toLowerCase()
      if (seenUrls.has(normUrl)) {
        await browser.tabs.remove(tab.id)
        closedCount++
      } else {
        seenUrls.add(normUrl)
      }
    }

    return { success: true, closedCount: closedCount }
  } catch (error) {
    console.error("Error cleaning duplicate tabs:", error)
    await logError("clean_duplicates_failed", error.message)
    throw error
  }
}

// Delete multiple backups
async function deleteMultipleBackups(indices) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    let backups = result[STORAGE_KEY] || []

    const validIndices = new Set(indices.map(Number))
    backups = backups.filter((_, index) => !validIndices.has(index))

    await browser.storage.local.set({ [STORAGE_KEY]: backups })
    return { success: true, message: "Selected backups deleted successfully" }
  } catch (error) {
    console.error("Error deleting multiple backups:", error)
    await logError("delete_multiple_failed", error.message)
    throw error
  }
}

// Selective restore
async function selectiveRestore(backupIndex, selectedTabs) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (backups.length === 0 || !backups[backupIndex]) {
      throw new Error("No backup found")
    }

    const backup = backups[backupIndex]
    const tabsToRestore = []

    // Parse selected tabs and collect URLs
    selectedTabs.forEach((tabRef) => {
      const [windowIndex, tabIndex] = tabRef.split("-").map(Number)
      if (backup.windows[windowIndex] && backup.windows[windowIndex].tabs[tabIndex]) {
        tabsToRestore.push(backup.windows[windowIndex].tabs[tabIndex])
      }
    })

    if (tabsToRestore.length === 0) {
      throw new Error("No valid tabs selected")
    }

    // Create new window with selected tabs
    const newWindow = await browser.windows.create({ url: tabsToRestore[0].url })

    // Add remaining tabs
    for (let i = 1; i < tabsToRestore.length; i++) {
      await browser.tabs.create({
        windowId: newWindow.id,
        url: tabsToRestore[i].url,
        pinned: tabsToRestore[i].pinned,
        active: false,
      })
    }

    return { success: true, message: "Selected tabs restored successfully" }
  } catch (error) {
    console.error("Error in selective restore:", error)
    await logError("selective_restore_failed", error.message)
    throw error
  }
}

// Compare backups
async function compareBackups(backup1Index, backup2Index) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (!backups[backup1Index] || !backups[backup2Index]) {
      throw new Error("Invalid backup indices")
    }

    const backup1 = backups[backup1Index]
    const backup2 = backups[backup2Index]

    // Get all tabs from both backups
    const tabs1 = backup1.windows.flatMap((window) => window.tabs)
    const tabs2 = backup2.windows.flatMap((window) => window.tabs)

    // Create URL sets for comparison
    const urls1 = new Set(tabs1.map((tab) => tab.url))
    const urls2 = new Set(tabs2.map((tab) => tab.url))

    // Find differences
    const added = tabs2.filter((tab) => !urls1.has(tab.url))
    const removed = tabs1.filter((tab) => !urls2.has(tab.url))
    const changed = tabs2.filter((tab) => {
      const tab1 = tabs1.find((t) => t.url === tab.url)
      return tab1 && tab1.title !== tab.title
    })

    return {
      success: true,
      differences: {
        added: added,
        removed: removed,
        changed: changed,
      },
    }
  } catch (error) {
    console.error("Error comparing backups:", error)
    await logError("compare_backups_failed", error.message)
    throw error
  }
}

// Merge backups
async function mergeBackups(backupIndices, mergedName) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    // Validate indices
    const validBackups = backupIndices.filter((index) => backups[index]).map((index) => backups[index])

    if (validBackups.length < 2) {
      throw new Error("Need at least 2 valid backups to merge")
    }

    // Merge all tabs from selected backups
    const allTabs = []
    const seenUrls = new Set()

    validBackups.forEach((backup) => {
      backup.windows.forEach((window) => {
        window.tabs.forEach((tab) => {
          if (!seenUrls.has(tab.url)) {
            allTabs.push(tab)
            seenUrls.add(tab.url)
          }
        })
      })
    })

    // Create merged backup
    const now = new Date()
    const mergedBackup = {
      id: generateBackupId(),
      timestamp: Date.now(),
      date: now.toLocaleString(),
      name: mergedName,
      category: "other",
      tags: ["merged"],
      notes: `Merged from ${validBackups.length} backups`,
      version: 1,
      windows: [
        {
          windowId: 1,
          focused: true,
          tabs: allTabs,
        },
      ],
    }

    // Save merged backup
    await saveBackup(mergedBackup)

    return { success: true, message: "Backups merged successfully" }
  } catch (error) {
    console.error("Error merging backups:", error)
    await logError("merge_backups_failed", error.message)
    throw error
  }
}

// Import from browser history
async function importFromHistory(fromDate, toDate) {
  try {
    const startTime = new Date(fromDate).getTime()
    const endTime = new Date(toDate).getTime() + 24 * 60 * 60 * 1000 // End of day

    // Get history items
    const historyItems = await browser.history.search({
      text: "",
      startTime: startTime,
      endTime: endTime,
      maxResults: 1000,
    })

    if (historyItems.length === 0) {
      throw new Error("No history items found for the selected date range")
    }

    // Group by day
    const groupedByDay = {}
    historyItems.forEach((item) => {
      const date = new Date(item.lastVisitTime).toDateString()
      if (!groupedByDay[date]) {
        groupedByDay[date] = []
      }
      groupedByDay[date].push({
        url: item.url,
        title: item.title,
        active: false,
        pinned: false,
        index: groupedByDay[date].length,
      })
    })

    // Create backups for each day
    const createdBackups = []
    for (const [date, tabs] of Object.entries(groupedByDay)) {
      const backup = {
        id: generateBackupId(),
        timestamp: new Date(date).getTime(),
        date: date,
        name: `History Import - ${date}`,
        category: "other",
        tags: ["history", "imported"],
        notes: `Imported from browser history`,
        version: 1,
        windows: [
          {
            windowId: 1,
            focused: true,
            tabs: tabs,
          },
        ],
      }

      await saveBackup(backup)
      createdBackups.push(backup)
    }

    return {
      success: true,
      message: `Created ${createdBackups.length} backups from history`,
      backupsCreated: createdBackups.length,
    }
  } catch (error) {
    console.error("Error importing from history:", error)
    await logError("import_history_failed", error.message)
    throw error
  }
}

// Rename backup
async function renameBackup(backupIndex, newName) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (!backups[backupIndex]) {
      throw new Error("Invalid backup index")
    }

    backups[backupIndex].name = newName

    await browser.storage.local.set({ [STORAGE_KEY]: backups })
    return { success: true, message: "Backup renamed successfully" }
  } catch (error) {
    console.error("Error renaming backup:", error)
    await logError("rename_backup_failed", error.message)
    throw error
  }
}

// Export backups to JSON file
async function exportBackups(format = "json", compression = false) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    const exportData = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      backups: backups,
    }

    let data, filename, mimeType

    switch (format) {
      case "html":
        data = generateHtmlExport(backups)
        filename = `tab-backup-export-${new Date().toISOString().slice(0, 10)}.html`
        mimeType = "text/html"
        break
      case "csv":
        data = generateCsvExport(backups)
        filename = `tab-backup-export-${new Date().toISOString().slice(0, 10)}.csv`
        mimeType = "text/csv"
        break
      default: // json
        data = JSON.stringify(exportData, null, 2)
        filename = `tab-backup-export-${new Date().toISOString().slice(0, 10)}.json`
        mimeType = "application/json"
    }

    // Apply compression if requested
    if (compression && format === "json") {
      data = JSON.stringify(exportData) // No pretty printing
    }

    return {
      success: true,
      data: data,
      filename: filename,
      mimeType: mimeType,
    }
  } catch (error) {
    console.error("Error exporting backups:", error)
    await logError("export_backups_failed", error.message)
    throw error
  }
}

// Generate HTML export
function generateHtmlExport(backups) {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tab Backup Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .backup { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .backup-header { margin-bottom: 10px; }
    .backup-name { font-size: 18px; font-weight: bold; }
    .backup-date { color: #666; font-size: 14px; }
    .backup-meta { margin-bottom: 10px; font-size: 14px; color: #666; }
    .window { margin-bottom: 15px; }
    .window-title { font-weight: bold; margin-bottom: 5px; }
    .tabs { margin-left: 20px; }
    .tab { margin-bottom: 5px; }
    .tab a { color: #0066cc; text-decoration: none; }
    .tab a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Tab Backup Export</h1>
  <p>Exported on ${new Date().toLocaleString()}</p>
  <p>Total backups: ${backups.length}</p>
  
  <div class="backups">
`

  backups.forEach((backup) => {
    html += `
    <div class="backup">
      <div class="backup-header">
        <div class="backup-name">${backup.name}</div>
        <div class="backup-date">${backup.date}</div>
      </div>
      <div class="backup-meta">
        <div>Category: ${backup.category || "N/A"}</div>
        <div>Tags: ${backup.tags ? backup.tags.join(", ") : "None"}</div>
        <div>Notes: ${backup.notes || "None"}</div>
      </div>
      <div class="windows">
`

    backup.windows.forEach((window, windowIndex) => {
      html += `
        <div class="window">
          <div class="window-title">Window ${windowIndex + 1} (${window.tabs.length} tabs)</div>
          <div class="tabs">
`

      window.tabs.forEach((tab) => {
        html += `
            <div class="tab">
              <a href="${tab.url}" target="_blank">${tab.title || tab.url}</a>
            </div>
`
      })

      html += `
          </div>
        </div>
`
    })

    html += `
      </div>
    </div>
`
  })

  html += `
  </div>
</body>
</html>
`

  return html
}

// Generate CSV export
function generateCsvExport(backups) {
  let csv = "Backup Name,Backup Date,Category,Tags,Notes,Window Index,Tab Index,Tab Title,Tab URL\n"

  backups.forEach((backup) => {
    const backupName = backup.name.replace(/"/g, '""')
    const backupDate = backup.date.replace(/"/g, '""')
    const category = (backup.category || "").replace(/"/g, '""')
    const tags = (backup.tags ? backup.tags.join(", ") : "").replace(/"/g, '""')
    const notes = (backup.notes || "").replace(/"/g, '""')

    backup.windows.forEach((window, windowIndex) => {
      window.tabs.forEach((tab, tabIndex) => {
        const tabTitle = (tab.title || "").replace(/"/g, '""')
        const tabUrl = tab.url.replace(/"/g, '""')

        csv += `"${backupName}","${backupDate}","${category}","${tags}","${notes}",${windowIndex},${tabIndex},"${tabTitle}","${tabUrl}"\n`
      })
    })
  })

  return csv
}

// Import backups from JSON file
async function importBackups(jsonData) {
  try {
    const importData = JSON.parse(jsonData)

    // Validate import data
    if (!importData.version || !importData.backups || !Array.isArray(importData.backups)) {
      throw new Error("Invalid backup file format")
    }

    // Get existing backups
    const result = await browser.storage.local.get(STORAGE_KEY)
    const existingBackups = result[STORAGE_KEY] || []

    // Ensure all imported backups have required fields
    const validatedBackups = importData.backups.map((backup) => {
      // Generate new ID for imported backups
      backup.id = backup.id || generateBackupId()

      // Ensure backup has a name
      if (!backup.name) {
        backup.name = `Imported Backup ${new Date(backup.timestamp || Date.now()).toLocaleString()}`
      }

      // Ensure backup has a timestamp
      if (!backup.timestamp) {
        backup.timestamp = Date.now()
      }

      // Ensure backup has a date
      if (!backup.date) {
        backup.date = new Date(backup.timestamp).toLocaleString()
      }

      // Add version if missing
      backup.version = backup.version || 1

      // Add category if missing
      backup.category = backup.category || "other"

      // Add tags if missing
      backup.tags = backup.tags || ["imported"]

      return backup
    })

    // Merge backups, avoiding duplicates by ID
    const existingIds = new Set(existingBackups.map((b) => b.id))
    const newBackups = validatedBackups.filter((b) => !existingIds.has(b.id))

    // Combine and sort by timestamp (newest first)
    const combinedBackups = [...existingBackups, ...newBackups].sort((a, b) => b.timestamp - a.timestamp)

    // Keep only MAX_BACKUPS
    const trimmedBackups = combinedBackups.slice(0, MAX_BACKUPS)

    // Save to storage
    await browser.storage.local.set({ [STORAGE_KEY]: trimmedBackups })

    return {
      success: true,
      message: `Imported ${newBackups.length} backups successfully`,
      totalBackups: trimmedBackups.length,
      newBackupsCount: newBackups.length,
    }
  } catch (error) {
    console.error("Error importing backups:", error)
    await logError("import_backups_failed", error.message)
    throw error
  }
}

// Get storage usage information
async function getStorageInfo() {
  try {
    const bytesToMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2)

    // Get all storage data
    const allData = await browser.storage.local.get(null)
    const backupsData = allData[STORAGE_KEY] || []

    // Calculate sizes
    const totalSize = new Blob([JSON.stringify(allData)]).size
    const backupsSize = new Blob([JSON.stringify(backupsData)]).size

    // Get storage quota if available
    let quota = null
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      quota = estimate.quota
    }

    return {
      success: true,
      totalSizeBytes: totalSize,
      totalSizeMB: bytesToMB(totalSize),
      backupsSizeBytes: backupsSize,
      backupsSizeMB: bytesToMB(backupsSize),
      backupsCount: backupsData.length,
      quota: quota ? bytesToMB(quota) : null,
      percentUsed: quota ? ((totalSize / quota) * 100).toFixed(1) : null,
    }
  } catch (error) {
    console.error("Error getting storage info:", error)
    await logError("get_storage_info_failed", error.message)
    throw error
  }
}



// GitHub Gist Cloud Sync
async function syncToGist() {
  try {
    const settings = await getSettings()
    const token = settings.githubToken
    let gistId = settings.gistId

    if (!token) {
      throw new Error("GitHub Token (PAT) is required for Cloud Sync")
    }

    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    const payload = {
      description: "TabSaver Backup Sync",
      public: false,
      files: {
        "tabsaver_backups.json": {
          content: JSON.stringify(backups, null, 2),
        },
      },
    }

    let url = "https://api.github.com/gists"
    let method = "POST"

    if (gistId) {
      url = `https://api.github.com/gists/${gistId}`
      method = "PATCH"
    }

    const res = await fetch(url, {
      method: method,
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw new Error(`GitHub Gist API error: ${res.statusText}`)
    }

    const data = await res.json()
    if (data.id && !gistId) {
      settings.gistId = data.id
      await browser.storage.local.set({ [SETTINGS_KEY]: settings })
    }

    return { success: true, gistId: data.id, message: "Cloud Sync completed successfully!" }
  } catch (error) {
    console.error("Error syncing to Gist:", error)
    await logError("sync_to_gist_failed", error.message)
    throw error
  }
}

async function syncFromGist() {
  try {
    const settings = await getSettings()
    const token = settings.githubToken
    const gistId = settings.gistId

    if (!token || !gistId) {
      throw new Error("GitHub Token and Gist ID are required to pull cloud backups")
    }

    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error(`GitHub Gist API error: ${res.statusText}`)
    }

    const data = await res.json()
    const file = data.files["tabsaver_backups.json"]
    if (!file || !file.content) {
      throw new Error("No valid tabsaver_backups.json file found in Gist")
    }

    const remoteBackups = JSON.parse(file.content)
    if (!Array.isArray(remoteBackups)) {
      throw new Error("Invalid backup payload in Gist")
    }

    const result = await browser.storage.local.get(STORAGE_KEY)
    let localBackups = result[STORAGE_KEY] || []

    const existingIds = new Set(localBackups.map((b) => b.id))
    let added = 0
    for (const b of remoteBackups) {
      if (!existingIds.has(b.id)) {
        localBackups.push(b)
        added++
      }
    }

    localBackups.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    await browser.storage.local.set({ [STORAGE_KEY]: localBackups })

    return { success: true, addedCount: added, message: `Synced ${added} new backups from Cloud Gist` }
  } catch (error) {
    console.error("Error syncing from Gist:", error)
    await logError("sync_from_gist_failed", error.message)
    throw error
  }
}

// Log errors for debugging
async function logError(errorType, errorMessage) {
  try {
    const timestamp = Date.now()
    const result = await browser.storage.local.get(ERROR_LOG_KEY)
    let errorLogs = result[ERROR_LOG_KEY] || []

    // Add new error to the beginning
    errorLogs.unshift({
      type: errorType,
      message: errorMessage,
      timestamp,
      date: new Date(timestamp).toISOString(),
    })

    // Keep only recent errors
    if (errorLogs.length > MAX_ERROR_LOGS) {
      errorLogs = errorLogs.slice(0, MAX_ERROR_LOGS)
    }

    await browser.storage.local.set({ [ERROR_LOG_KEY]: errorLogs })
  } catch (error) {
    console.error("Error logging error:", error)
    // Can't do much if error logging itself fails
  }
}

// Delete a specific backup
async function deleteBackup(backupIndex) {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (backupIndex >= 0 && backupIndex < backups.length) {
      backups.splice(backupIndex, 1)
      await browser.storage.local.set({ [STORAGE_KEY]: backups })
      return { success: true, message: "Backup deleted successfully" }
    } else {
      throw new Error("Invalid backup index")
    }
  } catch (error) {
    console.error("Error deleting backup:", error)
    await logError("delete_backup_failed", error.message)
    throw error
  }
}

// Get settings
async function getSettings() {
  try {
    const result = await browser.storage.local.get(SETTINGS_KEY)
    return result[SETTINGS_KEY] || {}
  } catch (error) {
    console.error("Error getting settings:", error)
    await logError("get_settings_failed", error.message)
    throw error
  }
}

// Update settings
async function updateSettings(newSettings) {
  try {
    // Save settings to storage
    await browser.storage.local.set({ [SETTINGS_KEY]: newSettings })

    // Update backup interval
    BACKUP_INTERVAL = (newSettings.backupInterval !== undefined && newSettings.backupInterval !== null) ? Number(newSettings.backupInterval) : 300

    // Recreate alarm with new interval
    await createBackupAlarm()

    console.log("Settings updated:", newSettings)
    return { success: true, message: "Settings updated successfully" }
  } catch (error) {
    console.error("Error updating settings:", error)
    await logError("update_settings_failed", error.message)
    throw error
  }
}

// Cloud sync (placeholder implementation)
async function syncNow() {
  try {
    const settings = await getSettings()

    if (!settings.enableCloudSync) {
      throw new Error("Cloud sync is not enabled")
    }

    const provider = settings.cloudProvider || "google"

    // This would be replaced with actual cloud provider API calls
    console.log(`Syncing with ${provider}...`)

    // Simulate sync delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true, message: "Sync completed successfully" }
  } catch (error) {
    console.error("Error during sync:", error)
    await logError("sync_failed", error.message)
    throw error
  }
}

// Listen for messages from popup
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case "performBackup":
        return await performBackup(message.backupName, message.category, message.tags, message.notes, message.pin)

      case "decryptBackup": {
        const result = await browser.storage.local.get(STORAGE_KEY)
        const backups = result[STORAGE_KEY] || []
        const targetBackup = backups[message.backupIndex]
        if (!targetBackup || !targetBackup.isEncrypted) {
          return { success: false, error: "Backup is not encrypted" }
        }
        const decryptedWindows = simpleDecrypt(targetBackup.encryptedData, message.pin)
        if (!decryptedWindows) {
          return { success: false, error: "Invalid PIN / Password" }
        }
        return { success: true, windows: decryptedWindows }
      }

      case "syncToGist":
        return await syncToGist()

      case "syncFromGist":
        return await syncFromGist()

      case "cleanDuplicateTabs":
        return await cleanDuplicateTabs()

      case "restoreBackup":
        return await restoreBackup(message.backupIndex || 0)

      case "selectiveRestore":
        return await selectiveRestore(message.backupIndex, message.selectedTabs)

      case "getBackups":
        const result = await browser.storage.local.get(STORAGE_KEY)
        return { backups: result[STORAGE_KEY] || [] }

      case "deleteBackup":
        return await deleteBackup(message.backupIndex)

      case "renameBackup":
        return await renameBackup(message.backupIndex, message.newName)

      case "getSettings":
        const settings = await getSettings()
        return { settings: settings }

      case "updateSettings":
        return await updateSettings(message.settings)

      case "exportBackups":
        return await exportBackups(message.format, message.compression)

      case "importBackups":
        return await importBackups(message.jsonData)

      case "getStorageInfo":
        return await getStorageInfo()

      case "getErrorLogs":
        const errorResult = await browser.storage.local.get(ERROR_LOG_KEY)
        return { logs: errorResult[ERROR_LOG_KEY] || [] }

      case "deleteMultipleBackups":
        return await deleteMultipleBackups(message.indices)

      case "compareBackups":
        return await compareBackups(message.backup1Index, message.backup2Index)

      case "mergeBackups":
        return await mergeBackups(message.backupIndices, message.mergedName)

      case "importFromHistory":
        return await importFromHistory(message.fromDate, message.toDate)

      case "syncNow":
        return await syncNow()

      default:
        return { error: "Unknown action" }
    }
  } catch (error) {
    console.error("Error handling message:", error)
    return { error: error.message }
  }
})

// Listen for keyboard commands
browser.commands.onCommand.addListener(async (command) => {
  try {
    if (command === "backup-now") {
      await performBackup()
    } else if (command === "restore-latest") {
      const result = await browser.storage.local.get(STORAGE_KEY)
      const backups = result[STORAGE_KEY] || []

      if (backups.length > 0) {
        await restoreBackup(0)
      }
    }
  } catch (error) {
    console.error("Error handling command:", error)
    await logError("command_failed", `${command}: ${error.message}`)
  }
})
