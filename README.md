# RetroSleuth: Case Files Detective

**Rasakan atmosfer detektif retro di dalam browser Anda.**  
Interogasi tersangka bertenaga AI, periksa barang bukti, dan pecahkan misteri pembunuhan dalam lingkungan komputer tahun 1970‑an yang autentik.

![Platform](https://img.shields.io/badge/platform-web-brightgreen) ![Tech](https://img.shields.io/badge/tech-vanilla_JS_ES6-yellow) ![Status](https://img.shields.io/badge/status-production%20ready-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Daftar Isi

1. [Deskripsi](#deskripsi)
2. [Fitur Utama](#fitur-utama)
3. [Tangkapan Layar](#tangkapan-layar)
4. [Persyaratan Sistem](#persyaratan-sistem)
5. [Instalasi](#instalasi)
6. [Cara Bermain](#cara-bermain)
7. [Struktur Proyek](#struktur-proyek)
8. [Membuat Kasus Baru (Modding)](#membuat-kasus-baru-modding)
9. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
10. [Berkontribusi](#berkontribusi)
11. [Lisensi](#lisensi)
12. [Kontak](#kontak)

---

## Deskripsi

**RetroSleuth: Case Files Detective** adalah permainan investigasi kriminal naratif yang berjalan sepenuhnya di peramban web. Game ini meniru pengalaman menggunakan komputer detektif era 1970‑an/80‑an, lengkap dengan efek layar CRT hijau, jendela retro, dan suara mekanik.

Alih-alih dialog pohon yang kaku, pemain dapat **mengetik pertanyaan bebas** untuk menginterogasi tersangka yang ditenagai oleh **AI lokal**. Setiap karakter AI memiliki kepribadian, rahasia, dan emosi—mereka dapat berbohong, marah, atau akhirnya mengaku jika dihadapkan dengan bukti yang tepat.

Game dirancang sepenuhnya **data-driven**; seluruh konten kasus disimpan dalam file JSON dan Markdown. Komunitas dapat membuat dan membagikan kasus baru tanpa perlu menyentuh kode inti.

---

## Fitur Utama

- 🕵️ **Interogasi AI Open-ended** – Ketik pertanyaan bebas, AI merespons sesuai karakter, emosi, dan bukti yang ditemukan.
- 🖥️ **Estetika CRT Autentik** – Efek monitor tabung, scanlines, flicker, dan palet monokrom fosfor.
- 📁 **Manajer Berkas Retro** – Jelajahi bukti dalam File Manager bergaya Windows Explorer klasik.
- 🧠 **AI Karakter Dinamis** – Tersangka memiliki Trust, Stress, Fear, dan Anger yang berubah berdasarkan interaksi.
- 📝 **Catatan & Objectives** – Tulis catatan detektif, lacak tugas investigasi.
- ⚖️ **Formulir Tuduhan** – Ajukan tuduhan dengan memilih pelaku, motif, dan bukti pendukung.
- 💾 **Simpan & Muat Progres** – Data disimpan otomatis ke IndexedDB, bisa diekspor/impor.
- 📱 **Responsif** – Dapat dimainkan di desktop maupun perangkat seluler.
- 🔧 **Modding-friendly** – Kasus baru hanya perlu folder JSON + Markdown.

---

## Tangkapan Layar

> _Tambahkan tangkapan layar game di sini (desktop, interogasi, file manager)._

---

## Persyaratan Sistem

- **Browser modern**: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+.
- **Koneksi lokal** ke server AI (opsional, hanya untuk interogasi).
- Tidak perlu instalasi runtime lain; game berjalan statis.

---

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/RetroSleuth.git
cd RetroSleuth
```

### 2. Jalankan Server Web Lokal

Buka `index.html` langsung di browser, atau gunakan server statis sederhana:

```bash
# Python 3
python -m http.server 8000
# atau Node
npx serve .
```

Buka `http://localhost:8000` di browser.

### 3. Menjalankan AI Server (Interogasi)

Interogasi menggunakan LLM lokal melalui `gemini-cli`. Pastikan Anda sudah menginstalnya:

```bash
npm install -g @google/gemini-cli
gemini-cli serve --model gemini-cli --host 0.0.0.0 --port 20128 --cors
```

Setelah server berjalan, buka game dan atur endpoint AI di jendela **Settings** (default `http://localhost:20128/v1/chat/completions`).

> **Catatan Mixed Content:**  
> Jika game diakses melalui GitHub Pages (HTTPS), browser akan memblokir koneksi ke localhost (HTTP). Izinkan konten tidak aman di site settings, atau gunakan tunnel HTTPS seperti ngrok:  
> `ngrok http 20128` → salin URL HTTPS ke pengaturan game.

---

## Cara Bermain

1. **Boot & Pilih Kasus** – Setelah animasi boot, buka **Case Files** untuk memilih kasus yang tersedia.
2. **Baca Briefing** – Buka dokumen briefing untuk mendapatkan gambaran awal.
3. **Periksa Bukti** – Buka **File Manager** untuk melihat bukti yang sudah ditemukan. Bukti baru akan terbuka seiring investigasi.
4. **Interogasi Tersangka** – Buka **Interrogation**, pilih karakter, dan ketik pertanyaan. Gunakan tombol **Sodorkan Bukti** untuk mengonfrontasi dengan bukti spesifik.
5. **Catat & Analisis** – Gunakan **Notes** untuk mencatat petunjuk, dan **Objectives** untuk melacak tugas.
6. **Ajukan Tuduhan** – Jika sudah yakin, buka **Accusation Form**, pilih pelaku, motif, dan bukti pendukung.
7. **Verdict** – Sistem akan mengecek apakah tuduhan Anda benar.

---

## Struktur Proyek

```
/
├── index.html                     # Entry point
├── assets/
│   ├── css/                       # Stylesheet (CRT, windows, terminal, dll.)
│   ├── js/
│   │   ├── main.js                # Orchestrator
│   │   ├── app.js
│   │   ├── core/                  # GameState, EventBus
│   │   ├── engine/                # CaseLoader, EvidenceEngine, dll.
│   │   ├── ai/                    # AIClient, PromptBuilder
│   │   ├── ui/                    # WindowManager, Taskbar, Desktop
│   │   ├── modules/               # InterrogationRoom, CaseHub, EvidenceFileManager
│   │   └── utils/                 # DatabaseManager, Markdown, Audio
│   ├── audio/
│   └── images/
├── cases/
│   ├── index.json                 # Daftar semua kasus
│   └── case_001_wisma_angker/     # Contoh kasus
│       ├── case.json              # Manifest & solusi
│       ├── briefing.md            # Narasi pembuka
│       ├── solution.md
│       ├── characters/            # Data karakter (JSON)
│       └── evidence/              # Bukti (Markdown)
└── docs/                          # Dokumentasi tambahan
```

---

## Membuat Kasus Baru (Modding)

1. Buat folder baru di `cases/`, misal `case_002_pantai_berlian`.
2. Salin struktur dari kasus yang sudah ada.
3. Isi file-file berikut:
   - `case.json`: metadata, victim, evidence_registry, characters, solution_matrix, objectives.
   - `briefing.md`: narasi awal.
   - `solution.md`: penjelasan solusi (opsional).
   - `characters/*.json`: profil dan kepribadian tiap tersangka.
   - `evidence/*.md`: konten bukti dalam Markdown.
4. Tambahkan entri kasus di `cases/index.json`.
5. Game akan otomatis mendeteksi kasus baru! 🎉

Lihat [Modding Guide](docs/MODDING_GUIDE.md) untuk panduan lengkap.

---

## Teknologi yang Digunakan

- **Vanilla HTML5, CSS3, JavaScript ES6 Modules** – tanpa framework frontend.
- **`marked`** – Markdown parsing.
- **`idb`** – IndexedDB wrapper untuk penyimpanan progres.
- **Google Gemini CLI** – LLM lokal untuk interogasi AI.
- **GitHub Pages** – deployment statis.

---

## Berkontribusi

Kontribusi sangat diterima! Baik itu perbaikan bug, penambahan fitur, atau pembuatan kasus baru.

1. Fork repositori.
2. Buat branch fitur (`git checkout -b fitur/NamaFitur`).
3. Commit perubahan (`git commit -m 'Menambahkan fitur X'`).
4. Push ke branch (`git push origin fitur/NamaFitur`).
5. Buka Pull Request.

Lihat [Panduan Kontribusi](CONTRIBUTING.md) untuk detail lebih lanjut.

---

## Lisensi

Proyek ini dilisensikan di bawah lisensi MIT. Lihat [LICENSE](LICENSE) untuk informasi lengkap.

---

## Kontak

Dibuat dengan ❤️ oleh [Tim RetroSleuth](https://github.com/username/RetroSleuth).  
Untuk pertanyaan, saran, atau diskusi, silakan buka Issue di repositori GitHub.

---
