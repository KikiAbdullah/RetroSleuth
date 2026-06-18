import { eventBus } from '../core/EventBus.js';
import { evidenceEngine } from '../engine/EvidenceEngine.js';
import { markdown } from '../utils/Markdown.js';

export class EvidenceViewer {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.currentEvidence = [];

    eventBus.on('case:loaded', (fullCase) => {
      this.currentEvidence = fullCase.evidence;
      this.updateView();
    });

    eventBus.on('evidence:discovered', () => {
      this.updateView();
    });
  }

  updateView() {
    const container = document.createElement('div');
    container.className = 'evidence-grid';

    this.currentEvidence.forEach(ev => {
      const isUnlocked = evidenceEngine.isUnlocked(ev.id);
      const card = document.createElement('div');
      card.className = `evidence-card ${isUnlocked ? '' : 'locked'}`;
      
      card.innerHTML = `
        <div class="evidence-icon">${isUnlocked ? ev.icon : '🔒'}</div>
        <div class="evidence-title">${ev.title}</div>
        ${!isUnlocked ? '<div class="lock-overlay">[LOCKED]</div>' : ''}
      `;

      card.onclick = () => {
        if (isUnlocked) {
          this.showDetail(ev);
        } else {
          // Temporary way to unlock for testing Fase 2
          evidenceEngine.unlockEvidence(ev.id);
        }
      };

      container.appendChild(card);
    });

    const win = this.windowManager.windows.get('evidence');
    if (win) {
      win.body.innerHTML = '';
      win.body.appendChild(container);
    }
  }

  showDetail(ev) {
    const detailId = `evidence-detail-${ev.id}`;
    const htmlContent = markdown.renderMarkdown(ev.content);

    this.windowManager.register(detailId, {
      title: `Evidence: ${ev.title}`,
      content: `<div class="evidence-detail-window">${htmlContent}</div>`,
      width: '400px',
      height: '500px'
    });

    this.windowManager.open(detailId);
  }
}
