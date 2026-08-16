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
    fifteenMinutes: "15 Minutes",
    thirtyMinutes: "30 Minutes",
    oneHour: "1 Hour",
    twoHours: "2 Hours",
    sixHours: "6 Hours",
    twelveHours: "12 Hours",
    twentyFourHours: "24 Hours",
    customInterval: "Custom Interval (min):",
    addInterval: "Add",
    invalidInterval: "Please enter a valid interval (1 - 1440 min)",
    custom: "Custom",
    hours: "Hours",
    openThisWindowOnly: "Open Window Only",
    selectWindow: "Select Window",
    bulkDelete: "Bulk Delete",
    selectBackupsToDelete: "Select backups to delete:",
    deleteSelected: "Delete Selected",
    confirmBulkDelete: "Are you sure you want to delete {count} selected backups?",
    bulkDeleteSuccess: "Selected backups deleted successfully!",
    excludedDomains: "Excluded Domains (comma separated):",
    autoPrune: "Auto-delete old backups:",
    cloudSync: "Cloud Sync (GitHub Gist):",
    pushToCloud: "☁️ Push to Cloud",
    pullFromCloud: "⬇️ Pull from Cloud",
    cleanDuplicates: "Clean Duplicates",
    enableSound: "Enable Retro Sound Effects",
    enableLazyRestore: "Lazy Tab Restore (RAM Saver)",
    copyMarkdown: "Copy as Markdown",
    cleanedDuplicates: "Closed {count} duplicate tabs!",
    copiedToClipboard: "Copied to clipboard as Markdown!",
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
    version: "Version 3.0.0",
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
    fifteenMinutes: "15 Dakika",
    thirtyMinutes: "30 Dakika",
    oneHour: "1 Saat",
    twoHours: "2 Saat",
    sixHours: "6 Saat",
    twelveHours: "12 Saat",
    twentyFourHours: "24 Saat",
    searchBackups: "Yedeklerde Ara",
    backupSettings: "Yedekleme Ayarları",
    customInterval: "Özel Süre (dakika):",
    addInterval: "Ekle",
    invalidInterval: "Lütfen geçerli bir süre girin (1 - 1440 dak)",
    custom: "Özel",
    hours: "Saat",
    openThisWindowOnly: "Sadece Bu Pencereyi Aç",
    selectWindow: "Pencereyi Seç",
    bulkDelete: "Toplu Sil",
    selectBackupsToDelete: "Silinecek yedekleri seçin:",
    deleteSelected: "Seçilenleri Sil",
    confirmBulkDelete: "Seçilen {count} adet yedeği silmek istediğinizden emin misiniz?",
    bulkDeleteSuccess: "Seçilen yedekler başarıyla silindi!",
    excludedDomains: "Hariç Tutulan Domainler (virgülle ayırın):",
    autoPrune: "Eski Yedekleri Otomatik Sil:",
    cloudSync: "Bulut Senkronizasyonu (GitHub Gist):",
    pushToCloud: "☁️ Buluta Yükle",
    pullFromCloud: "⬇️ Buluttan Çek",
    cleanDuplicates: "Kopya Temizle",
    enableSound: "Retro Ses Efektleri",
    enableLazyRestore: "Sekme Bellek Tasarrufu (RAM Koruma)",
    copyMarkdown: "Markdown Olarak Kopyala",
    cleanedDuplicates: "{count} adet kopya sekme kapatıldı!",
    copiedToClipboard: "Markdown olarak panoya kopyalandı!",
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
    version: "Sürüm 3.0.0",
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
  ko: {
    extensionName: "TabSaver",
    quickActions: "빠른 작업",
    backupNow: "지금 백업",
    restoreLatest: "최신 백업 복원",
    backupHistory: "백업 기록",
    loadingBackups: "백업 로딩 중...",
    windows: "창",
    window: "창",
    tabs: "탭",
    tab: "탭",
    restore: "복원",
    delete: "삭제",
    edit: "편집",
    preview: "미리보기",
    rename: "이름 변경",
    selectiverestore: "선택 복원",
    performingBackup: "백업 진행 중...",
    backupSuccess: "백업이 완료되었습니다!",
    backupError: "백업 중 오류 발생",
    restoringBackup: "백업 복원 중...",
    restoreSuccess: "백업이 복원되었습니다!",
    restoreError: "복원 중 오류 발생",
    deleteSuccess: "백업이 삭제되었습니다!",
    deleteError: "백업 삭제 중 오류 발생",
    noBackupsFound: "백업을 찾을 수 없습니다",
    confirmRestore: "새 창에서 백업된 탭을 엽니다. 계속하시겠습니까?",
    confirmDelete: "이 백업을 삭제하시겠습니까?",
    autoBackup: "자동 백업",
    disabled: "비활성화",
    oneMinute: "1분",
    fiveMinutes: "5분",
    tenMinutes: "10분",
    fifteenMinutes: "15분",
    thirtyMinutes: "30분",
    oneHour: "1시간",
    twoHours: "2시간",
    sixHours: "6시간",
    twelveHours: "12시간",
    twentyFourHours: "24시간",
    searchBackups: "백업 검색",
    backupSettings: "백업 설정",
    customInterval: "사용자 지정 간격(분):",
    addInterval: "추가",
    invalidInterval: "올바른 간격을 입력하세요(1-1440분)",
    custom: "사용자 지정",
    hours: "시간",
    openThisWindowOnly: "이 창만 열기",
    selectWindow: "창 선택",
    bulkDelete: "일괄 삭제",
    selectBackupsToDelete: "삭제할 백업 선택:",
    deleteSelected: "선택 항목 삭제",
    confirmBulkDelete: "선택한 {count}개 백업을 삭제하시겠습니까?",
    bulkDeleteSuccess: "선택한 백업이 삭제되었습니다!",
    excludedDomains: "제외할 도메인(쉼표로 구분):",
    autoPrune: "오래된 백업 자동 삭제:",
    cloudSync: "클라우드 동기화(GitHub Gist):",
    pushToCloud: "☁️ 클라우드로 업로드",
    pullFromCloud: "⬇️ 클라우드에서 내려받기",
    settingsUpdated: "설정이 업데이트되었습니다!",
    categories: {
      personal: "개인",
      work: "업무",
      research: "연구",
      shopping: "쇼핑",
      entertainment: "엔터테인먼트",
      education: "교육",
      other: "기타"
    }
  },
  zh: {
    extensionName: "TabSaver 标签页",
    quickActions: "快捷操作",
    backupNow: "立即备份",
    restoreLatest: "还原最新备份",
    backupHistory: "备份历史",
    loadingBackups: "正在加载备份...",
    windows: "窗口",
    window: "窗口",
    tabs: "标签页",
    tab: "标签页",
    restore: "还原",
    delete: "删除",
    edit: "编辑",
    preview: "预览",
    rename: "重命名",
    selectiverestore: "选择性还原",
    performingBackup: "正在备份...",
    backupSuccess: "备份完成！",
    backupError: "备份出错",
    restoringBackup: "正在还原...",
    restoreSuccess: "还原成功！",
    restoreError: "还原出错",
    deleteSuccess: "备份已删除！",
    deleteError: "删除备份出错",
    noBackupsFound: "未找到备份",
    confirmRestore: "这将在新窗口中打开备份的标签页。是否继续？",
    confirmDelete: "确定要删除此备份吗？",
    autoBackup: "自动备份",
    disabled: "已禁用",
    oneMinute: "1 分钟",
    fiveMinutes: "5 分钟",
    tenMinutes: "10 分钟",
    fifteenMinutes: "15 分钟",
    thirtyMinutes: "30 分钟",
    oneHour: "1 小时",
    twoHours: "2 小时",
    sixHours: "6 小时",
    twelveHours: "12 小时",
    twentyFourHours: "24 小时",
    searchBackups: "搜索备份",
    backupSettings: "备份设置",
    customInterval: "自定义间隔（分钟）:",
    addInterval: "添加",
    invalidInterval: "请输入有效间隔（1 - 1440 分钟）",
    custom: "自定义",
    hours: "小时",
    openThisWindowOnly: "仅打开此窗口",
    selectWindow: "选择窗口",
    bulkDelete: "批量删除",
    selectBackupsToDelete: "选择要删除的备份：",
    deleteSelected: "删除所选",
    confirmBulkDelete: "确定要删除所选的 {count} 项备份吗？",
    bulkDeleteSuccess: "所选备份已成功删除！",
    excludedDomains: "排除的域名（逗号分隔）:",
    autoPrune: "自动清理旧备份:",
    cloudSync: "云端同步 (GitHub Gist):",
    pushToCloud: "☁️ 上传到云端",
    pullFromCloud: "⬇️ 从云端下载",
    settingsUpdated: "设置已更新！",
    categories: {
      personal: "个人",
      work: "工作",
      research: "研究",
      shopping: "购物",
      entertainment: "娱乐",
      education: "教育",
      other: "其他"
    }
  },
  ru: {
    extensionName: "TabSaver",
    quickActions: "Быстрые действия",
    backupNow: "Создать резервную копию",
    restoreLatest: "Восстановить последнюю",
    backupHistory: "История копий",
    loadingBackups: "Загрузка копий...",
    windows: "окон",
    window: "окно",
    tabs: "вкладок",
    tab: "вкладка",
    restore: "Восстановить",
    delete: "Удалить",
    edit: "Изменить",
    preview: "Просмотр",
    rename: "Переименовать",
    selectiverestore: "Выбор параметров",
    performingBackup: "Создание копии...",
    backupSuccess: "Копия успешно создана!",
    backupError: "Ошибка при создании копии",
    restoringBackup: "Восстановление...",
    restoreSuccess: "Копия успешно восстановлена!",
    restoreError: "Ошибка при восстановлении",
    deleteSuccess: "Копия удалена!",
    deleteError: "Ошибка при удалении",
    noBackupsFound: "Копии не найдены",
    confirmRestore: "Открыть вкладки из копии в новых окнах?",
    confirmDelete: "Вы уверены, что хотите удалить эту копию?",
    autoBackup: "Автобэкап",
    disabled: "Отключено",
    oneMinute: "1 мин.",
    fiveMinutes: "5 мин.",
    tenMinutes: "10 мин.",
    fifteenMinutes: "15 мин.",
    thirtyMinutes: "30 мин.",
    oneHour: "1 час",
    twoHours: "2 часа",
    sixHours: "6 часов",
    twelveHours: "12 часов",
    twentyFourHours: "24 часа",
    searchBackups: "Поиск копий",
    backupSettings: "Настройки копирования",
    customInterval: "Свой интервал (мин.):",
    addInterval: "Добавить",
    invalidInterval: "Введите интервал от 1 до 1440 мин.",
    custom: "Свой",
    hours: "час.",
    openThisWindowOnly: "Открыть только это окно",
    selectWindow: "Выбрать окно",
    bulkDelete: "Массовое удаление",
    selectBackupsToDelete: "Выберите копии для удаления:",
    deleteSelected: "Удалить выбранные",
    confirmBulkDelete: "Удалить выбранные копии ({count} шт.)?",
    bulkDeleteSuccess: "Выбранные копии успешно удалены!",
    excludedDomains: "Исключенные домены (через запятую):",
    autoPrune: "Автоудаление старых копий:",
    cloudSync: "Синхронизация (GitHub Gist):",
    pushToCloud: "☁️ Загрузить в облако",
    pullFromCloud: "⬇️ Скачать из облака",
    settingsUpdated: "Настройки обновлены!",
    categories: {
      personal: "Личное",
      work: "Работа",
      research: "Исследования",
      shopping: "Покупки",
      entertainment: "Развлечения",
      education: "Обучение",
      other: "Другое"
    }
  },
  ar: {
    extensionName: "TabSaver حافظ التبويبات",
    quickActions: "إجراءات سريعة",
    backupNow: "حفظ النسخة الآن",
    restoreLatest: "استعادة أحدث نسخة",
    backupHistory: "سجل النسخ",
    loadingBackups: "جاري تحميل النسخ...",
    windows: "نوافذ",
    window: "نافذة",
    tabs: "تبويبات",
    tab: "تبويب",
    restore: "استعادة",
    delete: "حذف",
    edit: "تعديل",
    preview: "معاينة",
    rename: "إعادة تسمية",
    selectiverestore: "استعادة مخصصة",
    performingBackup: "جاري الإنشاء...",
    backupSuccess: "تم إنشاء النسخة بنجاح!",
    backupError: "حدث خطأ أثناء الحفظ",
    restoringBackup: "جاري الاستعادة...",
    restoreSuccess: "تمت الاستعادة بنجاح!",
    restoreError: "حدث خطأ أثناء الاستعادة",
    deleteSuccess: "تم حذف النسخة بنجاح!",
    deleteError: "حدث خطأ أثناء الحذف",
    noBackupsFound: "لم يتم العثور على نسخ",
    confirmRestore: "سيؤدي هذا إلى فتح نوافذ جديدة بالتبويبات المحفوظة. هل تريد الاستمرار؟",
    confirmDelete: "هل أنت متأكد من حذف هذه النسخة الاحتياطية؟",
    autoBackup: "النسخ التلقائي",
    disabled: "معطل",
    oneMinute: "دقيقة واحدة",
    fiveMinutes: "5 دقائق",
    tenMinutes: "10 دقائق",
    fifteenMinutes: "15 دقيقة",
    thirtyMinutes: "30 دقيقة",
    oneHour: "ساعة واحدة",
    twoHours: "ساعتان",
    sixHours: "6 ساعات",
    twelveHours: "12 ساعة",
    twentyFourHours: "24 ساعة",
    searchBackups: "البحث في النسخ",
    backupSettings: "إعدادات النسخ",
    customInterval: "مدة مخصصة (بالدقائق):",
    addInterval: "إضافة",
    invalidInterval: "يرجى إدخال مدة صالحة (1 - 1440 دقيقة)",
    custom: "مخصص",
    hours: "ساعات",
    openThisWindowOnly: "فتح هذه النافذة فقط",
    selectWindow: "تحديد النافذة",
    bulkDelete: "حذف متعدد",
    selectBackupsToDelete: "حدد النسخ المراد حذفها:",
    deleteSelected: "حذف المحدد",
    confirmBulkDelete: "هل أنت متأكد من حذف النسخ المحددة ({count})؟",
    bulkDeleteSuccess: "تم حذف النسخ المحددة بنجاح!",
    excludedDomains: "المواقع المستثناة (مفصولة بفواصل):",
    autoPrune: "حذف النسخ القديمة تلقائياً:",
    cloudSync: "المزامنة السحابية (GitHub Gist):",
    pushToCloud: "☁️ رفع إلى السحابة",
    pullFromCloud: "⬇️ تنزيل من السحابة",
    settingsUpdated: "تم تحديث الإعدادات بنجاح!",
    categories: {
      personal: "شخصي",
      work: "عمل",
      research: "بحوث",
      shopping: "تسوق",
      entertainment: "ترفيه",
      education: "تعليم",
      other: "آخر"
    }
  }
}

function updateLocalizedText() {
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr"

  // Translate all data-i18n elements
  const elements = document.querySelectorAll("[data-i18n]")
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n")
    const message = getMessage(key)
    if (message) {
      element.textContent = message
    }
  })

  // Translate placeholders
  const inputs = document.querySelectorAll("[data-i18n-placeholder]")
  inputs.forEach((input) => {
    const key = input.getAttribute("data-i18n-placeholder")
    const message = getMessage(key)
    if (message) {
      input.placeholder = message
    }
  })

  // Update interval selector options text in new language
  const intervalSelect = document.getElementById("intervalSelect")
  if (intervalSelect) {
    for (const opt of intervalSelect.options) {
      const val = Number.parseInt(opt.value)
      if (val === 0) opt.textContent = getMessage("disabled")
      else if (val === 60) opt.textContent = getMessage("oneMinute")
      else if (val === 300) opt.textContent = getMessage("fiveMinutes")
      else if (val === 600) opt.textContent = getMessage("tenMinutes")
      else if (val === 900) opt.textContent = getMessage("fifteenMinutes")
      else if (val === 1800) opt.textContent = getMessage("thirtyMinutes")
      else if (val === 3600) opt.textContent = getMessage("oneHour")
      else if (val === 7200) opt.textContent = getMessage("twoHours")
      else if (val === 21600) opt.textContent = getMessage("sixHours")
      else if (val === 43200) opt.textContent = getMessage("twelveHours")
      else if (val === 86400) opt.textContent = getMessage("twentyFourHours")
    }
  }

  // Update category filter options in new language
  const categoryFilter = document.getElementById("categoryFilter")
  if (categoryFilter) {
    for (const opt of categoryFilter.options) {
      const catKey = opt.value
      if (catKey === "all") opt.textContent = getMessage("categories.all") || getMessage("categories.all")
      else if (catKey) opt.textContent = getMessage(`categories.${catKey}`) || opt.textContent
    }
  }

  // Refresh auto backup status text
  updateAutoBackupStatus()

  // Re-render backup list cards in new language
  if (typeof loadBackups === "function") {
    loadBackups()
  }
}

// Initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings()
  await loadLocalization()
  await loadBackups()
  await updateStorageInfo()
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
    if (document.getElementById("languageSelect")) {
      document.getElementById("languageSelect").value = currentLanguage
    }
    updateLocalizedText()

    // Load backup settings
    const settingsResponse = await browser.runtime.sendMessage({ action: "getSettings" })
    currentSettings = settingsResponse.settings || {}

    // Set interval selector
    const backupInterval = (currentSettings.backupInterval !== undefined && currentSettings.backupInterval !== null) ? Number(currentSettings.backupInterval) : 300

    // Populate custom intervals if saved
    if (currentSettings.customIntervals && Array.isArray(currentSettings.customIntervals)) {
      const select = document.getElementById("intervalSelect")
      currentSettings.customIntervals.forEach((sec) => {
        let exists = false
        for (let i = 0; i < select.options.length; i++) {
          if (Number.parseInt(select.options[i].value) === sec) {
            exists = true
            break
          }
        }
        if (!exists) {
          const min = Math.round(sec / 60)
          const opt = document.createElement("option")
          opt.value = sec
          opt.textContent = min >= 60 ? `${(min / 60).toFixed(1)} ${getMessage("hours")}` : `${min} ${getMessage("minutes")} (${getMessage("custom")})`
          select.appendChild(opt)
        }
      })
    }

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
    const matchesDate = (() => {
      if (!dateFrom) return true
      const filterDate = new Date(dateFrom)
      filterDate.setHours(0, 0, 0, 0)
      const backupDate = backup.timestamp ? new Date(backup.timestamp) : new Date(backup.date)
      if (isNaN(backupDate.getTime())) return true
      backupDate.setHours(0, 0, 0, 0)
      return backupDate.getTime() >= filterDate.getTime()
    })()

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
      const formattedDate = formatDate(backup.date, backup.timestamp)
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
            <svg class="pixel-btn-icon" viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 3C4 3 1 8 1 8s3 5 7 5 7-5 7-5-3-5-7-5zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>
            ${getMessage("preview")}
          </button>
          <button class="button button-small button-secondary rename-btn" data-index="${originalIndex}" title="${getMessage("rename")}">
            <svg class="pixel-btn-icon" viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M12 1l3 3-9 9H3v-3l9-9zm-1 2L4 10v1h1l7-7-1-1z"/></svg>
            ${getMessage("rename")}
          </button>
          <button class="button button-small button-secondary selective-restore-btn" data-index="${originalIndex}" title="${getMessage("selectiverestore")}">
            <svg class="pixel-btn-icon" viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M2 3h3v3H2V3zm5 1h7v1H7V4zM2 9h3v3H2V9zm5 1h7v1H7v-1z"/></svg>
            ${getMessage("selectiverestore")}
          </button>
          <button class="button button-small button-primary restore-btn" data-index="${originalIndex}" aria-label="${getMessage("restore")} ${backupName}">
            <svg class="pixel-btn-icon" viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 2a6 6 0 1 0 5.6 4h-2.1A4 4 0 1 1 8 4v3l4-3.5L8 0v2z"/></svg>
            ${getMessage("restore")}
          </button>
          <button class="button button-small button-danger delete-btn" data-index="${originalIndex}" aria-label="${getMessage("delete")} ${backupName}">
            <svg class="pixel-btn-icon" viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M5 2V1h6v1h4v2H1V2h4zm1 4h2v8H6V6zm4 0h2v8h-2V6z"/></svg>
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
  if (document.getElementById("languageSelect")) {
    document.getElementById("languageSelect").addEventListener("change", async (e) => {
      currentLanguage = e.target.value
      await browser.storage.local.set({ language: currentLanguage })
      updateLocalizedText()
      showStatus(getMessage("settingsUpdated"), "success")
    })
  }

  document.getElementById("notificationsToggle").addEventListener("change", handleNotificationsChange)
  document.getElementById("versioningToggle").addEventListener("change", handleVersioningChange)
  document.getElementById("maxVersionsInput").addEventListener("change", handleMaxVersionsChange)
  if (document.getElementById("addCustomIntervalBtn")) {
    document.getElementById("addCustomIntervalBtn").addEventListener("click", handleAddCustomInterval)
  }
 
  

  // Import/Export
  document.getElementById("exportBackups").addEventListener("click", handleExportBackups)
  document.getElementById("importBackups").addEventListener("click", () => {
    document.getElementById("importFile").click()
  })
  document.getElementById("importFile").addEventListener("change", handleImportBackups)

  // Advanced features
  document.getElementById("compareBackups").addEventListener("click", handleCompareBackups)
  document.getElementById("mergeBackups").addEventListener("click", handleMergeBackups)
  if (document.getElementById("bulkDeleteBackups")) {
    document.getElementById("bulkDeleteBackups").addEventListener("click", handleBulkDeleteBackups)
  }
  document.getElementById("importHistory").addEventListener("click", handleImportHistory)


 

  // Tab navigation - Fix the tab click handler
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", handleTabClick)
  })

    if (currentSettings.soundEnabled !== undefined && document.getElementById("soundToggle")) {
      document.getElementById("soundToggle").checked = !!currentSettings.soundEnabled
    }
    if (currentSettings.lazyRestore !== undefined && document.getElementById("lazyRestoreToggle")) {
      document.getElementById("lazyRestoreToggle").checked = !!currentSettings.lazyRestore
    }
    if (currentSettings.excludedDomains !== undefined && document.getElementById("excludedDomainsInput")) {
      document.getElementById("excludedDomainsInput").value = currentSettings.excludedDomains
    }
    if (currentSettings.autoPruneDays !== undefined && document.getElementById("autoPruneDaysSelect")) {
      document.getElementById("autoPruneDaysSelect").value = currentSettings.autoPruneDays
    }

  if (document.getElementById("excludedDomainsInput")) {
    document.getElementById("excludedDomainsInput").addEventListener("change", (e) => {
      currentSettings.excludedDomains = e.target.value
      browser.runtime.sendMessage({ action: "updateSettings", settings: currentSettings })
      showStatus(getMessage("settingsUpdated"), "success")
    })
  }
  if (document.getElementById("autoPruneDaysSelect")) {
    document.getElementById("autoPruneDaysSelect").addEventListener("change", (e) => {
      currentSettings.autoPruneDays = e.target.value
      browser.runtime.sendMessage({ action: "updateSettings", settings: currentSettings })
      showStatus(getMessage("settingsUpdated"), "success")
    })
  }
  if (document.getElementById("githubTokenInput")) {
    document.getElementById("githubTokenInput").addEventListener("change", (e) => {
      currentSettings.githubToken = e.target.value
      browser.runtime.sendMessage({ action: "updateSettings", settings: currentSettings })
      showStatus(getMessage("settingsUpdated"), "success")
    })
  }
  if (document.getElementById("gistIdInput")) {
    document.getElementById("gistIdInput").addEventListener("change", (e) => {
      currentSettings.gistId = e.target.value
      browser.runtime.sendMessage({ action: "updateSettings", settings: currentSettings })
      showStatus(getMessage("settingsUpdated"), "success")
    })
  }
  if (document.getElementById("pushGistBtn")) {
    document.getElementById("pushGistBtn").addEventListener("click", handlePushGist)
  }
  if (document.getElementById("pullGistBtn")) {
    document.getElementById("pullGistBtn").addEventListener("click", handlePullGist)
  }

  if (document.getElementById("cleanDuplicatesBtn")) {
    document.getElementById("cleanDuplicatesBtn").addEventListener("click", handleCleanDuplicates)
  }
  if (document.getElementById("soundToggle")) {
    document.getElementById("soundToggle").addEventListener("change", (e) => {
      currentSettings.soundEnabled = e.target.checked
      browser.runtime.sendMessage({ action: "updateSettings", settings: currentSettings })
      showStatus(getMessage("settingsUpdated"), "success")
      playRetroSound("click")
    })
  }
  if (document.getElementById("lazyRestoreToggle")) {
    document.getElementById("lazyRestoreToggle").addEventListener("change", (e) => {
      currentSettings.lazyRestore = e.target.checked
      browser.runtime.sendMessage({ action: "updateSettings", settings: currentSettings })
      showStatus(getMessage("settingsUpdated"), "success")
      playRetroSound("click")
    })
  }

  // Event delegation for backup list actions
  document.getElementById("backupList").addEventListener("click", handleBackupListClick)

  // Keyboard shortcut listener inside popup
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
      e.preventDefault()
      const backupsTab = document.getElementById("backupsTab")
      if (backupsTab && !backupsTab.classList.contains("active")) {
        backupsTab.click()
      }
      const searchInput = document.getElementById("searchInput")
      if (searchInput) {
        searchInput.focus()
        searchInput.select()
      }
    }
  })
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
    showStatus(getMessage("settingsUpdated"), "success")
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
    showStatus(getMessage("settingsUpdated"), "success")
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
    showStatus(getMessage("settingsUpdated"), "success")
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

// Handle adding custom backup interval
async function handleAddCustomInterval() {
  const input = document.getElementById("customIntervalInput")
  if (!input) return
  const minutes = Number.parseInt(input.value)

  if (isNaN(minutes) || minutes < 1 || minutes > 1440) {
    showStatus(getMessage("invalidInterval"), "error")
    return
  }

  const seconds = minutes * 60
  const select = document.getElementById("intervalSelect")

  let optionExists = false
  for (let i = 0; i < select.options.length; i++) {
    if (Number.parseInt(select.options[i].value) === seconds) {
      optionExists = true
      break
    }
  }

  if (!optionExists) {
    const opt = document.createElement("option")
    opt.value = seconds
    opt.textContent = minutes >= 60 ? `${(minutes / 60).toFixed(1)} ${getMessage("hours")}` : `${minutes} ${getMessage("minutes")} (${getMessage("custom")})`
    select.appendChild(opt)
  }

  select.value = seconds

  currentSettings.customIntervals = currentSettings.customIntervals || []
  if (!currentSettings.customIntervals.includes(seconds)) {
    currentSettings.customIntervals.push(seconds)
  }
  currentSettings.backupInterval = seconds

  try {
    const response = await browser.runtime.sendMessage({
      action: "updateSettings",
      settings: currentSettings,
    })

    if (response.success) {
      showStatus(getMessage("settingsUpdated"), "success")
      updateAutoBackupStatus()
      input.value = ""
    }
  } catch (error) {
    console.error("Error adding custom interval:", error)
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
  document.body.classList.remove("theme-red", "theme-blue", "theme-green", "theme-purple", "theme-amber", "theme-cyan")

  if (color && color !== "default") {
    document.body.classList.add(`theme-${color}`)
  }
}

// Update auto backup status display
function updateAutoBackupStatus() {
  const statusDiv = document.getElementById("autoBackupStatus")
  if (!statusDiv) return
  const interval = (currentSettings.backupInterval !== undefined && currentSettings.backupInterval !== null) ? Number(currentSettings.backupInterval) : 300

  if (interval === 0) {
    statusDiv.textContent = getMessage("autoBackupDisabled")
  } else {
    const minutes = Math.round(interval / 60)
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
          <label for="backupPinInput" style="color: var(--pixel-red);">🔒 PIN / Password (Optional):</label>
          <input type="password" id="backupPinInput" placeholder="Enter PIN to encrypt (e.g. 1234)" />
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
  const pin = document.getElementById("backupPinInput") ? document.getElementById("backupPinInput").value.trim() : null

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
      notes: notes,
      pin: pin,
    })

    if (response.success) {
      playRetroSound("backup")
      showStatus(getMessage("backupSuccess"), "success")
      await loadBackups() // Refresh the list
      await updateStorageInfo() // Update storage usage
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

        // Apply theme
        applyThemeColor()

        // Render backups
        renderBackups()

        // Update storage info
        await updateStorageInfo()
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
        `<label class="checkbox-item" style="display: flex; align-items: center; gap: 10px; font-family: 'VT323', monospace; font-size: 16px; width: 100%; box-sizing: border-box; background: #121418; border: 2px solid #000; padding: 8px 10px; box-shadow: 2px 2px 0px #000; margin-bottom: 6px;">
      <input type="checkbox" value="${index}" style="width: 18px; height: 18px; accent-color: var(--pixel-accent); flex-shrink: 0;" />
      <span style="color: #fff; word-break: break-word;">${backup.name} - ${formatDate(backup.date, backup.timestamp)} (${backup.windows.reduce((sum, w) => sum + w.tabs.length, 0)} ${getMessage("tabs")})</span>
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
        <p style="margin-top: 0; margin-bottom: 10px; font-family: 'VT323', monospace; font-size: 17px; color: var(--pixel-yellow);">${getMessage("selectBackupsToMerge")}</p>
        <div class="checkbox-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; margin-bottom: 14px; padding-right: 4px;">
          ${backupCheckboxes}
        </div>
        <div class="form-group">
          <label for="mergedBackupName">${getMessage("enterBackupName")}</label>
          <input type="text" id="mergedBackupName" value="Merged Backup - ${formatDate(new Date().toISOString(), Date.now())}" />
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
      showStatus(getMessage("backupSuccess"), "success")
      await loadBackups()
      await updateStorageInfo()
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

    if (response && response.success) {
      const progressBar = document.getElementById("storageProgressBar")
      const details = document.getElementById("storageDetails")

      if (progressBar && response.percentUsed) {
        progressBar.style.width = `${response.percentUsed}%`
      }

    }
  } catch (error) {
    console.error("Error getting storage info:", error)
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
function formatDate(dateInput, timestampInput) {
  try {
    let date
    if (typeof timestampInput === "number" && !isNaN(timestampInput)) {
      date = new Date(timestampInput)
    } else if (typeof dateInput === "number" && !isNaN(dateInput)) {
      date = new Date(dateInput)
    } else if (dateInput) {
      date = new Date(dateInput)
      if (isNaN(date.getTime())) {
        const parts = String(dateInput).match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/)
        if (parts) {
          date = new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6])
        }
      }
    }

    if (!date || isNaN(date.getTime())) {
      return String(dateInput || "N/A")
    }

    const format = currentSettings.dateFormat || "locale"

    switch (format) {
      case "iso":
        return date.toISOString().slice(0, 19).replace("T", " ")
      case "us":
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.toTimeString().slice(0, 8)}`
      case "eu":
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.toTimeString().slice(0, 8)}`
      default:
        return date.toLocaleString(currentLanguage === "tr" ? "tr-TR" : "en-US")
    }
  } catch (error) {
    console.error("Error formatting date:", error)
    return String(dateInput || "")
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

  if (backup.isEncrypted && (!backup.windows || backup.windows.length === 0)) {
    promptPinModal(async (pin) => {
      showStatus("Unlocking encrypted backup...", "loading")
      const response = await browser.runtime.sendMessage({ action: "decryptBackup", backupIndex: index, pin: pin })
      if (response.success) {
        backup.windows = response.windows
        previewBackup(index)
      } else {
        showStatus(response.error || "Invalid PIN / Password", "error")
      }
    })
    return
  }

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
      <div class="window-preview" style="border: 2px solid #000; padding: 8px; margin-bottom: 10px; background: #121418;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <h5 style="margin: 0; font-family: 'Press Start 2P', monospace; font-size: 8px; color: var(--pixel-yellow);">
            ${getMessage("window")} ${windowIndex + 1} (${window.tabs.length} ${getMessage("tabs")})
          </h5>
          <button class="button button-small button-primary restore-single-window-btn" data-backup-index="${index}" data-window-index="${windowIndex}" style="margin:0; font-size: 7px; padding: 4px 6px;">
            ▶ ${getMessage("openThisWindowOnly")}
          </button>
        </div>
        <div class="tabs-list" style="max-height: 120px; overflow-y: auto;">${tabsHtml}</div>
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
          <div class="preview-info" style="margin-bottom: 10px;">
            <p style="margin: 2px 0;"><strong>${getMessage("category")}:</strong> ${backup.category ? getMessage(`categories.${backup.category}`) : "N/A"}</p>
            <p style="margin: 2px 0;"><strong>${getMessage("tags")}:</strong> ${backup.tags ? backup.tags.join(", ") : "None"}</p>
            <p style="margin: 2px 0;"><strong>${getMessage("notes")}:</strong> ${backup.notes || "None"}</p>
          </div>
          <h4>${getMessage("backupContents")}</h4>
          <div class="windows-preview">${windowsHtml}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary modal-copy-md" style="margin-right: auto;">📋 ${getMessage("copyMarkdown")}</button>
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
  const copyMdBtn = dialog.querySelector(".modal-copy-md")

  const closeDialog = () => {
    document.body.removeChild(dialog)
  }

  if (copyMdBtn) {
    copyMdBtn.addEventListener("click", () => {
      copyBackupAsMarkdown(index)
    })
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)
  confirmBtn.addEventListener("click", () => {
    closeDialog()
    restoreBackup(index)
  })

  // Single window restore buttons
  dialog.querySelectorAll(".restore-single-window-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const bIndex = Number.parseInt(e.currentTarget.getAttribute("data-backup-index"))
      const wIndex = Number.parseInt(e.currentTarget.getAttribute("data-window-index"))
      const targetBackup = currentBackups[bIndex]
      if (targetBackup && targetBackup.windows[wIndex]) {
        const selectedTabs = targetBackup.windows[wIndex].tabs.map((_, tIdx) => `${wIndex}-${tIdx}`)
        closeDialog()
        try {
          await browser.runtime.sendMessage({
            action: "selectiveRestore",
            backupIndex: bIndex,
            selectedTabs: selectedTabs,
          })
          showStatus(getMessage("restoreSuccess"), "success")
        } catch (err) {
          showStatus(err.message, "error")
        }
      }
    })
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

  if (backup.isEncrypted && (!backup.windows || backup.windows.length === 0)) {
    promptPinModal(async (pin) => {
      showStatus("Unlocking encrypted backup...", "loading")
      const response = await browser.runtime.sendMessage({ action: "decryptBackup", backupIndex: index, pin: pin })
      if (response.success) {
        backup.windows = response.windows
        selectiveRestore(index)
      } else {
        showStatus(response.error || "Invalid PIN / Password", "error")
      }
    })
    return
  }

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

// Prompt retro pixel PIN modal for encrypted backups
function promptPinModal(onSuccess) {
  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"
  dialog.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 style="color: var(--pixel-red);">🔒 PIN / Password Required</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-family: 'VT323', monospace; font-size: 18px; color: var(--pixel-yellow);">This backup is encrypted. Enter PIN to unlock:</p>
        <div class="form-group">
          <input type="password" id="unlockPinInput" placeholder="Enter PIN (e.g. 1234)" autofocus />
        </div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary modal-cancel">${getMessage("cancelNote")}</button>
        <button class="button button-primary modal-confirm">Unlock</button>
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  const closeBtn = dialog.querySelector(".modal-close")
  const cancelBtn = dialog.querySelector(".modal-cancel")
  const confirmBtn = dialog.querySelector(".modal-confirm")

  const closeDialog = () => {
    if (document.body.contains(dialog)) {
      document.body.removeChild(dialog)
    }
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)

  confirmBtn.addEventListener("click", async () => {
    const pin = document.getElementById("unlockPinInput").value.trim()
    if (!pin) return
    closeDialog()
    onSuccess(pin)
  })

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog()
    }
  })
}

// Push / Pull Gist Event Handlers
async function handlePushGist() {
  try {
    showStatus("Syncing backups to GitHub Gist...", "loading")
    const response = await browser.runtime.sendMessage({ action: "syncToGist" })
    if (response.success) {
      if (response.gistId && document.getElementById("gistIdInput")) {
        document.getElementById("gistIdInput").value = response.gistId
      }
      showStatus(response.message || "Cloud Sync completed successfully!", "success")
    } else {
      showStatus(response.error || "Gist sync failed", "error")
    }
  } catch (err) {
    showStatus(err.message, "error")
  }
}

async function handlePullGist() {
  try {
    showStatus("Pulling backups from GitHub Gist...", "loading")
    const response = await browser.runtime.sendMessage({ action: "syncFromGist" })
    if (response.success) {
      showStatus(response.message || "Cloud Pull completed!", "success")
      await loadBackups()
    } else {
      showStatus(response.error || "Gist pull failed", "error")
    }
  } catch (err) {
    showStatus(err.message, "error")
  }
}

// Reusable custom retro pixel confirmation modal
function showConfirmModal(title, message, confirmBtnText, onConfirm) {
  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"
  dialog.innerHTML = `
    <div class="modal">
      <div class="modal-header" style="background: #121418; border-bottom: 3px solid #000;">
        <h3 style="font-family: 'Press Start 2P', monospace; font-size: 10px; color: var(--pixel-red); margin:0;">${title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body" style="padding: 16px; font-family: 'VT323', monospace; font-size: 18px; line-height: 1.4;">
        <p style="margin: 0; color: var(--text-main);">${message}</p>
      </div>
      <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end; background: #121418; border-top: 3px solid #000; padding: 10px 14px;">
        <button class="button button-secondary modal-cancel">${getMessage("cancelNote")}</button>
        <button class="button button-danger modal-confirm">${confirmBtnText}</button>
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  const closeBtn = dialog.querySelector(".modal-close")
  const cancelBtn = dialog.querySelector(".modal-cancel")
  const confirmBtn = dialog.querySelector(".modal-confirm")

  const closeDialog = () => {
    if (document.body.contains(dialog)) {
      document.body.removeChild(dialog)
    }
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)
  confirmBtn.addEventListener("click", () => {
    closeDialog()
    onConfirm()
  })

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog()
    }
  })
}

// Handle bulk delete backups
function handleBulkDeleteBackups() {
  if (currentBackups.length === 0) {
    showStatus(getMessage("noBackupsFound"), "error")
    return
  }

  showBulkDeleteDialog()
}

// Show bulk delete dialog
function showBulkDeleteDialog() {
  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"

  const backupCheckboxes = currentBackups
    .map(
      (backup, index) =>
        `<label class="checkbox-item" style="display: flex; align-items: center; gap: 10px; font-family: 'VT323', monospace; font-size: 16px; width: 100%; box-sizing: border-box; background: #121418; border: 2px solid #000; padding: 8px 10px; box-shadow: 2px 2px 0px #000; margin-bottom: 6px;">
      <input type="checkbox" value="${index}" class="bulk-delete-cb" style="width: 18px; height: 18px; accent-color: var(--pixel-red); flex-shrink: 0;" />
      <span style="color: #fff; word-break: break-word;">${backup.name} - ${formatDate(backup.date, backup.timestamp)} (${backup.windows.reduce((sum, w) => sum + w.tabs.length, 0)} ${getMessage("tabs")})</span>
    </label>`,
    )
    .join("")

  dialog.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 style="color: var(--pixel-red);">${getMessage("bulkDelete")}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <p style="margin: 0; font-family: 'VT323', monospace; font-size: 17px; color: var(--pixel-yellow);">${getMessage("selectBackupsToDelete")}</p>
          <div style="display: flex; gap: 4px;">
            <button class="button button-small button-secondary select-all-del-btn">${getMessage("selectAll")}</button>
            <button class="button button-small button-secondary select-none-del-btn">${getMessage("selectNone")}</button>
          </div>
        </div>
        <div class="checkbox-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto; margin-bottom: 14px; padding-right: 4px;">
          ${backupCheckboxes}
        </div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary modal-cancel">${getMessage("cancelNote")}</button>
        <button class="button button-danger modal-confirm bulk-delete-confirm-btn" disabled>${getMessage("deleteSelected")} (0)</button>
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  const closeBtn = dialog.querySelector(".modal-close")
  const cancelBtn = dialog.querySelector(".modal-cancel")
  const confirmBtn = dialog.querySelector(".bulk-delete-confirm-btn")
  const selectAllBtn = dialog.querySelector(".select-all-del-btn")
  const selectNoneBtn = dialog.querySelector(".select-none-del-btn")
  const checkboxes = dialog.querySelectorAll(".bulk-delete-cb")

  const updateBulkDeleteCount = () => {
    const checked = dialog.querySelectorAll(".bulk-delete-cb:checked")
    const count = checked.length
    confirmBtn.textContent = `${getMessage("deleteSelected")} (${count})`
    confirmBtn.disabled = count === 0
  }

  checkboxes.forEach((cb) => cb.addEventListener("change", updateBulkDeleteCount))

  selectAllBtn.addEventListener("click", () => {
    checkboxes.forEach((cb) => (cb.checked = true))
    updateBulkDeleteCount()
  })

  selectNoneBtn.addEventListener("click", () => {
    checkboxes.forEach((cb) => (cb.checked = false))
    updateBulkDeleteCount()
  })

  const closeDialog = () => {
    if (document.body.contains(dialog)) {
      document.body.removeChild(dialog)
    }
  }

  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)

  confirmBtn.addEventListener("click", () => {
    const checked = Array.from(dialog.querySelectorAll(".bulk-delete-cb:checked")).map((cb) => Number.parseInt(cb.value))
    if (checked.length === 0) return

    closeDialog()

    const confirmMsg = getMessage("confirmBulkDelete").replace("{count}", checked.length)

    showConfirmModal(
      getMessage("bulkDelete"),
      confirmMsg,
      getMessage("delete"),
      async () => {
        try {
          showStatus("Deleting selected backups...", "loading")
          const response = await browser.runtime.sendMessage({
            action: "deleteMultipleBackups",
            indices: checked,
          })

          if (response.success) {
            showStatus(getMessage("bulkDeleteSuccess"), "success")
            await loadBackups()
            await updateStorageInfo()
          } else {
            showStatus(response.error || "Error deleting backups", "error")
          }
        } catch (error) {
          console.error("Bulk delete error:", error)
          showStatus(error.message, "error")
        }
      }
    )
  })

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog()
    }
  })
}

// Restore specific backup
async function restoreBackup(index) {
  if (isOperationInProgress) return

  showConfirmModal(
    getMessage("restore"),
    getMessage("confirmRestore"),
    getMessage("restore"),
    async () => {
      isOperationInProgress = true
      try {
        showStatus(getMessage("restoringBackup"), "loading")

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
        const button = document.querySelector(`.restore-btn[data-index="${index}"]`)
        if (button) {
          button.classList.remove("loading")
          button.disabled = false
        }
        isOperationInProgress = false
      }
    }
  )
}

// Delete specific backup
async function deleteBackup(index) {
  if (isOperationInProgress) return

  showConfirmModal(
    getMessage("delete"),
    getMessage("confirmDelete"),
    getMessage("delete"),
    async () => {
      isOperationInProgress = true
      try {
        showStatus("Deleting backup...", "loading")

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
          await loadBackups()
          await updateStorageInfo()
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
  )
}

// Get localized message (supports nested dot keys like categories.personal)
function getMessage(key) {
  if (!key) return ""

  const getNestedValue = (obj, path) => {
    if (!obj) return null
    if (obj[path] !== undefined) return obj[path]
    const parts = path.split(".")
    let current = obj
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part]
      } else {
        return null
      }
    }
    return typeof current === "string" ? current : null
  }

  const langMsg = getNestedValue(messages[currentLanguage], key)
  if (langMsg) return langMsg

  const enMsg = getNestedValue(messages.en, key)
  if (enMsg) return enMsg

  return key
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

  if (totalBackupsHeader) {
    totalBackupsHeader.textContent = currentBackups.length
  }
}

// 8-Bit Web Audio Synth Retro Sound Effects
function playRetroSound(type) {
  if (!currentSettings || currentSettings.soundEnabled === false) return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime

    if (type === "backup") {
      osc.type = "square"
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.setValueAtTime(554.37, now + 0.05)
      osc.frequency.setValueAtTime(659.25, now + 0.1)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.25)
    } else if (type === "restore") {
      osc.type = "sawtooth"
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.25)
    } else if (type === "delete") {
      osc.type = "square"
      osc.frequency.setValueAtTime(700, now)
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.15)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc.start(now)
      osc.stop(now + 0.15)
    } else if (type === "click") {
      osc.type = "sine"
      osc.frequency.setValueAtTime(600, now)
      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
      osc.start(now)
      osc.stop(now + 0.05)
    }
  } catch (e) {
    // Audio Context suppressed or unsupported
  }
}

// Copy backup as Markdown Reading List
async function copyBackupAsMarkdown(index) {
  const backup = currentBackups[index]
  if (!backup) return

  let md = `# ${backup.name || "TabSaver Backup"} - ${backup.date || ""}\n\n`
  let tabCount = 0

  for (let w = 0; w < (backup.windows || []).length; w++) {
    const win = backup.windows[w]
    md += `## ${getMessage("window")} ${w + 1}\n`
    for (const tab of win.tabs || []) {
      const title = (tab.title || tab.url || "Untitled").replace(/[\[\]]/g, "")
      md += `- [${title}](${tab.url})\n`
      tabCount++
    }
    md += `\n`
  }

  try {
    await navigator.clipboard.writeText(md)
    playRetroSound("click")
    const msg = getMessage("copiedToClipboard") || `${tabCount} tabs copied as Markdown!`
    showStatus(msg, "success")
  } catch (err) {
    showStatus(err.message, "error")
  }
}

// Clean Duplicate Tabs Handler
async function handleCleanDuplicates() {
  try {
    showStatus("Scanning duplicate open tabs...", "loading")
    const response = await browser.runtime.sendMessage({ action: "cleanDuplicateTabs" })
    if (response.success) {
      playRetroSound("delete")
      const template = getMessage("cleanedDuplicates") || "Closed {count} duplicate tabs!"
      showStatus(template.replace("{count}", response.closedCount), "success")
    } else {
      showStatus(response.error || "Failed to clean duplicates", "error")
    }
  } catch (err) {
    showStatus(err.message, "error")
  }
}

// Make functions globally available
window.renderBackupList = renderFilteredBackups
window.showStatus = showStatus
window.updateHeaderStats = updateHeaderStats
