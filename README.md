# RetroSleuth: Case Files Detective

Sebuah game detektif naratif bergaya retro yang berjalan di browser.

## Cara Menjalankan
1. Pastikan Anda memiliki server inferensi lokal yang mendukung format OpenAI API (seperti `gemini-cli` atau server lokal lainnya) berjalan di `http://localhost:20128`.
2. Buka `index.html` di browser modern (Chrome/Firefox/Edge).
3. Anda mungkin perlu mengaktifkan izin untuk konten tidak aman (Mixed Content) karena API lokal menggunakan HTTP.

## Struktur Folder
- `cases/`: Semua data kasus dalam bentuk JSON/Markdown.
- `assets/`: Aset CSS, JS, dan utilitas.
- `docs/`: Dokumentasi pengembangan.

## Modding
Anda dapat membuat kasus baru dengan menambahkan subfolder di `cases/`. Ikuti panduan di `docs/MODDING_GUIDE.md`.
