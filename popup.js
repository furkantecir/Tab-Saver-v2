// Popup script for tab backup extension

let currentBackups = []
let currentLanguage = "en"
let currentSettings = {}
let isOperationInProgress = false
let browser // Declare browser variable before using it
let searchQuery = ""
let selectedCategory = "all"
const selectedTags = []

// Initialize browser API
if (typeof window.browser === "undefined") {
  browser = window.chrome
} else {
  browser = window.browser
}

// Localization messages
const messages = {
  en: {
    extensionName: "TabSaver",
    quickActions: "Quick Actions",
    backupNow: "Backup Now",
    restoreLatest: "Restore Latest Backup",
    backupHistory: "Backup History",
    loadingBackups: "Loading backups...",
    windows: "windows",
    window: "window",
    tabs: "tabs",
    tab: "tab",
    restore: "Restore",
    delete: "Delete",
    edit: "Edit",
    preview: "Preview",
    rename: "Rename",
    selectiverestore: "Selective Restore",
    performingBackup: "Performing backup...",
    backupSuccess: "Backup completed successfully!",
    backupError: "Error occurred during backup",
    restoringBackup: "Restoring backup...",
    restoreSuccess: "Backup restored successfully!",
    restoreError: "Error occurred during restore",
    deleteSuccess: "Backup deleted successfully!",
    deleteError: "Error occurred while deleting backup",
    noBackupsFound: "No backups found",
    errorLoadingBackups: "Error loading backups",
    confirmRestore: "This will open new windows with the backed up tabs. Continue?",
    confirmDelete: "Are you sure you want to delete this backup?",
    autoBackup: "Auto Backup",
    disabled: "Disabled",
    oneMinute: "1 Minute",
    fiveMinutes: "5 Minutes",
    tenMinutes: "10 Minutes",
    thirtyMinutes: "30 Minutes",
    oneHour: "1 Hour",
    settingsUpdated: "Settings updated successfully!",
    autoBackupDisabled: "Automatic backup is disabled",
    nextBackupIn: "Next backup in",
    minutes: "minutes",
    minute: "minute",
    exportBackups: "Export",
    importBackups: "Import",
    exportSuccess: "Backups exported successfully!",
    exportError: "Error exporting backups",
    importSuccess: "Backups imported successfully!",
    importError: "Error importing backups",
    invalidBackupFile: "Invalid backup file format",
    storageUsage: "Storage usage:",
    backupsTab: "Backups",
    settingsTab: "Settings",
    analyticsTab: "Analytics",
    displaySettings: "Display Settings",
    darkMode: "Dark Mode",
    dateFormat: "Date Format:",
    localeDefault: "Locale Default",
    keyboardShortcuts: "Keyboard Shortcuts",
    version: "Version 2.0.0",
    reportIssue: "Report Issue",
    backupHelp: "Creates a backup of all open tabs",
    restoreHelp: "Opens all tabs from the most recent backup",
    exportHelp: "Export all backups to a JSON file",
    importHelp: "Import backups from a JSON file",
    noChanges: "No changes since last backup",
    selectBackupFile: "Select backup file to import",
    importedBackups: "Imported {count} backups successfully",
    totalBackups: "Total backups: {count}",
    storageDetails: "{used} MB used of {total} MB ({percent}%)",
    enterBackupName: "Enter backup name:",
    defaultBackupName: "Backup",
    searchBackups: "Search backups...",
    category: "Category:",
    tags: "Tags:",
    notes: "Notes:",
    addTag: "Add Tag",
    removeTag: "Remove",
    addNote: "Add Note",
    editNote: "Edit Note",
    saveNote: "Save Note",
    cancelNote: "Cancel",
    categories: {
      all: "All",
      work: "Work",
      personal: "Personal",
      research: "Research",
      shopping: "Shopping",
      entertainment: "Entertainment",
      education: "Education",
      other: "Other",
    },
    backupStats: "Backup Statistics",
    totalBackupsCount: "Total Backups",
    totalTabsBackedUp: "Total Tabs Backed Up",
    averageTabsPerBackup: "Average Tabs per Backup",
    oldestBackup: "Oldest Backup",
    newestBackup: "Newest Backup",
    mostUsedCategory: "Most Used Category",
    storageUsed: "Storage Used",
    backupFrequency: "Backup Frequency",
    selectTabsToRestore: "Select tabs to restore:",
    selectAll: "Select All",
    selectNone: "Select None",
    restoreSelected: "Restore Selected",
    tabsSelected: "tabs selected",
    previewBackup: "Preview Backup",
    backupContents: "Backup Contents",
    enterNewName: "Enter new name:",
    renameBackup: "Rename Backup",
    backupRenamed: "Backup renamed successfully!",
    renameError: "Error renaming backup",
    noteAdded: "Note added successfully!",
    noteUpdated: "Note updated successfully!",
    noteError: "Error saving note",
    exportFormat: "Export Format:",
    exportJson: "JSON",
    exportHtml: "HTML",
    exportCsv: "CSV",
    compressionEnabled: "Enable Compression",
    encryptionEnabled: "Enable Encryption",
    encryptionPassword: "Encryption Password:",
    backupNotifications: "Backup Notifications",
    showNotifications: "Show backup notifications",
    advancedScheduling: "Advanced Scheduling",
    scheduleBackups: "Schedule Backups",
    scheduleDays: "Days:",
    scheduleTime: "Time:",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
    backupVersioning: "Backup Versioning",
    enableVersioning: "Enable versioning",
    maxVersions: "Max versions per backup:",
    showDiff: "Show Differences",
    compareBackups: "Compare Backups",
    selectBackupsToCompare: "Select two backups to compare:",
    backup1: "Backup 1:",
    backup2: "Backup 2:",
    compare: "Compare",
    differences: "Differences",
    addedTabs: "Added Tabs",
    removedTabs: "Removed Tabs",
    changedTabs: "Changed Tabs",
    noDifferences: "No differences found",
    mergeBackups: "Merge Backups",
    selectBackupsToMerge: "Select backups to merge:",
    mergeSelected: "Merge Selected",
    mergeSuccess: "Backups merged successfully!",
    mergeError: "Error merging backups",
    cloudSync: "Cloud Sync",
    enableCloudSync: "Enable cloud sync",
    cloudProvider: "Cloud Provider:",
    syncStatus: "Sync Status:",
    lastSync: "Last Sync:",
    syncNow: "Sync Now",
    syncSuccess: "Sync completed successfully!",
    syncError: "Error during sync",
    importFromHistory: "Import from History",
    selectDateRange: "Select date range:",
    fromDate: "From:",
    toDate: "To:",
    importHistory: "Import History",
    historyImported: "History imported successfully!",
    historyImportError: "Error importing history",
  },
  tr: {
    extensionName: "Sekme Kurtarıcı",
    quickActions: "Hızlı İşlemler",
    backupNow: "Şimdi Yedekle",
    restoreLatest: "Son Yedeği Geri Yükle",
    backupHistory: "Yedek Geçmişi",
    loadingBackups: "Yedekler yükleniyor...",
    windows: "pencere",
    window: "pencere",
    tabs: "sekme",
    tab: "sekme",
    restore: "Geri Yükle",
    delete: "Sil",
    edit: "Düzenle",
    preview: "Önizle",
    rename: "Yeniden Adlandır",
    selectiverestore: "Seçmeli Geri Yükleme",
    performingBackup: "Yedekleme yapılıyor...",
    backupSuccess: "Yedekleme başarıyla tamamlandı!",
    backupError: "Yedekleme sırasında hata oluştu",
    restoringBackup: "Yedek geri yükleniyor...",
    restoreSuccess: "Yedek başarıyla geri yüklendi!",
    restoreError: "Geri yükleme sırasında hata oluştu",
    deleteSuccess: "Yedek başarıyla silindi!",
    deleteError: "Yedek silinirken hata oluştu",
    noBackupsFound: "Yedek bulunamadı",
    errorLoadingBackups: "Yedekler yüklenirken hata oluştu",
    confirmRestore: "Bu işlem yedeklenen sekmelerle yeni pencereler açacak. Devam edilsin mi?",
    confirmDelete: "Bu yedeği silmek istediğinizden emin misiniz?",
    autoBackup: "Otomatik Yedekleme",
    disabled: "Devre Dışı",
    oneMinute: "1 Dakika",
    fiveMinutes: "5 Dakika",
    tenMinutes: "10 Dakika",
    thirtyMinutes: "30 Dakika",
    oneHour: "1 Saat",
    settingsUpdated: "Ayarlar başarıyla güncellendi!",
    autoBackupDisabled: "Otomatik yedekleme devre dışı",
    nextBackupIn: "Sonraki yedekleme",
    minutes: "dakika sonra",
    minute: "dakika sonra",
    exportBackups: "Dışa Aktar",
    importBackups: "İçe Aktar",
    exportSuccess: "Yedekler başarıyla dışa aktarıldı!",
    exportError: "Yedekleri dışa aktarırken hata oluştu",
    importSuccess: "Yedekler başarıyla içe aktarıldı!",
    importError: "Yedekleri içe aktarırken hata oluştu",
    invalidBackupFile: "Geçersiz yedek dosya formatı",
    storageUsage: "Depolama kullanımı:",
    backupsTab: "Yedekler",
    settingsTab: "Ayarlar",
    analyticsTab: "Analitik",
    displaySettings: "Görüntü Ayarları",
    darkMode: "Karanlık Mod",
    dateFormat: "Tarih Formatı:",
    localeDefault: "Yerel Varsayılan",
    keyboardShortcuts: "Klavye Kısayolları",
    version: "Sürüm 2.0.0",
    reportIssue: "Sorun Bildir",
    backupHelp: "Tüm açık sekmelerin yedeğini oluşturur",
    restoreHelp: "En son yedekten tüm sekmeleri açar",
    exportHelp: "Tüm yedekleri JSON dosyasına aktarır",
    importHelp: "JSON dosyasından yedekleri içe aktarır",
    noChanges: "Son yedekten bu yana değişiklik yok",
    selectBackupFile: "İçe aktarılacak yedek dosyasını seçin",
    importedBackups: "{count} yedek başarıyla içe aktarıldı",
    totalBackups: "Toplam yedek: {count}",
    storageDetails: "{total} MB'nin {used} MB'si kullanıldı ({percent}%)",
    enterBackupName: "Bu yedek için bir isim girin:",
    defaultBackupName: "Yedek",
    searchBackups: "Yedeklerde ara...",
    category: "Kategori:",
    tags: "Etiketler:",
    notes: "Notlar:",
    addTag: "Etiket Ekle",
    removeTag: "Kaldır",
    addNote: "Not Ekle",
    editNote: "Notu Düzenle",
    saveNote: "Notu Kaydet",
    cancelNote: "İptal",
    categories: {
      all: "Tümü",
      work: "İş",
      personal: "Kişisel",
      research: "Araştırma",
      shopping: "Alışveriş",
      entertainment: "Eğlence",
      education: "Eğitim",
      other: "Diğer",
    },
    backupStats: "Yedek İstatistikleri",
    totalBackupsCount: "Toplam Yedek Sayısı",
    totalTabsBackedUp: "Toplam Yedeklenen Sekme",
    averageTabsPerBackup: "Yedek Başına Ortalama Sekme",
    oldestBackup: "En Eski Yedek",
    newestBackup: "En Yeni Yedek",
    mostUsedCategory: "En Çok Kullanılan Kategori",
    storageUsed: "Kullanılan Depolama",
    backupFrequency: "Yedekleme Sıklığı",
    selectTabsToRestore: "Geri yüklenecek sekmeleri seçin:",
    selectAll: "Tümünü Seç",
    selectNone: "Hiçbirini Seçme",
    restoreSelected: "Seçilenleri Geri Yükle",
    tabsSelected: "sekme seçildi",
    previewBackup: "Yedek Önizleme",
    backupContents: "Yedek İçeriği",
    enterNewName: "Yeni isim girin:",
    renameBackup: "Yedeği Yeniden Adlandır",
    backupRenamed: "Yedek başarıyla yeniden adlandırıldı!",
    renameError: "Yedek yeniden adlandırılırken hata oluştu",
    noteAdded: "Not başarıyla eklendi!",
    noteUpdated: "Not başarıyla güncellendi!",
    noteError: "Not kaydedilirken hata oluştu",
    exportFormat: "Dışa Aktarma Formatı:",
    exportJson: "JSON",
    exportHtml: "HTML",
    exportCsv: "CSV",
    compressionEnabled: "Sıkıştırmayı Etkinleştir",
    encryptionEnabled: "Şifrelemeyi Etkinleştir",
    encryptionPassword: "Şifreleme Parolası:",
    backupNotifications: "Yedekleme Bildirimleri",
    showNotifications: "Yedekleme bildirimlerini göster",
    advancedScheduling: "Gelişmiş Zamanlama",
    scheduleBackups: "Yedekleme Zamanla",
    scheduleDays: "Günler:",
    scheduleTime: "Saat:",
    monday: "Pzt",
    tuesday: "Sal",
    wednesday: "Çar",
    thursday: "Per",
    friday: "Cum",
    saturday: "Cmt",
    sunday: "Paz",
    backupVersioning: "Yedek Sürümleme",
    enableVersioning: "Sürümlemeyi etkinleştir",
    maxVersions: "Yedek başına maksimum sürüm:",
    showDiff: "Farkları Göster",
    compareBackups: "Yedekleri Karşılaştır",
    selectBackupsToCompare: "Karşılaştırılacak iki yedek seçin:",
    backup1: "Yedek 1:",
    backup2: "Yedek 2:",
    compare: "Karşılaştır",
    differences: "Farklar",
    addedTabs: "Eklenen Sekmeler",
    removedTabs: "Kaldırılan Sekmeler",
    changedTabs: "Değiştirilen Sekmeler",
    noDifferences: "Fark bulunamadı",
    mergeBackups: "Yedekleri Birleştir",
    selectBackupsToMerge: "Birleştirilecek yedekleri seçin:",
    mergeSelected: "Seçilenleri Birleştir",
    mergeSuccess: "Yedekler başarıyla birleştirildi!",
    mergeError: "Yedekler birleştirilirken hata oluştu",
    cloudSync: "Bulut Senkronizasyonu",
    enableCloudSync: "Bulut senkronizasyonunu etkinleştir",
    cloudProvider: "Bulut Sağlayıcısı:",
    syncStatus: "Senkronizasyon Durumu:",
    lastSync: "Son Senkronizasyon:",
    syncNow: "Şimdi Senkronize Et",
    syncSuccess: "Senkronizasyon başarıyla tamamlandı!",
    syncError: "Senkronizasyon sırasında hata oluştu",
    importFromHistory: "Geçmişten İçe Aktar",
    selectDateRange: "Tarih aralığı seçin:",
    fromDate: "Başlangıç:",
    toDate: "Bitiş:",
    importHistory: "Geçmişi İçe Aktar",
    historyImported: "Geçmiş başarıyla içe aktarıldı!",
    historyImportError: "Geçmiş içe aktarılırken hata oluştu",
  },
}

// Initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings()
  await loadLocalization()
  await loadBackups()
  await updateStorageInfo()
  await loadAnalytics()
  setupEventListeners()
  updateAutoBackupStatus()
  setupKeyboardShortcuts()
  setupToggleElements()
  updateHeaderStats()
})

// Load saved settings
async function loadSettings() {
  try {
    // Load language setting
    const result = await browser.storage.local.get("language")
    currentLanguage = result.language || "en"
    document.getElementById("languageSelect").value = currentLanguage

    // Load backup settings
    const settingsResponse = await browser.runtime.sendMessage({ action: "getSettings" })
    currentSettings = settingsResponse.settings || {}

    // Set interval selector
    const backupInterval = currentSettings.backupInterval || 300
    document.getElementById("intervalSelect").value = backupInterval

    // Set dark mode if enabled
    if (currentSettings.darkMode) {
      document.getElementById("darkModeToggle").checked = true
      document.body.classList.add("dark-mode")
    }

    // Set date format
    if (currentSettings.dateFormat) {
      document.getElementById("dateFormatSelect").value = currentSettings.dateFormat
    }

    // Set theme color if available
    if (currentSettings.themeColor) {
      document.getElementById("themeColorSelect").value = currentSettings.themeColor
      applyThemeColor(currentSettings.themeColor)
    }

    // Set compression setting
    if (currentSettings.compressionEnabled) {
      document.getElementById("compressionToggle").checked = true
    }

    // Set notification setting
    if (currentSettings.showNotifications) {
      document.getElementById("notificationsToggle").checked = true
    }

    // Set versioning settings
    if (currentSettings.enableVersioning) {
      document.getElementById("versioningToggle").checked = true
    }
    if (currentSettings.maxVersions) {
      document.getElementById("maxVersionsInput").value = currentSettings.maxVersions
    }

    // Set cloud sync settings
    if (currentSettings.enableCloudSync) {
      document.getElementById("cloudSyncToggle").checked = true
    }
    if (currentSettings.cloudProvider) {
      document.getElementById("cloudProviderSelect").value = currentSettings.cloudProvider
    }
  } catch (error) {
    console.error("Error loading settings:", error)
    showStatus("Error loading settings: " + error.message, "error")
  }
}

// Add enhanced search functionality
function setupEnhancedSearch() {
  const searchToggle = document.getElementById("searchToggle")
  const advancedFilters = document.getElementById("advancedFilters")
  const searchContainer = document.getElementById("searchContainer")

  if (searchToggle && advancedFilters) {
    searchToggle.addEventListener("click", () => {
      const isExpanded = advancedFilters.classList.contains("show")
      if (isExpanded) {
        advancedFilters.classList.remove("show")
        searchContainer.classList.remove("expanded")
      } else {
        advancedFilters.classList.add("show")
        searchContainer.classList.add("expanded")
      }
    })
  }

  // Enhanced search input
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", handleEnhancedSearch)
  }

  // Filter inputs
  const categoryFilter = document.getElementById("categoryFilter")
  const dateFromFilter = document.getElementById("dateFromFilter")
  const minTabsFilter = document.getElementById("minTabsFilter")
  const domainFilter = document.getElementById("domainFilter")

  if (categoryFilter) categoryFilter.addEventListener("change", handleEnhancedSearch)
  if (dateFromFilter) dateFromFilter.addEventListener("change", handleEnhancedSearch)
  if (minTabsFilter) minTabsFilter.addEventListener("input", handleEnhancedSearch)
  if (domainFilter) domainFilter.addEventListener("input", handleEnhancedSearch)

  // Clear filters
  const clearFiltersBtn = document.getElementById("clearFiltersBtn")
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = ""
      if (categoryFilter) categoryFilter.value = "all"
      if (dateFromFilter) dateFromFilter.value = ""
      if (minTabsFilter) minTabsFilter.value = ""
      if (domainFilter) domainFilter.value = ""
      handleEnhancedSearch()
    })
  }
}

// Enhanced search handler
function handleEnhancedSearch() {
  const searchInput = document.getElementById("searchInput")
  const categoryFilter = document.getElementById("categoryFilter")
  const dateFromFilter = document.getElementById("dateFromFilter")
  const minTabsFilter = document.getElementById("minTabsFilter")
  const domainFilter = document.getElementById("domainFilter")

  const searchQuery = searchInput ? searchInput.value.toLowerCase() : ""
  const categoryValue = categoryFilter ? categoryFilter.value : "all"
  const dateFrom = dateFromFilter ? dateFromFilter.value : ""
  const minTabs = minTabsFilter ? Number.parseInt(minTabsFilter.value) || 0 : 0
  const domain = domainFilter ? domainFilter.value.toLowerCase() : ""

  const filteredBackups = currentBackups.filter((backup) => {
    // Text search
    const matchesSearch =
      !searchQuery ||
      backup.name.toLowerCase().includes(searchQuery) ||
      (backup.notes && backup.notes.toLowerCase().includes(searchQuery)) ||
      (backup.tags && backup.tags.some((tag) => tag.toLowerCase().includes(searchQuery))) ||
      backup.windows.some((window) =>
        window.tabs.some(
          (tab) => tab.title.toLowerCase().includes(searchQuery) || tab.url.toLowerCase().includes(searchQuery),
        ),
      )

    // Category filter
    const matchesCategory = categoryValue === "all" || backup.category === categoryValue

    // Date filter
    const matchesDate = !dateFrom || new Date(backup.timestamp) >= new Date(dateFrom)

    // Tab count filter
    const totalTabs = backup.windows.reduce((sum, window) => sum + window.tabs.length, 0)
    const matchesTabCount = totalTabs >= minTabs

    // Domain filter
    const matchesDomain =
      !domain || backup.windows.some((window) => window.tabs.some((tab) => tab.url.toLowerCase().includes(domain)))

    return matchesSearch && matchesCategory && matchesDate && matchesTabCount && matchesDomain
  })

  renderFilteredBackups(filteredBackups)
}

// Render filtered backups
function renderFilteredBackups(filteredBackups) {
  const backupList = document.getElementById("backupList")

  if (filteredBackups.length === 0) {
    backupList.innerHTML = `<div class="empty-state">${getMessage("noBackupsFound")}</div>`
    return
  }

  backupList.innerHTML = filteredBackups
    .map((backup, index) => {
      const originalIndex = currentBackups.indexOf(backup)
      const totalTabs = backup.windows.reduce((sum, window) => sum + window.tabs.length, 0)
      const windowsText = getPluralText(backup.windows.length, getMessage("window"), getMessage("windows"))
      const tabsText = getPluralText(totalTabs, getMessage("tab"), getMessage("tabs"))
      const formattedDate = formatDate(backup.date)
      const backupName = backup.name || getMessage("defaultBackupName")
      const category = backup.category ? getMessage(`categories.${backup.category}`) : ""
      const tags = backup.tags ? backup.tags.map((tag) => `<span class="tag">${tag}</span>`).join("") : ""
      const notes = backup.notes ? `<div class="backup-notes">${backup.notes}</div>` : ""

      // Calculate backup health
      const health = calculateBackupHealth(backup)

      return `
      <div class="backup-item" data-index="${originalIndex}">
        <div class="backup-header">
          <div class="backup-name">${backupName}</div>
          <div class="backup-health ${health.status}">
            ${health.icon} ${health.status}
          </div>
          ${category ? `<div class="backup-category">${category}</div>` : ""}
        </div>
        <div class="backup-date">${formattedDate}</div>
        <div class="backup-info">
          ${backup.windows.length} ${windowsText}, 
          ${totalTabs} ${tabsText}
        </div>
        ${tags ? `<div class="backup-tags">${tags}</div>` : ""}
        ${notes}
        <div class="backup-actions">
          <button class="button button-small button-secondary preview-btn" data-index="${originalIndex}" title="${getMessage("preview")}">
            👁️
          </button>
          <button class="button button-small button-secondary rename-btn" data-index="${originalIndex}" title="${getMessage("rename")}">
            ✏️
          </button>
          <button class="button button-small button-secondary selective-restore-btn" data-index="${originalIndex}" title="${getMessage("selectiverestore")}">
            📋
          </button>
          <button class="button button-small button-secondary restore-btn" data-index="${originalIndex}" aria-label="${getMessage("restore")} ${backupName}">
            ${getMessage("restore")}
          </button>
          <button class="button button-small button-danger delete-btn" data-index="${originalIndex}" aria-label="${getMessage("delete")} ${backupName}">
            ${getMessage("delete")}
          </button>
        </div>
      </div>
    `
    })
    .join("")
}

// Calculate backup health
function calculateBackupHealth(backup) {
  let score = 100
  const issues = []

  // Check for broken URLs
  const brokenUrls = backup.windows.flatMap((window) =>
    window.tabs.filter(
      (tab) =>
        !tab.url ||
        tab.url.startsWith("about:") ||
        tab.url === "chrome://newtab/" ||
        tab.url.startsWith("moz-extension://"),
    ),
  ).length

  if (brokenUrls > 0) {
    score -= brokenUrls * 5
    issues.push(`${brokenUrls} broken URLs`)
  }

  // Check backup age
  const ageInDays = (Date.now() - backup.timestamp) / (1000 * 60 * 60 * 24)
  if (ageInDays > 30) {
    score -= 10
    issues.push("Old backup")
  }

  // Check for missing data
  if (!backup.name || backup.name.trim() === "") {
    score -= 5
    issues.push("Missing name")
  }

  // Determine status
  let status, icon
  if (score >= 90) {
    status = "excellent"
    icon = "✅"
  } else if (score >= 70) {
    status = "good"
    icon = "✅"
  } else if (score >= 50) {
    status = "warning"
    icon = "⚠️"
  } else {
    status = "poor"
    icon = "❌"
  }

  return { status, icon, score, issues }
}

 
 

// Setup event listeners
function setupEventListeners() {
  // Quick action buttons
  document.getElementById("backupNow").addEventListener("click", handleBackupNow)
  document.getElementById("restoreLatest").addEventListener("click", handleRestoreLatest)

  // Enhanced search
  setupEnhancedSearch()

  // Settings controls
  document.getElementById("languageSelect").addEventListener("change", handleLanguageChange)
  document.getElementById("intervalSelect").addEventListener("change", handleIntervalChange)
  document.getElementById("darkModeToggle").addEventListener("change", handleDarkModeChange)
  document.getElementById("dateFormatSelect").addEventListener("change", handleDateFormatChange)
  document.getElementById("themeColorSelect").addEventListener("change", handleThemeColorChange)
  document.getElementById("compressionToggle").addEventListener("change", handleCompressionChange)
  document.getElementById("notificationsToggle").addEventListener("change", handleNotificationsChange)
  document.getElementById("versioningToggle").addEventListener("change", handleVersioningChange)
  document.getElementById("maxVersionsInput").addEventListener("change", handleMaxVersionsChange)
 
  

  // Import/Export
  document.getElementById("exportBackups").addEventListener("click", handleExportBackups)
  document.getElementById("importBackups").addEventListener("click", () => {
    document.getElementById("importFile").click()
  })
  document.getElementById("importFile").addEventListener("change", handleImportBackups)

  // Advanced features
  document.getElementById("compareBackups").addEventListener("click", handleCompareBackups)
  document.getElementById("mergeBackups").addEventListener("click", handleMergeBackups)
  document.getElementById("importHistory").addEventListener("click", handleImportHistory)


 

  // Tab navigation - Fix the tab click handler
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", handleTabClick)
  })

  // Event delegation for backup list actions
  document.getElementById("backupList").addEventListener("click", handleBackupListClick)
}

// Fix the tab click handler
function handleTabClick(event) {
  const tabElement = event.currentTarget
  const tabId = tabElement.getAttribute("data-tab")

  // Update active tab
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active")
  })
  tabElement.classList.add("active")

  // Show selected tab content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })

  const targetContent = document.getElementById(tabId)
  if (targetContent) {
    targetContent.classList.add("active")
  }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    // Ctrl+B for backup
    if (event.ctrlKey && event.key === "b") {
      event.preventDefault()
      handleBackupNow()
    }

    // Ctrl+R for restore
    if (event.ctrlKey && event.key === "r") {
      event.preventDefault()
      handleRestoreLatest()
    }

    // Ctrl+F for search
    if (event.ctrlKey && event.key === "f") {
      event.preventDefault()
      document.getElementById("searchInput").focus()
    }
  })
}

// Handle search
function handleSearch(event) {
  searchQuery = event.target.value.toLowerCase()
  renderBackupList()
}

// Handle category filter
function handleCategoryFilter(event) {
  selectedCategory = event.target.value
  renderFilteredBackups()
}

// Handle language change
async function handleLanguageChange(event) {
  currentLanguage = event.target.value

  // Save language preference
  try {
    await browser.storage.local.set({ language: currentLanguage })
  } catch (error) {
    console.error("Error saving language:", error)
  }

  // Update UI immediately
  loadLocalization()

  // Show confirmation that language was changed
  showStatus(getMessage("settingsUpdated"), "success")
}

// Handle backup interval change
async function handleIntervalChange(event) {
  if (isOperationInProgress) return
  isOperationInProgress = true

  try {
    const newInterval = Number.parseInt(event.target.value)

    // Update settings
    currentSettings.backupInterval = newInterval

    // Send to background script
    const response = await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })

    if (response.success) {
      showStatus(getMessage("settingsUpdated"), "success")
      updateAutoBackupStatus()
    } else {
      showStatus(response.error || getMessage("backupError"), "error")
    }
  } catch (error) {
    console.error("Error updating interval:", error)
    showStatus(error.message || getMessage("backupError"), "error")
  } finally {
    isOperationInProgress = false
  }
}

// Handle dark mode toggle
async function handleDarkModeChange(event) {
  const darkMode = event.target.checked

  // Update body class
  if (darkMode) {
    document.body.classList.add("dark-mode")
  } else {
    document.body.classList.remove("dark-mode")
  }

  // Save setting
  try {
    currentSettings.darkMode = darkMode
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })
  } catch (error) {
    console.error("Error saving dark mode setting:", error)
    showStatus(error.message, "error")
  }
}

// Handle date format change
async function handleDateFormatChange(event) {
  const dateFormat = event.target.value

  // Save setting
  try {
    currentSettings.dateFormat = dateFormat
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })

    // Refresh backup list to show new date format
    await loadBackups()
  } catch (error) {
    console.error("Error saving date format setting:", error)
    showStatus(error.message, "error")
  }
}

// Handle theme color change
async function handleThemeColorChange(event) {
  const themeColor = event.target.value

  // Apply the theme color
  applyThemeColor(themeColor)

  // Save setting
  try {
    currentSettings.themeColor = themeColor
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })
  } catch (error) {
    console.error("Error saving theme color setting:", error)
    showStatus(error.message, "error")
  }
}

// Handle compression toggle
async function handleCompressionChange(event) {
  const compressionEnabled = event.target.checked

  try {
    currentSettings.compressionEnabled = compressionEnabled
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })
    showStatus(getMessage("settingsUpdated"), "success")
  } catch (error) {
    console.error("Error saving compression setting:", error)
    showStatus(error.message, "error")
  }
}

// Handle notifications toggle
async function handleNotificationsChange(event) {
  const showNotifications = event.target.checked

  try {
    currentSettings.showNotifications = showNotifications
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })
    showStatus(getMessage("settingsUpdated"), "success")
  } catch (error) {
    console.error("Error saving notifications setting:", error)
    showStatus(error.message, "error")
  }
}

// Handle versioning toggle
async function handleVersioningChange(event) {
  const enableVersioning = event.target.checked

  try {
    currentSettings.enableVersioning = enableVersioning
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })
    showStatus(getMessage("settingsUpdated"), "success")
  } catch (error) {
    console.error("Error saving versioning setting:", error)
    showStatus(error.message, "error")
  }
}

// Handle max versions change
async function handleMaxVersionsChange(event) {
  const maxVersions = Number.parseInt(event.target.value)

  try {
    currentSettings.maxVersions = maxVersions
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })
    showStatus(getMessage("settingsUpdated"), "success")
  } catch (error) {
    console.error("Error saving max versions setting:", error)
    showStatus(error.message, "error")
  }
}

// Handle cloud sync toggle
async function handleCloudSyncChange(event) {
  const enableCloudSync = event.target.checked

  try {
    currentSettings.enableCloudSync = enableCloudSync
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })
    showStatus(getMessage("settingsUpdated"), "success")
  } catch (error) {
    console.error("Error saving cloud sync setting:", error)
    showStatus(error.message, "error")
  }
}

// Handle cloud provider change
async function handleCloudProviderChange(event) {
  const cloudProvider = event.target.value

  try {
    currentSettings.cloudProvider = cloudProvider
    await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })
    showStatus(getMessage("settingsUpdated"), "success")
  } catch (error) {
    console.error("Error saving cloud provider setting:", error)
    showStatus(error.message, "error")
  }
}

// Apply theme color
function applyThemeColor(color) {
  document.body.classList.remove("theme-red", "theme-blue", "theme-green", "theme-purple")

  if (color && color !== "default") {
    document.body.classList.add(`theme-${color}`)
  }
}

// Update auto backup status display
function updateAutoBackupStatus() {
  const statusDiv = document.getElementById("autoBackupStatus")
  const interval = currentSettings.backupInterval || 300

  if (interval === 0) {
    statusDiv.textContent = getMessage("autoBackupDisabled")
  } else {
    const minutes = interval / 60
    const minuteText = minutes === 1 ? getMessage("minute") : getMessage("minutes")
    statusDiv.textContent = `${getMessage("nextBackupIn")} ${minutes} ${minuteText}`
  }
}

// Handle manual backup
async function handleBackupNow() {
  if (isOperationInProgress) return
  isOperationInProgress = true

  // Show backup creation dialog
  showBackupDialog()
}

// Show backup creation dialog
function showBackupDialog() {
  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"
  dialog.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${getMessage("backupNow")}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="backupNameInput">${getMessage("enterBackupName")}</label>
          <input type="text" id="backupNameInput" value="${getMessage("defaultBackupName")} - ${new Date().toLocaleString()}" />
        </div>
        <div class="form-group">
          <label for="backupCategorySelect">${getMessage("category")}</label>
          <select id="backupCategorySelect">
            <option value="personal">${getMessage("categories.personal")}</option>
            <option value="work">${getMessage("categories.work")}</option>
            <option value="research">${getMessage("categories.research")}</option>
            <option value="shopping">${getMessage("categories.shopping")}</option>
            <option value="entertainment">${getMessage("categories.entertainment")}</option>
            <option value="education">${getMessage("categories.education")}</option>
            <option value="other">${getMessage("categories.other")}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="backupTagsInput">${getMessage("tags")}</label>
          <input type="text" id="backupTagsInput" placeholder="tag1, tag2, tag3" />
        </div>
        <div class="form-group">
          <label for="backupNotesInput">${getMessage("notes")}</label>
          <textarea id="backupNotesInput" rows="3" placeholder="${getMessage("addNote")}"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary modal-cancel">${getMessage("cancelNote")}</button>
        <button class="button button-primary modal-confirm">${getMessage("backupNow")}</button>
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  // Add event listeners
  const closeBtn = dialog.querySelector(".modal-close")
  const cancelBtn = dialog.querySelector(".modal-cancel")
  const confirmBtn = dialog.querySelector(".modal-confirm")

  const closeDialog = () => {
    document.body.removeChild(dialog)
    isOperationInProgress = false
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)
  confirmBtn.addEventListener("click", performBackupWithDetails)

  // Close on overlay click
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog()
    }
  })
}

// Perform backup with details
async function performBackupWithDetails() {
  const name = document.getElementById("backupNameInput").value.trim()
  const category = document.getElementById("backupCategorySelect").value
  const tagsInput = document.getElementById("backupTagsInput").value.trim()
  const notes = document.getElementById("backupNotesInput").value.trim()

  const tags = tagsInput
    ? tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)
    : []

  // Close dialog
  const dialog = document.querySelector(".modal-overlay")
  if (dialog) {
    document.body.removeChild(dialog)
  }

  const backupButton = document.getElementById("backupNow")
  backupButton.classList.add("loading")
  backupButton.disabled = true

  try {
    showStatus(getMessage("performingBackup"), "loading")

    const response = await browser.runtime.sendMessage({
      action: "performBackup",
      backupName: name || `${getMessage("defaultBackupName")} - ${new Date().toLocaleString()}`,
      category: category,
      tags: tags,
      notes: notes,
    })

    if (response.success) {
      showStatus(getMessage("backupSuccess"), "success")
      await loadBackups() // Refresh the list
      await updateStorageInfo() // Update storage usage
      await loadAnalytics() // Update analytics
    } else if (response.error === "no_changes") {
      showStatus(getMessage("noChanges"), "info")
    } else {
      showStatus(response.error || getMessage("backupError"), "error")
    }
  } catch (error) {
    console.error("Backup error:", error)
    showStatus(error.message || getMessage("backupError"), "error")
  } finally {
    backupButton.classList.remove("loading")
    backupButton.disabled = false
    isOperationInProgress = false
  }
}

// Handle restore latest backup
async function handleRestoreLatest() {
  if (isOperationInProgress) return
  isOperationInProgress = true

  const restoreButton = document.getElementById("restoreLatest")

  if (currentBackups.length === 0) {
    showStatus(getMessage("noBackupsFound"), "error")
    isOperationInProgress = false
    return
  }

  if (!confirm(getMessage("confirmRestore"))) {
    isOperationInProgress = false
    return
  }

  restoreButton.classList.add("loading")
  restoreButton.disabled = true

  try {
    showStatus(getMessage("restoringBackup"), "loading")

    const response = await browser.runtime.sendMessage({
      action: "restoreBackup",
      backupIndex: 0,
    })

    if (response.success) {
      showStatus(getMessage("restoreSuccess"), "success")
    } else {
      showStatus(response.error || getMessage("restoreError"), "error")
    }
  } catch (error) {
    console.error("Restore error:", error)
    showStatus(error.message || getMessage("restoreError"), "error")
  } finally {
    restoreButton.classList.remove("loading")
    restoreButton.disabled = false
    isOperationInProgress = false
  }
}

// Handle export backups
async function handleExportBackups() {
  if (isOperationInProgress) return
  isOperationInProgress = true

  // Show export dialog
  showExportDialog()
}

// Show export dialog
function showExportDialog() {
  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"
  dialog.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${getMessage("exportBackups")}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="exportFormatSelect">${getMessage("exportFormat")}</label>
          <select id="exportFormatSelect">
            <option value="json">${getMessage("exportJson")}</option>
            <option value="html">HTML</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="exportCompressionToggle" checked />
            ${getMessage("compressionEnabled")}
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary modal-cancel">${getMessage("cancelNote")}</button>
        <button class="button button-primary modal-confirm">${getMessage("exportBackups")}</button>
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  // Add event listeners
  const closeBtn = dialog.querySelector(".modal-close")
  const cancelBtn = dialog.querySelector(".modal-cancel")
  const confirmBtn = dialog.querySelector(".modal-confirm")

  const closeDialog = () => {
    document.body.removeChild(dialog)
    isOperationInProgress = false
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)
  confirmBtn.addEventListener("click", performExportWithOptions)

  // Close on overlay click
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog()
    }
  })
}

// Perform export with options
async function performExportWithOptions() {
  const format = document.getElementById("exportFormatSelect").value
  const compression = document.getElementById("exportCompressionToggle").checked

  // Close dialog
  const dialog = document.querySelector(".modal-overlay")
  if (dialog) {
    document.body.removeChild(dialog)
  }

  const exportButton = document.getElementById("exportBackups")
  exportButton.classList.add("loading")
  exportButton.disabled = true

  try {
    showStatus("Exporting backups...", "loading")

    const response = await browser.runtime.sendMessage({
      action: "exportBackups",
      format: format,
      compression: compression,
    })

    if (response.success) {
      // Create download link
      const blob = new Blob([response.data], { type: response.mimeType || "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.filename
      document.body.appendChild(a)
      a.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      showStatus(getMessage("exportSuccess"), "success")
    } else {
      showStatus(response.error || getMessage("exportError"), "error")
    }
  } catch (error) {
    console.error("Export error:", error)
    showStatus(error.message || getMessage("exportError"), "error")
  } finally {
    exportButton.classList.remove("loading")
    exportButton.disabled = false
    isOperationInProgress = false
  }
}

// Handle import backups
async function handleImportBackups(event) {
  if (isOperationInProgress) return
  isOperationInProgress = true

  const importButton = document.getElementById("importBackups")
  importButton.classList.add("loading")
  importButton.disabled = true

  try {
    const file = event.target.files[0]
    if (!file) {
      isOperationInProgress = false
      importButton.classList.remove("loading")
      importButton.disabled = false
      return
    }

    showStatus("Importing backups...", "loading")

    try {
      // Read file as text
      const text = await file.text()

      // Validate JSON format
      const importData = JSON.parse(text)

      // Validate structure
      if (!importData.version || !importData.backups || !Array.isArray(importData.backups)) {
        throw new Error(getMessage("invalidBackupFile"))
      }

      const response = await browser.runtime.sendMessage({
        action: "importBackups",
        jsonData: text,
      })

      if (response.success) {
        const message = getMessage("importedBackups").replace("{count}", response.newBackupsCount || 0)
        showStatus(message, "success")

        // Force reload backups to refresh the UI
        await loadBackups()
        await updateStorageInfo()
        await loadAnalytics()
      } else {
        showStatus(response.error || getMessage("importError"), "error")
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      showStatus(getMessage("invalidBackupFile"), "error")
    }
  } catch (error) {
    console.error("Import error:", error)
    showStatus(error.message || getMessage("importError"), "error")
  } finally {
    importButton.classList.remove("loading")
    importButton.disabled = false
    isOperationInProgress = false
    // Reset file input
    document.getElementById("importFile").value = ""
  }
}

// Handle compare backups
async function handleCompareBackups() {
  if (currentBackups.length < 2) {
    showStatus("Need at least 2 backups to compare", "error")
    return
  }

  showCompareDialog()
}

// Show compare dialog
function showCompareDialog() {
  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"

  const backupOptions = currentBackups
    .map((backup, index) => `<option value="${index}">${backup.name} - ${formatDate(backup.date)}</option>`)
    .join("")

  dialog.innerHTML = `
    <div class="modal large">
      <div class="modal-header">
        <h3>${getMessage("compareBackups")}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="backup1Select">${getMessage("backup1")}</label>
          <select id="backup1Select">${backupOptions}</select>
        </div>
        <div class="form-group">
          <label for="backup2Select">${getMessage("backup2")}</label>
          <select id="backup2Select">${backupOptions}</select>
        </div>
        <div id="comparisonResults" class="comparison-results" style="display: none;">
          <h4>${getMessage("differences")}</h4>
          <div id="comparisonContent"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary modal-cancel">${getMessage("cancelNote")}</button>
        <button class="button button-primary modal-confirm">${getMessage("compare")}</button>
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  // Set different default selections
  document.getElementById("backup2Select").selectedIndex = 1

  // Add event listeners
  const closeBtn = dialog.querySelector(".modal-close")
  const cancelBtn = dialog.querySelector(".modal-cancel")
  const confirmBtn = dialog.querySelector(".modal-confirm")

  const closeDialog = () => {
    document.body.removeChild(dialog)
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)
  confirmBtn.addEventListener("click", performComparison)

  // Close on overlay click
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog()
    }
  })
}

// Perform comparison
async function performComparison() {
  const backup1Index = Number.parseInt(document.getElementById("backup1Select").value)
  const backup2Index = Number.parseInt(document.getElementById("backup2Select").value)

  if (backup1Index === backup2Index) {
    showStatus("Please select different backups to compare", "error")
    return
  }

  try {
    const response = await browser.runtime.sendMessage({
      action: "compareBackups",
      backup1Index: backup1Index,
      backup2Index: backup2Index,
    })

    if (response.success) {
      displayComparisonResults(response.differences)
    } else {
      showStatus(response.error || "Error comparing backups", "error")
    }
  } catch (error) {
    console.error("Comparison error:", error)
    showStatus(error.message, "error")
  }
}

// Display comparison results
function displayComparisonResults(differences) {
  const resultsDiv = document.getElementById("comparisonResults")
  const contentDiv = document.getElementById("comparisonContent")

  if (differences.added.length === 0 && differences.removed.length === 0 && differences.changed.length === 0) {
    contentDiv.innerHTML = `<p>${getMessage("noDifferences")}</p>`
  } else {
    let html = ""

    if (differences.added.length > 0) {
      html += `<div class="diff-section">
        <h5>${getMessage("addedTabs")} (${differences.added.length})</h5>
        <ul>${differences.added.map((tab) => `<li class="added">${tab.title} - ${tab.url}</li>`).join("")}</ul>
      </div>`
    }

    if (differences.removed.length > 0) {
      html += `<div class="diff-section">
        <h5>${getMessage("removedTabs")} (${differences.removed.length})</h5>
        <ul>${differences.removed.map((tab) => `<li class="removed">${tab.title} - ${tab.url}</li>`).join("")}</ul>
      </div>`
    }

    if (differences.changed.length > 0) {
      html += `<div class="diff-section">
        <h5>${getMessage("changedTabs")} (${differences.changed.length})</h5>
        <ul>${differences.changed.map((tab) => `<li class="changed">${tab.title} - ${tab.url}</li>`).join("")}</ul>
      </div>`
    }

    contentDiv.innerHTML = html
  }

  resultsDiv.style.display = "block"
}

// Handle merge backups
async function handleMergeBackups() {
  if (currentBackups.length < 2) {
    showStatus("Need at least 2 backups to merge", "error")
    return
  }

  showMergeDialog()
}

// Show merge dialog
function showMergeDialog() {
  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"

  const backupCheckboxes = currentBackups
    .map(
      (backup, index) =>
        `<label class="checkbox-item">
      <input type="checkbox" value="${index}" />
      ${backup.name} - ${formatDate(backup.date)} (${backup.windows.reduce((sum, w) => sum + w.tabs.length, 0)} tabs)
    </label>`,
    )
    .join("")

  dialog.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${getMessage("mergeBackups")}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${getMessage("selectBackupsToMerge")}</p>
        <div class="checkbox-list">
          ${backupCheckboxes}
        </div>
        <div class="form-group">
          <label for="mergedBackupName">${getMessage("enterBackupName")}</label>
          <input type="text" id="mergedBackupName" value="Merged Backup - ${new Date().toLocaleString()}" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary modal-cancel">${getMessage("cancelNote")}</button>
        <button class="button button-primary modal-confirm">${getMessage("mergeSelected")}</button>
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  // Add event listeners
  const closeBtn = dialog.querySelector(".modal-close")
  const cancelBtn = dialog.querySelector(".modal-cancel")
  const confirmBtn = dialog.querySelector(".modal-confirm")

  const closeDialog = () => {
    document.body.removeChild(dialog)
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)
  confirmBtn.addEventListener("click", performMerge)

  // Close on overlay click
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog()
    }
  })
}

// Perform merge
async function performMerge() {
  const checkboxes = document.querySelectorAll('.checkbox-list input[type="checkbox"]:checked')
  const selectedIndices = Array.from(checkboxes).map((cb) => Number.parseInt(cb.value))
  const mergedName = document.getElementById("mergedBackupName").value.trim()

  if (selectedIndices.length < 2) {
    showStatus("Please select at least 2 backups to merge", "error")
    return
  }

  // Close dialog
  const dialog = document.querySelector(".modal-overlay")
  if (dialog) {
    document.body.removeChild(dialog)
  }

  try {
    showStatus("Merging backups...", "loading")

    const response = await browser.runtime.sendMessage({
      action: "mergeBackups",
      backupIndices: selectedIndices,
      mergedName: mergedName || `Merged Backup - ${new Date().toLocaleString()}`,
    })

    if (response.success) {
      showStatus(getMessage("mergeSuccess"), "success")
      await loadBackups()
      await updateStorageInfo()
      await loadAnalytics()
    } else {
      showStatus(response.error || getMessage("mergeError"), "error")
    }
  } catch (error) {
    console.error("Merge error:", error)
    showStatus(error.message || getMessage("mergeError"), "error")
  }
}

// Handle import from history
async function handleImportHistory() {
  showHistoryImportDialog()
}

// Show history import dialog
function showHistoryImportDialog() {
  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"

  const today = new Date().toISOString().split("T")[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  dialog.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${getMessage("importFromHistory")}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${getMessage("selectDateRange")}</p>
        <div class="form-group">
          <label for="fromDate">${getMessage("fromDate")}</label>
          <input type="date" id="fromDate" value="${weekAgo}" />
        </div>
        <div class="form-group">
          <label for="toDate">${getMessage("toDate")}</label>
          <input type="date" id="toDate" value="${today}" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary modal-cancel">${getMessage("cancelNote")}</button>
        <button class="button button-primary modal-confirm">${getMessage("importHistory")}</button>
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  // Add event listeners
  const closeBtn = dialog.querySelector(".modal-close")
  const cancelBtn = dialog.querySelector(".modal-cancel")
  const confirmBtn = dialog.querySelector(".modal-confirm")

  const closeDialog = () => {
    document.body.removeChild(dialog)
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)
  confirmBtn.addEventListener("click", performHistoryImport)

  // Close on overlay click
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog()
    }
  })
}

// Perform history import
async function performHistoryImport() {
  const fromDate = document.getElementById("fromDate").value
  const toDate = document.getElementById("toDate").value

  if (!fromDate || !toDate) {
    showStatus("Please select both dates", "error")
    return
  }

  // Close dialog
  const dialog = document.querySelector(".modal-overlay")
  if (dialog) {
    document.body.removeChild(dialog)
  }

  try {
    showStatus("Importing from history...", "loading")

    const response = await browser.runtime.sendMessage({
      action: "importFromHistory",
      fromDate: fromDate,
      toDate: toDate,
    })

    if (response.success) {
      showStatus(getMessage("historyImported"), "success")
      await loadBackups()
      await updateStorageInfo()
      await loadAnalytics()
    } else {
      showStatus(response.error || getMessage("historyImportError"), "error")
    }
  } catch (error) {
    console.error("History import error:", error)
    showStatus(error.message || getMessage("historyImportError"), "error")
  }
}

// Handle sync now
async function handleSyncNow() {
  if (!currentSettings.enableCloudSync) {
    showStatus("Cloud sync is not enabled", "error")
    return
  }

  try {
    showStatus("Syncing...", "loading")

    const response = await browser.runtime.sendMessage({
      action: "syncNow",
    })

    if (response.success) {
      showStatus(getMessage("syncSuccess"), "success")
      await loadBackups()
      await updateStorageInfo()
    } else {
      showStatus(response.error || getMessage("syncError"), "error")
    }
  } catch (error) {
    console.error("Sync error:", error)
    showStatus(error.message || getMessage("syncError"), "error")
  }
}

// Update storage info
async function updateStorageInfo() {
  try {
    const response = await browser.runtime.sendMessage({ action: "getStorageInfo" })

    if (response.success) {
      const progressBar = document.getElementById("storageProgressBar")
      const details = document.getElementById("storageDetails")

      // Update progress bar
      if (response.percentUsed) {
        progressBar.style.width = `${response.percentUsed}%`
      }

      // Update details text
      if (response.backupsSizeMB && response.quota) {
        const detailsText = getMessage("storageDetails")
          .replace("{used}", response.backupsSizeMB)
          .replace("{total}", response.quota)
          .replace("{percent}", response.percentUsed)
        details.textContent = detailsText
      } else {
        details.textContent = `${response.backupsSizeMB} MB, ${response.backupsCount} backups`
      }
    }
  } catch (error) {
    console.error("Error getting storage info:", error)
  }
}

// Load analytics
async function loadAnalytics() {
  try {
    const response = await browser.runtime.sendMessage({ action: "getAnalytics" })

    if (response.success) {
      const analytics = response.analytics

      // Update analytics display
      document.getElementById("totalBackupsCount").textContent = analytics.totalBackups
      document.getElementById("totalTabsBackedUp").textContent = analytics.totalTabs
      document.getElementById("averageTabsPerBackup").textContent = analytics.averageTabs.toFixed(1)
      document.getElementById("oldestBackup").textContent = analytics.oldestBackup
        ? formatDate(analytics.oldestBackup)
        : "N/A"
      document.getElementById("newestBackup").textContent = analytics.newestBackup
        ? formatDate(analytics.newestBackup)
        : "N/A"
      document.getElementById("mostUsedCategory").textContent = analytics.mostUsedCategory || "N/A"
      document.getElementById("storageUsed").textContent = `${analytics.storageUsed} MB`
      document.getElementById("backupFrequency").textContent = analytics.backupFrequency
    }
  } catch (error) {
    console.error("Error loading analytics:", error)
  }
}

// Load backups from storage
async function loadBackups() {
  try {
    const response = await browser.runtime.sendMessage({ action: "getBackups" })
    currentBackups = response.backups || []
    renderFilteredBackups(currentBackups)
  } catch (error) {
    console.error("Error loading backups:", error)
    document.getElementById("backupList").innerHTML =
      `<div class="empty-state" style="color: #dc3545;">${getMessage("errorLoadingBackups")}</div>`
  }
}

// Format date according to settings
function formatDate(dateString) {
  try {
    const date = new Date(dateString)
    const format = currentSettings.dateFormat || "locale"

    switch (format) {
      case "iso":
        return date.toISOString().slice(0, 19).replace("T", " ")
      case "us":
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.toTimeString().slice(0, 8)}`
      case "eu":
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.toTimeString().slice(0, 8)}`
      default:
        return date.toLocaleString(currentLanguage)
    }
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString // Return original if error
  }
}

// Get pluralized text
function getPluralText(count, singular, plural) {
  return count === 1 ? singular : plural
}

// Filter backups based on search and category
function filterBackups() {
  return currentBackups.filter((backup) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      backup.name.toLowerCase().includes(searchQuery) ||
      (backup.notes && backup.notes.toLowerCase().includes(searchQuery)) ||
      (backup.tags && backup.tags.some((tag) => tag.toLowerCase().includes(searchQuery)))

    // Category filter
    const matchesCategory = selectedCategory === "all" || backup.category === selectedCategory

    return matchesSearch && matchesCategory
  })
}

// Handle backup list clicks (event delegation)
function handleBackupListClick(event) {
  const target = event.target

  // Handle restore button click
  if (target.classList.contains("restore-btn")) {
    const index = Number.parseInt(target.getAttribute("data-index"))
    restoreBackup(index)
  }

  // Handle delete button click
  if (target.classList.contains("delete-btn")) {
    const index = Number.parseInt(target.getAttribute("data-index"))
    deleteBackup(index)
  }

  // Handle preview button click
  if (target.classList.contains("preview-btn")) {
    const index = Number.parseInt(target.getAttribute("data-index"))
    previewBackup(index)
  }

  // Handle rename button click
  if (target.classList.contains("rename-btn")) {
    const index = Number.parseInt(target.getAttribute("data-index"))
    renameBackup(index)
  }

  // Handle selective restore button click
  if (target.classList.contains("selective-restore-btn")) {
    const index = Number.parseInt(target.getAttribute("data-index"))
    selectiveRestore(index)
  }
}

// Preview backup
function previewBackup(index) {
  const backup = currentBackups[index]
  if (!backup) return

  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"

  const windowsHtml = backup.windows
    .map((window, windowIndex) => {
      const tabsHtml = window.tabs
        .map(
          (tab) =>
            `<div class="tab-item">
        <div class="tab-title">${tab.title}</div>
        <div class="tab-url">${tab.url}</div>
      </div>`,
        )
        .join("")

      return `
      <div class="window-preview">
        <h5>Window ${windowIndex + 1} (${window.tabs.length} tabs)</h5>
        <div class="tabs-list">${tabsHtml}</div>
      </div>
    `
    })
    .join("")

  dialog.innerHTML = `
    <div class="modal large">
      <div class="modal-header">
        <h3>${getMessage("previewBackup")}: ${backup.name}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="backup-preview">
          <div class="preview-info">
            <p><strong>${getMessage("category")}:</strong> ${backup.category ? getMessage(`categories.${backup.category}`) : "N/A"}</p>
            <p><strong>${getMessage("tags")}:</strong> ${backup.tags ? backup.tags.join(", ") : "None"}</p>
            <p><strong>${getMessage("notes")}:</strong> ${backup.notes || "None"}</p>
          </div>
          <h4>${getMessage("backupContents")}</h4>
          <div class="windows-preview">${windowsHtml}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary modal-cancel">${getMessage("cancelNote")}</button>
        <button class="button button-primary modal-confirm">${getMessage("restore")}</button>
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  // Add event listeners
  const closeBtn = dialog.querySelector(".modal-close")
  const cancelBtn = dialog.querySelector(".modal-cancel")
  const confirmBtn = dialog.querySelector(".modal-confirm")

  const closeDialog = () => {
    document.body.removeChild(dialog)
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)
  confirmBtn.addEventListener("click", () => {
    closeDialog()
    restoreBackup(index)
  })

  // Close on overlay click
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog()
    }
  })
}

// Rename backup
async function renameBackup(index) {
  const backup = currentBackups[index]
  if (!backup) return

  const newName = prompt(getMessage("enterNewName"), backup.name)
  if (!newName || newName === backup.name) return

  try {
    const response = await browser.runtime.sendMessage({
      action: "renameBackup",
      backupIndex: index,
      newName: newName.trim(),
    })

    if (response.success) {
      showStatus(getMessage("backupRenamed"), "success")
      await loadBackups()
    } else {
      showStatus(response.error || getMessage("renameError"), "error")
    }
  } catch (error) {
    console.error("Rename error:", error)
    showStatus(error.message || getMessage("renameError"), "error")
  }
}

// Selective restore
function selectiveRestore(index) {
  const backup = currentBackups[index]
  if (!backup) return

  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"

  const tabsHtml = backup.windows
    .flatMap((window, windowIndex) =>
      window.tabs.map(
        (tab, tabIndex) =>
          `<label class="checkbox-item">
        <input type="checkbox" value="${windowIndex}-${tabIndex}" checked />
        <div class="tab-info">
          <div class="tab-title">${tab.title}</div>
          <div class="tab-url">${tab.url}</div>
        </div>
      </label>`,
      ),
    )
    .join("")

  dialog.innerHTML = `
    <div class="modal large">
      <div class="modal-header">
        <h3>${getMessage("selectTabsToRestore")}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="selection-controls">
          <button class="button button-small button-secondary" onclick="selectAllTabs(true)">${getMessage("selectAll")}</button>
          <button class="button button-small button-secondary" onclick="selectAllTabs(false)">${getMessage("selectNone")}</button>
          <span id="selectedCount">0 ${getMessage("tabsSelected")}</span>
        </div>
        <div class="tabs-selection">${tabsHtml}</div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary modal-cancel">${getMessage("cancelNote")}</button>
        <button class="button button-primary modal-confirm">${getMessage("restoreSelected")}</button>
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  // Add event listeners
  const closeBtn = dialog.querySelector(".modal-close")
  const cancelBtn = dialog.querySelector(".modal-cancel")
  const confirmBtn = dialog.querySelector(".modal-confirm")

  const closeDialog = () => {
    document.body.removeChild(dialog)
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)
  confirmBtn.addEventListener("click", performSelectiveRestore.bind(null, index))

  // Close on overlay click
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog()
    }
  })

  // Add event listeners for checkboxes
  const checkboxes = dialog.querySelectorAll('.tabs-selection input[type="checkbox"]')
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateSelectedCount)
  })
  updateSelectedCount()
}

// Update selected count
function updateSelectedCount() {
  const checkboxes = document.querySelectorAll('.tabs-selection input[type="checkbox"]:checked')
  const count = checkboxes.length
  document.getElementById("selectedCount").textContent = `${count} ${getMessage("tabsSelected")}`
}

// Select all tabs
function selectAllTabs(selectAll) {
  const checkboxes = document.querySelectorAll('.tabs-selection input[type="checkbox"]')
  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAll
  })
  updateSelectedCount()
}

// Perform selective restore
async function performSelectiveRestore(backupIndex) {
  const checkboxes = document.querySelectorAll('.tabs-selection input[type="checkbox"]:checked')
  const selectedTabs = Array.from(checkboxes).map((cb) => cb.value)

  if (selectedTabs.length === 0) {
    showStatus("Please select at least one tab to restore", "error")
    return
  }

  // Close dialog
  const dialog = document.querySelector(".modal-overlay")
  if (dialog) {
    document.body.removeChild(dialog)
  }

  try {
    showStatus(getMessage("restoringBackup"), "loading")

    const response = await browser.runtime.sendMessage({
      action: "selectiveRestore",
      backupIndex: backupIndex,
      selectedTabs: selectedTabs,
    })

    if (response.success) {
      showStatus(getMessage("restoreSuccess"), "success")
    } else {
      showStatus(response.error || getMessage("restoreError"), "error")
    }
  } catch (error) {
    console.error("Selective restore error:", error)
    showStatus(error.message || getMessage("restoreError"), "error")
  }
}

// Restore specific backup
async function restoreBackup(index) {
  if (isOperationInProgress) return
  isOperationInProgress = true

  if (!confirm(getMessage("confirmRestore"))) {
    isOperationInProgress = false
    return
  }

  try {
    showStatus(getMessage("restoringBackup"), "loading")

    // Find and disable the button
    const button = document.querySelector(`.restore-btn[data-index="${index}"]`)
    if (button) {
      button.classList.add("loading")
      button.disabled = true
    }

    const response = await browser.runtime.sendMessage({
      action: "restoreBackup",
      backupIndex: index,
    })

    if (response.success) {
      showStatus(getMessage("restoreSuccess"), "success")
    } else {
      showStatus(response.error || getMessage("restoreError"), "error")
    }
  } catch (error) {
    console.error("Restore error:", error)
    showStatus(error.message || getMessage("restoreError"), "error")
  } finally {
    // Re-enable the button
    const button = document.querySelector(`.restore-btn[data-index="${index}"]`)
    if (button) {
      button.classList.remove("loading")
      button.disabled = false
    }
    isOperationInProgress = false
  }
}

// Delete specific backup
async function deleteBackup(index) {
  if (isOperationInProgress) return
  isOperationInProgress = true

  if (!confirm(getMessage("confirmDelete"))) {
    isOperationInProgress = false
    return
  }

  try {
    showStatus("Deleting backup...", "loading") // Show loading first

    // Find and disable the button
    const button = document.querySelector(`.delete-btn[data-index="${index}"]`)
    if (button) {
      button.classList.add("loading")
      button.disabled = true
    }

    const response = await browser.runtime.sendMessage({
      action: "deleteBackup",
      backupIndex: index,
    })

    if (response.success) {
      showStatus(getMessage("deleteSuccess"), "success")
      await loadBackups() // Refresh the list
      await updateStorageInfo() // Update storage usage
      await loadAnalytics() // Update analytics
    } else {
      showStatus(response.error || getMessage("deleteError"), "error")
    }
  } catch (error) {
    console.error("Delete error:", error)
    showStatus(error.message || getMessage("deleteError"), "error")
  } finally {
    isOperationInProgress = false
  }
}

// Get localized message
function getMessage(key) {
  return messages[currentLanguage][key] || messages.en[key] || key
}

// Enhanced status display
function showStatus(message, type) {
  const statusDiv = document.getElementById("status")

  statusDiv.textContent = getMessage(message) || message
  statusDiv.className = `status status-${type} show`

  // Auto-hide after delay
  if (type !== "info") {
    setTimeout(() => {
      statusDiv.classList.remove("show")
    }, 5000)
  }
}

// Load localization
function loadLocalization() {
  const elements = document.querySelectorAll("[data-i18n]")
  elements.forEach((element) => {
    const messageKey = element.getAttribute("data-i18n")
    const message = getMessage(messageKey)
    if (message) {
      element.textContent = message
    }
  })

  // Update category filter options
  const categoryFilter = document.getElementById("categoryFilter")
  if (categoryFilter) {
    categoryFilter.innerHTML = `
      <option value="all">${getMessage("categories.all")}</option>
      <option value="work">${getMessage("categories.work")}</option>
      <option value="personal">${getMessage("categories.personal")}</option>
      <option value="research">${getMessage("categories.research")}</option>
      <option value="shopping">${getMessage("categories.shopping")}</option>
      <option value="entertainment">${getMessage("categories.entertainment")}</option>
      <option value="education">${getMessage("categories.education")}</option>
      <option value="other">${getMessage("categories.other")}</option>
    `
  }

  // Update search placeholder
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.placeholder = getMessage("searchBackups")
  }

  // Update page title
  document.title = getMessage("extensionName")

  // Re-render backup list to update button text

  // Update auto backup status
  updateAutoBackupStatus()
}

// Enhanced toggle functionality
function setupToggleElements() {
  document.querySelectorAll(".toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active")

      // Trigger change event for the associated setting
      const settingId = toggle.id
      if (settingId) {
        const event = new Event("change")
        toggle.dispatchEvent(event)
      }
    })
  })
}

// Update header stats
function updateHeaderStats() {
  const totalBackupsHeader = document.getElementById("totalBackupsHeader")
  const storageUsedHeader = document.getElementById("storageUsedHeader")

  if (totalBackupsHeader) {
    totalBackupsHeader.textContent = currentBackups.length
  }

  // Storage info will be updated by updateStorageInfo function
}

// Make functions globally available
window.renderBackupList = renderFilteredBackups
window.showStatus = showStatus
window.updateHeaderStats = updateHeaderStats
