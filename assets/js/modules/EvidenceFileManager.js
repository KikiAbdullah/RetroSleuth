import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/Store.js';
import { markdown } from '../utils/Markdown.js';

export class EvidenceFileManager {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.currentCase = null;
    this.currentFolder = null;
    this.container = null;
    this.sidebarEl = null;
    this.filePaneEl = null;
    this.addressBarEl = null;
    this._listen();
  }

  _listen() {
    eventBus.on('case:loaded', (caseData) => {
      this.currentCase = caseData;
      this.currentFolder = null;
      if (this.container) this.render();
    });
    eventBus.on('evidence:unlocked', () => {
      if (this.container) this._refresh();
    });
  }

  open(container) {
    this.container = container;
    if (this.currentCase) {
      this.render();
    } else {
      container.innerHTML = '<p style="padding:20px;">Tidak ada kasus dimuat. Buka Case Files terlebih dahulu.</p>';
    }
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';
    
    // Address bar
    this.addressBarEl = document.createElement('div');
    this.addressBarEl.className = 'efm-addressbar';
    this.container.appendChild(this.addressBarEl);
    
    // Main layout
    const main = document.createElement('div');
    main.className = 'efm-main';
    
    this.sidebarEl = document.createElement('div');
    this.sidebarEl.className = 'efm-sidebar';
    
    this.filePaneEl = document.createElement('div');
    this.filePaneEl.className = 'efm-filepane';
    
    main.appendChild(this.sidebarEl);
    main.appendChild(this.filePaneEl);
    this.container.appendChild(main);
    
    this._renderSidebar();
    
    // Default: pilih folder pertama
    const folders = this._getFolders();
    if (folders.length > 0) {
      this._onFolderClick(folders[0].name);
    }
  }

  _getFolders() {
    const manifest = this.currentCase.manifest;
    const structure = manifest.evidence_structure;
    if (structure && Object.keys(structure).length > 0) {
      return Object.keys(structure).map(name => ({ name, items: structure[name] }));
    } else {
      const allIds = manifest.evidence_registry.map(e => e.id);
      return [{ name: 'Semua Bukti', items: allIds }];
    }
  }

  _getEvidenceById(id) {
    return this.currentCase.manifest.evidence_registry.find(e => e.id === id);
  }

  _renderSidebar() {
    if (!this.sidebarEl) return;
    const folders = this._getFolders();
    this.sidebarEl.innerHTML = '<div class="efm-sidebar-title">Folder</div>';
    folders.forEach(folder => {
      const el = document.createElement('div');
      el.className = `efm-folder-item ${this.currentFolder === folder.name ? 'active' : ''}`;
      el.innerHTML = `<span>📁</span> ${folder.name}`;
      el.addEventListener('click', () => this._onFolderClick(folder.name));
      this.sidebarEl.appendChild(el);
    });
  }

  _onFolderClick(folderName) {
    this.currentFolder = folderName;
    this._renderSidebar();
    this._renderFilePane();
    this.addressBarEl.textContent = `Evidence > ${folderName}`;
  }

  _renderFilePane() {
    if (!this.filePaneEl || !this.currentFolder) return;
    const folders = this._getFolders();
    const folder = folders.find(f => f.name === this.currentFolder);
    if (!folder) return;

    // Filter hanya bukti yang sudah ditemukan
    const discoveredIds = gameState.state.discoveredEvidence || [];
    const itemsToShow = folder.items.filter(id => discoveredIds.includes(id));

    if (itemsToShow.length === 0) {
      this.filePaneEl.innerHTML = `<p style="padding: 20px; color: #888;">Folder kosong – lanjutkan investigasi.</p>`;
      return;
    }

    let html = '<ul class="efm-filelist">';
    itemsToShow.forEach(id => {
      const evidence = this._getEvidenceById(id);
      if (!evidence) return;
      
      const isAnalyzed = gameState.state.analyzedEvidence?.includes(id);
      const statusIcon = isAnalyzed ? '✅' : '🔍';
      
      html += `<li class="efm-file-item unlocked" data-evidence-id="${id}">
        <span class="efm-file-icon">${evidence.icon || '📄'}</span>
        <span class="efm-file-name">${evidence.title}</span>
        <span class="efm-file-status">${statusIcon}</span>
      </li>`;
    });
    html += '</ul>';
    this.filePaneEl.innerHTML = html;

    // Event listener untuk item yang sudah ditemukan
    this.filePaneEl.querySelectorAll('.efm-file-item.unlocked').forEach(item => {
      item.addEventListener('click', () => this._onFileClick(item.dataset.evidenceId));
      item.style.cursor = 'pointer';
    });
  }

  _onFileClick(evidenceId) {
    const evidence = this._getEvidenceById(evidenceId);
    if (!evidence) return;
    
    const wm = this.windowManager;
    const detailId = `evidence-detail-${evidenceId}`;
    
    if (wm.windows.has(detailId)) {
      wm.open(detailId);
      return;
    }

    wm.register(detailId, {
      title: evidence.title,
      icon: evidence.icon,
      content: '<p>Memuat...</p>',
      isTerminal: false
    });
    wm.open(detailId);
    
    const caseFolder = this.currentCase.folder || this.currentCase.manifest.id;
    if (!caseFolder) {
      console.error('Tidak dapat menentukan folder kasus.');
      return;
    }

    fetch(`./cases/${caseFolder}/evidence/${evidence.file}`)
      .then(r => r.text())
      .then(md => {
        const html = markdown.renderMarkdown(md);
        const win = wm.windows.get(detailId);
        if (win) {
          win.body.innerHTML = `<div style="padding:15px; color:#000;">${html}</div>`;
        }
      })
      .catch(err => {
        console.error('Gagal memuat detail bukti:', err);
        const win = wm.windows.get(detailId);
        if (win) {
          win.body.innerHTML = '<p style="padding:15px; color:red;">Gagal memuat konten bukti.</p>';
        }
      });
  }

  _refresh() {
    if (this.currentFolder) {
      this._renderFilePane();
    }
    this._renderSidebar();
  }
}
