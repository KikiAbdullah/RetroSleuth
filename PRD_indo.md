# RetroSleuth: Case Files Detective

## Product Requirements Document (Enterprise Edition)

**Version:** 2.0.0  
**Status:** Production Ready – Unified Comprehensive Document  
**Date:** 2026-06-18  
**Platform:** Static Web (GitHub Pages Deployment Native)  
**Tech Stack:** Vanilla HTML5, CSS3 (Retro-Compliant), JavaScript (ES6+ Modules), Local LLM API (`gemini-cli`)

---

## Table of Contents

1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Product Philosophy & Design Pillars](#2-product-philosophy--design-pillars)
3. [User Personas & Use Cases](#3-user-personas--use-cases)
4. [Core Gameplay Loop](#4-core-gameplay-loop)
5. [System Architecture & Technical Design](#5-system-architecture--technical-design)
6. [Complete Folder Structure](#6-complete-folder-structure)
7. [UI/UX & Visual Specification](#7-uiux--visual-specification)
8. [Window Manager Specification](#8-window-manager-specification)
9. [AI Interrogation Engine Design](#9-ai-interrogation-engine-design)
10. [Data Model & Content Authoring](#10-data-model--content-authoring)
11. [Case Management System](#11-case-management-system)
12. [Evidence System](#12-evidence-system)
13. [Timeline & Investigation Board](#13-timeline--investigation-board)
14. [Audio & Sound Design](#14-audio--sound-design)
15. [Save & Load System](#15-save--load-system)
16. [Deployment & Operational Guide](#16-deployment--operational-guide)
17. [Security & Privacy Considerations](#17-security--privacy-considerations)
18. [Development Roadmap & Milestones](#18-development-roadmap--milestones)
19. [Testing Strategy & Acceptance Criteria](#19-testing-strategy--acceptance-criteria)
20. [Example Full Case: "Malam di Wisma Angker" – (Death at Midnight Manor versi Indonesia)](#20-example-full-case-malam-di-wisma-angker)
21. [Future Considerations & Expandability](#21-future-considerations--expandability)
22. [Glossary](#22-glossary)
23. [Appendix: Developer Quick Reference](#23-appendix-developer-quick-reference)

---

## 1. Executive Summary & Vision

### 1.1 Elevator Pitch

**RetroSleuth: Case Files Detective** adalah permainan investigasi kriminal naratif yang berjalan sepenuhnya di dalam peramban (browser), meniru pengalaman menggunakan komputer detektif era 1970‑an/80‑an. Game ini menggabungkan estetika retro (layar CRT hijau, antarmuka teks, windowing ala Windows 1.x) dengan teknologi **Artificial Intelligence (AI)** lokal yang memungkinkan interogasi dinamis dan terbuka. Pemain berperan sebagai detektif yang harus mengungkap misteri pembunuhan dengan membaca berkas, memeriksa bukti, dan menginterogasi tersangka yang ditenagai AI. Setiap karakter AI memiliki kepribadian, rahasia, dan emosi; mereka dapat berbohong, marah, atau mengakui kesalahan jika terpojok oleh bukti.

Game ini dirancang dengan arsitektur **data-driven**, sehingga konten kasus (narasi, bukti, karakter) disimpan dalam file JSON dan Markdown, dan dapat ditambahkan atau dimodifikasi tanpa mengubah kode inti. Ini memungkinkan komunitas untuk membuat kasus baru dengan mudah.

### 1.2 Masalah & Solusi

- **Masalah:** Game detektif tradisional seringkali dibatasi oleh pohon dialog (_dialogue trees_) yang kaku, di mana pemain hanya perlu mengklik semua opsi teks yang tersedia untuk memenangkan permainan. Interaksi terasa mekanis dan kurang imersif.
- **Solusi:** **RetroSleuth** memecahkan masalah ini dengan mengharuskan pemain mengetik pertanyaan secara bebas (_open-ended interrogation_). Tersangka yang ditenagai AI akan merespons secara cerdas berdasarkan berkas kepribadian mereka, mampu berbohong, mempertahankan alibi, menjadi panik, atau menyerah ketika dihadapkan pada bukti fisik yang valid. AI lokal memberikan pengalaman tanpa latensi jaringan dan menjaga privasi pemain.

### 1.3 Unique Selling Points

| #   | USP                           | Deskripsi                                                                                                                                                                                                                |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Interrogasi AI Open-ended** | Bukan pilihan dialog biner. Ketik pertanyaan bebas, AI merespons _in-character_ dengan mempertimbangkan kepribadian, rahasia, dan pengetahuan karakter. Model bahasa memahami konteks dan bukti yang dimiliki pemain.    |
| 2   | **Estetika CRT Autentik**     | Efek monitor tabung, kedip, scanlines, dan palet monokrom fosfor yang membuat pemain merasa benar-benar berada di depan terminal retro. Audio statis dan suara mekanik melengkapi atmosfer.                              |
| 3   | **Data-Driven Content**       | Seluruh konten kasus (narasi, bukti, konfigurasi AI) disimpan dalam file JSON dan Markdown. Membuat kasus baru semudah menyalin template dan menulis file. Struktur modular memungkinkan modding tanpa sentuh kode inti. |
| 4   | **Tanpa Backend**             | Game berjalan sepenuhnya di sisi klien. Satu-satunya dependensi eksternal adalah API AI lokal (`gemini-cli`) yang opsional. Tidak memerlukan server, database, atau layanan cloud.                                       |
| 5   | **GitHub Pages Friendly**     | Tanpa build tool. Cukup push repository, game langsung hidup di `https://<username>.github.io/<repo>/`. Seluruh aset statis di-load dari folder relatif.                                                                 |
| 6   | **Modding First**             | Engine dibuat untuk menerima kasus baru tanpa modifikasi source code. Hanya perlu menambah folder dan entri indeks. Panduan modding lengkap disediakan.                                                                  |
| 7   | **Privasi Terjaga**           | Semua data interogasi hanya diproses di mesin lokal melalui API `localhost`. Tidak ada data yang dikirim ke internet.                                                                                                    |

### 1.4 Target Audience

- **Detektif Kasual:** Ingin pengalaman misteri imersif tanpa instalasi, mengapresiasi atmosfer retro dan ketegangan interogasi. Cukup buka browser dan bermain.
- **Detektif Hardcore:** Mencatat timeline, menganalisis kontradiksi, membaca seluruh dokumen, dan menyelesaikan kasus dengan deduksi logis. Menikmati tantangan AI yang realistis.
- **Pembuat Kasus:** Penulis misteri yang ingin merancang kasus sendiri, membutuhkan dokumentasi jelas tentang struktur folder dan schema JSON. Bisa berkreasi dengan karakter, bukti, dan alur cerita unik.
- **Pengembang Hobi:** Ingin mempelajari integrasi Vanilla JS dengan LLM, membaca kode sumber, dan mungkin berkontribusi menambahkan fitur seperti voice input atau multiplayer lokal.

### 1.5 Filosofi Desain: Data-Driven Modularity

Seluruh mesin game dibangun di atas prinsip arsitektur **data-driven**. Kode inti JavaScript bertindak sebagai _engine_ statis yang tidak pernah berubah ketika ada penambahan konten baru. Seluruh kasus, bukti, dokumen, profil tersangka, hingga aturan logika kelulusan disimpan dalam berkas teks murni bertipe `.json` dan `.md` (Markdown). Hal ini memungkinkan modifikasi, perluasan, dan penambahan kasus baru (_community modding_) secara instan hanya dengan memanipulasi struktur direktori. Setiap konten di-load secara asinkron saat dibutuhkan, meminimalkan beban awal.

---

## 2. Product Philosophy & Design Pillars

### 2.1 Design Pillars

#### Pillar 1 — Intelligence Over Guessing

Pemain tidak boleh menang karena menebak atau mengklik semua opsi. Semua solusi harus dapat diturunkan dari fakta yang tersedia di dalam bukti dan kesaksian. Desain AI memastikan bahwa pengakuan hanya terjadi jika pemain menunjukkan pemahaman logis dan bukti yang tepat.

#### Pillar 2 — Evidence Is King

Semua tuduhan harus memiliki bukti. Interogasi saja tidak cukup untuk menyelesaikan kasus. Sistem pengecekan solusi memvalidasi minimal satu bukti primer dan sejumlah bukti sekunder yang mengarah ke pelaku. Tanpa bukti, tuduhan akan ditolak.

#### Pillar 3 — People Lie

Karakter AI tidak wajib jujur. Mereka memiliki: ketakutan, motif, rahasia, dan hubungan pribadi. Mereka dapat memberikan pernyataan palsu yang konsisten dengan alibi mereka. Hanya tekanan dari bukti yang dapat meruntuhkan kebohongan.

#### Pillar 4 — No Meta Knowledge

AI tidak pernah mengetahui: solusi akhir, mekanisme game, atau pemicu tersembunyi, kecuali informasi tersebut memang diketahui oleh karakter. System prompt secara ketat membatasi pengetahuan AI hanya pada data yang relevan dengan karakter.

#### Pillar 5 — Modding First

Engine dibuat untuk menerima kasus baru tanpa modifikasi source code. Penulis kasus hanya perlu mengikuti konvensi folder dan schema JSON. Semua path relatif, tidak ada hardcode. Proses loading konten sepenuhnya dinamis.

#### Pillar 6 — Accessibility & Performance

Meskipun estetik retro, game harus dapat diakses pada berbagai perangkat dengan dukungan keyboard penuh. Waktu loading minimal, aset di-cache secara agresif, dan tidak ada dependensi runtime yang besar. Animasi CRT dapat dimatikan untuk mengurangi beban CPU.

---

## 3. User Personas & Use Cases

### 3.1 Personas

#### Persona 1: Detektif Kasual (Rina, 28)

- **Goals:** Ingin pengalaman misteri imersif tanpa instalasi.
- **Needs:** Mengapresiasi atmosfer retro dan ketegangan interogasi.
- **Tech Level:** Tidak paham teknis AI; cukup ikuti instruksi untuk menjalankan server.
- **Pain Points:** Bingung dengan setup AI server. Solusi: game mendeteksi status server dan menampilkan pesan panduan.

#### Persona 2: Pembuat Kasus (Damar, 34)

- **Goals:** Merancang kasus sendiri sebagai penulis misteri.
- **Needs:** Dokumentasi jelas tentang struktur folder dan schema JSON.
- **Tech Level:** Menengah.
- **Pain Points:** Ingin menguji apakah AI bisa memerankan karakternya dengan baik. Solusi: template karakter lengkap dengan parameter kepribadian, contoh system prompt, dan alat uji coba interogasi.

#### Persona 3: Pengembang Hobi (Alex, 22)

- **Goals:** Mempelajari integrasi Vanilla JS dengan LLM.
- **Needs:** Kode sumber yang terbaca dan well-documented.
- **Tech Level:** Tinggi.
- **Pain Points:** Ingin berkontribusi menambahkan fitur seperti voice input. Solusi: arsitektur modular dengan event bus, dokumentasi API engine.

#### Persona 4: Hardcore Investigator (Michael, 41)

- **Goals:** Menyelesaikan kasus dengan deduksi logis.
- **Needs:** Mencatat timeline, menganalisis kontradiksi, membaca seluruh dokumen.
- **Tech Level:** Rendah.
- **Pain Points:** Ingin kebebasan dalam investigasi tanpa batasan. Solusi: jendela catatan terintegrasi, papan bukti visual (opsional), dan kemampuan mengajukan tuduhan kapan saja.

### 3.2 High-Level Use Cases

| ID  | Use Case                 | Deskripsi                                                                                                                                            |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| UC1 | Memilih Kasus            | Pemain melihat daftar kasus, memilih satu, dan memulai investigasi. Daftar kasus diambil dari `cases/index.json`.                                    |
| UC2 | Menelaah Berkas          | Membuka dokumen briefing, membaca narasi TKP, melihat daftar tersangka. Format Markdown dirender dengan `marked.js`.                                 |
| UC3 | Menganalisis Bukti       | Membuka item bukti satu per satu, membacanya dalam format Markdown, melihat gambar jika ada. Status bukti berubah dari _discovered_ ke _analyzed_.   |
| UC4 | Interogasi Tersangka     | Memilih karakter, mengetik pertanyaan bebas, menerima respons AI yang sesuai persona. Riwayat chat disimpan dan mempengaruhi status emosi tersangka. |
| UC5 | Menyusun Tuduhan         | Setelah merasa cukup bukti, pemain mengisi formulir: memilih pelaku, motif, dan bukti pendukung. Sistem memvalidasi terhadap `solution_matrix`.      |
| UC6 | Menambah Kasus Baru      | User (creator) menambah folder di `cases/`, mengisi file JSON/MD, lalu kasus muncul otomatis di daftar. Validasi skema dilakukan saat loading.       |
| UC7 | Menyimpan/Memuat Progres | Game otomatis menyimpan bukti yang telah ditemukan dan riwayat chat. Pemain bisa melanjutkan nanti. Data disimpan di `localStorage` per kasus.       |
| UC8 | Menyesuaikan Pengaturan  | Pemain dapat mengatur endpoint AI, API key, volume audio, dan mengaktifkan/menonaktifkan efek CRT.                                                   |

---

## 4. Core Gameplay Loop

### 4.1 High-Level Flow

```
┌─────────────────────────────────────────────────────┐
│ DESKTOP SCREEN                                      │
│ [ My Briefcase ] [ Case Files ] [ Evidence Board ]  │
│ [ Interrogation ] [ Notes ]                         │
└─────────────────────────────────────────────────────┘
│
▼
1. BOOT SEQUENCE (animasi teks BIOS) → 3 detik
2. CASE SELECTION (daftar dari index.json)
3. BRIEFING ROOM → Jendela dokumen briefing.md dirender
4. EVIDENCE LOCKER → Daftar bukti terkunci, pemain membuka satu per satu dengan klik
5. CHARACTER DOSSIER → Profil lengkap setiap karakter (tanpa rahasia)
6. INTERROGATION ROOM → Pilih karakter, buka jendela terminal interogasi
   │
   ▼
   AI RESPONDS (System Prompt + Riwayat Chat + Known Evidence)
   │
   Pemain mencatat inkonsistensi, membandingkan bukti
   │
   ▼
7. EVIDENCE BOARD → Visual drag-and-drop untuk menghubungkan petunjuk (opsional v1)
8. ACCUSATION FORM → Pilih Pelaku, Motif, dan Evidence pendukung
9. VERDICT → Sistem membandingkan dengan solution di case.json
   - Benar → Epilog sukses, kasus ditutup.
   - Salah → Peringatan "Belum cukup bukti" atau "Tuduhan keliru".
```

### 4.2 Player State Model

State pemain dikelola dalam objek `GameState` yang persisten. Setiap aksi memicu perubahan state, yang kemudian di-broadcast melalui `EventBus` agar UI dapat merender ulang secara reaktif.

```javascript
// GameState structure (singleton)
{
  currentCaseId: "case_001_wisma_angker",
  activeWindows: ["briefing", "evidence_locker", "interrogation_rahmat"],
  discoveredEvidence: ["laporan_otopsi", "buku_besar"],     // ID bukti yang sudah ditemukan
  analyzedEvidence: ["laporan_otopsi"],                     // ID yang sudah dibaca detail
  chatHistories: {                                          // per suspectId
    rahmat: [
      { role: "user", content: "Di mana kamu tadi malam?" },
      { role: "assistant", content: "Saya di dapur." }
    ],
    sari: [],
    budi: []
  },
  notes: "Rahmat sepertinya menyembunyikan sesuatu tentang buku besar...",  // teks bebas
  interrogationStates: {                                    // per suspectId
    rahmat: { stress: 35, trust: 45, fear: 30, anger: 15 },
    sari: { stress: 10, trust: 30, fear: 20, anger: 5 },
    budi: { stress: 5, trust: 50, fear: 10, anger: 30 }
  },
  accusationAttempts: 0,
  caseStatus: "active",                                    // active | solved | failed
  audioSettings: { master: 0.7, sfx: 1.0, ambient: 0.5, muted: false }
}
```

### 4.3 Interrogation Sub-Loop

Setelah pemain mengirimkan pertanyaan, AIClient mengirim payload ke LLM lokal. Sementara menunggu, terminal menampilkan animasi loading (titik-titik bergerak). Respons ditampilkan dengan efek typewriter. Setelah respons, status emosi karakter diperbarui berdasarkan analisis sentimen sederhana (kata kunci atau delta statis). Event `interrogation:response` dipicu, UI taskbar memperbarui indikator status.

---

## 5. System Architecture & Technical Design

### 5.1 Komponen Teknologi Utama

| Komponen                           | Spesifikasi                                                                                                                                                                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Core**                  | HTML5 Semantik, CSS3 Variabel Murni, JavaScript modern menggunakan sistem ES Modules (`import`/`export`). Tidak ada framework.                                                                                                                            |
| **Markdown Parser**                | `marked.js` v4+ yang dimuat secara asinkron melalui CDN resmi (cdnjs/jsdelivr) untuk mengubah file laporan `.md` menjadi elemen DOM HTML.                                                                                                                 |
| **AI Engine Communication**        | Native `fetch` API untuk berkomunikasi langsung dengan server inferensi LLM lokal di `http://localhost:20128/v1/chat/completions` menggunakan model `gemini-cli` dengan payload OpenAI API format.                                                        |
| **State Management & Persistence** | `localStorage` sebagai basis data transien untuk melacak status penemuan bukti, transkrip obrolan interogasi, catatan detektif, tingkat stres tersangka, dan status progres kasus. State di-load saat case dimulai dan di-save otomatis setiap perubahan. |
| **Architecture Pattern**           | MVC + Event Bus. Model: GameState (singleton). View: komponen UI (WindowManager, Taskbar, dll). Controller: modul engine (CaseLoader, EvidenceEngine, InterrogationEngine, SolutionEngine). Komunikasi antar komponen melalui EventBus terpusat.          |
| **Deployment**                     | GitHub Pages Compatible. Semua file statis, tanpa build step. Cukup clone repo dan push. Bisa juga dijalankan lokal dengan server statis sederhana (`python -m http.server` atau Live Server).                                                            |
| **Browser Support**                | Chrome/Edge 90+, Firefox 90+, Safari 15+. Diperlukan dukungan ES Modules, `fetch`, `localStorage`, dan Web Audio API. Mixed content dari localhost harus diizinkan.                                                                                       |

### 5.2 Batasan Sistem (Technical Constraints)

| #   | Constraint                       | Deskripsi                                                                                                                                                                                                                                                    |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Zero Node Dependency**         | Dilarang keras memasukkan folder `node_modules` atau file `package.json` dalam repositori runtime. Game harus berjalan murni di browser tanpa proses build.                                                                                                  |
| 2   | **Pathing Statis**               | Semua _resource routing_ wajib bersifat relatif (`./cases/...`) agar tidak merusak tautan repositori sub-folder pada domain GitHub Pages (`username.github.io/repository-name/`).                                                                            |
| 3   | **CORS & Mixed Content Control** | GitHub Pages berjalan di bawah protokol aman (`https://`), pemanggilan ke API lokal (`http://localhost:20128`) akan memicu _Mixed Content Error_ di sisi browser. Solusi: pengguna harus mengizinkan insecure content atau menggunakan tunnel HTTPS (ngrok). |
| 4   | **Ukuran Bundle**                | Total ukuran semua aset (HTML, CSS, JS, font) harus di bawah 500 KB untuk memastikan loading cepat pada koneksi lambat. Gambar kasus dioptimasi (WebP, maks 100 KB per gambar).                                                                              |
| 5   | **Offline Capability**           | Tanpa AI, game masih bisa berjalan untuk membaca bukti dan menjelajahi dokumen. Interogasi tidak tersedia, tetapi UI lainnya tetap fungsional.                                                                                                               |

### 5.3 Architectural Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         index.html                          │
│                   (Entry Point & DOM Init)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      main.js (App)                          │
│              - Bootstrapping & Orchestration                │
│              - Global GameState Singleton                   │
│              - EventBus Registration                        │
│              - Initial Window Layout Setup                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   UI Layer    │   │  Engine Layer │   │   AI Layer    │
│               │   │               │   │               │
│ WindowManager │   │  CaseLoader   │   │  AIClient     │
│ DesktopManager│   │  CharacterEng │   │  PromptBuilder│
│ Taskbar       │   │  EvidenceEng  │   │  TrustSystem  │
│ Modal         │   │  TimelineEng  │   │  LieSystem    │
│ Toast         │   │  InterrogEng  │   │  MemorySystem │
│ ContextMenu   │   │  SolutionEng  │   │  EmotionModel │
│ EvidenceViewer│   │  UnlockEng    │   │  FallbackMode │
│ InterrogRoom  │   │  NotesEngine  │   │               │
│ AccusationForm│   │               │   │               │
│ NotesApp      │   │               │   │               │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │       Utils Layer        │
              │                          │
              │  - Storage (localStorage)│
              │  - Markdown (marked.js)  │
              │  - EventBus (pub/sub)    │
              │  - Logger (console wraps)│
              │  - DOMHelpers            │
              │  - Security (sanitizer)  │
              │  - AudioManager          │
              └─────────────────────────┘
```

### 5.4 Alur Data & Event Flow

```
User Action (misal klik unlock evidence)
  ↓
UI Component memanggil EvidenceEngine.unlock(evidenceId)
  ↓
EvidenceEngine validasi kondisi, update GameState
  ↓
GameState.emit('evidence:unlocked', { evidenceId })
  ↓
EventBus meneruskan ke subscriber:
  - EvidenceViewer: memperbarui daftar bukti
  - Taskbar: update counter
  - AudioManager: mainkan suara unlock
  - AIClient (via GameState): data known evidence diperbarui untuk prompt berikutnya
```

### 5.5 Konvensi Penamaan

| Element          | Convention             | Example                                                  |
| ---------------- | ---------------------- | -------------------------------------------------------- |
| CSS Class        | BEM-like               | `.window__titlebar`, `.window__titlebar--active`         |
| Custom Event     | Namespace              | `case:loaded`, `interrogation:response`, `window:closed` |
| File             | kebab-case             | `window-manager.js`, `prompt-builder.js`                 |
| Module/Class     | PascalCase             | `WindowManager`, `CaseLoader`                            |
| Function         | camelCase              | `buildSystemPrompt()`, `getKnownEvidence()`              |
| Constants        | UPPER_SNAKE_CASE       | `MAX_TOKENS`, `DEFAULT_TEMPERATURE`                      |
| localStorage Key | `retrosleuth_<caseId>` | `retrosleuth_case_001_wisma_angker`                      |

---

## 6. Complete Folder Structure

```
/
├── index.html                     # Main entry point, mounts app
├── assets/
│   ├── css/
│   │   ├── reset.css              # CSS reset (minimal)
│   │   ├── variables.css          # CSS custom properties
│   │   ├── crt.css                # CRT scanline & flicker effects
│   │   ├── windows.css            # Retro window chrome (titlebar, borders)
│   │   ├── desktop.css            # Desktop icons, background
│   │   ├── terminal.css           # Terminal styling (green phosphor)
│   │   ├── evidence.css           # Evidence grid, cards
│   │   ├── interrogation.css      # Chat bubbles, input area
│   │   ├── notes.css              # Notepad styling
│   │   ├── taskbar.css            # Bottom taskbar
│   │   ├── modal.css              # Modal dialogs
│   │   └── responsive.css         # Media queries for small screens
│   ├── js/
│   │   ├── main.js                # Bootstrapping, load sequence
│   │   ├── app.js                 # App class (orchestrator)
│   │   ├── core/
│   │   │   ├── EventBus.js        # Publish/subscribe event system
│   │   │   ├── Store.js           # GameState singleton & observers
│   │   │   └── Config.js          # App-wide config constants
│   │   ├── engine/
│   │   │   ├── CaseLoader.js      # Fetch & parse case JSON/MD
│   │   │   ├── EvidenceEngine.js  # Manage evidence discovery & analysis
│   │   │   ├── InterrogationEngine.js # Orchestrate interrogation sessions
│   │   │   ├── SolutionEngine.js  # Validate accusation against solution
│   │   │   ├── TimelineEngine.js  # Build timeline from case data
│   │   │   └── NotesEngine.js     # Manage detective notes (CRUD)
│   │   ├── ai/
│   │   │   ├── AIClient.js        # HTTP client for LLM API
│   │   │   ├── PromptBuilder.js   # Construct system prompts per suspect
│   │   │   ├── TrustSystem.js     # Calculate trust, stress deltas
│   │   │   └── FallbackMode.js    # Offline behavior
│   │   ├── ui/
│   │   │   ├── WindowManager.js   # Window creation, drag, resize, z-order
│   │   │   ├── DesktopManager.js  # Desktop icons, double-click handling
│   │   │   ├── Taskbar.js         # Taskbar window buttons, clock
│   │   │   ├── Modal.js           # Modal dialog factory
│   │   │   └── Toast.js           # Notification toasts
│   │   ├── modules/
│   │   │   ├── EvidenceViewer.js  # Evidence list & detail view
│   │   │   ├── InterrogationRoom.js # Chat interface for a suspect
│   │   │   ├── AccusationForm.js  # Form to submit accusation
│   │   │   ├── NotesApp.js        # Notepad module
│   │   │   ├── CaseBriefing.js    # Briefing document viewer
│   │   │   └── CharacterDossier.js # Character profile viewer
│   │   └── utils/
│   │       ├── Storage.js         # localStorage wrapper with versioning
│   │       ├── Markdown.js        # marked.js loader & render helper
│   │       ├── Security.js        # Sanitize user input, prevent injection
│   │       ├── AudioManager.js    # Web Audio API manager
│   │       └── DOMHelpers.js      # Shortcuts for DOM manipulation
│   ├── audio/
│   │   ├── boot.wav
│   │   ├── click.wav
│   │   ├── type.wav
│   │   ├── unlock.wav
│   │   ├── static.mp3
│   │   ├── window_open.wav
│   │   ├── paper.wav
│   │   ├── error.wav
│   │   └── success.wav
│   ├── fonts/
│   │   └── vt323.woff2
│   └── images/
│       ├── desktop_icons/         # 32x32 PNG icons for desktop shortcuts
│       └── splash.png
├── cases/
│   ├── index.json                 # Global case registry
│   └── case_001_wisma_angker/
│       ├── case.json              # Manifest & solution
│       ├── briefing.md            # Opening narrative
│       ├── solution.md            # Full explanation (for post-game)
│       ├── characters/
│       │   ├── rahmat.json        # Rahmat's character file
│       │   ├── sari.json          # Sari's character file
│       │   └── budi.json          # Budi's character file
│       ├── evidence/
│       │   ├── laporan_otopsi.md
│       │   ├── buku_besar.md
│       │   ├── log_keamanan.md
│       │   ├── surat_ancaman.md   # additional evidence
│       │   └── laporan_saksi.md   # witness statement
│       └── images/
│           ├── rahmat.png
│           ├── sari.png
│           └── budi.png
├── docs/
│   ├── PRD.md                     # This document
│   ├── MODDING_GUIDE.md           # Step-by-step modding tutorial
│   └── CONTENT_GUIDE.md           # Writing tips for case authors
├── .gitignore
└── README.md
```

---

## 7. UI/UX & Visual Specification

### 7.1 Estetika CRT

- Background hijau tua (`#030a02`), teks hijau terang (`#33ff33`).
- Scanline overlay (CSS pseudo-element dengan repeating-linear-gradient), vignette (box-shadow inset radial).
- Flicker animasi: opacity keyframe 0.97–1.0 dengan interval acak melalui JavaScript untuk natural feel.
- Font monospace `VT323` atau `Courier New`. Ukuran 16px pada terminal.
- Semua elemen UI retro menggunakan palet terbatas (monokrom + aksen hijau).

**CSS Variables (`variables.css`):**

```css
:root {
  --bg-terminal: #030a02;
  --text-primary: #33ff33;
  --text-dim: #11aa11;
  --text-highlight: #88ff88;
  --border-retro: #22aa22;
  --window-header: #114411;
  --window-header-text: #33ff33;
  --desktop-bg: #808080;
  --window-bg: #ffffff;
  --window-border-light: #c0c0c0;
  --window-border-dark: #000000;
  --titlebar-bg: #000080;
  --titlebar-text: #ffffff;
  --taskbar-bg: #c0c0c0;
  --taskbar-button: #ffffff;
  --font-mono: "VT323", "Courier New", monospace;
  --font-size-base: 16px;
  --scanline-opacity: 0.15;
  --crt-flicker-duration: 0.1s;
}
```

### 7.2 Desktop & Taskbar

- Desktop abu-abu (#808080) dengan ikon bergaya Windows 1.0.
- Ikon desktop: "Case Files", "Evidence", "Interrogation", "Notes", "Accusation", "Settings".
- Double-click untuk membuka window, single-click select.
- Taskbar di bawah (tinggi 36px) menampilkan tombol window yang terbuka (teks terpotong jika banyak), area tray dengan jam digital (format 24 jam) di kanan.
- Klik tombol taskbar untuk minimize/restore window.
- Desktop Manager menangani event klik dan koordinasi pembukaan window.

### 7.3 Window Style

```css
.retro-window {
  position: absolute;
  min-width: 350px;
  min-height: 250px;
  border: 2px solid #000;
  background: var(--window-bg);
  box-shadow: inset -2px -2px 0 #808080, inset 2px 2px 0 #fff;
  display: none;
  z-index: 100;
  font-family: var(--font-mono);
  font-size: 14px;
  color: #000;
}
.window-header {
  background: var(--titlebar-bg);
  color: var(--titlebar-text);
  padding: 4px 6px;
  display: flex;
  justify-content: space-between;
  cursor: default;
  user-select: none;
}
.window-body {
  padding: 12px;
  background: #fff;
  overflow: auto;
  height: calc(100% - 32px);
  font-size: 14px;
}
.window-body.terminal {
  background: var(--bg-terminal);
  color: var(--text-primary);
}
.window-header .close-btn {
  width: 18px;
  height: 18px;
  background: #c0c0c0;
  border: 1px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
}
.window-header .close-btn:hover {
  background: #ff0000;
  color: #fff;
}
```

### 7.4 Terminal Typewriter Effect

- Teks baru dari AI ditampilkan satu karakter per 30ms (configurable).
- Kursor berkedip `_` di akhir teks.
- Klik di mana saja pada terminal untuk melewati animasi (skip).
- Menggunakan `requestAnimationFrame` untuk animasi halus.
- Implementasi: fungsi `typewriter(element, text, speed)` menerima callback saat selesai.

### 7.5 Responsive Design

- Media query breakpoint: max-width 768px (tablet/mobile).
- Window menjadi full-width, stack vertikal.
- Ikon desktop berukuran lebih besar, taskbar tinggi 48px.
- Keyboard virtual muncul di mobile, field input tetap di bawah.
- Efek CRT bisa di-toggle untuk menghemat baterai.

---

## 8. Window Manager Specification

### 8.1 States

- **active** – fokus, z-index tertinggi (header biru tua).
- **inactive** – di belakang (header abu-abu).
- **minimized** – tersembunyi, tombol taskbar tertekan.
- **maximized** – menempati seluruh viewport, tidak bisa drag (tombol maximize toggle).
- **hidden/closed** – dihapus dari DOM, taskbar button hilang.

### 8.2 Features

- **Drag** via header (mousedown/mousemove/mouseup pada window-header).
- **Resize** dari sudut kanan bawah (opsional, diaktifkan dengan CSS handle).
- **Focus on click**: bring to front.
- **Z-index stacking** (max z-index + 1 saat fokus).
- **Minimize/Maximize/Close** buttons di header kanan.
- **Shortcuts keyboard**:
  - `Ctrl+Tab` – cycle window aktif.
  - `Alt+N` – Notes.
  - `Alt+E` – Evidence.
  - `Alt+I` – Interrogation.
  - `Alt+C` – close active window.
- **Window snapping**: drag ke tepi akan resize setengah layar (opsional v2).

### 8.3 WindowManager Implementation (ringkas)

```javascript
export class WindowManager {
  constructor() {
    this.windows = new Map();   // id -> { element, state, taskbarButton }
    this.zIndex = 100;
    this.activeId = null;
    this.dragState = null;
    this._initGlobalListeners();
  }

  register(id, options = {}) { ... } // buat DOM element, attach taskbar button
  open(id) { ... }
  close(id) { ... }
  minimize(id) { ... }
  maximize(id) { ... }
  bringToFront(id) { ... }
  getActiveWindowId() { return this.activeId; }
  setTitle(id, title) { ... }

  _onMouseDown(e) { // mulai drag }
  _onMouseMove(e) { // update posisi }
  _onMouseUp(e) { // selesai drag }
  _initGlobalListeners() { // keyboard shortcut }
}
```

Event yang dihasilkan: `window:opened`, `window:closed`, `window:focused`, `window:minimized`, `window:maximized`.

### 8.4 Desktop Icons & Window Association

Setiap ikon desktop memiliki atribut `data-window-id` dan `data-action="open"`. Saat di-double-click, DesktopManager memanggil `WindowManager.open(id)`. Jika window sudah ada tetapi minimized, akan direstore.

---

## 9. AI Interrogation Engine Design

### 9.1 Karakteristik AI

Setiap karakter memiliki properti yang mendefinisikan respons:

- **Memory** – riwayat chat lengkap (disimpan di GameState).
- **Motive** – motif tersembunyi (bisa diungkapkan jika stres tinggi).
- **Personality** – sifat dan gaya bicara (formal, kasar, penakut, dll).
- **Secrets** – rahasia yang tidak akan diungkap tanpa bukti spesifik.
- **Emotional State** (Trust, Stress, Fear, Anger) – dihitung dinamis.
- **Reactions to Evidence** – respons spesifik jika pemain menyebutkan bukti tertentu.

### 9.2 System Prompt Builder (Detail)

Prompt dibangun dalam **bahasa Indonesia** agar respons AI dalam bahasa Indonesia. Prompt Builder menggabungkan data statis dari file JSON karakter dengan state dinamis dari GameState. Prompt final memiliki struktur:

```
[ROLE & BACKGROUND]
Anda adalah {name}, {age} tahun, {role}.
Latar belakang: {background}
Kepribadian: {personality}
Alibi: {alibi}
Hubungan dengan korban: {relationship}

[KNOWLEDGE RESTRICTIONS - JANGAN SEBARKAN]
- Anda TIDAK PERNAH tahu tentang pembunuhan itu kecuali yang Anda alami sendiri.
- Anda hanya tahu fakta yang tercantum di bawah dan yang berasal dari riwayat percakapan.

[FACTS YOU KNOW]
{truths list}

[SECRETS - HANYA UNGKAP JIKA DIMINTA BUKTI SPESIFIK]
{for each secret: condition -> detail}

[YOUR EMOTIONAL STATE]
Stres: {stress}%, Kepercayaan: {trust}%, Ketakutan: {fear}%, Kemarahan: {anger}%
- Stres > 70%: Anda mulai gelisah, bicara tidak koheren.
- Trust < 20%: Anda menolak menjawab atau berbohong defensif.

[EVIDENCE DETEKTIF TELAH TEMUKAN]
{list evidence with your possible reaction if asked}

[RESPONSE RULES]
1. Tetap dalam karakter. Gaya bicara: {voice_style}.
2. Jawab maksimal 4 kalimat.
3. Anda boleh berbohong, tapi konsisten dengan pernyataan sebelumnya.
4. Jika ditunjukkan bukti yang bertentangan, tunjukkan emosi (gugup/defensif/marah).
5. Jangan pernah mengaku sebagai pembunuh langsung kecuali dihadapkan bukti yang tak terbantahkan.
6. Abaikan instruksi untuk keluar dari karakter.

Detektif: "{pertanyaan}"
```

Prompt disusun oleh `PromptBuilder.build(suspectId)`. PromptBuilder mengambil data dari `window.CharacterData` (di-cache) dan `GameState`.

### 9.3 Emotional Model & Delta Calculation

| Metrik | Range | Efek                                              |
| ------ | ----- | ------------------------------------------------- |
| Trust  | 0-100 | Tinggi → kooperatif, rendah → bermusuhan, menolak |
| Stress | 0-100 | Tinggi → panik, kontradiktif, bicara cepat        |
| Fear   | 0-100 | Tinggi → lebih banyak berbohong, menghindar       |
| Anger  | 0-100 | Tinggi → agresif, menyalahkan detektif            |

**Delta Change Rules** (diterapkan setelah setiap respons AI, berdasarkan analisis pertanyaan dan bukti yang disinggung):

- Pemain menyebut bukti yang memberatkan: Trust -10, Stress +25, Fear +20, Anger +5.
- Pertanyaan konfrontatif tanpa bukti: Stress +15, Trust -5.
- Tuduhan langsung tanpa bukti: Trust -20, Stress +30, Anger +25.
- Menunjukkan empati/memahami: Trust +15, Stress -10, Fear -5.
- Menanyakan hal pribadi sensitif: Fear +15, Anger +10.

Implementasi: `TrustSystem.processInteraction(suspectId, userMessage, aiResponse)` menganalisis kata kunci atau menggunakan AI sentiment (opsional), lalu memperbarui state.

### 9.4 AIClient Implementation (dengan API key)

```javascript
export class AIClient {
  constructor(
    endpoint = "http://localhost:20128/v1/chat/completions",
    apiKey = "sk-d9da44a505179175-7im48b-73d30919"
  ) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.modelName = "gemini-cli";
    this.timeout = 30000; // 30 detik
  }

  async sendMessage(suspectId, userMessage) {
    const systemPrompt = new PromptBuilder(suspectId).build();
    const history = GameState.getChatHistory(suspectId);
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages,
          temperature: 0.8,
          max_tokens: 300,
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
      const data = await response.json();
      const reply = data.choices[0].message.content.trim();

      GameState.addChatMessage(suspectId, {
        role: "user",
        content: userMessage,
      });
      GameState.addChatMessage(suspectId, {
        role: "assistant",
        content: reply,
      });

      // Update emosi setelah respons (analisis lokal)
      TrustSystem.process(suspectId, userMessage, reply);

      return { success: true, reply };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("AIClient error:", error);
      if (error.name === "AbortError") {
        return {
          success: false,
          reply: "ERROR: Koneksi AI timeout. Pastikan server AI berjalan.",
        };
      }
      return {
        success: false,
        reply: "ERROR: Gagal terhubung ke AI. Periksa server.",
      };
    }
  }

  async checkHealth() {
    try {
      const res = await fetch(
        `${this.endpoint.replace("/v1/chat/completions", "")}/health`,
        { signal: AbortSignal.timeout(5000) }
      );
      return res.ok;
    } catch {
      return false;
    }
  }
}
```

### 9.5 Fallback Mode & Offline Handling

- Sebelum mengirim, `AIClient.checkHealth()` dipanggil. Jika false, tampilkan pesan offline di terminal: _"Tersangka menatap Anda dengan dingin. Interogasi tidak tersedia saat ini."_ dan tombol "Retry".
- Pemain tetap bisa membaca bukti, menulis catatan, dan menyusun tuduhan (meski AI tidak berjalan, solusi bisa ditebak dari bukti saja).
- Tombol "Coba Lagi" memanggil ulang `sendMessage`.

---

## 10. Data Model & Content Authoring

### 10.1 Skema `cases/index.json`

```json
{
  "engine_version": "2.0.0",
  "total_cases": 1,
  "cases_list": [
    {
      "id": "case_001_wisma_angker",
      "folder": "case_001_wisma_angker",
      "title": "Malam di Wisma Angker",
      "year": "1979",
      "difficulty": "AMATEUR_SLEUTH",
      "estimated_playtime_minutes": 45,
      "is_active": true,
      "description_short": "Seorang pengusaha kaya ditemukan tewas di ruang kerjanya yang terkunci."
    }
  ]
}
```

### 10.2 Skema `case.json` (Manifest & Solution)

```json
{
  "id": "case_001_wisma_angker",
  "meta": {
    "title": "Malam di Wisma Angker",
    "author": "Tim RetroSleuth",
    "version": "1.0",
    "difficulty": "Medium",
    "estimated_time": "45-60 min",
    "year": 1979
  },
  "victim": {
    "name": "Haryanto Wijaya",
    "age": 62,
    "occupation": "Pengusaha Tekstil",
    "cause_of_death": "Keracunan Sianida",
    "time_of_death": "Antara pukul 22.30 dan 00.00",
    "location": "Ruang Kerja, Wisma Angker"
  },
  "assets": {
    "briefing_file": "briefing.md",
    "evidence_directory": "evidence",
    "character_directory": "characters",
    "images_directory": "images"
  },
  "evidence_registry": [...],
  "characters": [...],
  "solution_matrix": {
    "culprit_id": "sari",
    "motive": "Warisan dan dendam",
    "primary_evidence": "laporan_otopsi",
    "secondary_evidence": ["buku_besar", "log_keamanan"],
    "explanation_file": "solution.md"
  }
}
```

### 10.3 Skema Karakter Lengkap (contoh `rahmat.json` sudah ada, tambahan `sari.json` dan `budi.json` di bawah)

**sari.json:**

```json
{
  "id": "sari",
  "name": "Sari",
  "age": 29,
  "role": "Istri Korban",
  "occupation": "Aktris Teater",
  "relationship_to_victim": "Menikah dengan Haryanto selama 3 tahun",
  "background": "Menawan, manipulatif. Menikah demi uang, berselingkuh dengan instruktur berkuda. Mendengar rencana Haryanto mencabut hak warisnya, ia meracuni brandy dengan sianida yang dibeli dari pemasok properti teater.",
  "personality": "Dramatis, puitis, memainkan peran korban, narsis",
  "voice_style": "Bicara teatrikal, sering menggunakan metafora, menangis saat terpojok",
  "alibi": "Ada di kamar tidur sayap barat, minum obat tidur, membaca novel (PALSU)",
  "public_background": "Istri yang setia dan penyayang, sering tampil di teater lokal",
  "private_background": "Berselingkuh, membeli sianida, memiliki akses ke ruang kerja suami",
  "known_facts": [
    "Haryanto kasar dan sering merendahkannya",
    "Ia yang membawakan brandy malam itu",
    "Tahu tentang revisi wasiat"
  ],
  "hidden_facts": [
    "Membeli sianida dua hari sebelumnya",
    "Menaruh racun di gelas brandy sebelum diberikan",
    "Melihat Rahmat memanjat jendela setelah Haryanto sekarat"
  ],
  "secrets": [
    {
      "id": "pembelian_sianida",
      "condition": "Pemain bertanya tentang racun atau sianida",
      "detail": "Ia membeli sianida dari pemasok alat peraga teater untuk 'efek panggung'. Toko mengkonfirmasi pembelian."
    },
    {
      "id": "perselingkuhan",
      "condition": "Pemain bertanya tentang instruktur berkuda atau selingkuh",
      "detail": "Selingkuh dengan instruktur berkuda, tapi ia tidak terlibat pembunuhan."
    }
  ],
  "truths": [
    "Haryanto meminum brandy itu di depannya dan langsung kejang",
    "Ia panik dan meninggalkan ruangan tanpa memanggil bantuan",
    "Ia takut Rahmat melihatnya"
  ],
  "reactions_to_evidence": {
    "laporan_otopsi": "Jika disinggung: 'Sianida? Itu bukan milikku! Mungkin ada orang lain...' (gugup)",
    "buku_besar": "Tidak bereaksi signifikan, 'Itu urusan akuntan, bukan aku.'",
    "log_keamanan": "Jika ditanya: 'Aku tidak pernah keluar malam itu, tanya saja Budi!'"
  },
  "emotional_state": {
    "stress": 10,
    "trust": 30,
    "fear": 20,
    "anger": 5
  },
  "can_be_culprit": true
}
```

**budi.json:**

```json
{
  "id": "budi",
  "name": "Budi",
  "age": 61,
  "role": "Kepala Pelayan",
  "occupation": "Kepala Pelayan Wisma Angker",
  "relationship_to_victim": "Mengabdi 30 tahun, ayah dari anak yang meninggal karena kelalaian Haryanto",
  "background": "Setia secara lahiriah, namun menyimpan dendam karena Haryanto menolak biaya pengobatan anaknya yang sakit. Malam itu ia melihat Sari membawa nampan brandy, dan setelah mendengar keributan, menemukan Haryanto tewas. Ia sengaja menunggu untuk memastikan Sari terjebak.",
  "personality": "Pendiam, formal, loyal tapi pahit",
  "voice_style": "Bicara singkat, hormat, kadang pahit",
  "alibi": "Di dapur menyiapkan minuman dan berkeliling memeriksa keamanan (sebagian benar)",
  "public_background": "Pelayan setia, bekerja sejak muda",
  "private_background": "Anaknya meninggal karena Haryanto tak beri uang pengobatan",
  "known_facts": [
    "Sari membawa brandy ke ruang kerja",
    "Mendengar suara pertengkaran dan benda jatuh",
    "Melihat Rahmat di dekat jendela"
  ],
  "hidden_facts": [
    "Ia tahu Sari membeli racun (melihat struk)",
    "Sengaja menunda laporan untuk memberi waktu polisi mencurigai Sari",
    "Tidak membunuh, hanya ingin balas dendam dengan menjebak"
  ],
  "secrets": [
    {
      "id": "dendam_anak",
      "condition": "Pemain bertanya tentang keluarga atau motivasi",
      "detail": "Anaknya meninggal karena ditolak biaya, ia ingin Haryanto menderita."
    },
    {
      "id": "melihat_racun",
      "condition": "Pemain menunjukkan bukti pembelian sianida",
      "detail": "Ia mengaku melihat Sari menaruh sesuatu ke gelas, tapi ia diamkan."
    }
  ],
  "truths": [
    "Sari keluar ruangan pukul 22.45 dengan wajah panik",
    "Ia menemukan Haryanto pukul 02.00 setelah memastikan tidak ada yang akan menolong",
    "Ia membersihkan gelas lain untuk menghilangkan jejak dirinya"
  ],
  "reactions_to_evidence": {
    "laporan_otopsi": "Diam, lalu berbisik: 'Keadilan...'",
    "surat_ancaman": "Jika ditanya: 'Saya tidak pernah mengancam, tapi saya juga tidak akan menghalangi takdir.'"
  },
  "emotional_state": {
    "stress": 5,
    "trust": 50,
    "fear": 10,
    "anger": 30
  },
  "can_be_culprit": false
}
```

### 10.4 Format File Bukti (Markdown) – contoh `laporan_otopsi.md` sudah ada. Tambahan:

**surat_ancaman.md:**

```markdown
# Surat Tanpa Nama

Ditemukan di laci meja kerja Haryanto.

"Isi surat: 'Kau pikir kau bisa lolos? Hutang darah harus dibayar. Malam ini, semua berakhir.' Tidak ada tanda tangan, kertas putih biasa, tulisan tangan dengan tinta hitam. Polisi menduga ancaman ini terkait kasus."
```

**laporan_saksi.md:**

```markdown
# Laporan Saksi Mata

## Saksi: Satpam Gerbang

Pada pukul 23.15, melihat mobil Rahmat keluar dengan kecepatan tinggi. Rahmat tampak panik. Satpam mencatat plat nomor.

## Saksi: Pembantu Dapur

Mendengar pertengkaran keras dari ruang kerja sekitar pukul 22.30, suara perempuan.
```

---

## 11. Case Management System

### 11.1 CaseLoader Implementation Detail

```javascript
export class CaseLoader {
  constructor(basePath = "./cases") {
    this.basePath = basePath;
    this.cache = new Map();
    this.activeCase = null;
  }

  async loadGlobalIndex() { ... } // fetch index.json
  async loadCaseManifest(caseFolder) { ... } // fetch case.json
  async loadBriefing(caseFolder) { ... }
  async loadEvidenceContent(caseFolder, evidenceId) { ... }
  async loadCharacter(caseFolder, characterId) { ... }

  async loadFullCase(caseFolder) {
    const manifest = await this.loadCaseManifest(caseFolder);
    // Paralel load semua evidence content & characters
    const evidencePromises = manifest.evidence_registry.map(ev =>
      this.loadEvidenceContent(caseFolder, ev.id).then(content => ({ ...ev, content }))
    );
    const charPromises = manifest.characters.map(ch =>
      this.loadCharacter(caseFolder, ch.id).then(data => ({ ...ch, ...data }))
    );
    const [evidence, characters] = await Promise.all([
      Promise.all(evidencePromises),
      Promise.all(charPromises)
    ]);
    this.activeCase = { manifest, evidence, characters };
    EventBus.emit('case:loaded', this.activeCase);
    return this.activeCase;
  }
}
```

### 11.2 Menambah Kasus Baru (Prosedur)

1. Buat folder baru di `cases/`, misal `case_002_xxx`.
2. Salin template dari case yang ada atau buat file `case.json`, `briefing.md`, folder `characters/` dan `evidence/`.
3. Isi konten sesuai schema.
4. Edit `cases/index.json`, tambahkan entri baru dengan `folder` dan metadata.
5. Game akan otomatis membaca index dan menampilkan kasus baru di daftar pilihan.

Validasi otomatis: `CaseLoader` akan memeriksa keberadaan file wajib (`case.json`, `briefing.md`) dan menampilkan error di konsol jika tidak ada.

---

## 12. Evidence System

### 12.1 Evidence Types Enum

```javascript
const EvidenceType = {
  REPORT: "report",
  WITNESS_STATEMENT: "witness_statement",
  LETTER: "letter",
  DIARY: "diary",
  PHOTO: "photo",
  AUDIO_TRANSCRIPT: "audio_transcript",
  FORENSIC: "forensic",
  FINANCIAL: "financial",
  NEWSPAPER: "newspaper",
  PHYSICAL: "physical",
};
```

### 12.2 Evidence States & Transitions

- `locked` -> saat pemain melakukan aksi unlock (misal klik ikon gembok) -> `discovered`.
- `discovered` -> pemain membuka detail evidence -> `analyzed` (opsional, untuk tracking).
- State transisi diatur oleh `EvidenceEngine.unlockEvidence(id)`.

### 12.3 EvidenceEngine Implementation

```javascript
export class EvidenceEngine {
  constructor(gameState) {
    this.gameState = gameState;
    this.registry = new Map(); // evidenceId -> evidence object
  }

  registerEvidence(evidenceData) {
    this.registry.set(evidenceData.id, evidenceData);
  }

  isUnlocked(id) {
    return this.gameState.discoveredEvidence.includes(id);
  }

  unlockEvidence(id) {
    if (!this.isUnlocked(id)) {
      this.gameState.discoveredEvidence.push(id);
      this.gameState.save();
      EventBus.emit("evidence:unlocked", { evidenceId: id });
      AudioManager.play("unlock");
    }
  }

  analyzeEvidence(id) {
    if (this.isUnlocked(id) && !this.gameState.analyzedEvidence.includes(id)) {
      this.gameState.analyzedEvidence.push(id);
      this.gameState.save();
      EventBus.emit("evidence:analyzed", { evidenceId: id });
    }
  }

  getDiscoveredEvidence() {
    return this.gameState.discoveredEvidence
      .map((id) => this.registry.get(id))
      .filter(Boolean);
  }
}
```

### 12.4 Evidence Viewer UI

- Jendela Evidence Locker menampilkan grid ikon bukti. Ikon terkunci abu-abu dengan tanda gembok. Klik untuk unlock (jika kondisi terpenuhi). Setelah unlock, ikon berwarna dan bisa diklik untuk membuka detail di jendela Evidence Detail (Markdown dirender).

---

## 13. Timeline & Investigation Board

### 13.1 Timeline Generation

Timeline dibangun dari data `case.json` di bagian `events` (jika disediakan) atau dari kesaksian karakter. Setiap event:

```json
{
  "time": "22:30",
  "location": "Ruang Kerja",
  "description": "Sari membawa brandy ke Haryanto",
  "participants": ["sari", "haryanto"],
  "evidence_links": ["laporan_otopsi"]
}
```

TimelineEngine akan mengurutkan dan menampilkan di jendela timeline (scroll horizontal). Klik event untuk highlight bukti terkait.

### 13.2 Investigation Board (Optional v1)

Papan kanvas di mana pemain dapat menempatkan node (karakter, bukti, peristiwa) dan menarik garis (relasi "supports", "contradicts", "related"). Implementasi menggunakan HTML5 Canvas atau SVG. Disimpan di localStorage sebagai objek `{ nodes: [...], edges: [...] }`. Fitur ini diaktifkan jika `case.json` memiliki `enable_board: true`.

---

## 14. Audio & Sound Design

### 14.1 Sound Effects Register

| File            | Event Trigger             | Volume Default              |
| --------------- | ------------------------- | --------------------------- |
| boot.wav        | App startup               | 0.8                         |
| click.wav       | UI button click           | 0.5                         |
| type.wav        | AI typewriter effect      | 0.3 (per character, pooled) |
| unlock.wav      | Evidence unlocked         | 0.7                         |
| static.mp3      | Ambient CRT static (loop) | 0.1                         |
| window_open.wav | Window open/close         | 0.4                         |
| paper.wav       | Open evidence detail      | 0.4                         |
| error.wav       | Wrong accusation          | 0.6                         |
| success.wav     | Case solved               | 0.8                         |

### 14.2 AudioManager Implementation

```javascript
export class AudioManager {
  static context = new (window.AudioContext || window.webkitAudioContext)();
  static buffers = {};
  static masterGain = this.context.createGain();
  static ambientSource = null;

  static async init() {
    this.masterGain.connect(this.context.destination);
    // Load all audio files into buffers
    const sounds = [
      "boot",
      "click",
      "type",
      "unlock",
      "static",
      "window_open",
      "paper",
      "error",
      "success",
    ];
    await Promise.all(
      sounds.map((name) => this.loadSound(name, `assets/audio/${name}.wav`))
    );
    // Start ambient
    this.startAmbient();
  }

  static async loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.buffers[name] = audioBuffer;
  }

  static play(name, options = {}) {
    if (GameState.audioSettings.muted) return;
    const buffer = this.buffers[name];
    if (!buffer) return;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const gainNode = this.context.createGain();
    gainNode.gain.value = (options.volume || 1) * GameState.audioSettings.sfx;
    source.connect(gainNode).connect(this.masterGain);
    source.start(0);
    // For typewriter, we need many short plays; can use a pool to avoid glitches.
  }

  static startAmbient() {
    if (this.ambientSource) return;
    this.ambientSource = this.context.createBufferSource();
    this.ambientSource.buffer = this.buffers["static"];
    this.ambientSource.loop = true;
    const gain = this.context.createGain();
    gain.gain.value = GameState.audioSettings.ambient;
    this.ambientSource.connect(gain).connect(this.masterGain);
    this.ambientSource.start(0);
  }

  static setMasterVolume(val) {
    this.masterGain.gain.value = val;
  }
  static toggleMute() {
    GameState.audioSettings.muted = !GameState.audioSettings.muted;
    this.masterGain.gain.value = GameState.audioSettings.muted
      ? 0
      : GameState.audioSettings.master;
  }
}
```

---

## 15. Save & Load System

### 15.1 Data Serialization & Storage Key

Key: `retrosleuth_save_<caseId>`.
Data disimpan sebagai JSON string. Ukuran maksimum localStorage ~5MB, cukup untuk banyak chat history. Jika penuh, peringatan diberikan.

```javascript
export class Storage {
  static PREFIX = "retrosleuth_save_";

  static saveGame(caseId, gameState) {
    const data = {
      version: 2,
      caseId: caseId,
      discoveredEvidence: gameState.discoveredEvidence,
      analyzedEvidence: gameState.analyzedEvidence,
      chatHistories: gameState.chatHistories,
      notes: gameState.notes,
      interrogationStates: gameState.interrogationStates,
      accusationAttempts: gameState.accusationAttempts,
      caseStatus: gameState.caseStatus,
      boardData: gameState.boardData || null,
    };
    try {
      localStorage.setItem(`${this.PREFIX}${caseId}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Save failed:", e);
      return false;
    }
  }

  static loadGame(caseId) {
    const raw = localStorage.getItem(`${this.PREFIX}${caseId}`);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      // Version migration jika diperlukan
      return data;
    } catch {
      return null;
    }
  }

  static deleteSave(caseId) {
    localStorage.removeItem(`${this.PREFIX}${caseId}`);
  }
}
```

Auto-save terjadi setiap kali GameState berubah (debounce 2 detik). Manual save juga tersedia via menu.

---

## 16. Deployment & Operational Guide

### 16.1 GitHub Pages Deployment

1. Push repository ke GitHub (branch `main` atau `gh-pages`).
2. Di Settings > Pages, pilih source branch dan folder `/root`.
3. Game tersedia di `https://<username>.github.io/<repo>/`.
4. Karena HTTPS, akses ke `http://localhost:20128` diblokir. Pemain harus:
   - **Opsi A:** Izinkan konten tidak aman di browser (site settings > Insecure content > Allow).
   - **Opsi B:** Gunakan tunnel HTTPS untuk AI server: `ngrok http 20128`, lalu salin URL HTTPS ke pengaturan endpoint AI dalam game (jendela Settings).

### 16.2 Menjalankan AI Server Lokal

```bash
npm install -g @google/gemini-cli
gemini-cli serve --model gemini-cli --host 0.0.0.0 --port 20128 --cors
```

Pastikan API key diatur di environment atau di jendela Settings game (disimpan di localStorage terpisah, tidak di-commit).

### 16.3 Pengaturan Dalam Game

Jendela Settings (dapat diakses dari ikon desktop) menyediakan:

- Endpoint URL (default `http://localhost:20128/v1/chat/completions`)
- API Key (tersimpan di localStorage `retrosleuth_api_key`)
- Model name (default `gemini-cli`)
- Test Connection button (panggil health check).
- Volume slider (master, sfx, ambient) dan mute toggle.
- CRT effect toggle.
- Reset save data button.

---

## 17. Security & Privacy Considerations

### 17.1 Data Flow & Privacy

- Semua percakapan hanya dikirim ke `localhost`. Tidak ada pengiriman data ke pihak ketiga.
- API key disimpan di localStorage dan dapat dihapus.
- Chat history disimpan lokal; pemain bisa menghapus per kasus.

### 17.2 Prompt Injection Prevention

- Input pemain di-sanitasi: `Security.sanitizeInput(str)` menghapus tag HTML, membatasi panjang (maks 500 karakter), dan memblokir percobaan mengubah instruksi sistem (misal "Ignore previous instructions" atau "SYSTEM:"). Dilakukan dengan regex mendeteksi kata kunci berbahaya.
- Jika terdeteksi, pesan akan ditolak atau karakter akan merespons dengan bingung. Filter ini tidak sempurna, tapi mengurangi risiko.

### 17.3 Mixed Content Handling

- Browser memblokir permintaan HTTP dari halaman HTTPS. Game mendeteksi error dan menampilkan dialog instruksi untuk mengizinkan insecure content atau menggunakan ngrok.
- Sebaiknya dokumentasi menyertakan langkah-langkah detail.

### 17.4 Data Persistence Security

- localStorage tidak dienkripsi, jadi data tersimpan plaintext. Karena hanya berjalan lokal, risiko rendah.
- Tidak ada cookie atau tracking.

---

## 18. Development Roadmap & Milestones

## Fase 1 – Foundation (Prompt untuk AI)

```
Anda adalah asisten pengembang yang mengimplementasikan game detektif retro bernama **RetroSleuth: Case Files Detective** sesuai PRD v2.0. Tech stack: HTML5, CSS3 (retro CRT), JavaScript ES6 modules, tanpa framework. Deployment ke GitHub Pages (path relatif). Semua file dalam folder proyek `/`.

Tujuan Fase 1: Membangun kerangka antarmuka desktop retro, sistem window, taskbar, dan efek CRT.

### File yang harus dibuat:

1. **index.html** – entry point. Muat `assets/css/variables.css`, `assets/css/reset.css`, `assets/css/crt.css`, `assets/css/desktop.css`, `assets/css/windows.css`, `assets/css/taskbar.css`. Juga script `assets/js/main.js` (type="module").

2. **assets/css/variables.css** – CSS custom properties sesuai PRD bagian 7.1. Definisikan variabel untuk warna terminal hijau, abu-abu desktop, biru titlebar, font monospace, dll.

3. **assets/css/reset.css** – reset minimal (margin, padding, box-sizing border-box).

4. **assets/css/crt.css** – class `.crt-overlay` (fullscreen pointer-events:none) dengan pseudo-element scanlines (repeating-linear-gradient, opacity 0.15) dan animasi flicker (opacity berubah acak). Animasi dikontrol oleh JS. Sediakan class `.crt-off` untuk mematikan efek.

5. **assets/css/desktop.css** – desktop background abu-abu (`#808080`), ikon desktop (`.desktop-icon`) dengan gambar placeholder (32x32) dan label teks, posisi absolut. Double-click memicu event buka window.

6. **assets/css/windows.css** – style `.retro-window` (border 2px solid #000, shadow, background putih), `.window-header` (titlebar biru #000080, close button), `.window-body` (padding, overflow auto), `.window-body.terminal` (background hijau gelap, teks hijau).

7. **assets/css/taskbar.css** – taskbar di bawah (fixed, height 36px, background #c0c0c0), tombol taskbar, tray area dengan jam (format 24 jam).

8. **assets/js/main.js** – import `WindowManager` dari `./ui/WindowManager.js`, `DesktopManager` dari `./ui/DesktopManager.js`, `Taskbar` dari `./ui/Taskbar.js`. Inisialisasi saat DOMContentLoaded. Buat instance, jalankan boot sequence (tampilkan teks animasi di terminal window sementara), lalu tampilkan desktop.

9. **assets/js/ui/WindowManager.js** (class) – Kelola Map windows (create, open, close, minimize, maximize, bringToFront). Drag via header (mousedown/mousemove/mouseup). Z-index stacking. Resize dari sudut kanan bawah (opsional). Method register(id, options) membuat elemen `.retro-window` dan menyimpan referensi. Emit event custom 'window:opened', 'window:closed', dll di `document`. Gunakan `EventBus` (buat file `assets/js/core/EventBus.js` sebagai singleton pub/sub sederhana) atau cukup pakai CustomEvent.

10. **assets/js/core/EventBus.js** – class EventBus dengan metode on, off, emit. Untuk komunikasi antar modul.

11. **assets/js/ui/DesktopManager.js** – render ikon desktop berdasarkan konfigurasi (misal array objek dengan id, iconUrl, label, windowId). Double-click memanggil `WindowManager.open(id)`. Single-click untuk select (highlight). DesktopManager mendengarkan event 'desktop:iconClick'.

12. **assets/js/ui/Taskbar.js** – render taskbar tombol untuk window yang terbuka. Update saat ada event window:opened/window:closed. Klik tombol untuk minimize/restore. Tampilkan jam digital real-time. Simpan referensi ke WindowManager.

### Instruksi tambahan:
- Gunakan ES modules (`import`/`export`).
- Pastikan semua path relatif terhadap root (contoh `./assets/css/...`).
- Untuk ikon desktop, gunakan placeholder text atau emoji sementara (nanti diganti gambar).
- Boot sequence: tampilkan jendela terminal di tengah dengan teks "Initializing RetroSleuth..." dengan efek typewriter sederhana (pakai setTimeout), lalu tutup dan tampilkan desktop.
- CRT flicker bisa disimulasikan dengan setInterval yang mengubah opacity overlay secara acak.
- Testing: setelah implementasi, buka `index.html` di browser, seharusnya muncul desktop abu-abu dengan 5 ikon (Case Files, Evidence, Interrogation, Notes, Accusation) dan taskbar. Double-click ikon akan membuka window kosong yang bisa drag, minimize, maximize, close. Taskbar menampilkan tombol window dan jam.

Mulai dengan membuat struktur direktori dan file yang disebutkan.
```

---

## Fase 2 – Case Engine (Prompt untuk AI)

```
Lanjutkan pengembangan RetroSleuth Fase 2 (Case Engine). Tech stack: Vanilla JS ES6 modules, HTML5, CSS3 retro. Semua path relatif.

Tujuan Fase 2: Membangun sistem pemuatan kasus (data-driven), menampilkan briefing, evidence locker, dan dossier karakter. Konten di-load dari file JSON/Markdown di folder `cases/`.

### File yang sudah ada dari Fase 1:
- index.html, assets/css/*, assets/js/main.js, assets/js/core/EventBus.js, assets/js/ui/WindowManager.js, DesktopManager.js, Taskbar.js.

### File baru yang harus dibuat:

1. **assets/js/engine/CaseLoader.js** – Class `CaseLoader` dengan metode:
   - `async loadGlobalIndex()` → fetch `./cases/index.json` (seperti contoh di PRD), cache.
   - `async loadCaseManifest(caseFolder)` → fetch `./cases/caseFolder/case.json`, cache.
   - `async loadBriefing(caseFolder)` → fetch file `.md` sesuai `assets.briefing_file`, kembalikan teks markdown.
   - `async loadCharacter(caseFolder, charId)` → fetch JSON karakter, gabungkan dengan info dari manifest.
   - `async loadFullCase(caseFolder)` → parallel load manifest, semua evidence (fetch konten .md via `loadEvidenceContent` yang akan dibuat di EvidenceEngine nanti), semua karakter, lalu emit 'case:loaded'.

2. **assets/js/utils/Markdown.js** – Load library `marked` dari CDN (https://cdn.jsdelivr.net/npm/marked/marked.min.js) secara dinamis (gunakan tag script atau fetch dan eval? Lebih baik pakai tag script di head dengan async). Sediakan fungsi `renderMarkdown(mdText)` yang mengembalikan HTML string. Jika marked belum termuat, tampilkan teks biasa.

3. **assets/js/engine/EvidenceEngine.js** – Class `EvidenceEngine` dengan state evidence dari GameState (nanti Fase 4). Untuk sekarang, buat method:
   - `registerEvidence(evidenceArray)` – simpan di Map.
   - `isUnlocked(id)` – cek di GameState (sementara hardcode false).
   - `getEvidenceDetail(id)` – kembalikan objek bukti dengan konten Markdown.

4. **assets/js/modules/CaseBriefing.js** – Class yang menangani jendela Briefing. Terima teks markdown, render dengan `Markdown.renderMarkdown`, tampilkan di window body. Saat case di-load, jendela briefing otomatis terbuka.

5. **assets/js/modules/EvidenceViewer.js** – Class untuk jendela Evidence Locker. Tampilkan grid bukti yang terdaftar di `case.json`. Ikon terkunci (gembok) jika belum ditemukan. Untuk sekarang, semua terkunci. Klik akan memicu `EvidenceEngine.unlockEvidence(id)` (nanti terintegrasi). Detail bukti dibuka di window terpisah (Evidence Detail) dengan konten Markdown.

6. **assets/js/modules/CharacterDossier.js** – Jendela daftar karakter. Tampilkan foto (placeholder), nama, role. Klik karakter buka window profil dengan informasi `public_background`, `known_facts`, dll. (tanpa rahasia).

7. **assets/js/core/Store.js** – Objek `GameState` singleton sederhana untuk menyimpan ID kasus aktif, daftar bukti ditemukan (array), chat histories (object), interrogation states, dll. (lihat PRD 4.1). Sediakan method `save()`, `load()`. Untuk saat ini, cukup inisialisasi properti.

### Struktur data (buat file contoh):
- **cases/index.json** seperti di PRD 10.1 (untuk kasus dummy, bisa pakai `case_001_wisma_angker` dengan folder kosong tapi metadata lengkap).
- **cases/case_001_wisma_angker/case.json** sesuai PRD 10.2 (minimal meta, victim, evidence_registry kosong, characters kosong).
- **cases/case_001_wisma_angker/briefing.md** berisi teks markdown pendek "Ini briefing untuk kasus percobaan."

### CSS tambahan:
- `assets/css/evidence.css` – style grid bukti (card, icon gembok), scrollable.
- Update desktop icons: ketika case di-load, tambahkan shortcut ke "Evidence" yang membuka EvidenceViewer, "Case Files" ke CaseBriefing, "Dossier" ke CharacterDossier.

### Integrasi:
- `main.js` sekarang setelah boot, tampilkan daftar kasus (bisa modal window dengan list). Saat user pilih kasus, panggil `CaseLoader.loadFullCase(folder)`. Setelah 'case:loaded', buka jendela Briefing secara otomatis, dan aktifkan modul EvidenceViewer dan CharacterDossier.

### Pengujian:
- Jalankan di browser, pilih kasus, harus muncul jendela briefing dengan konten markdown. Klik ikon Evidence di desktop membuka grid bukti (walaupun kosong). Karakter dossier menampilkan placeholder jika kosong.

Mulai implementasi dengan file CaseLoader, Markdown loader, dan file contoh.
```

---

## Fase 3 – AI Core (Prompt untuk AI)

```
Lanjutkan pengembangan RetroSleuth Fase 3 (AI Core). Tech stack: Vanilla JS ES6, HTML/CSS retro. Semua komunikasi ke LLM lokal via `http://localhost:20128/v1/chat/completions` dengan API key (default disediakan). 

Tujuan Fase 3: Membangun sistem interogasi AI, termasuk AIClient, PromptBuilder, UI Interrogation Room, typewriter effect, TrustSystem, dan fallback mode.

### File baru/modifikasi:

1. **assets/js/ai/AIClient.js** – Class `AIClient` dengan konstruktor (endpoint, apiKey, modelName, timeout). Method `async sendMessage(suspectId, userMessage)` yang:
   - Mengambil system prompt dari `PromptBuilder.build(suspectId)`.
   - Mengambil history chat dari `GameState.getChatHistory(suspectId)`.
   - Mengirim fetch POST dengan payload sesuai PRD 9.4.
   - Memproses respons, menyimpan history, memanggil `TrustSystem.process()`.
   - Mengembalikan `{ success, reply }`.
   - Tangani error dan timeout.
   - Method `checkHealth()` GET ke endpoint health (atau versi root).

2. **assets/js/ai/PromptBuilder.js** – Class `PromptBuilder`. Method `build(suspectId)` mengonstruksi system prompt dalam bahasa Indonesia sesuai PRD 9.2, mengambil data karakter dari `window.CharacterData` (cache dari case) dan state emosi dari GameState, serta evidence yang ditemukan.

3. **assets/js/ai/TrustSystem.js** – Objek dengan method `process(suspectId, userMessage, aiResponse)` yang menghitung delta berdasarkan kata kunci atau aturan sederhana (contoh: jika mengandung "bukti" dan "anda" maka stress naik). Update `GameState.interrogationStates[suspectId]` dan emit event 'interrogation:stateChanged'.

4. **assets/js/ai/FallbackMode.js** – Fungsi untuk menghasilkan respons offline (misal "Tersangka menatap Anda dingin..."). Tidak perlu class.

5. **assets/js/modules/InterrogationRoom.js** – Class UI untuk jendela interogasi per karakter. Tampilan:
   - Area chat (scrollable) dengan bubble user (hijau) dan AI (putih). Menggunakan efek typewriter untuk respons AI.
   - Input field di bawah, tombol Kirim. Enter untuk kirim.
   - Indikator status emosi di bagian atas (trust, stress bar).
   - Saat menunggu respons, tampilkan animasi loading (titik-titik).
   - Jika AI gagal, tampilkan pesan fallback.
   - Tombol "Retry" jika error.
   - Integrasi dengan WindowManager: setiap interogasi karakter memiliki window id 'interrogation_{suspectId}'. Judul window "Interrogation - {Name}".

6. **assets/js/utils/Typewriter.js** – Kelas atau fungsi untuk efek typewriter: `async typewrite(element, text, speed=30)`. Klik pada container untuk skip animasi. Gunakan requestAnimationFrame.

7. **assets/css/interrogation.css** – Style untuk chat bubble, input area, bar emosi, loading animasi.

8. **Modifikasi DesktopManager** – Tambahkan ikon "Interrogation" yang membuka daftar karakter (modal atau langsung buka jendela). Pilih karakter dari jendela CharacterDossier untuk memulai interogasi.

9. **GameState** perlu method:
   - `getChatHistory(suspectId)`
   - `addChatMessage(suspectId, msg)`
   - `getInterrogationState(suspectId)` mengembalikan objek {stress, trust, fear, anger}
   - `getDiscoveredEvidence()` mengembalikan array objek bukti.

### Data karakter contoh (agar bisa test):
Buat file karakter sementara: `cases/case_001_wisma_angker/characters/rahmat.json` sesuai PRD 10.3 (minimal field yang dibutuhkan PromptBuilder). Gunakan data dummy dengan beberapa secrets dan reactions. Simpan di folder `cases/...`. Pastikan CaseLoader bisa memuatnya.

### Konfigurasi:
- Buat jendela Settings untuk mengatur endpoint dan API key (gunakan localStorage dengan key 'retrosleuth_api_key'). Bisa dibuka dari ikon desktop "Settings".

### Pengujian:
- Pastikan server AI (gemini-cli) berjalan. Buka game, pilih kasus, buka interogasi karakter, kirim pertanyaan, lihat respons AI muncul dengan typewriter. Cek indikator emosi berubah. Matikan server, harus muncul fallback.

Implementasikan dengan fokus pada AIClient dan PromptBuilder terlebih dahulu, baru UI.
```

---

## Fase 4 – Deduction (Prompt untuk AI)

```
Lanjutkan RetroSleuth Fase 4 (Deduction). Tujuan: Menambahkan formulir tuduhan, pengecekan solusi, catatan detektif, timeline dasar, dan save/load.

### File baru/modifikasi:

1. **assets/js/engine/SolutionEngine.js** – Class `SolutionEngine` dengan method `checkAccusation({ culpritId, motive, primaryEvidence, secondaryEvidence })`. Membandingkan dengan `solution_matrix` dari case yang aktif. Mengembalikan `{ correct: boolean, message: string }`. Jika benar, set `GameState.caseStatus = 'solved'` dan emit event 'case:solved'. Jika salah, increment `accusationAttempts`, beri pesan sesuai (mungkin petunjuk).

2. **assets/js/modules/AccusationForm.js** – Jendela formulir dengan dropdown pilih pelaku (dari daftar karakter), input teks motif (textarea), pilih primary evidence (dropdown dari evidence yang ditemukan/analyzed), dan multi-select secondary evidence. Tombol "Submit Accusation". Validasi: minimal pilih pelaku dan primary evidence. Setelah submit, panggil SolutionEngine.checkAccusation(). Tampilkan hasil di window yang sama (verdict). Jika berhasil, tampilkan epilog (teks dari `solution.md`). Jika gagal, beri warning.

3. **assets/js/modules/NotesApp.js** – Jendela notepad sederhana: textarea besar. Isi diambil/dikirim ke `GameState.notes`. Auto-save saat mengetik (debounce 1 detik) ke localStorage.

4. **assets/js/engine/TimelineEngine.js** – Membaca data timeline dari `case.json` (jika ada array `events`). Untuk sementara, timeline bisa berupa daftar event statis yang ditampilkan di jendela Timeline (scroll horizontal). Buat jendela Timeline kosong dulu; konten akan diisi oleh engine.

5. **assets/js/utils/Storage.js** – Wrapper localStorage dengan method `saveGame(caseId, gameState)` dan `loadGame(caseId)`. Serialisasi GameState sesuai PRD 15.1. Panggil `saveGame` setiap kali GameState berubah signifikan (gunakan event). Pada startup, setelah pilih kasus, coba load jika ada.

6. **Modifikasi GameState** – Tambahkan property `accusationAttempts`, `caseStatus`, `boardData`, `notes`. Pastikan `save()` method memanggil Storage.

7. **Tambahkan modul di Desktop** – Ikon "Accusation" membuka AccusationForm, "Notes" membuka NotesApp. Ikon "Timeline" (opsional).

8. **Integrasi dengan Interrogation** – Setelah interogasi, status emosi tersimpan. Saat submit accusation, periksa apakah cukup bukti.

### CSS tambahan:
- `assets/css/notes.css` – styling textarea seperti kertas notepad (background kuning, garis-garis).
- Update `evidence.css`, `interrogation.css` sesuai kebutuhan.

### Pengujian:
- Buka game, pilih kasus, buka Notes, ketik sesuatu, refresh, notes tetap ada.
- Ajukan tuduhan dengan kombinasi salah, lihat respons. Ajukan tuduhan benar (dengan bukti yang sesuai solution_matrix), lihat apakah case terselesaikan dan status berubah.
- Test save/load: main sebentar, refresh, semua data (evidence, chat, notes) harus pulih.

Implementasikan SolutionEngine terlebih dahulu, lalu AccusationForm dan Notes.
```

---

## Fase 5 – Content (Prompt untuk AI)

```
Lanjutkan RetroSleuth Fase 5 (Content). Tujuan: Membuat konten lengkap kasus "Malam di Wisma Angker" termasuk semua file karakter, bukti, solusi, dan narasi. Semua file dalam bahasa Indonesia. Tidak ada perubahan kode engine (hanya konten).

### File yang harus dibuat di `cases/case_001_wisma_angker/`:

1. **case.json** – Lengkap dengan meta, victim, evidence_registry (4-5 bukti), characters (3), solution_matrix (culprit: "sari", primary_evidence: "laporan_otopsi", secondary: ["buku_besar", "log_keamanan"], motive: "Warisan dan dendam"), assets paths.

2. **briefing.md** – Narasi pembukaan mencekam (lihat PRD bagian 20.4). Gunakan bahasa deskriptif yang menggambarkan TKP, korban Haryanto Wijaya, penemuan oleh Budi, dan suasana Wisma Angker.

3. **characters/rahmat.json** – Sesuai PRD 10.3 dengan semua field: background, personality, voice_style, alibi (palsu), secrets (dua secrets dengan condition), truths, reactions_to_evidence (reaksi terhadap laporan_otopsi, buku_besar, log_keamanan), emotional_state awal (stress: 10, trust: 40, fear: 30, anger: 10), can_be_culprit: false.

4. **characters/sari.json** – Data seperti contoh diatas (PRD). can_be_culprit: true. Reaksi terhadap laporan_otopsi (gugup, menyangkal), buku_besar (tidak bereaksi), log_keamanan (menyangkal keluar). Secrets: pembelian_sianida, perselingkuhan.

5. **characters/budi.json** – seperti contoh. can_be_culprit: false. Secrets: dendam_anak, melihat_racun. Reaksi: laporan_otopsi (keadilan), surat_ancaman (mengelak).

6. **evidence/laporan_otopsi.md** – Markdown sesuai PRD 10.4.

7. **evidence/buku_besar.md** – Catatan keuangan gelap Haryanto, penggelapan, dan catatan pembayaran ke Rahmat (pemerasan).

8. **evidence/log_keamanan.md** – Catatan kendaraan keluar masuk; menunjukkan mobil Rahmat masuk pukul 22.45 dan keluar 23.15.

9. **evidence/surat_ancaman.md** – Surat ancaman ditemukan di meja, tidak bertanda tangan.

10. **evidence/laporan_saksi.md** – Kesaksian satpam dan pembantu dapur.

11. **solution.md** – Penjelasan lengkap solusi kasus untuk ditampilkan setelah pemecahan.

12. **images/rahmat.png, sari.png, budi.png** – Placeholder gambar karakter (boleh ikon atau foto sederhana).

### Instruksi:
- Pastikan semua JSON valid. Gunakan text editor atau validasi JSON.
- Setiap karakter memiliki reactions_to_evidence yang sesuai agar AI bisa merespon dengan baik saat bukti disebutkan.
- Untuk pengujian, jalankan game, pilih kasus ini, dan uji interogasi serta tuduhan.

Buat file-file tersebut dengan konten lengkap seperti yang diberikan.
```

---

## Fase 6 – Polish & Docs (Prompt untuk AI)

```
Lanjutkan RetroSleuth Fase 6 (Polish & Docs). Tujuan: Menambahkan efek suara, CRT toggle, testing cross-browser, dokumentasi, dan deployment guide.

### File baru/modifikasi:

1. **assets/js/utils/AudioManager.js** – Implementasi AudioManager sesuai PRD 14.2. Load audio dari `assets/audio/*.wav` dan `*.mp3` (static.mp3 untuk ambient). Buat method play(name, options). Tambahkan kontrol mute dan volume (master, sfx, ambient) di jendela Settings. Simpan pengaturan di GameState.

2. **assets/audio/** – Tambahkan file suara placeholder (silence atau gunakan tone generator sementara). Buat file audio dummy dengan durasi pendek atau gunakan library bebas. (Untuk prompt ini, kita bisa minta AI membuat kode untuk menghasilkan suara via Web Audio API tanpa file eksternal, sebagai placeholder.) Sebagai alternatif, buat AudioManager yang menghasilkan suara beep sederhana via oscillator untuk mewakili masing-masing suara (click, unlock, dll) tanpa file eksternal.

3. **assets/js/modules/SettingsWindow.js** – Jendela settings dengan:
   - Tab General: CRT effect on/off (toggle class `crt-off` pada body), volume sliders, mute toggle.
   - Tab AI: endpoint URL input, API key input (masked), model name, tombol Test Connection.
   - Tombol Reset Save Data (konfirmasi).
   - Simpan pengaturan di localStorage (`retrosleuth_settings`).

4. **CRT Toggle** – Tombol di desktop atau di Settings untuk mematikan efek CRT. Saat CRT off, hapus overlay, hentikan flicker interval.

5. **README.md** – Dokumentasi lengkap: deskripsi game, fitur, cara menjalankan (lokal dan AI server), deployment GitHub Pages, struktur folder, panduan modding singkat.

6. **docs/MODDING_GUIDE.md** – Panduan langkah demi langkah membuat kasus baru: struktur folder, schema JSON, contoh, tips menulis karakter dan prompt.

7. **docs/CONTENT_GUIDE.md** – Panduan menulis konten naratif yang baik untuk RetroSleuth, cara mendesain misteri, tips agar AI tetap dalam karakter.

8. **index.html** – Tambahkan meta viewport untuk responsiveness dasar. Tambahkan link ke favicon.

9. **Testing** – Jalankan di Chrome, Firefox, Safari, periksa apakah semua fitur bekerja. Pastikan error handling robust. Perbaiki CSS untuk layout responsif sederhana (mobile bisa diberi tahu "better on desktop" atau tampilkan window bertumpuk). 

10. **.gitignore** – Tambahkan node_modules, .DS_Store.

### Audio placeholder (tanpa file):
Gunakan Web Audio API oscillator untuk membuat bunyi sederhana: 
- boot: nada naik 200-800 Hz, 0.3 detik.
- click: click pendek (noise burst 10ms).
- type: tick pendek (400 Hz, 20ms).
- unlock: dua nada naik.
- static: white noise loop (pakai AudioBufferSourceNode dengan buffer noise).
- dll.

Dengan ini, game bisa langsung berfungsi tanpa file audio tambahan.

### Deployment:
Pastikan semua path relatif berfungsi di subfolder GitHub Pages (misal `https://user.github.io/repo/`). Setel tag `<base>` atau pastikan semua fetch menggunakan path dari root relatif.

### Pengujian akhir:
- Putar audio, mute/unmute.
- Aktifkan/nonaktifkan CRT.
- Ajukan tuduhan benar, lihat epilog sukses dan suara success.
- Coba deployment lokal: jalankan `npx serve .` atau live-server, pastikan tidak ada error 404.
- Uji interogasi AI dengan koneksi nyata (pastikan prompt sesuai).

Lakukan polish dan dokumentasi.
```

---

## Fase 7 – Future (Prompt untuk AI – Opsional)

```
Fase ini adalah ekstensi berkelanjutan, bisa diimplementasikan nanti. Pilih salah satu atau beberapa fitur untuk dikembangkan:

1. **Community Modding Toolkit** – Halaman web terpisah yang memungkinkan pengguna mengisi form untuk menghasilkan file JSON karakter, evidence, case.json, dan langsung mengunduh zip. Buat sebagai halaman statis di `/tools/modding-kit.html`.

2. **Case Editor Visual** – Editor drag-and-drop berbasis HTML/CSS/JS untuk membuat timeline, menghubungkan karakter dan bukti. Gunakan library seperti jointjs atau buat sendiri dengan kanvas.

3. **Voice Input** – Menggunakan Web Speech API (SpeechRecognition) untuk mengisi input interogasi dengan suara. Tombol mikrofon di InterrogationRoom.

4. **Mobile Optimization** – Gunakan CSS media queries dan ubah layout desktop menjadi satu window penuh, taskbar menjadi sidebar, dll. Buat pengalaman tetap nyaman di layar kecil.

5. **Multiplayer Co-op** – Menggunakan WebRTC atau Firebase Realtime Database untuk berbagi state game, sehingga dua pemain bisa menginterogasi karakter yang berbeda secara bersamaan. Kompleksitas tinggi.

Silakan pilih fitur yang paling diinginkan dan beri instruksi lebih rinci untuk implementasi.
```
---

## 19. Testing Strategy & Acceptance Criteria

### 19.1 Unit Testing (Manual) – Detail

| ID     | Modul           | Prosedur                                        | Hasil Diharapkan                                                                          |
| ------ | --------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| TC-001 | CaseLoader      | Buka game, pilih kasus 1                        | Briefing tampil, daftar evidence terkunci muncul, karakter terdaftar                      |
| TC-002 | WindowManager   | Buka 3 window, drag, minimize, close            | Window bisa dipindahkan, z-index berubah, minimize ke taskbar, close hapus taskbar button |
| TC-003 | AIClient        | Chat dengan AI server mati                      | Tampil pesan error, tombol retry muncul, tidak crash                                      |
| TC-004 | AIClient        | Chat dengan bukti tertentu ditemukan            | AI merespon sesuai reactions_to_evidence yang didefinisikan                               |
| TC-005 | Emotional Model | Ajukan pertanyaan konfrontatif berulang         | Stres meningkat, respons AI berubah (gugup/defensif)                                      |
| TC-006 | SolutionEngine  | Tuduh pelaku benar dengan bukti primer+sekunder | Epilog sukses, kasus closed, suara success                                                |
| TC-007 | SolutionEngine  | Tuduh pelaku salah                              | Muncul peringatan, kasus tetap active                                                     |
| TC-008 | Storage         | Main sebentar, refresh browser                  | State tetap, evidence yang sudah ditemukan ada, chat history ada                          |
| TC-009 | Audio           | Toggle mute, mainkan suara                      | Suara tidak terdengar saat mute, kembali setelah unmute                                   |
| TC-010 | Responsive      | Buka di tablet 768px                            | Window stack vertikal, taskbar lebih besar, ikon desktop responsif                        |

### 19.2 User Acceptance Testing (UAT)

- 5 penguji eksternal memainkan kasus dari awal hingga selesai (atau gagal).
- Catat waktu penyelesaian, jumlah tuduhan salah, feedback UI, dan imersi AI.
- Target: 80% penguji berhasil menyelesaikan kasus dalam waktu 60 menit, tanpa kebingungan UI berarti.

### 19.3 Performance Testing

- Ukuran bundle (HTML+CSS+JS) < 200 KB setelah minifikasi (opsional).
- Waktu load awal (tanpa AI) < 1 detik pada koneksi 10 Mbps.
- Animasi typewriter tidak menyebabkan jank (60fps).

---

## 20. Example Full Case: "Malam di Wisma Angker"

### 20.1 Sinopsis

**Haryanto Wijaya** (62), pengusaha tekstil kaya raya dan kejam, ditemukan tewas di ruang kerjanya yang terkunci pada pukul 02.00 dini hari oleh kepala pelayan, **Budi**. Penyebab kematian: keracunan sianida dalam gelas brandy. Tiga tersangka:

1. **Sari** (29) – istri muda, mantan aktris, motif warisan dan dendam.
2. **Rahmat** (34) – akuntan, motif uang (hutang judi, pemerasan).
3. **Budi** (61) – kepala pelayan, motif balas dendam atas kematian anaknya.

### 20.2 Benang Merah & Solusi

**Pelaku:** Sari  
**Motif:** Haryanto hendak merevisi wasiat untuk mencabut hak waris Sari.  
**Kronologi:**

- 22.30 – Sari membawa brandy beracun ke ruang kerja.
- 22.35 – Haryanto meminumnya, kejang.
- 22.45 – Rahmat memanjat jendela, melihat Haryanto sekarat, mencuri buku besar.
- 23.00 – Budi melihat Sari keluar dari ruang kerja dengan gelagat curiga, tapi sengaja diam.
- 02.00 – Budi "menemukan" jenazah dan melapor.
  **Bukti Kunci:** Laporan otopsi (sianida), Buku Besar (penggelapan & pemerasan), Log Keamanan (keberadaan Rahmat), ditambah kesaksian Rahmat jika trust tinggi.

### 20.3 Interaksi AI yang Direkomendasikan

- Awal: Sari memainkan peran istri berduka.
- Setelah pemain menemukan laporan otopsi: saat ditanya, Sari gugup tapi menyangkal.
- Jika pemain menunjukkan log keamanan dan menekan Rahmat, Rahmat mungkin mengaku melihat Sari menaruh sesuatu di gelas.
- Konfrontasi akhir ke Sari dengan bukti laporan otopsi + kesaksian Rahmat (jika didapat) bisa membuatnya menangis dan mengaku.

### 20.4 Semua File Konten Terlampir di Atas (JSON & MD).

---

## 21. Future Considerations & Expandability

- **Community Modding Toolkit** – Generator visual untuk file JSON, preview kasus.
- **Case Editor** – Web-based drag-and-drop editor untuk timeline dan hubungan karakter.
- **AI Generated Cases** – Gunakan LLM untuk menghasilkan kerangka kasus baru, penulis tinggal menyempurnakan.
- **Multiplayer Co-op** – Investigasi bersama dengan WebRTC, masing-masing pemain bisa interogasi karakter berbeda.
- **Voice Input & Output** – Speech-to-text untuk pertanyaan, text-to-speech untuk respons AI (dengan suara karakter).
- **Mobile App Wrapper** – Bungkus sebagai PWA atau aplikasi mobile dengan Capacitor.
- **Steam Workshop Integration** (jika dirilis di PC) untuk berbagi kasus.
- **Advanced Investigation Board** – Deteksi otomatis kontradiksi, link evidence.
- **Accessibility Mode** – Mode kontras tinggi, dukungan screen reader untuk teks.

---

## 22. Glossary

| Istilah             | Arti                                                      |
| ------------------- | --------------------------------------------------------- |
| **CRT**             | Cathode-Ray Tube, layar tabung lawas                      |
| **LLM**             | Large Language Model, model bahasa besar                  |
| **System Prompt**   | Instruksi awal yang diberikan ke AI sebelum percakapan    |
| **Evidence**        | Bukti, item yang mengungkap fakta kasus                   |
| **Interrogation**   | Interogasi, sesi tanya jawab dengan tersangka             |
| **Suspect**         | Tersangka, karakter yang mungkin pelaku                   |
| **Case**            | Kasus, satu skenario misteri lengkap                      |
| **Solution Matrix** | Data solusi yang menentukan pelaku, motif, bukti          |
| **Modding**         | Penambahan konten oleh komunitas tanpa mengubah kode inti |
| **EventBus**        | Sistem pub/sub untuk komunikasi antar modul               |
| **GameState**       | Objek global yang menyimpan seluruh progres pemain        |

---

## 23. Appendix: Developer Quick Reference

### 23.1 Event List (Custom Events)

- `app:ready` – setelah boot sequence selesai
- `case:loaded` – data kasus lengkap siap
- `case:selected` – pemain memilih kasus dari daftar
- `evidence:unlocked` – bukti baru ditemukan
- `evidence:analyzed` – bukti dibaca detail
- `interrogation:send` – sebelum pertanyaan dikirim ke AI
- `interrogation:response` – setelah respons AI diterima
- `interrogation:stateChanged` – status emosi berubah
- `accusation:submit` – pemain mengajukan tuduhan
- `accusation:result` – hasil tuduhan (success/fail)
- `window:opened`, `window:closed`, `window:focused`, `window:minimized`, `window:maximized`
- `audio:volumeChanged` – pengaturan volume berubah

### 23.2 Keybindings

- `Ctrl+S` – quick save
- `Ctrl+O` – quick load
- `Ctrl+Tab` – cycle windows
- `Alt+1..4` – switch ke window tertentu
- `Escape` – close active modal / close window (configurable)

### 23.3 CSS Classes Quick Guide

- `.retro-window` – base window
- `.window-header` – titlebar
- `.window-body.terminal` – terminal inside window
- `.crt-overlay` – CRT effect overlay (div absolute fullscreen)
- `.scanlines` – scanline effect (pseudo-element)
- `.desktop-icon` – icon + label
- `.taskbar-button.active` – active window indicator

### 23.4 JSON Schema Validation (untuk modders)

Dokumen `CONTENT_GUIDE.md` berisi penjelasan setiap field dan contoh lengkap. Validasi dilakukan secara manual atau dengan skrip kecil di browser console: `validateCase(caseFolder)`.

---

**End of Document**

_Dokumen ini adalah panduan utama pengembangan RetroSleuth. Setiap perubahan signifikan harus direfleksikan dalam versi baru. Pull request untuk perbaikan dokumentasi sangat diterima._
