import { eventBus } from '../core/EventBus.js';

export class CharacterDossier {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.characters = [];

    eventBus.on('case:loaded', (fullCase) => {
      this.characters = fullCase.characters;
      this.updateView();
    });
  }

  updateView() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '20px';
    container.style.padding = '10px';

    this.characters.forEach(char => {
      const card = document.createElement('div');
      card.style.width = '120px';
      card.style.textAlign = 'center';
      card.style.cursor = 'pointer';
      card.style.border = '1px solid #ccc';
      card.style.padding = '10px';
      card.style.background = '#f0f0f0';

      card.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 10px;">👤</div>
        <div style="font-weight: bold;">${char.name}</div>
        <div style="font-size: 11px;">${char.role}</div>
        <button class="interrogate-btn" style="margin-top: 10px; font-family: inherit; font-size: 10px;">INTEROGASI</button>
      `;

      card.querySelector('.interrogate-btn').onclick = (e) => {
        e.stopPropagation();
        eventBus.emit('interrogation:start', char.id);
      };

      card.onclick = () => this.showDetail(char);
      container.appendChild(card);
    });

    const win = this.windowManager.windows.get('dossier');
    if (!win) {
        // Register it if not exists
        this.windowManager.register('dossier', { title: 'Character Dossier', width: '450px', height: '350px' });
    }
    
    const targetWin = this.windowManager.windows.get('dossier');
    targetWin.body.innerHTML = '';
    targetWin.body.appendChild(container);
  }

  showDetail(char) {
    const detailId = `char-detail-${char.id}`;
    const content = `
      <div style="display: flex; gap: 20px;">
        <div style="font-size: 80px;">👤</div>
        <div>
          <h2>${char.name}</h2>
          <p><strong>Umur:</strong> ${char.age || '?'}</p>
          <p><strong>Pekerjaan:</strong> ${char.occupation || '?'}</p>
          <p><strong>Hubungan:</strong> ${char.relationship_to_victim || '?'}</p>
        </div>
      </div>
      <hr style="margin: 15px 0;">
      <h3>Latar Belakang Publik</h3>
      <p>${char.public_background || 'Tidak ada data publik.'}</p>
      <h3>Fakta Diketahui</h3>
      <ul>
        ${(char.known_facts || ['Tidak ada fakta tercatat.']).map(f => `<li>${f}</li>`).join('')}
      </ul>
    `;

    this.windowManager.register(detailId, {
      title: `Dossier: ${char.name}`,
      content: content,
      width: '500px',
      height: '400px'
    });

    this.windowManager.open(detailId);
  }
}
