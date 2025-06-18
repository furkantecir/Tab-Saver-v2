// Enhanced search and filtering functionality

class EnhancedSearch {
  constructor() {
    this.currentFilters = {
      query: "",
      category: "all",
      dateFrom: "",
      dateTo: "",
      minTabs: "",
      maxTabs: "",
      domain: "",
      tags: "",
    }
    this.savedSearches = []
    this.searchHistory = []
    this.debounceTimer = null
  }

  async init() {
    await this.loadSavedSearches()
    this.setupEventListeners()
    this.renderSavedSearches()
  }

  setupEventListeners() {
    // Main search input
    const searchInput = document.getElementById("searchInputMain")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.handleSearch(e))
      searchInput.addEventListener("keydown", (e) => this.handleSearchKeydown(e))
    }

    // Advanced search toggle
    const searchToggle = document.getElementById("searchToggle")
    if (searchToggle) {
      searchToggle.addEventListener("click", () => this.toggleAdvancedSearch())
    }

    // Filter inputs
    const filterInputs = document.querySelectorAll(".filter-input")
    filterInputs.forEach((input) => {
      input.addEventListener("input", (e) => this.handleFilterChange(e))
      input.addEventListener("change", (e) => this.handleFilterChange(e))
    })

    // Action buttons
    const saveSearchBtn = document.getElementById("saveSearchBtn")
    if (saveSearchBtn) {
      saveSearchBtn.addEventListener("click", () => this.saveCurrentSearch())
    }

    const clearFiltersBtn = document.getElementById("clearFiltersBtn")
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => this.clearAllFilters())
    }
  }

  handleSearch(event) {
    this.currentFilters.query = event.target.value.toLowerCase()
    this.debounceSearch()
  }

  handleSearchKeydown(event) {
    if (event.key === "Enter") {
      this.addToSearchHistory(this.currentFilters.query)
    }
  }

  handleFilterChange(event) {
    const filterName = event.target.dataset.filter
    this.currentFilters[filterName] = event.target.value
    this.debounceSearch()
  }

  debounceSearch() {
    clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => {
      this.performSearch()
    }, 300)
  }

  performSearch() {
    if (window.currentBackups) {
      const filteredBackups = this.filterBackups(window.currentBackups)
      this.updateSearchResults(filteredBackups)
      this.updateSearchStats(filteredBackups)
    }
  }

  filterBackups(backups) {
    return backups.filter((backup) => {
      // Text search across multiple fields
      if (this.currentFilters.query) {
        const searchText = this.currentFilters.query
        const searchableText = [
          backup.name,
          backup.notes || "",
          ...(backup.tags || []),
          ...backup.windows.flatMap((w) => w.tabs.map((t) => `${t.title} ${t.url}`)),
        ]
          .join(" ")
          .toLowerCase()

        if (!searchableText.includes(searchText)) {
          return false
        }
      }

      // Category filter
      if (this.currentFilters.category !== "all" && backup.category !== this.currentFilters.category) {
        return false
      }

      // Date range filters
      if (this.currentFilters.dateFrom) {
        const backupDate = new Date(backup.timestamp)
        const fromDate = new Date(this.currentFilters.dateFrom)
        if (backupDate < fromDate) return false
      }

      if (this.currentFilters.dateTo) {
        const backupDate = new Date(backup.timestamp)
        const toDate = new Date(this.currentFilters.dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (backupDate > toDate) return false
      }

      // Tab count filters
      const totalTabs = backup.windows.reduce((sum, window) => sum + window.tabs.length, 0)

      if (this.currentFilters.minTabs && totalTabs < Number.parseInt(this.currentFilters.minTabs)) {
        return false
      }

      if (this.currentFilters.maxTabs && totalTabs > Number.parseInt(this.currentFilters.maxTabs)) {
        return false
      }

      // Domain filter
      if (this.currentFilters.domain) {
        const domain = this.currentFilters.domain.toLowerCase()
        const hasDomain = backup.windows.some((window) =>
          window.tabs.some((tab) => {
            try {
              const url = new URL(tab.url)
              return url.hostname.includes(domain)
            } catch {
              return tab.url.toLowerCase().includes(domain)
            }
          }),
        )
        if (!hasDomain) return false
      }

      return true
    })
  }

  updateSearchResults(filteredBackups) {
    window.filteredBackups = filteredBackups
    if (window.renderBackupList) {
      window.renderBackupList()
    }
  }

  updateSearchStats(filteredBackups) {
    const statsElement = document.getElementById("searchStats")
    if (statsElement) {
      const totalTabs = filteredBackups.reduce(
        (sum, backup) => sum + backup.windows.reduce((wSum, window) => wSum + window.tabs.length, 0),
        0,
      )
      statsElement.textContent = `${filteredBackups.length} backups, ${totalTabs} tabs`
    }
  }

  toggleAdvancedSearch() {
    const advancedFilters = document.getElementById("advancedFilters")
    const searchContainer = document.getElementById("searchContainer")

    if (advancedFilters.classList.contains("show")) {
      advancedFilters.classList.remove("show")
      searchContainer.classList.remove("expanded")
    } else {
      advancedFilters.classList.add("show")
      searchContainer.classList.add("expanded")
    }
  }

  async saveCurrentSearch() {
    const hasActiveFilters = Object.values(this.currentFilters).some((value) => value && value !== "all")

    if (!hasActiveFilters) {
      if (window.showStatus) {
        window.showStatus("No active filters to save", "error")
      }
      return
    }

    const name = prompt("Enter a name for this search:")
    if (!name) return

    const savedSearch = {
      id: Date.now().toString(),
      name: name.trim(),
      filters: { ...this.currentFilters },
      createdAt: Date.now(),
    }

    this.savedSearches.push(savedSearch)
    await this.saveSavedSearches()
    this.renderSavedSearches()

    if (window.showStatus) {
      window.showStatus("Search saved successfully!", "success")
    }
  }

  async loadSavedSearch(searchId) {
    const savedSearch = this.savedSearches.find((search) => search.id === searchId)
    if (!savedSearch) return

    this.currentFilters = { ...savedSearch.filters }
    this.updateFilterInputs()
    this.performSearch()

    if (window.showStatus) {
      window.showStatus(`Applied search: ${savedSearch.name}`, "success")
    }
  }

  updateFilterInputs() {
    Object.entries(this.currentFilters).forEach(([key, value]) => {
      const input = document.querySelector(`[data-filter="${key}"]`)
      if (input) {
        input.value = value
      }
    })

    // Update main search input
    const mainSearch = document.getElementById("searchInputMain")
    if (mainSearch) {
      mainSearch.value = this.currentFilters.query
    }
  }

  async deleteSavedSearch(searchId) {
    this.savedSearches = this.savedSearches.filter((search) => search.id !== searchId)
    await this.saveSavedSearches()
    this.renderSavedSearches()

    if (window.showStatus) {
      window.showStatus("Search deleted", "success")
    }
  }

  renderSavedSearches() {
    const container = document.getElementById("savedSearches")
    if (!container) return

    if (this.savedSearches.length === 0) {
      container.innerHTML = '<p class="text-muted" style="font-size: 12px;">No saved searches</p>'
      return
    }

    container.innerHTML = `
      <div class="filter-label mb-1">Saved Searches</div>
      ${this.savedSearches
        .map(
          (search) => `
        <div class="saved-search-item" onclick="window.enhancedSearch.loadSavedSearch('${search.id}')">
          <span>${search.name}</span>
          <button class="saved-search-remove" onclick="event.stopPropagation(); window.enhancedSearch.deleteSavedSearch('${search.id}')" title="Delete search">
            ×
          </button>
        </div>
      `,
        )
        .join("")}
    `
  }

  clearAllFilters() {
    this.currentFilters = {
      query: "",
      category: "all",
      dateFrom: "",
      dateTo: "",
      minTabs: "",
      maxTabs: "",
      domain: "",
      tags: "",
    }

    this.updateFilterInputs()
    this.performSearch()

    if (window.showStatus) {
      window.showStatus("Filters cleared", "success")
    }
  }

  addToSearchHistory(query) {
    if (!query || this.searchHistory.includes(query)) return

    this.searchHistory.unshift(query)
    if (this.searchHistory.length > 10) {
      this.searchHistory = this.searchHistory.slice(0, 10)
    }

    this.saveSearchHistory()
  }

  async loadSavedSearches() {
    try {
      if (window.browser) {
        const result = await window.browser.storage.local.get("savedSearches")
        this.savedSearches = result.savedSearches || []
      }
    } catch (error) {
      console.error("Error loading saved searches:", error)
    }
  }

  async saveSavedSearches() {
    try {
      if (window.browser) {
        await window.browser.storage.local.set({ savedSearches: this.savedSearches })
      }
    } catch (error) {
      console.error("Error saving searches:", error)
    }
  }

  async saveSearchHistory() {
    try {
      if (window.browser) {
        await window.browser.storage.local.set({ searchHistory: this.searchHistory })
      }
    } catch (error) {
      console.error("Error saving search history:", error)
    }
  }
}

// Initialize enhanced search when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.enhancedSearch = new EnhancedSearch()
  window.enhancedSearch.init()
})
