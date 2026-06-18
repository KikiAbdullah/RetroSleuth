import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/Store.js';

export class CaseHub {
  constructor() {
    this.currentCase = null;
    this.container = null;
    this._listen();
  }

  _listen() {
    eventBus.on('case:loaded', (caseData) => {
      this.currentCase = caseData;
      if (this.container) {
        this._render();
      }
    });
    
    eventBus.on('state:updated', () => {
      if (this.container) {
        this._render();
      }
    });
  }

  /**
   * Dipanggil saat ikon "Case Files" diklik.
   * @param {HTMLElement} container - elemen body jendela
   */
  open(container) {
    this.container = container;
    this._render();
  }

  _render() {
    if (!this.container) return;
    if (!this.currentCase) {
      this._loadCaseList();
      return;
    }

    const manifest = this.currentCase.manifest;
    const meta = manifest.meta;
    const victim = manifest.victim;
    const caseStatus = gameState.state.caseStatus || 'active';

    const statusText = caseStatus === 'solved' ? '✅ Terpecahkan' : '🔎 Dalam Investigasi';
    const statusColor = caseStatus === 'solved' ? '#33ff33' : '#ffaa00';

    let html = `
      <div class="case-hub">
        <div class="case-hub-header">
          <h1 class="case-hub-title">${meta.title || 'Kasus Tanpa Judul'}</h1>
          <p class="case-hub-meta">
            <span>Tahun: ${meta.year || '?'}</span> • 
            <span>Penulis: ${meta.author || '?'}</span> • 
            <span>Kesulitan: ${meta.difficulty || '?'}</span>
          </p>
          <p class="case-hub-status" style="color: ${statusColor};">${statusText}</p>
        </div>
        <div class="case-hub-victim">
          <h3>🕯️ Korban</h3>
          <table class="case-hub-table">
            <tr><td>Nama</td><td>:</td><td>${victim.name || '?'}</td></tr>
            <tr><td>Usia</td><td>:</td><td>${victim.age || '?'} tahun</td></tr>
            <tr><td>Pekerjaan</td><td>:</td><td>${victim.occupation || '?'}</td></tr>
            <tr><td>Penyebab Kematian</td><td>:</td><td>${victim.cause_of_death || '?'}</td></tr>
            <tr><td>Waktu Kematian</td><td>:</td><td>${victim.time_of_death || '?'}</td></tr>
            <tr><td>Lokasi</td><td>:</td><td>${victim.location || '?'}</td></tr>
          </table>
        </div>
        <div class="case-hub-description">
          <h3>📝 Deskripsi Singkat</h3>
          <p>${meta.description || 'Tidak ada deskripsi.'}</p>
        </div>
        <div class="case-hub-actions">
          <button class="case-hub-btn" data-action="briefing">📄 Baca Briefing</button>
          ${caseStatus === 'solved' ? `<button class="case-hub-btn" data-action="solution">🔍 Lihat Solusi</button>` : ''}
          <button class="case-hub-btn" data-action="change-case" style="margin-left: auto;">📂 Ganti Kasus</button>
        </div>
      </div>`;

    this.container.innerHTML = html;

    // Event listener untuk tombol
    this.container.querySelectorAll('.case-hub-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'briefing') {
          if (!gameState.state.briefingRead) {
            gameState.state.briefingRead = true;
            const initialEvidence = this.currentCase.manifest.initial_evidence || [];
            initialEvidence.forEach(id => gameState.unlockEvidence(id));
            gameState.save();
          }
          eventBus.emit('navigate:briefing', {});
        } else if (action === 'solution') {
          eventBus.emit('navigate:solution', {});
        } else if (action === 'change-case') {
          this.currentCase = null;
          this._render();
        }
      });
    });
  }

  async _loadCaseList() {
    this.container.innerHTML = '<p style="text-align:center; padding:20px;">Memuat daftar kasus...</p>';
    try {
      const response = await fetch('./cases/index.json');
      const data = await response.json();
      const cases = data.cases_list.filter(c => c.is_active !== false);
      this._renderCaseList(cases);
    } catch (error) {
      this.container.innerHTML = '<p style="color:red; padding:20px;">Gagal memuat daftar kasus.</p>';
      console.error(error);
    }
  }

  _renderCaseList(cases) {
    if (!this.container) return;
    let html = '<div class="case-hub"><h2>Daftar Kasus</h2><ul class="case-list">';
    cases.forEach(c => {
      html += `
        <li class="case-list-item" data-folder="${c.folder}">
          <div class="case-list-title">${c.title}</div>
          <div class="case-list-meta">${c.year} • ${c.difficulty || 'Unknown'}</div>
          <div class="case-list-desc">${c.description_short || ''}</div>
        </li>`;
    });
    html += '</ul></div>';
    this.container.innerHTML = html;

    this.container.querySelectorAll('.case-list-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const folder = item.dataset.folder;
        if (folder) {
          eventBus.emit('case:select', { folder });
        }
      });
    });
  }
}
