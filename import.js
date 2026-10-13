const api = typeof globalThis.browser !== "undefined" ? globalThis.browser : globalThis.chrome

const I18N = {
  en: {
    title: "Import Backups",
    desc: "Select the .json file you exported earlier.",
    choose: "Choose file",
    noFile: "No file selected",
    importBtn: "Import",
    importing: "Importing...",
    success: "{count} backups imported (total: {total}).",
    invalid: "Invalid backup file!",
    failed: "Import failed",
    backHint: "Done! Your backups are now in the extension.",
    back: "Back to extension",
  },
  tr: {
    title: "Yedekleri İçe Aktar",
    desc: "Daha önce dışa aktardığın .json dosyasını seç.",
    choose: "Dosya seç",
    noFile: "Dosya seçilmedi",
    importBtn: "İçe Aktar",
    importing: "İçe aktarılıyor...",
    success: "{count} yedek içe aktarıldı (toplam: {total}).",
    invalid: "Geçersiz yedek dosyası!",
    failed: "İçe aktarma başarısız",
    backHint: "Tamam! Yedeklerin artık eklentide.",
    back: "Eklentiye dön",
  },
  ko: {
    title: "백업 가져오기",
    desc: "이전에 내보낸 .json 파일을 선택하세요.",
    choose: "파일 선택",
    noFile: "선택된 파일 없음",
    importBtn: "가져오기",
    importing: "가져오는 중...",
    success: "백업 {count}개를 가져왔습니다 (총: {total}).",
    invalid: "잘못된 백업 파일입니다!",
    failed: "가져오기 실패",
    backHint: "완료! 백업이 확장 프로그램에 추가되었습니다.",
    back: "확장 프로그램으로 돌아가기",
  },
  zh: {
    title: "导入备份",
    desc: "请选择之前导出的 .json 文件。",
    choose: "选择文件",
    noFile: "未选择文件",
    importBtn: "导入",
    importing: "正在导入...",
    success: "已导入 {count} 个备份（共 {total} 个）。",
    invalid: "无效的备份文件！",
    failed: "导入失败",
    backHint: "完成！备份已添加到扩展程序中。",
    back: "返回扩展程序",
  },
  ru: {
    title: "Импорт резервных копий",
    desc: "Выберите ранее экспортированный файл .json.",
    choose: "Выбрать файл",
    noFile: "Файл не выбран",
    importBtn: "Импорт",
    importing: "Импорт...",
    success: "Импортировано копий: {count} (всего: {total}).",
    invalid: "Неверный файл резервной копии!",
    failed: "Ошибка импорта",
    backHint: "Готово! Ваши копии теперь в расширении.",
    back: "Вернуться в расширение",
  },
  ar: {
    title: "استيراد النسخ الاحتياطية",
    desc: "اختر ملف .json الذي قمت بتصديره سابقاً.",
    choose: "اختيار ملف",
    noFile: "لم يتم اختيار ملف",
    importBtn: "استيراد",
    importing: "جارٍ الاستيراد...",
    success: "تم استيراد {count} نسخة (الإجمالي: {total}).",
    invalid: "ملف النسخة الاحتياطية غير صالح!",
    failed: "فشل الاستيراد",
    backHint: "تم! أصبحت نسخك الاحتياطية في الإضافة.",
    back: "العودة إلى الإضافة",
  },
}

let lang = "en"
const t = (key) => (I18N[lang] && I18N[lang][key]) || I18N.en[key]

const $ = (id) => document.getElementById(id)
const fileInput = $("importFile")
const importBtn = $("importBtn")
const statusEl = $("status")

function setStatus(text, cls) {
  statusEl.textContent = text
  statusEl.className = `status show ${cls}`
}

function applyTexts() {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  document.title = `TabSaver - ${t("title")}`
  $("title").textContent = t("title")
  $("desc").textContent = t("desc")
  $("chooseBtn").textContent = t("choose")
  importBtn.textContent = t("importBtn")
  $("backHint").textContent = t("backHint")
  $("backBtn").textContent = t("back")
  $("fileName").textContent = fileInput.files[0] ? fileInput.files[0].name : t("noFile")
}

async function init() {
  try {
    const stored = await api.storage.local.get(["language", "tabBackupSettings"])
    if (stored.language && I18N[stored.language]) lang = stored.language
    const settings = stored.tabBackupSettings || {}
    if (settings.darkMode) document.body.classList.add("dark-mode")
    if (settings.themeColor && settings.themeColor !== "default") {
      document.body.classList.add(`theme-${settings.themeColor}`)
    }
  } catch (e) {
    console.error("Failed to load settings", e)
  }
  applyTexts()
}

$("chooseBtn").addEventListener("click", () => fileInput.click())

fileInput.addEventListener("change", () => {
  importBtn.disabled = !fileInput.files[0]
  $("fileName").textContent = fileInput.files[0] ? fileInput.files[0].name : t("noFile")
})

importBtn.addEventListener("click", async () => {
  const file = fileInput.files[0]
  if (!file) return
  importBtn.disabled = true
  setStatus(t("importing"), "info")
  try {
    const text = await file.text()
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      throw new Error(t("invalid"))
    }
    if (!data.version || !Array.isArray(data.backups)) {
      throw new Error(t("invalid"))
    }
    const response = await api.runtime.sendMessage({ action: "importBackups", jsonData: text })
    if (response && response.success) {
      setStatus(
        t("success").replace("{count}", response.newBackupsCount).replace("{total}", response.totalBackups),
        "success",
      )
      $("backSection").classList.add("show")
    } else {
      setStatus((response && response.error) || t("failed"), "error")
    }
  } catch (e) {
    setStatus(e.message || t("failed"), "error")
  } finally {
    importBtn.disabled = !fileInput.files[0]
  }
})

$("backBtn").addEventListener("click", async () => {
  // Try to reopen the popup (needs a user gesture), then close this tab
  try {
    const action = api.action || api.browserAction
    if (action && action.openPopup) await action.openPopup()
  } catch (e) {
    console.warn("openPopup not available", e)
  }
  try {
    const tab = await api.tabs.getCurrent()
    if (tab) await api.tabs.remove(tab.id)
  } catch (e) {
    window.close()
  }
})

init()
