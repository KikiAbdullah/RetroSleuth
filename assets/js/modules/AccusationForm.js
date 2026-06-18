import { gameState } from '../core/Store.js';
import { eventBus } from '../core/EventBus.js';
import { solutionEngine } from '../engine/SolutionEngine.js';

export class AccusationForm {
  constructor(windowManager) {
    this.windowManager = windowManager;
    
    eventBus.on('case:solved', (solution) => {
        this.showEpilogue(solution);
    });
  }

  open() {
    const activeCase = gameState.state.activeCase;
    if (!activeCase) return;

    const discoveredEvidence = gameState.getDiscoveredEvidence();
    const characters = activeCase.characters;

    const content = `
      <div class="accusation-form" style="padding: 15px; font-family: var(--font-mono); color: #000;">
        <h3 style="margin-bottom: 10px; border-bottom: 2px solid #000; text-transform: uppercase;">Surat Perintah Penangkapan</h3>
        
        <div style="margin-top: 15px;">
          <label style="display: block; font-weight: bold; margin-bottom: 5px;">Tersangka Utama:</label>
          <select id="acc-culprit" style="width: 100%; padding: 5px; font-family: inherit; border: 2px solid #000;">
            <option value="">-- Pilih Tersangka --</option>
            ${characters.map(c => `<option value="${c.id}">${c.name} (${c.role})</option>`).join('')}
          </select>
        </div>

        <div style="margin-top: 15px;">
          <label style="display: block; font-weight: bold; margin-bottom: 5px;">Motif Kejahatan:</label>
          <textarea id="acc-motive" style="width: 100%; height: 60px; font-family: inherit; padding: 5px; border: 2px solid #000;" placeholder="Tuliskan deduksi Anda..."></textarea>
        </div>

        <div style="margin-top: 15px;">
          <label style="display: block; font-weight: bold; margin-bottom: 5px;">Bukti Utama (Primary):</label>
          <select id="acc-primary" style="width: 100%; padding: 5px; font-family: inherit; border: 2px solid #000;">
            <option value="">-- Pilih Bukti --</option>
            ${discoveredEvidence.map(e => `<option value="${e.id}">${e.title}</option>`).join('')}
          </select>
        </div>

        <div style="margin-top: 15px;">
          <label style="display: block; font-weight: bold; margin-bottom: 5px;">Bukti Pendukung:</label>
          <div id="acc-secondary" style="border: 2px solid #000; height: 100px; overflow-y: auto; padding: 5px; background: #fff;">
            ${discoveredEvidence.map(e => `
              <div style="margin-bottom: 5px;">
                <input type="checkbox" value="${e.id}" id="chk-${e.id}">
                <label for="chk-${e.id}" style="font-size: 12px;">${e.title}</label>
              </div>
            `).join('')}
          </div>
        </div>

        <button id="acc-submit" style="width: 100%; margin-top: 20px; padding: 10px; background: #000; color: #33ff33; border: 2px solid #33ff33; font-family: inherit; font-weight: bold; cursor: pointer; text-transform: uppercase;">Kirim ke Markas Besar</button>
        
        <div id="acc-verdict" style="margin-top: 15px; padding: 10px; display: none; border: 2px solid #000; font-weight: bold; font-size: 12px;"></div>
      </div>
    `;

    this.windowManager.register('accusation', {
      title: 'Submit Accusation',
      content: content,
      width: '420px',
      height: '550px'
    });

    this.windowManager.open('accusation');

    document.getElementById('acc-submit').onclick = () => this.handleSubmit();
  }

  handleSubmit() {
    const culpritId = document.getElementById('acc-culprit').value;
    const motive = document.getElementById('acc-motive').value;
    const primaryEvidence = document.getElementById('acc-primary').value;
    const secondaryEvidence = Array.from(document.querySelectorAll('#acc-secondary input:checked')).map(cb => cb.value);

    if (!culpritId || !primaryEvidence) {
      alert("Lengkapi data tersangka dan bukti utama!");
      return;
    }

    const result = solutionEngine.checkAccusation({ culpritId, motive, primaryEvidence, secondaryEvidence });
    
    const verdictEl = document.getElementById('acc-verdict');
    verdictEl.style.display = 'block';
    verdictEl.style.background = result.correct ? '#ccffcc' : '#ffcccc';
    verdictEl.textContent = result.message;

    if (!result.correct) {
        // Play error sound if we had one
    }
  }

  showEpilogue(solution) {
      const win = this.windowManager.windows.get('accusation');
      if (win) {
          win.body.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #000; font-family: var(--font-mono);">
                <h2 style="color: green; border-bottom: 2px solid green; padding-bottom: 10px;">KASUS TERPECAHKAN!</h2>
                <div style="font-size: 48px; margin: 20px 0;">⚖️</div>
                <p style="margin-bottom: 20px; line-height: 1.5;">Keadilan telah ditegakkan. Pelaku telah mengakui perbuatannya setelah dihadapkan pada bukti-bukti yang Anda susun.</p>
                <div style="text-align: left; background: #f0f0f0; padding: 15px; border: 2px solid #000; margin-bottom: 20px;">
                    <strong>Pelaku:</strong> ${solution.culprit_id.toUpperCase()}<br>
                    <strong>Motif:</strong> ${solution.motive}<br>
                </div>
                <button onclick="location.reload()" style="padding: 10px 20px; font-family: inherit; background: #000; color: #fff; border: none; cursor: pointer;">TUTUP BERKAS & KELUAR</button>
            </div>
          `;
      }
  }
}
