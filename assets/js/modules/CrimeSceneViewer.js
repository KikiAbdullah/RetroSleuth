// assets/js/modules/CrimeSceneViewer.js
import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/Store.js';

export class CrimeSceneViewer {
  constructor(windowManager) {
    this.wm = windowManager;
    this.currentCase = null;
    this.sceneData = null;
  }

  /**
   * Membuka jendela TKP.
   * @param {object} caseData - data dari event case:loaded
   */
  open(caseData) {
    this.currentCase = caseData;
    this.sceneData = caseData.manifest.crime_scene;

    if (!this.sceneData) {
      alert('Data TKP tidak tersedia untuk kasus ini.');
      return;
    }

    const windowId = 'crime-scene';

    // Daftarkan jendela jika belum ada
    if (!this.wm.getWindow(windowId)) {
      this.wm.register(windowId, {
        title: '🔎 TKP – Tempat Kejadian Perkara',
        icon: '🔎',
        content: '',
        isTerminal: false
      });
    }

    // Buka jendela
    this.wm.open(windowId);

    // Render konten
    this._render();

    // Pasang event hotspot
    this._attachHotspotEvents();
  }

  /**
   * Merender UI TKP.
   */
  _render() {
    const body = this.wm.getWindowBody('crime-scene');
    if (!body) return;

    const discovered = gameState.state.discoveredEvidence || [];

    // Bangun HTML hotspot
    const hotspotsHTML = this.sceneData.hotspots.map(h => {
      const isFound = h.evidence_unlock && discovered.includes(h.evidence_unlock);
      const icon = isFound ? '✅' : '🔍';
      const cssClass = isFound ? 'hotspot found' : 'hotspot';
      return `<div class="${cssClass}" 
                   data-id="${h.id}" 
                   data-evidence="${h.evidence_unlock || ''}"
                   style="left:${h.x}%; top:${h.y}%;"
                   title="${h.label}">
                ${icon}
              </div>`;
    }).join('');

    body.innerHTML = `
      <div class="crime-scene-container">
        <div class="crime-scene-header">
          <h3>📍 ${this.sceneData.image_placeholder || 'TKP'}</h3>
          <p class="crime-scene-desc">${this.sceneData.description}</p>
        </div>
        <div class="crime-scene-map" id="crime-scene-map">
          ${hotspotsHTML}
          <div class="crime-scene-grid">
            <span class="grid-label tl">Meja</span>
            <span class="grid-label tr">Jendela</span>
            <span class="grid-label bl">Lemari</span>
            <span class="grid-label br">Pintu</span>
          </div>
        </div>
        <div class="crime-scene-log" id="crime-scene-log">
          <p class="log-placeholder">Klik hotspot 🔍 untuk memeriksa area.</p>
        </div>
      </div>
    `;
  }

  /**
   * Memasang event listener pada setiap hotspot.
   */
  _attachHotspotEvents() {
    const body = this.wm.getWindowBody('crime-scene');
    if (!body) return;

    const logEl = body.querySelector('#crime-scene-log');

    body.querySelectorAll('.hotspot').forEach(hotspot => {
      hotspot.addEventListener('click', () => {
        const id = hotspot.dataset.id;
        const evidenceId = hotspot.dataset.evidence;
        const spotData = this.sceneData.hotspots.find(h => h.id === id);
        if (!spotData) return;

        const discovered = gameState.state.discoveredEvidence || [];
        const isAlreadyFound = evidenceId && discovered.includes(evidenceId);

        // Tampilkan narasi
        let message = '';
        if (isAlreadyFound && spotData.already_found_message) {
          message = spotData.already_found_message;
        } else if (!isAlreadyFound) {
          message = spotData.narrative;
        } else {
          message = spotData.narrative; // fallback
        }

        if (logEl) {
          logEl.innerHTML = `<p><strong>🔎 ${spotData.label}:</strong> ${message}</p>`;
        }

        // Unlock bukti jika ada dan belum ditemukan
        if (evidenceId && !discovered.includes(evidenceId)) {
          gameState.addEvidence(evidenceId);
          // Perbarui ikon hotspot
          hotspot.classList.add('found');
          hotspot.textContent = '✅';
        }
      });
    });
  }
}
