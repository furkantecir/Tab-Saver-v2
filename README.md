<div align="center">
  <img src="icons/logo.svg" width="96" height="96" alt="TabSaver Logo">
  <h1>TabSaver v3.0.0</h1>
  <p><b>Retro Pixel Arcade Edition</b></p>
  
  <p>
    A high-performance, retro 8-bit pixel themed WebExtension (Firefox & Chrome Manifest V3) for tab saving, auto-backups, cross-device sync, and RAM management.
    <br>
    <i>Sekme yedekleme, otomatik yedekleme, cihazlar arası eşitleme ve RAM koruma özelliklerine sahip retro 8-bit piksel temalı modern web eklentisi.</i>
  </p>
</div>

---

## 🖼️ Ekran Görüntüleri / Screenshots

| | |
| :---: | :---: |
| <img src="screenshots/Screenshot_1.png" width="400" alt="TabSaver Screen 1"> | <img src="screenshots/Screenshot_2.png" width="400" alt="TabSaver Screen 2"> |
| <img src="screenshots/Screenshot_3.png" width="400" alt="TabSaver Screen 3"> | <img src="screenshots/Screenshot_4.png" width="400" alt="TabSaver Screen 4"> |

---

## 🌟 Ana Özellikler / Key Features

### 👾 Retro Pixel Arcade Tasarım & Sesler
- **Piksel Tasarım Sistemi**: Google Fonts (`Press Start 2P`, `VT323`) ve 16x16 özel piksel SVG ikonlar.
- **6 Canlı Renk Paleti**: Klasik Yeşil Arcade, Çim Kırmızı, Retro Siber Mavi, Synth 16-Bit Mor, GameBoy Amber, Matris Siyan.
- **🎵 8-Bit Web Audio Chiptune Efektleri**: Yedek alma, geri yükleme, silme ve tıklamalar için kod tabanlı sentezlenen nostaljik sesler.
- **Koyu & Açık Mod**: Retro Kağıt Açık Mod ve Chiptune Arcade Koyu Mod.

### 🚀 Süper Güç Özellikleri / Power Utilities
- **⚡ Sekme Bellek Tasarrufu (RAM Saver / Lazy Restore)**: Geri yüklenen sekmeleri askıda (`discarded: true`) açarak RAM kullanımını ve donmaları engeller.
- **🧹 Mükerrer Sekme Temizleyici (Duplicate Tab Cleaner)**: Tüm pencerelerdeki aynı açık URL sekmelerini tek tıkla tarar ve temizler.
- **🔒 PIN Korumalı Şifreli Kasa**: Hassas yedekleri parola/PIN ile şifreleme (`simpleEncrypt` / `simpleDecrypt`).
- **🧠 Akıllı Otomatik Kategorileme**: Sekmeleri alan adlarına göre otomatik olarak İş, Eğlence, Alışveriş, Araştırma, Eğitim, Kişisel kategorilerine ayırır.
- **📌 Domain Kara Listesi (Blacklist)**: Belirtilen domainleri (`localhost`, `127.0.0.1` vb.) yedeklerden otomatik hariç tutar.
- **🕒 Otomatik Eski Yedek Temizliği (Auto-Prune)**: 7 ila 90 gün arasındaki eski yedekleri otomatik temizler.
- **☁️ GitHub Gist Bulut Eşitleme**: GitHub PAT tokenı ile cihazlar arası yedek aktarımı.
- **📋 Markdown Okuma Listesi Kopyalama**: Yedeği tek tıkla okuma listesi formatında (`[Başlık](URL)`) panoya kopyalama.
- **🪟 Tek Pencere Restorasyonu & Toplu Silme**: Yedeğin sadece istenen penceresini açma veya çoklu yedek silme.

---

## 🌐 6 Desteklenen Dil / Supported Languages

- 🇹🇷 **Türkçe**
- 🇬🇧 **English**
- 🇰🇷 **한국어 (Korean)**
- 🇨🇳 **中文 (Chinese)**
- 🇷🇺 **Русский (Russian)**
- 🇦🇪 **العربية (Arabic - Native RTL)**

---

## 📦 Kurulum / Installation

### 🦊 Firefox
1. Firefox'u açın ve `about:debugging#/setup` adresine gidin.
2. Sol menüden **"Bu Firefox" (This Firefox)** seçeneğine tıklayın.
3. **"Geçici Eklenti Yükle..." (Load Temporary Add-on...)** butonuna basın.
4. Klasördeki `manifest.json` dosyasını seçin.

### 🌐 Chrome / Edge / Brave
1. Tarayıcınızda `chrome://extensions` adresine gidin.
2. Sağ üstteki **Geliştirici Modu (Developer mode)** anahtarını açın.
3. **"Paketlenmemiş Öğe Yükle" (Load unpacked)** butonuna tıklayın.
4. Proje klasörünü seçin.

---

## 📁 Proje Yapısı / Directory Structure

```text
├── manifest.json         # Extension Manifest V3 konfigürasyonu
├── background.js         # Service worker, zamanlayıcılar, bulut senkronizasyonu
├── popup.html            # Ana popup arayüzü
├── popup.js              # Arayüz mantığı, 8-bit ses sentezleyici, 6-dilli sözlük
├── icons/                # 8-bit retro floppy disk SVG logosu ve ikonlar
├── _locales/             # Dil paketleri (en, tr, ko, zh, ru, ar)
├── screenshots/          # Ekran görüntüleri (2x2 Izgara)
└── README.md             # Proje dokümantasyonu
```

---

## 📄 Lisans / License

MIT License.
