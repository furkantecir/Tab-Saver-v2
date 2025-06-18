# Firefox Tab Backup Extension

A powerful and modern Firefox extension for backing up, managing, and restoring your browser tabs with advanced features and an intuitive interface.


## 🚀 Features

### Core Functionality
- **One-Click Backup** - Save all your open tabs instantly
- **Smart Restore** - Restore individual tabs or entire backup sessions
- **Bulk Operations** - Select and manage multiple tabs at once
- **Session Management** - Organize backups by categories and add custom notes

### Advanced Search & Discovery
- **Intelligent Search** - Find tabs by title, URL, or content
- **Advanced Filters** - Filter by date range, domain, backup status, and more
- **Quick Access** - Recent searches and frequently accessed tabs


### Backup Management
- **Health Monitoring** - Visual indicators for backup integrity
- **Automatic Validation** - Detect and fix corrupted backups
- **Cleanup Tools** - Remove duplicates and optimize storage
- **Analytics Dashboard** - Detailed statistics and insights

### User Experience
- **Multi-Language Support** - Available in English and Turkish
- **Modern UI** - Clean, responsive design with dark/light themes
- **Performance Optimized** - Fast loading and minimal memory usage

## 📦 Installation

### From Firefox Add-ons Store
1. Visit the [Firefox Add-ons page](https://addons.mozilla.org) (coming soon)
2. Click "Add to Firefox"
3. Confirm the installation

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extension directory

## 🎯 Usage

### Basic Operations

#### Creating a Backup
1. Click the extension icon in the toolbar
2. Click "Backup Now" button
3. Add optional category and notes
4. Your tabs are saved instantly

#### Restoring Tabs
1. Open the extension popup
2. Navigate to the "Restore" tab
3. Browse your saved backups
4. Click individual tabs to restore or use "Restore All"

#### Managing Backups
1. Go to the "Manage" tab
2. View backup health indicators
3. Use search and filters to find specific backups
4. Rename, categorize, or delete backups as needed

### Advanced Features

#### Search & Filters
- Use the search bar to find tabs by title or URL
- Click the gear icon for advanced filtering options
- Filter by date range, domain, or backup status
- Save frequently used search queries

#### Analytics Dashboard
- View backup statistics and trends
- Monitor storage usage
- Track most visited domains
- Analyze browsing patterns


## 🛠️ Technical Details

### Built With
- **Manifest V3** - Latest Firefox extension standard
- **Vanilla JavaScript** - No external dependencies
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Web Extensions API** - Cross-browser compatibility

### File Structure
\`\`\`
firefox-tab-backup/
├── manifest.json              # Extension manifest
├── popup.html                 # Main popup interface
├── popup.js                   # Core functionality
├── background.js              # Background script
├── enhanced-search.js         # Search functionality
├── backup-management.js       # Backup operations
├── styles/
│   ├── enhanced-ui.css       # Main styles
│   └── globals.css           # Global styles
├── _locales/
│   ├── en/messages.json      # English translations
│   └── tr/messages.json      # Turkish translations
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
\`\`\`

### Permissions
- `tabs` - Access to browser tabs
- `storage` - Local data storage
- `activeTab` - Current tab information

## 🌐 Localization

Currently supported languages:
- **English** (en)
- **Turkish** (tr)

### Adding New Languages
1. Create a new folder in `_locales/` with the language code
2. Copy `en/messages.json` to the new folder
3. Translate all message values
4. Update the language selector in `popup.js`


## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Clone your fork locally
3. Load the extension in Firefox developer mode
4. Make your changes and test thoroughly
5. Submit a pull request

### Contribution Guidelines
- Follow the existing code style
- Add comments for complex functionality
- Test all features before submitting
- Update documentation as needed

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include Firefox version and OS information
- Attach screenshots if relevant

## 📝 Changelog

### Version 2.0.0 (Latest)
- ✨ Enhanced search with advanced filters
- 🎨 Modern UI redesign with improved UX
- 📊 Analytics dashboard
- 🔧 Backup validation and cleanup tools
- 🌍 Multi-language support
- ⚡ Performance optimizations

### Version 1.0.0
- 🚀 Initial release
- 💾 Basic backup and restore functionality
- 📁 Simple tab management
- 🎯 Core extension features

## 🗺️ Roadmap

### Upcoming Features
- [ ] Cloud sync integration
- [ ] Backup scheduling
- [ ] Tab grouping support
- [ ] Import/export functionality
- [ ] Browser sync compatibility
- [ ] Mobile companion app

### Long-term Goals
- [ ] AI-powered tab organization
- [ ] Cross-browser compatibility
- [ ] Team collaboration features
- [ ] Advanced analytics
- [ ] Plugin ecosystem



**Made with ❤️ for the Firefox community**

⭐ If you find this extension helpful, please consider giving it a star on GitHub!
