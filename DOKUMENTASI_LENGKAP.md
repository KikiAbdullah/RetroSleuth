# DOKUMENTASI LENGKAP — RetroSleuth: Case Files Detective

Dokumen ini menjelaskan **seluruh aplikasi** secara detail: arsitektur, tech stack, alur kerja, dan penjelasan setiap file beserta isinya.

---

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Tech Stack](#2-tech-stack)
3. [Arsitektur Aplikasi](#3-arsitektur-aplikasi)
4. [Struktur Direktori Lengkap](#4-struktur-direktori-lengkap)
5. [Alur Kerja Aplikasi (End-to-End)](#5-alur-kerja-aplikasi-end-to-end)
6. [Penjelasan Setiap File](#6-penjelasan-setiap-file)
   - [Entry Point & Konfigurasi](#61-entry-point--konfigurasi)
   - [CSS Stylesheets](#62-css-stylesheets)
   - [Core (Inti)](#63-core-inti)
   - [Engine (Mesin Game)](#64-engine-mesin-game)
   - [AI (Kecerdasan Buatan)](#65-ai-kecerdasan-buatan)
   - [UI (Antarmuka)](#66-ui-antarmuka)
   - [Modules (Modul Fitur)](#67-modules-modul-fitur)
   - [Utils (Utilitas)](#68-utils-utilitas)
   - [Data Kasus](#69-data-kasus)
   - [Dokumentasi](#610-dokumentasi)
7. [Sistem Interogasi AI](#7-sistem-interogasi-ai)
8. [Sistem Penyimpanan Data](#8-sistem-penyimpanan-data)
9. [Sistem Crime Scene](#9-sistem-crime-scene)
10. [Cara Menambah Kasus Baru](#10-cara-menambah-kasus-baru)

---

## 1. Gambaran Umum

**RetroSleuth: Case Files Detective** adalah game investigasi kriminal naratif berbasis web yang meniru pengalaman menggunakan komputer detektif era 1970-an/80-an. Pemain menyelidiki kasus pembunuhan dengan:

- Membaca briefing dan bukti dalam format dokumen retro
- Menjelajahi TKP (crime scene) secara interaktif
- Menginterogasi tersangka menggunakan **AI lokal** (mengetik pertanyaan bebas)
- Mengumpulkan bukti dan membuat tuduhan

Seluruh UI menggunakan estetika monitor CRT hijau dengan efek scanline, flicker, dan font monospace VT323.

Game ini **sepenuhnya data-driven** — semua konten kasus disimpan dalam file JSON dan Markdown, sehingga siapa pun bisa membuat kasus baru tanpa mengubah kode.

---

## 2. Tech Stack

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| Frontend | Vanilla HTML5, CSS3, JavaScript ES6 Modules | Zero framework, tanpa build step |
| Markdown Parser | `marked.js` | Dimuat dinamis dari CDN |
| Penyimpanan | IndexedDB via `idb` library (CDN) | Dengan fallback/migrasi dari localStorage |
| AI Backend | LLM lokal via `gemini-cli` | Endpoint: `http://localhost:20128/v1/chat/completions` (format OpenAI-compatible) |
| Font | Google Fonts VT323 | Font monospace retro |
| Audio | Web Audio API | Suara dihasilkan dari oscillator, tanpa file audio eksternal |
| Deployment | Static files | GitHub Pages compatible, zero build step |

---

## 3. Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────┐
│                    index.html                        │
│              (Entry Point + CSS Loading)             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                    main.js                           │
│         (Bootstrapper + Boot Sequence)               │
└──────┬──────┬───────┬───────┬───────┬───────────────┘
       │      │       │       │       │
       ▼      ▼       ▼       ▼       ▼
   ┌──────┐┌──────┐┌───────┐┌─────┐┌───────┐
   │ Core ││  UI  ││Engine ││ AI  ││Modules│
   └──┬───┘└──┬───┘└──┬────┘└──┬──┘└──┬────┘
      │       │       │        │      │
      ▼       ▼       ▼        ▼      ▼
   EventBus ←──── Komunikasi antar semua modul ────→
   Store    ←──── State management + persistence  ──→
```

**Pola komunikasi:** Semua modul berkomunikasi melalui `EventBus` (pub/sub pattern). State terpusat di `Store` (GameState) yang di-persist ke IndexedDB.

---

## 4. Struktur Direktori Lengkap

```
unsolved-case-ai/
├── .gitignore
├── index.html
├── README.md
├── PRD_indo.md
│
├── assets/
│   ├── audio/                          # (kosong — audio via Web Audio API)
│   │
│   ├── css/
│   │   ├── variables.css
│   │   ├── reset.css
│   │   ├── crt.css
│   │   ├── desktop.css
│   │   ├── windows.css
│   │   ├── taskbar.css
│   │   ├── evidence.css
│   │   ├── evidencefm.css
│   │   ├── interrogation.css
│   │   ├── notes.css
│   │   ├── casehub.css
│   │   ├── crimescene.css
│   │   ├── objectives.css
│   │   └── responsive.css
│   │
│   ├── images/
│   │   ├── desktop_icons/              # (kosong — ikon pakai emoji)
│   │   └── logo/
│   │       └── logo.png
│   │
│   └── js/
│       ├── main.js
│       │
│       ├── core/
│       │   ├── EventBus.js
│       │   └── Store.js
│       │
│       ├── engine/
│       │   ├── CaseLoader.js
│       │   ├── EvidenceEngine.js
│       │   ├── SolutionEngine.js
│       │   └── TimelineEngine.js
│       │
│       ├── ai/
│       │   ├── AIClient.js
│       │   ├── PromptBuilder.js
│       │   ├── TrustSystem.js
│       │   └── FallbackMode.js
│       │
│       ├── ui/
│       │   ├── WindowManager.js
│       │   ├── DesktopManager.js
│       │   └── Taskbar.js
│       │
│       ├── modules/
│       │   ├── AccusationForm.js
│       │   ├── CaseBriefing.js
│       │   ├── CaseHub.js
│       │   ├── CharacterDossier.js
│       │   ├── CrimeSceneViewer.js
│       │   ├── EvidenceFileManager.js
│       │   ├── EvidenceViewer.js
│       │   ├── InterrogationRoom.js
│       │   ├── NotesApp.js
│       │   ├── ObjectivesTracker.js
│       │   └── SettingsWindow.js
│       │
│       └── utils/
│           ├── AudioManager.js
│           ├── DatabaseManager.js
│           ├── Markdown.js
│           ├── Storage.js
│           └── Typewriter.js
│
├── cases/
│   ├── index.json
│   └── case_001_wisma_angker/
│       ├── case.json
│       ├── briefing.md
│       ├── solution.md
│       ├── characters/
│       │   ├── rahmat.json
│       │   ├── sari.json
│       │   └── budi.json
│       ├── evidence/
│       │   ├── laporan_otopsi.md
│       │   ├── buku_besar.md
│       │   ├── log_keamanan.md
│       │   ├── surat_ancaman.md
│       │   └── laporan_saksi.md
│       └── images/                     # (kosong — placeholder)
│
└── docs/
    ├── CONTENT_GUIDE.md
    └── MODDING_GUIDE.md
```

---

## 5. Alur Kerja Aplikasi (End-to-End)

### 5.1 Boot Sequence

1. Browser memuat `index.html` → memuat 14 file CSS + Google Font VT323
2. `main.js` dieksekusi sebagai ES Module pada event `DOMContentLoaded`
3. Migrasi data dari localStorage ke IndexedDB (jika ada data lama)
4. Inisialisasi semua komponen: `WindowManager`, `DesktopManager`, `Taskbar`, dan seluruh modul
5. Animasi boot sequence ditampilkan (terminal window dengan efek typewriter)
6. Auto-load kasus pertama dari `cases/index.json`

### 5.2 Case Loading

1. `CaseLoader.loadFullCase()` dipanggil
2. Fetch paralel: `index.json` → `case.json` → semua `evidence/*.md` → semua `characters/*.json`
3. Event `case:loaded` di-emit melalui `EventBus`
4. Semua modul bereaksi:
   - `CaseHub` menampilkan dashboard kasus
   - `CharacterDossier` mengisi kartu karakter
   - `EvidenceEngine` mendaftarkan semua bukti
   - `SolutionEngine` menyimpan matriks solusi
   - `TimelineEngine` menyimpan data timeline

### 5.3 Investigation Loop

1. **Baca Briefing** → `CaseHub` membuka briefing → membuka bukti awal (`laporan_otopsi`)
2. **Jelajahi TKP** → `CrimeSceneViewer` menampilkan 5 area interaktif → klik objek untuk menemukan bukti/petunjuk
3. **Periksa Bukti** → `EvidenceFileManager` menampilkan bukti dalam UI Windows Explorer
4. **Interogasi Tersangka** → `InterrogationRoom` membuka chat AI → ketik pertanyaan → AI merespons sesuai karakter
5. **Catat & Lacak** → `NotesApp` untuk catatan bebas, `ObjectivesTracker` untuk checklist tugas
6. **Ajukan Tuduhan** → `AccusationForm` → pilih pelaku + motif + bukti → `SolutionEngine` validasi

### 5.4 Verdict

- Jika benar: Event `case:solved` di-emit, epilog ditampilkan dengan "KASUS TERPECAHKAN!"
- Jika salah: Sistem memberikan hint berdasarkan apa yang kurang (bukti, motif, atau pelaku)

---

## 6. Penjelasan Setiap File

### 6.1 Entry Point & Konfigurasi

#### `index.html`
- **Fungsi:** Single-page entry point aplikasi
- **Isi:**
  - Memuat 14 file CSS (variables, reset, crt, desktop, windows, taskbar, evidence, evidencefm, interrogation, notes, casehub, crimescene, objectives, responsive)
  - Memuat Google Font VT323 (monospace retro)
  - Berisi div `#crt-overlay` untuk efek CRT scanline
  - Berisi div `#desktop` sebagai area kerja utama
  - Berisi `<footer>` sebagai taskbar di bawah
  - Memuat `main.js` sebagai ES module (`type="module"`)

#### `.gitignore`
- **Fungsi:** Mengatur file yang diabaikan Git
- **Isi:** `node_modules/`, `.DS_Store`, `.env`, `dist/`, `build/`, `*.log`

#### `PRD_indo.md`
- **Fungsi:** Product Requirements Document lengkap (1801 baris)
- **Isi:** Spesifikasi teknis menyeluruh: fitur, arsitektur, format data, aturan AI, wireframe, acceptance criteria

---

### 6.2 CSS Stylesheets

#### `assets/css/variables.css`
- **Fungsi:** Mendefinisikan CSS custom properties (variabel) global
- **Isi:** Warna tema (hijau fosfor CRT), ukuran font, variabel animasi CRT, spacing, z-index

#### `assets/css/reset.css`
- **Fungsi:** CSS reset dasar
- **Isi:** `box-sizing: border-box`, reset margin/padding untuk body/html, font default VT323

#### `assets/css/crt.css`
- **Fungsi:** Efek visual monitor CRT
- **Isi:**
  - Overlay scanline (garis horizontal semi-transparan)
  - Animasi flicker (kedipan layar)
  - Class `.crt-off` untuk menonaktifkan efek CRT

#### `assets/css/desktop.css`
- **Fungsi:** Layout desktop utama
- **Isi:** Flexbox column wrap untuk ikon desktop, styling ikon (emoji + label), efek hover dan select

#### `assets/css/windows.css`
- **Fungsi:** Styling jendela retro
- **Isi:**
  - Class `.retro-window` — border, shadow, background
  - `.window-header` — title bar dengan tombol minimize/maximize/close
  - `.window-body` — area konten
  - `.terminal` — styling terminal khusus

#### `assets/css/taskbar.css`
- **Fungsi:** Taskbar di bagian bawah layar
- **Isi:** Fixed bottom bar, tombol START, area window buttons, clock tray di kanan

#### `assets/css/evidence.css`
- **Fungsi:** Styling Evidence Viewer (grid)
- **Isi:** Grid kartu bukti, state locked (gembok) vs unlocked, animasi hover

#### `assets/css/evidencefm.css`
- **Fungsi:** Styling Evidence File Manager (explorer-style)
- **Isi:** Sidebar folder, address bar, file pane, ikon file, breadcrumb navigation

#### `assets/css/interrogation.css`
- **Fungsi:** Styling ruang interogasi
- **Isi:** Chat bubbles (hijau untuk user, hitam/hijau untuk AI), emotion bars, input area, loading spinner, evidence strip

#### `assets/css/notes.css`
- **Fungsi:** Styling notepad
- **Isi:** Textarea kuning bergaya kertas, font monospace, styling form tuduhan

#### `assets/css/casehub.css`
- **Fungsi:** Styling hub pemilihan kasus
- **Isi:** Daftar kasus (kartu klikable), panel info kasus, tombol aksi

#### `assets/css/crimescene.css`
- **Fungsi:** Styling crime scene viewer (1042 baris — file CSS terbesar)
- **Isi:**
  - Layout area TKP (sidebar + panel utama)
  - Objek interaktif (hover, click states)
  - Progress bar per area
  - Animasi penemuan bukti (flash, highlight)
  - Panel notifikasi dan log
  - Keyboard shortcut hints

#### `assets/css/objectives.css`
- **Fungsi:** Styling objectives tracker
- **Isi:** Checkbox retro, daftar tugas dengan hint, status completed

#### `assets/css/responsive.css`
- **Fungsi:** Responsive design untuk mobile
- **Isi:** Media query pada breakpoint 768px — jendela fullscreen, ikon lebih besar, taskbar simplified

---

### 6.3 Core (Inti)

#### `assets/js/core/EventBus.js`
- **Fungsi:** Sistem pub/sub (publish/subscribe) untuk komunikasi antar modul
- **Export:** `eventBus` (singleton)
- **Method utama:**
  - `on(event, callback)` — Mendaftarkan listener
  - `off(event, callback)` — Menghapus listener
  - `emit(event, data)` — Mengirim event ke semua listener
- **Event penting yang digunakan:**
  - `case:loaded` — Kasus selesai dimuat
  - `case:solved` — Kasus terpecahkan
  - `case:select` — Pemain memilih kasus
  - `evidence:unlocked` — Bukti baru terbuka
  - `interrogation:start` — Memulai interogasi
  - `desktop:open` — Ikon desktop diklik ganda
  - `window:opened`, `window:closed`, `window:minimized` — Event jendela

#### `assets/js/core/Store.js`
- **Fungsi:** State management terpusat + persistensi ke IndexedDB
- **Export:** `gameState` (singleton)
- **State yang disimpan:**
  - `currentCaseId` — ID kasus aktif
  - `discoveredEvidence[]` — Array ID bukti yang sudah ditemukan
  - `chatHistories{}` — Riwayat chat per tersangka (object keyed by suspectId)
  - `interrogationStates{}` — State emosi tiap tersangka (trust, stress, fear, anger)
  - `notes` — Catatan pemain (string)
  - `accusationAttempts` — Jumlah percobaan tuduhan
  - `caseStatus` — Status kasus (investigating/solved)
  - `completedObjectives[]` — Daftar objective yang sudah selesai
- **Method utama:**
  - `setCase(caseId)` — Set kasus aktif
  - `addEvidence(evidenceId)` — Tambah bukti ke discovered
  - `getChatHistory(suspectId)` — Ambil riwayat chat
  - `addChatMessage(suspectId, role, content)` — Simpan pesan chat
  - `updateInterrogationState(suspectId, deltas)` — Update emosi tersangka
  - `markObjective(objectiveId)` — Tandai objective selesai
  - `save()` — Persist state ke IndexedDB

---

### 6.4 Engine (Mesin Game)

#### `assets/js/engine/CaseLoader.js`
- **Fungsi:** Memuat seluruh data kasus dari file JSON dan Markdown
- **Export:** `CaseLoader` class
- **Cara kerja:**
  1. Fetch `cases/index.json` untuk daftar kasus
  2. Fetch `cases/<caseId>/case.json` untuk manifest kasus
  3. Fetch paralel semua `characters/*.json` dan `evidence/*.md`
  4. Gabungkan semua data menjadi satu objek kasus lengkap
  5. Emit event `case:loaded` dengan data lengkap
- **Method utama:**
  - `loadCaseList()` — Memuat daftar kasus dari index.json
  - `loadFullCase(caseId)` — Memuat kasus lengkap (manifest + karakter + bukti)

#### `assets/js/engine/EvidenceEngine.js`
- **Fungsi:** Registry dan manajemen bukti
- **Export:** `evidenceEngine` (singleton)
- **Cara kerja:**
  - Menyimpan semua bukti dalam `Map` (keyed by evidence ID)
  - Mendengarkan event `case:loaded` untuk mengisi registry
  - Delegasi unlock ke `gameState.addEvidence()`
- **Method utama:**
  - `registerEvidence(evidenceList)` — Mendaftarkan bukti dari case.json
  - `unlockEvidence(evidenceId)` — Membuka bukti (menandai sebagai discovered)
  - `getEvidence(evidenceId)` — Mengambil data bukti
  - `getDiscoveredEvidence()` — Mendapatkan semua bukti yang sudah ditemukan

#### `assets/js/engine/SolutionEngine.js`
- **Fungsi:** Validasi tuduhan pemain terhadap solusi yang benar
- **Export:** `solutionEngine` (singleton)
- **Cara kerja:**
  - Menyimpan `solution_matrix` dari case.json
  - Mengecek: pelaku benar? bukti utama benar? semua bukti sekunder ada?
  - Memberikan hint jika salah (apa yang kurang)
  - Emit `case:solved` jika benar
- **Data solusi (case 001):**
  - Pelaku: Sari (istri)
  - Motif: Warisan + balas dendam
  - Bukti utama: `laporan_otopsi`
  - Bukti sekunder: `buku_besar`, `log_keamanan`, `surat_ancaman`, `resep_racun`
- **Method utama:**
  - `checkAccusation({ culprit, motive, primaryEvidence, secondaryEvidence })` — Validasi tuduhan, return `{ correct, hints[] }`

#### `assets/js/engine/TimelineEngine.js`
- **Fungsi:** Merender timeline kronologis dari data kasus
- **Export:** `TimelineEngine` class
- **Cara kerja:**
  - Membaca array `manifest.timeline[]` dari case.json
  - Merender timeline vertikal dengan marker waktu dan deskripsi
  - Ditampilkan dalam window retro

---

### 6.5 AI (Kecerdasan Buatan)

#### `assets/js/ai/AIClient.js`
- **Fungsi:** HTTP client untuk berkomunikasi dengan LLM server
- **Export:** `aiClient` (singleton)
- **Cara kerja:**
  1. Membangun system prompt via `PromptBuilder`
  2. Membatasi riwayat chat ke 8 pesan terakhir (agar tidak melebihi context window)
  3. Mengirim POST request ke endpoint LLM (format OpenAI-compatible)
  4. Parameter: `temperature: 0.8`
  5. Menyimpan respons AI ke `gameState`
  6. Memanggil `TrustSystem` untuk menghitung perubahan emosi
- **Konfigurasi default:**
  - Endpoint: `http://localhost:20128/v1/chat/completions`
  - API Key: `sk-d9da44a505179175-7im48b-73d30919`
  - Model: sesuai server
- **Method utama:**
  - `sendMessage(suspectId, userMessage, presentedEvidenceId)` — Kirim pesan ke AI, return respons
  - `checkHealth()` — Cek apakah server AI aktif

#### `assets/js/ai/PromptBuilder.js`
- **Fungsi:** Membangun system prompt dalam Bahasa Indonesia untuk setiap tersangka
- **Export:** `PromptBuilder` class
- **System prompt berisi:**
  - Identitas karakter (nama, umur, pekerjaan)
  - Kepribadian dan sifat
  - Alibi yang diklaim
  - Fakta yang diketahui karakter
  - Rahasia (dipotong hingga 60 karakter agar tidak bocor langsung)
  - State emosi saat ini (persentase trust/stress/fear/anger)
  - Daftar bukti yang sudah ditemukan pemain
  - Aturan respons (harus in-character, bahasa Indonesia, tidak boleh langsung mengaku)
  - Jika ada `presentedEvidenceId`: instruksi khusus konfrontasi bukti

#### `assets/js/ai/TrustSystem.js`
- **Fungsi:** Sistem kalkulasi perubahan emosi berbasis aturan (rule-based)
- **Export:** `trustSystem` (singleton)
- **Cara kerja:**
  - Menganalisis kata kunci dalam pesan user:
    - "bukti", "tahu", "mengaku" → meningkatkan stress & fear
    - "bohong", "salah" → meningkatkan anger
    - "maaf", "mengerti" → meningkatkan trust
  - Menyebut judul bukti spesifik → lonjakan besar pada stress & fear
  - Update disimpan via `gameState.updateInterrogationState()`
- **4 dimensi emosi:**
  - **Trust** (0-100): Kepercayaan tersangka terhadap pemain
  - **Stress** (0-100): Tingkat stres
  - **Fear** (0-100): Tingkat ketakutan
  - **Anger** (0-100): Tingkat kemarahan

#### `assets/js/ai/FallbackMode.js`
- **Fungsi:** Menyediakan respons offline ketika AI server tidak tersedia
- **Export:** `getFallbackResponse()` function
- **Isi:** 4 template respons acak dalam Bahasa Indonesia (misal: "Saya tidak ingin menjawab pertanyaan itu.", "Tanyakan hal lain...")

---

### 6.6 UI (Antarmuka)

#### `assets/js/ui/WindowManager.js`
- **Fungsi:** Sistem manajemen jendela (windowing system) utama
- **Export:** `WindowManager` class
- **Fitur:**
  - `register(id, options)` — Membuat elemen DOM jendela dengan header (ikon, judul, tombol min/max/close) dan body
  - `open(id)` / `close(id)` / `minimize(id)` / `maximize(id)` — Kontrol jendela
  - `bringToFront(id)` — Z-index stacking (jendela aktif di depan)
  - Drag & drop via mousedown/mousemove pada header
  - Touch support untuk mobile
  - Posisi acak pada desktop, fullscreen otomatis di mobile
  - Emit event: `window:opened`, `window:closed`, `window:minimized`, `window:maximized`

#### `assets/js/ui/DesktopManager.js`
- **Fungsi:** Mengelola ikon-ikon di desktop
- **Export:** `DesktopManager` class
- **8 ikon desktop:**
  1. Case Files (berkas kasus)
  2. Evidence (bukti)
  3. Crime Scene (TKP)
  4. Dossier (profil karakter)
  5. Timeline (kronologi)
  6. Notes (catatan)
  7. Accusation (tuduhan)
  8. Settings (pengaturan)
- **Interaksi:**
  - Single-click: Seleksi ikon (highlight)
  - Double-click (atau tap di mobile): Emit `desktop:open` untuk membuka window terkait

#### `assets/js/ui/Taskbar.js`
- **Fungsi:** Taskbar di bagian bawah layar (mirip Windows 95)
- **Export:** `Taskbar` class
- **Fitur:**
  - Tombol per jendela yang terbuka (ikon + judul)
  - Highlight pada jendela aktif
  - Klik tombol: minimize jika aktif, restore jika minimized
  - Jam digital di sudut kanan (diperbarui setiap detik)
  - Di mobile: teks tombol disembunyikan, hanya tampil ikon

---

### 6.7 Modules (Modul Fitur)

#### `assets/js/modules/CaseHub.js`
- **Fungsi:** Hub pemilihan dan dashboard kasus
- **Export:** `CaseHub` class
- **Dua mode:**
  1. **Case List** — Fetch `index.json`, render kartu kasus yang bisa diklik, emit `case:select`
  2. **Case Dashboard** — Tampilkan judul kasus, info korban, status investigasi, tombol "Baca Briefing"
- **Logika penting:** Saat briefing pertama kali dibaca, otomatis unlock `initial_evidence` (misal: `laporan_otopsi`)

#### `assets/js/modules/CaseBriefing.js`
- **Fungsi:** Menampilkan narasi briefing kasus
- **Export:** `CaseBriefing` class
- **Cara kerja:** Mendengarkan event `case:loaded`, merender markdown briefing dalam window retro

#### `assets/js/modules/EvidenceFileManager.js`
- **Fungsi:** File Manager bergaya Windows Explorer untuk menjelajahi bukti
- **Export:** `EvidenceFileManager` class
- **Fitur:**
  - Sidebar kiri: Folder berdasarkan `evidence_structure` di case.json (misal: "Dokumen", "Log", "Barang")
  - Panel kanan: Menampilkan bukti yang sudah ditemukan (discovered) saja
  - Klik file: Membuka window detail dengan konten markdown bukti yang di-render
  - Address bar bergaya retro

#### `assets/js/modules/EvidenceViewer.js`
- **Fungsi:** Grid-based evidence locker (viewer lama/legacy)
- **Export:** `EvidenceViewer` class
- **Catatan:** Sebagian besar digantikan oleh `EvidenceFileManager`, tapi masih ada di codebase
- **Fitur:** Grid kartu bukti (locked/unlocked), klik locked → unlock (untuk testing), klik unlocked → buka detail

#### `assets/js/modules/CharacterDossier.js`
- **Fungsi:** Menampilkan profil karakter/tersangka
- **Export:** `CharacterDossier` class
- **Fitur:**
  - Kartu karakter dengan emoji, nama, dan peran
  - Klik kartu → buka window detail dengan info publik (TANPA rahasia)
  - Tombol "INTEROGASI" → emit `interrogation:start` untuk membuka ruang interogasi

#### `assets/js/modules/InterrogationRoom.js`
- **Fungsi:** Antarmuka chat AI untuk menginterogasi tersangka
- **Export:** `InterrogationRoom` class
- **Fitur:**
  - **Emotion bars** di bagian atas: Trust (hijau), Stress (kuning), Fear (biru), Anger (merah)
  - **Chat bubbles:** Hijau untuk pesan user, hitam/hijau untuk respons AI
  - **Text input + tombol Send**
  - **Loading spinner** saat menunggu respons AI
  - **Efek typewriter** pada respons AI (30ms per karakter, klik untuk skip)
  - **Evidence strip** di bagian bawah: Chip bukti yang bisa diklik untuk "menyodorkan bukti" ke tersangka
  - **Reveals evidence:** Beberapa karakter otomatis membuka bukti baru saat pertama kali diinterogasi (misal: Rahmat mengungkap `buku_besar`)

#### `assets/js/modules/AccusationForm.js`
- **Fungsi:** Formulir untuk mengajukan tuduhan resmi
- **Export:** `AccusationForm` class
- **Elemen form:**
  - Dropdown pilih tersangka (pelaku)
  - Textarea untuk motif
  - Dropdown bukti utama
  - Checkbox bukti sekunder (bisa pilih banyak)
- **Proses:** Memanggil `solutionEngine.checkAccusation()`, tampilkan verdict (hijau jika benar, merah jika salah)
- **Jika berhasil:** Tampilkan epilog "KASUS TERPECAHKAN!" dengan detail solusi

#### `assets/js/modules/NotesApp.js`
- **Fungsi:** Notepad untuk catatan detektif
- **Export:** `NotesApp` class
- **Fitur:**
  - Textarea kuning bergaya kertas
  - Auto-save ke `gameState.state.notes` dengan debounce 1 detik
  - Konten tetap tersimpan antar sesi

#### `assets/js/modules/ObjectivesTracker.js`
- **Fungsi:** Checklist tugas investigasi
- **Export:** `ObjectivesTracker` class
- **Fitur:**
  - Merender objectives dari `case.json` sebagai checkbox retro
  - Setiap objective punya hint/petunjuk
  - Toggle via `gameState.markObjective()`
  - Menggunakan `window.toggleObjective` global untuk event onclick

#### `assets/js/modules/SettingsWindow.js`
- **Fungsi:** Jendela pengaturan aplikasi
- **Export:** `SettingsWindow` class
- **Pengaturan:**
  - Input URL endpoint AI (default: `http://localhost:20128/v1/chat/completions`)
  - Input API key
  - Tombol Save (menyimpan ke localStorage, reload halaman)
  - Tombol toggle efek CRT (menambah/hapus class `.crt-off`)

#### `assets/js/modules/CrimeSceneViewer.js`
- **Fungsi:** Penjelajah TKP interaktif (file modul terbesar: 852 baris)
- **Export:** `CrimeSceneViewer` class
- **Fitur detail:**
  - Membaca `crime_scene.areas[]` dari case.json
  - **Sidebar kiri:** Daftar 5 area TKP dengan progress bar
    1. Meja Kerja
    2. Jendela
    3. Lemari Arsip
    4. Pintu Masuk
    5. Rak Buku
  - **Panel kanan:** Objek interaktif per area (klikable)
  - **Tipe objek:**
    - `evidence` — Membuka bukti baru
    - `clue` — Info naratif (tidak membuka bukti)
    - `red_herring` — Umpan palsu (tidak relevan)
    - `locked` — Membutuhkan item tertentu (misal: `kunci_cadangan`)
  - **Fitur tambahan:**
    - Progress tracking per area
    - Panel notifikasi saat menemukan sesuatu
    - Log panel untuk riwayat penemuan
    - Keyboard shortcuts: 1-9 untuk pindah area, R untuk reset, Esc untuk tutup
    - Audio feedback via Web Audio oscillator
    - Efek visual flash saat bukti ditemukan

---

### 6.8 Utils (Utilitas)

#### `assets/js/utils/AudioManager.js`
- **Fungsi:** Manajemen suara menggunakan Web Audio API
- **Export:** `audioManager` (singleton)
- **Suara tersedia (semua dihasilkan dari oscillator, TANPA file audio):**
  - `click` — Suara klik tombol
  - `type` — Suara ketikan keyboard
  - `unlock` — Suara membuka bukti
  - `boot` — Suara boot komputer
- **Fitur:** Master gain control, toggle mute

#### `assets/js/utils/DatabaseManager.js`
- **Fungsi:** Wrapper IndexedDB menggunakan library `idb` dari CDN
- **Export:** `DatabaseManager` static class
- **Database stores:**
  - `saves` — Menyimpan state game per kasus (keyed by caseId)
  - `settings` — Menyimpan pengaturan (keyed by key)
- **Method utama:**
  - `saveCaseState(caseId, state)` — Simpan state kasus
  - `loadCaseState(caseId)` — Muat state kasus
  - `deleteCaseState(caseId)` — Hapus state kasus
  - `saveSetting(key, value)` — Simpan pengaturan
  - `loadSetting(key)` — Muat pengaturan

#### `assets/js/utils/Markdown.js`
- **Fungsi:** Loader dinamis untuk library `marked.js` dari CDN
- **Export:** `markdown` (singleton)
- **Cara kerja:**
  - Memuat `marked.js` via `<script>` tag secara dinamis
  - Method `renderMarkdown(mdText)` mengubah Markdown menjadi HTML
  - Fallback: Jika `marked.js` gagal dimuat, hanya mengganti `\n` dengan `<br>`

#### `assets/js/utils/Storage.js`
- **Fungsi:** Wrapper localStorage (legacy)
- **Export:** `Storage` static class
- **Key format:** `retrosleuth_<caseId>`
- **Method:** `saveGame()`, `loadGame()`, `clearGame()`
- **Catatan:** Sebagian besar sudah digantikan oleh `DatabaseManager` (IndexedDB), tapi masih ada untuk backward compatibility dan migrasi

#### `assets/js/utils/Typewriter.js`
- **Fungsi:** Efek animasi typewriter (teks muncul per karakter)
- **Export:** `typewrite()` function
- **Cara kerja:**
  - Async function menggunakan `requestAnimationFrame`
  - Kecepatan default: 30ms per karakter
  - Klik pada elemen untuk skip (langsung tampilkan semua teks)
  - Mengembalikan Promise yang resolve saat animasi selesai

---

### 6.9 Data Kasus

#### `cases/index.json`
- **Fungsi:** Registry semua kasus yang tersedia
- **Isi saat ini:** 1 kasus — "Malam di Wisma Angker" (tahun 1979, difficulty: AMATEUR_SLEUTH)

#### `cases/case_001_wisma_angker/case.json`
- **Fungsi:** Manifest kasus utama (460 baris)
- **Isi:**
  - **Metadata:** ID, judul, tahun, difficulty, deskripsi
  - **Victim:** Haryanto Wijaya, 62 tahun, pengusaha, penyebab kematian: keracunan sianida
  - **Evidence registry:** 9 item bukti (ID, judul, kategori, tipe file, lokasi)
  - **Evidence structure:** Organisasi folder (Dokumen, Log, Barang)
  - **Characters:** Referensi ke 3 file karakter
  - **Solution matrix:**
    - Pelaku: Sari
    - Motif: Warisan dan balas dendam
    - Bukti utama: `laporan_otopsi`
    - Bukti sekunder: `buku_besar`, `log_keamanan`, `surat_ancaman`, `resep_racun`
  - **Timeline:** 7 event kronologis
  - **Objectives:** 7 tugas investigasi
  - **Crime scene:** 5 area TKP dengan 35+ objek interaktif

#### `cases/case_001_wisma_angker/briefing.md`
- **Fungsi:** Narasi pembuka kasus
- **Isi:** Budi (pelayan) menemukan Haryanto Wijaya tewas di ruang kerjanya pukul 02.00, sianida terdeteksi dalam gelas brandy, 3 tersangka di wisma

#### `cases/case_001_wisma_angker/solution.md`
- **Fungsi:** Penjelasan solusi kasus
- **Isi:** Sari adalah pembunuhnya — membeli sianida, meracuni brandy Haryanto untuk mencegah revisi surat wasiat

#### `cases/case_001_wisma_angker/characters/rahmat.json`
- **Fungsi:** Data karakter tersangka Rahmat
- **Profil:** Keponakan, 34 tahun, penjudi dengan hutang 500 juta
- **Alibi:** Mengaku tidur di kamar tamu
- **Rahasia:** Memanjat jendela untuk mencuri buku besar (tapi BUKAN pembunuh)
- **`reveals_evidence`:** `["buku_besar"]` — Saat pertama diinterogasi, bukti buku besar terbuka
- **`can_be_culprit`:** false

#### `cases/case_001_wisma_angker/characters/sari.json`
- **Fungsi:** Data karakter tersangka Sari (PELAKU)
- **Profil:** Istri muda, 29 tahun, mantan aktris
- **Alibi:** Mengaku sedang tidur dengan obat tidur
- **Rahasia:** Membeli sianida, meracuni brandy, punya selingkuhan
- **`can_be_culprit`:** true

#### `cases/case_001_wisma_angker/characters/budi.json`
- **Fungsi:** Data karakter tersangka Budi
- **Profil:** Pelayan setia, 61 tahun
- **Alibi:** Mengaku melakukan ronda malam
- **Rahasia:** Melihat Sari meracuni gelas TAPI sengaja terlambat masuk — anaknya meninggal karena Haryanto menolak biaya pengobatan
- **`can_be_culprit`:** false (tapi kaki tangannya pasif)

#### `cases/case_001_wisma_angker/evidence/laporan_otopsi.md`
- **Isi:** Laporan otopsi — Konfirmasi keracunan sianida, ditemukan dalam brandy, waktu kematian sekitar 23.00-01.00

#### `cases/case_001_wisma_angker/evidence/buku_besar.md`
- **Isi:** Buku besar rahasia — Catatan hutang-hutang, rencana revisi surat wasiat yang akan mengurangi bagian Sari

#### `cases/case_001_wisma_angker/evidence/log_keamanan.md`
- **Isi:** Log keamanan gerbang — Catatan keluar-masuk kendaraan, timestamp mobil Rahmat

#### `cases/case_001_wisma_angker/evidence/surat_ancaman.md`
- **Isi:** Surat ancaman anonim — Surat tanpa tanda tangan yang mengancam Haryanto

#### `cases/case_001_wisma_angker/evidence/laporan_saksi.md`
- **Isi:** Kumpulan pernyataan saksi — Penjaga keamanan dan pembantu dapur memberikan kesaksian

---

### 6.10 Dokumentasi

#### `docs/CONTENT_GUIDE.md`
- **Fungsi:** Tips singkat untuk penulis kasus
- **Isi:** 7 baris panduan penulisan konten kasus (cara menulis briefing, evidence, karakter)

#### `docs/MODDING_GUIDE.md`
- **Fungsi:** Panduan singkat membuat mod/kasus baru
- **Isi:** 10 baris instruksi cara membuat kasus baru (struktur folder, format file)

---

## 7. Sistem Interogasi AI

Sistem interogasi adalah fitur inti yang membedakan game ini. Berikut alur lengkapnya:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Pemain     │────>│ Interrogation│────>│  AIClient    │
│  ketik pesan  │     │    Room      │     │  sendMessage  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                     ┌──────────────┐             │
                     │ PromptBuilder │<────────────┘
                     │ buildPrompt() │     (1) Bangun system prompt
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │  LLM Server  │     (2) POST ke endpoint
                     │ (gemini-cli) │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │ TrustSystem  │     (3) Hitung perubahan emosi
                     │ calcDeltas() │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │   GameState  │     (4) Simpan chat + emosi
                     │   save()     │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │ Typewriter   │     (5) Tampilkan respons
                     │ effect       │         dengan animasi
                     └──────────────┘
```

### Aturan AI per karakter:

| Karakter | Kepribadian | Bereaksi terhadap bukti | Rahasia yang dilindungi |
|----------|------------|------------------------|------------------------|
| Rahmat | Gelisah, defensif | Buku besar → panik | Hutang judi, mencuri buku besar |
| Sari | Tenang, manipulatif | Laporan otopsi → bersikap sedih | Membeli sianida, meracuni brandy |
| Budi | Loyal, penuh penyesalan | Laporan saksi → mulai mengaku | Melihat Sari meracuni gelas |

---

## 8. Sistem Penyimpanan Data

```
┌─────────────────────────────────────────┐
│              DatabaseManager            │
│            (IndexedDB via idb)          │
│                                         │
│  Store: "saves"                         │
│  ├── key: caseId                        │
│  └── value: {                           │
│        discoveredEvidence,              │
│        chatHistories,                   │
│        interrogationStates,             │
│        notes,                           │
│        accusationAttempts,              │
│        caseStatus,                      │
│        completedObjectives              │
│      }                                  │
│                                         │
│  Store: "settings"                      │
│  ├── key: "ai_endpoint"                │
│  ├── key: "ai_api_key"                 │
│  └── key: "crt_enabled"                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Storage (Legacy)                │
│           (localStorage)                │
│                                         │
│  key: "retrosleuth_<caseId>"            │
│  value: JSON.stringify(gameState)       │
│                                         │
│  * Dimigrasi ke IndexedDB saat boot    │
└─────────────────────────────────────────┘
```

---

## 9. Sistem Crime Scene

TKP kasus 001 terdiri dari 5 area dengan objek interaktif:

| Area | Objek Penting | Tipe |
|------|--------------|------|
| **Meja Kerja** | Gelas brandy, dokumen, pena | evidence, clue |
| **Jendela** | Bekas panjatan, tanah di kusen | clue, evidence |
| **Lemari Arsip** | Buku besar, surat | evidence, locked |
| **Pintu Masuk** | Bekas sepatu, kunci cadangan | clue, evidence |
| **Rak Buku** | Buku farmasi, catatan tersembunyi | evidence, red_herring |

Setiap area memiliki progress bar yang menunjukkan berapa persen objek sudah diperiksa.

---

## 10. Cara Menambah Kasus Baru

1. **Buat folder** di `cases/`, contoh: `case_002_pantai_berlian/`

2. **Buat `case.json`** dengan struktur:
   ```json
   {
     "id": "case_002_pantai_berlian",
     "title": "Misteri Pantai Berlian",
     "year": "1982",
     "difficulty": "AMATEUR_SLEUTH",
     "victim": { "name": "...", "age": 0, "cause_of_death": "..." },
     "evidence_registry": [...],
     "evidence_structure": {...},
     "characters": [...],
     "solution_matrix": {
       "culprit": "nama_pelaku",
       "motive": "...",
       "primary_evidence": "id_bukti_utama",
       "secondary_evidence": ["id_1", "id_2"]
     },
     "timeline": [...],
     "objectives": [...],
     "crime_scene": { "areas": [...] }
   }
   ```

3. **Buat `briefing.md`** — Narasi pembuka

4. **Buat `solution.md`** — Penjelasan solusi

5. **Buat `characters/*.json`** — Satu file per tersangka dengan:
   - Identitas, kepribadian, alibi
   - Rahasia, fakta yang diketahui
   - `can_be_culprit: true/false`
   - `reveals_evidence: [...]` (bukti yang terbuka saat interogasi pertama)

6. **Buat `evidence/*.md`** — Satu file per bukti dalam format Markdown

7. **Daftarkan di `cases/index.json`:**
   ```json
   {
     "id": "case_002_pantai_berlian",
     "title": "Misteri Pantai Berlian",
     "year": "1982",
     "difficulty": "AMATEUR_SLEUTH",
     "description": "Deskripsi singkat kasus"
   }
   ```

8. Game akan otomatis mendeteksi kasus baru tanpa perubahan kode!

---

*Dokumen ini di-generate berdasarkan analisis seluruh source code proyek RetroSleuth: Case Files Detective.*
