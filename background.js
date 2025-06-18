// Background script for tab backup functionality

const chrome = window.chrome // Declare chrome variable before using it
var browser = chrome // Declare browser variable before using it

let BACKUP_INTERVAL = 300 // Default: 5 minutes (in seconds)
const ALARM_NAME = "tabBackup"
const STORAGE_KEY = "tabBackups"
const SETTINGS_KEY = "tabBackupSettings"
const ANALYTICS_KEY = "tabBackupAnalytics"
const MAX_BACKUPS = 50 // Increased from 10
const ERROR_LOG_KEY = "errorLogs"
const MAX_ERROR_LOGS = 50

// Initialize the extension
if (typeof browser === "undefined") {
  browser = chrome
}

browser.runtime.onInstalled.addListener(async () => {
  console.log("Tab Backup Pro Extension installed")

  // Load settings first
  await loadSettings()

  // Create periodic alarm for auto-backup
  await createBackupAlarm()

  // Perform initial backup
  await performBackup()

  // Initialize analytics
  await initializeAnalytics()
})

// Initialize analytics
async function initializeAnalytics() {
  try {
    const result = await browser.storage.local.get(ANALYTICS_KEY)
    if (!result[ANALYTICS_KEY]) {
      const analytics = {
        totalBackups: 0,
        totalTabs: 0,
        backupsByCategory: {},
        backupsByDate: {},
        lastUpdated: Date.now(),
      }
      await browser.storage.local.set({ [ANALYTICS_KEY]: analytics })
    }
  } catch (error) {
    console.error("Error initializing analytics:", error)
  }
}

// Update analytics
async function updateAnalytics(backup) {
  try {
    const result = await browser.storage.local.get(ANALYTICS_KEY)
    const analytics = result[ANALYTICS_KEY] || {
      totalBackups: 0,
      totalTabs: 0,
      backupsByCategory: {},
      backupsByDate: {},
      lastUpdated: Date.now(),
    }

    // Update totals
    analytics.totalBackups++
    const tabCount = backup.windows.reduce((sum, window) => sum + window.tabs.length, 0)
    analytics.totalTabs += tabCount

    // Update category stats
    const category = backup.category || "other"
    analytics.backupsByCategory[category] = (analytics.backupsByCategory[category] || 0) + 1

    // Update date stats
    const date = new Date(backup.timestamp).toDateString()
    analytics.backupsByDate[date] = (analytics.backupsByDate[date] || 0) + 1

    analytics.lastUpdated = Date.now()

    await browser.storage.local.set({ [ANALYTICS_KEY]: analytics })
  } catch (error) {
    console.error("Error updating analytics:", error)
  }
}

// Load settings from storage
async function loadSettings() {
  try {
    const result = await browser.storage.local.get(SETTINGS_KEY)
    const settings = result[SETTINGS_KEY] || {}

    // Set backup interval from settings or use default
    BACKUP_INTERVAL = settings.backupInterval || 300 // Default 5 minutes

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
    const currentTabs = windows.map((window) => ({
      windowId: window.id,
      tabs: window.tabs.map((tab) => tab.url),
    }))

    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (backups.length === 0) return true

    const lastBackup = backups[0]
    const lastBackupTabs = lastBackup.windows.map((window) => ({
      windowId: window.windowId,
      tabs: window.tabs.map((tab) => tab.url),
    }))

    return JSON.stringify(currentTabs) !== JSON.stringify(lastBackupTabs)
  } catch (error) {
    console.error("Error checking tab changes:", error)
    await logError("check_tabs_changed_failed", error.message)
    return true // Default to performing backup on error
  }
}

// Perform backup of all tabs
async function performBackup(backupName = null, category = "personal", tags = [], notes = "") {
  try {
    // Get all windows and their tabs
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
        // Skip extension pages and special URLs
        if (
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

    // Only save if we have tabs to backup
    if (backup.windows.length > 0) {
      await saveBackup(backup)
      await updateAnalytics(backup)
      console.log("Backup completed:", backup.name, backup.date)
    }

    return { success: true, message: "Backup completed successfully" }
  } catch (error) {
    console.error("Error during backup:", error)
    await logError("backup_failed", error.message)
    throw new Error(`Backup failed: ${error.message}`)
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
    const result = await browser.storage.local.get(STORAGE_KEY)
    const backups = result[STORAGE_KEY] || []

    if (backups.length === 0 || !backups[backupIndex]) {
      throw new Error("No backup found")
    }

    const backup = backups[backupIndex]

    for (const windowData of backup.windows) {
      // Create new window for each backed up window
      const windowCreateData = {
        focused: windowData.focused,
      }

      // Create window with first tab
      if (windowData.tabs.length > 0) {
        windowCreateData.url = windowData.tabs[0].url
        const newWindow = await browser.windows.create(windowCreateData)

        // Add remaining tabs to the window
        for (let i = 1; i < windowData.tabs.length; i++) {
          const tab = windowData.tabs[i]
          await browser.tabs.create({
            windowId: newWindow.id,
            url: tab.url,
            pinned: tab.pinned,
            active: false,
          })
        }

        // Set the originally active tab as active
        const activeTab = windowData.tabs.find((tab) => tab.active)
        if (activeTab) {
          const tabs = await browser.tabs.query({ windowId: newWindow.id })
          const targetTab = tabs.find((tab) => tab.url === activeTab.url)
          if (targetTab) {
            await browser.tabs.update(targetTab.id, { active: true })
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
    await updateAnalytics(mergedBackup)

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
      await updateAnalytics(backup)
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

    // Update analytics for each new backup
    for (const backup of newBackups) {
      await updateAnalytics(backup)
    }

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

// Get analytics data
async function getAnalytics() {
  try {
    const result = await browser.storage.local.get([STORAGE_KEY, ANALYTICS_KEY])
    const backups = result[STORAGE_KEY] || []
    const analytics = result[ANALYTICS_KEY] || {}

    // Calculate additional analytics
    const totalBackups = backups.length
    const totalTabs = backups.reduce((sum, backup) => {
      return sum + backup.windows.reduce((wSum, window) => wSum + window.tabs.length, 0)
    }, 0)

    const averageTabs = totalBackups > 0 ? totalTabs / totalBackups : 0

    // Find oldest and newest backup
    let oldestBackup = null
    let newestBackup = null
    if (totalBackups > 0) {
      oldestBackup = backups.reduce(
        (oldest, backup) => (backup.timestamp < oldest.timestamp ? backup : oldest),
        backups[0],
      ).date

      newestBackup = backups.reduce(
        (newest, backup) => (backup.timestamp > newest.timestamp ? backup : newest),
        backups[0],
      ).date
    }

    // Find most used category
    const categoryCount = {}
    backups.forEach((backup) => {
      const category = backup.category || "other"
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    let mostUsedCategory = null
    let maxCount = 0
    for (const [category, count] of Object.entries(categoryCount)) {
      if (count > maxCount) {
        mostUsedCategory = category
        maxCount = count
      }
    }

    // Calculate backup frequency
    let backupFrequency = "N/A"
    if (totalBackups >= 2) {
      const sortedBackups = [...backups].sort((a, b) => a.timestamp - b.timestamp)
      const timeSpan = sortedBackups[sortedBackups.length - 1].timestamp - sortedBackups[0].timestamp
      const avgTimeMs = timeSpan / (sortedBackups.length - 1)
      const avgTimeHours = avgTimeMs / (1000 * 60 * 60)

      if (avgTimeHours < 1) {
        backupFrequency = `${Math.round(avgTimeHours * 60)} minutes`
      } else if (avgTimeHours < 24) {
        backupFrequency = `${avgTimeHours.toFixed(1)} hours`
      } else {
        backupFrequency = `${(avgTimeHours / 24).toFixed(1)} days`
      }
    }

    // Get storage info
    const storageInfo = await getStorageInfo()

    return {
      success: true,
      analytics: {
        totalBackups,
        totalTabs,
        averageTabs,
        oldestBackup,
        newestBackup,
        mostUsedCategory,
        storageUsed: storageInfo.backupsSizeMB,
        backupFrequency,
      },
    }
  } catch (error) {
    console.error("Error getting analytics:", error)
    await logError("get_analytics_failed", error.message)
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
    BACKUP_INTERVAL = newSettings.backupInterval || 300

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
        return await performBackup(message.backupName, message.category, message.tags, message.notes)

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

      case "getAnalytics":
        return await getAnalytics()

      case "getErrorLogs":
        const errorResult = await browser.storage.local.get(ERROR_LOG_KEY)
        return { logs: errorResult[ERROR_LOG_KEY] || [] }

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
