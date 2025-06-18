// Advanced backup management functionality

class BackupManager {
  constructor() {
    this.healthScores = new Map()
    this.validationResults = new Map()
  }

  async init() {
    this.setupEventListeners()
    await this.calculateHealthScores()
  }

  setupEventListeners() {
    // Validation
    const validateBtn = document.getElementById("validateBackups")
    if (validateBtn) {
      validateBtn.addEventListener("click", () => this.validateAllBackups())
    }

    // Cleanup
    const cleanupBtn = document.getElementById("cleanupBackups")
    if (cleanupBtn) {
      cleanupBtn.addEventListener("click", () => this.showCleanupDialog())
    }

    // Repair
    const repairBtn = document.getElementById("repairBackups")
    if (repairBtn) {
      repairBtn.addEventListener("click", () => this.repairBackups())
    }

    // Optimize
    const optimizeBtn = document.getElementById("optimizeStorage")
    if (optimizeBtn) {
      optimizeBtn.addEventListener("click", () => this.optimizeStorage())
    }
  }

  async validateAllBackups() {
    if (window.showStatus) {
      window.showStatus("Validating backups...", "info")
    }

    try {
      const backups = window.currentBackups || []
      let healthyCount = 0
      let warningCount = 0
      let corruptedCount = 0

      for (const backup of backups) {
        const health = this.validateBackup(backup)
        this.validationResults.set(backup.id, health)

        switch (health.status) {
          case "excellent":
          case "good":
            healthyCount++
            break
          case "warning":
            warningCount++
            break
          case "poor":
            corruptedCount++
            break
        }
      }

      // Update analytics
      this.updateHealthAnalytics(healthyCount, warningCount, corruptedCount)

      if (window.showStatus) {
        window.showStatus(
          `Validation complete: ${healthyCount} healthy, ${warningCount} warnings, ${corruptedCount} corrupted`,
          "success",
        )
      }

      // Re-render backup list to show health indicators
      if (window.renderBackupList) {
        window.renderBackupList()
      }
    } catch (error) {
      console.error("Validation error:", error)
      if (window.showStatus) {
        window.showStatus("Validation failed: " + error.message, "error")
      }
    }
  }

  validateBackup(backup) {
    const issues = []
    let score = 100

    // Check required fields
    if (!backup.name || backup.name.trim() === "") {
      issues.push("Missing backup name")
      score -= 10
    }

    if (!backup.timestamp) {
      issues.push("Missing timestamp")
      score -= 15
    }

    if (!backup.windows || !Array.isArray(backup.windows)) {
      issues.push("Invalid windows data")
      score -= 30
    } else {
      // Check windows
      backup.windows.forEach((window, windowIndex) => {
        if (!window.tabs || !Array.isArray(window.tabs)) {
          issues.push(`Window ${windowIndex + 1}: Invalid tabs data`)
          score -= 20
        } else {
          // Check tabs
          window.tabs.forEach((tab, tabIndex) => {
            if (!tab.url) {
              issues.push(`Window ${windowIndex + 1}, Tab ${tabIndex + 1}: Missing URL`)
              score -= 5
            } else {
              try {
                new URL(tab.url)
              } catch {
                if (
                  !tab.url.startsWith("about:") &&
                  !tab.url.startsWith("chrome:") &&
                  !tab.url.startsWith("moz-extension:")
                ) {
                  issues.push(`Window ${windowIndex + 1}, Tab ${tabIndex + 1}: Invalid URL`)
                  score -= 3
                }
              }
            }

            if (!tab.title) {
              issues.push(`Window ${windowIndex + 1}, Tab ${tabIndex + 1}: Missing title`)
              score -= 2
            }
          })
        }
      })
    }

    // Check for empty backup
    const totalTabs = backup.windows ? backup.windows.reduce((sum, w) => sum + (w.tabs ? w.tabs.length : 0), 0) : 0
    if (totalTabs === 0) {
      issues.push("Backup contains no tabs")
      score -= 50
    }

    // Determine status
    let status
    if (score >= 90) status = "excellent"
    else if (score >= 70) status = "good"
    else if (score >= 50) status = "warning"
    else status = "poor"

    return {
      status,
      score,
      issues,
      tabCount: totalTabs,
      windowCount: backup.windows ? backup.windows.length : 0,
    }
  }

  async calculateHealthScores() {
    const backups = window.currentBackups || []

    for (const backup of backups) {
      const health = this.validateBackup(backup)
      this.healthScores.set(backup.id, health)
    }

    this.updateOverallHealth()
  }

  updateOverallHealth() {
    const scores = Array.from(this.healthScores.values())

    if (scores.length === 0) return

    const averageScore = scores.reduce((sum, health) => sum + health.score, 0) / scores.length
    let overallHealth = "Good"

    if (averageScore >= 90) overallHealth = "Excellent"
    else if (averageScore >= 70) overallHealth = "Good"
    else if (averageScore >= 50) overallHealth = "Warning"
    else overallHealth = "Poor"

    // Update header display
    const healthHeader = document.getElementById("overallHealthHeader")
    if (healthHeader) {
      healthHeader.textContent = overallHealth
      healthHeader.className = `stat-value health-${overallHealth.toLowerCase()}`
    }
  }

  updateHealthAnalytics(healthy, warning, corrupted) {
    const healthyElement = document.getElementById("healthyBackups")
    const warningElement = document.getElementById("warningBackups")
    const corruptedElement = document.getElementById("corruptedBackups")

    if (healthyElement) healthyElement.textContent = healthy
    if (warningElement) warningElement.textContent = warning
    if (corruptedElement) corruptedElement.textContent = corrupted
  }

  getBackupHealth(backupId) {
    return (
      this.healthScores.get(backupId) ||
      this.validationResults.get(backupId) || {
        status: "unknown",
        score: 0,
        issues: [],
        tabCount: 0,
        windowCount: 0,
      }
    )
  }

  showCleanupDialog() {
    const dialog = document.createElement("div")
    dialog.className = "modal-overlay"
    dialog.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">🧹 Cleanup Backups</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" id="cleanupOld" checked>
              Remove backups older than <input type="number" id="cleanupDays" value="30" min="1" max="365" style="width: 60px; margin: 0 4px;"> days
            </label>
          </div>
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" id="cleanupDuplicates" checked>
              Remove duplicate backups (same content, different timestamps)
            </label>
          </div>
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" id="cleanupEmpty">
              Remove empty backups (no tabs)
            </label>
          </div>
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" id="cleanupCorrupted">
              Remove corrupted backups (validation score < 50)
            </label>
          </div>
          <div id="cleanupPreview" class="text-muted" style="font-size: 12px; margin-top: 12px;">
            Click "Preview" to see what will be removed
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cleanupPreviewBtn">👁️ Preview</button>
          <button class="btn btn-secondary modal-cancel">Cancel</button>
          <button class="btn btn-danger" id="cleanupConfirmBtn">🗑️ Cleanup</button>
        </div>
      </div>
    `
    document.body.appendChild(dialog)

    // Event listeners
    const closeBtn = dialog.querySelector(".modal-close")
    const cancelBtn = dialog.querySelector(".modal-cancel")
    const previewBtn = dialog.querySelector("#cleanupPreviewBtn")
    const confirmBtn = dialog.querySelector("#cleanupConfirmBtn")

    const closeDialog = () => document.body.removeChild(dialog)

    closeBtn.addEventListener("click", closeDialog)
    cancelBtn.addEventListener("click", closeDialog)
    previewBtn.addEventListener("click", () => this.previewCleanup(dialog))
    confirmBtn.addEventListener("click", () => this.performCleanup(dialog))

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) closeDialog()
    })
  }

  previewCleanup(dialog) {
    const options = this.getCleanupOptions(dialog)
    const toRemove = this.identifyBackupsToRemove(options)

    const previewElement = dialog.querySelector("#cleanupPreview")
    if (toRemove.length === 0) {
      previewElement.innerHTML = "✅ No backups match the cleanup criteria"
      previewElement.style.color = "var(--success-color)"
    } else {
      previewElement.innerHTML = `
        ⚠️ ${toRemove.length} backups will be removed:<br>
        ${toRemove.map((backup) => `• ${backup.name} (${backup.reason})`).join("<br>")}
      `
      previewElement.style.color = "var(--warning-color)"
    }
  }

  getCleanupOptions(dialog) {
    return {
      removeOld: dialog.querySelector("#cleanupOld").checked,
      oldDays: Number.parseInt(dialog.querySelector("#cleanupDays").value),
      removeDuplicates: dialog.querySelector("#cleanupDuplicates").checked,
      removeEmpty: dialog.querySelector("#cleanupEmpty").checked,
      removeCorrupted: dialog.querySelector("#cleanupCorrupted").checked,
    }
  }

  identifyBackupsToRemove(options) {
    const backups = window.currentBackups || []
    const toRemove = []
    const now = Date.now()

    for (const backup of backups) {
      const reasons = []

      // Check age
      if (options.removeOld) {
        const age = (now - backup.timestamp) / (1000 * 60 * 60 * 24)
        if (age > options.oldDays) {
          reasons.push(`older than ${options.oldDays} days`)
        }
      }

      // Check if empty
      if (options.removeEmpty) {
        const totalTabs = backup.windows.reduce((sum, w) => sum + w.tabs.length, 0)
        if (totalTabs === 0) {
          reasons.push("empty")
        }
      }

      // Check if corrupted
      if (options.removeCorrupted) {
        const health = this.getBackupHealth(backup.id)
        if (health.score < 50) {
          reasons.push("corrupted")
        }
      }

      if (reasons.length > 0) {
        toRemove.push({
          ...backup,
          reason: reasons.join(", "),
        })
      }
    }

    // Check for duplicates
    if (options.removeDuplicates) {
      const duplicates = this.findDuplicateBackups(backups)
      for (const duplicate of duplicates) {
        if (!toRemove.find((b) => b.id === duplicate.id)) {
          toRemove.push({
            ...duplicate,
            reason: "duplicate",
          })
        }
      }
    }

    return toRemove
  }

  findDuplicateBackups(backups) {
    const duplicates = []
    const seen = new Map()

    for (const backup of backups) {
      const signature = this.createBackupSignature(backup)

      if (seen.has(signature)) {
        const existing = seen.get(signature)
        // Keep the newer backup, mark older as duplicate
        if (backup.timestamp > existing.timestamp) {
          duplicates.push(existing)
          seen.set(signature, backup)
        } else {
          duplicates.push(backup)
        }
      } else {
        seen.set(signature, backup)
      }
    }

    return duplicates
  }

  createBackupSignature(backup) {
    // Create a signature based on tab URLs and titles
    const tabData = backup.windows
      .flatMap((window) => window.tabs.map((tab) => `${tab.url}|${tab.title}`))
      .sort()
      .join("||")

    return btoa(tabData).slice(0, 32) // Use base64 hash for comparison
  }

  async performCleanup(dialog) {
    const options = this.getCleanupOptions(dialog)
    const toRemove = this.identifyBackupsToRemove(options)

    if (toRemove.length === 0) {
      if (window.showStatus) {
        window.showStatus("No backups to cleanup", "info")
      }
      document.body.removeChild(dialog)
      return
    }

    const confirmed = confirm(
      `Are you sure you want to remove ${toRemove.length} backups? This action cannot be undone.`,
    )
    if (!confirmed) return

    try {
      if (window.showStatus) {
        window.showStatus("Cleaning up backups...", "info")
      }

      // Remove backups
      for (const backup of toRemove) {
        const index = window.currentBackups.findIndex((b) => b.id === backup.id)
        if (index !== -1) {
          await window.browser.runtime.sendMessage({
            action: "deleteBackup",
            backupIndex: index,
          })
        }
      }

      // Refresh data
      await window.loadBackups()
      await window.updateStorageInfo()
      await window.loadAnalytics()

      if (window.showStatus) {
        window.showStatus(`Cleanup complete: ${toRemove.length} backups removed`, "success")
      }

      document.body.removeChild(dialog)
    } catch (error) {
      console.error("Cleanup error:", error)
      if (window.showStatus) {
        window.showStatus("Cleanup failed: " + error.message, "error")
      }
    }
  }

  async repairBackups() {
    if (window.showStatus) {
      window.showStatus("Repairing backups...", "info")
    }

    try {
      const backups = window.currentBackups || []
      let repairedCount = 0

      for (const backup of backups) {
        const health = this.getBackupHealth(backup.id)

        if (health.score < 90) {
          const repaired = this.repairBackup(backup)
          if (repaired) {
            repairedCount++
            // Update the backup
            const response = await window.browser.runtime.sendMessage({
              action: "updateBackup",
              backup: backup,
            })
          }
        }
      }

      if (window.showStatus) {
        window.showStatus(`Repair complete: ${repairedCount} backups repaired`, "success")
      }

      // Refresh validation
      await this.validateAllBackups()
    } catch (error) {
      console.error("Repair error:", error)
      if (window.showStatus) {
        window.showStatus("Repair failed: " + error.message, "error")
      }
    }
  }

  repairBackup(backup) {
    let repaired = false

    // Fix missing name
    if (!backup.name || backup.name.trim() === "") {
      backup.name = `Backup ${new Date(backup.timestamp).toLocaleString()}`
      repaired = true
    }

    // Fix missing timestamp
    if (!backup.timestamp) {
      backup.timestamp = Date.now()
      repaired = true
    }

    // Fix missing category
    if (!backup.category) {
      backup.category = "other"
      repaired = true
    }

    // Fix missing tags
    if (!backup.tags) {
      backup.tags = []
      repaired = true
    }

    // Fix windows structure
    if (!backup.windows || !Array.isArray(backup.windows)) {
      backup.windows = []
      repaired = true
    }

    // Fix tabs in windows
    backup.windows.forEach((window) => {
      if (!window.tabs || !Array.isArray(window.tabs)) {
        window.tabs = []
        repaired = true
      }

      window.tabs = window.tabs.filter((tab) => {
        // Remove tabs with invalid URLs
        if (!tab.url) return false

        // Fix missing titles
        if (!tab.title) {
          tab.title = tab.url
          repaired = true
        }

        return true
      })
    })

    // Remove empty windows
    backup.windows = backup.windows.filter((window) => window.tabs.length > 0)

    return repaired
  }

  async optimizeStorage() {
    if (window.showStatus) {
      window.showStatus("Optimizing storage...", "info")
    }

    try {
      const response = await window.browser.runtime.sendMessage({
        action: "optimizeStorage",
      })

      if (response.success) {
        await window.updateStorageInfo()
        if (window.showStatus) {
          window.showStatus(`Storage optimized: ${response.savedSpace || 0} MB saved`, "success")
        }
      } else {
        throw new Error(response.error || "Optimization failed")
      }
    } catch (error) {
      console.error("Optimization error:", error)
      if (window.showStatus) {
        window.showStatus("Optimization failed: " + error.message, "error")
      }
    }
  }
}

// Initialize backup manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.backupManager = new BackupManager()
  window.backupManager.init()
})
