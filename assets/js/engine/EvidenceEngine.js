import { gameState } from '../core/Store.js';
import { eventBus } from '../core/EventBus.js';

export class EvidenceEngine {
  constructor() {
    this.evidenceMap = new Map();
    
    eventBus.on('case:loaded', (fullCase) => {
      this.registerEvidence(fullCase.evidence);
    });
  }

  registerEvidence(evidenceArray) {
    this.evidenceMap.clear();
    evidenceArray.forEach(ev => {
      this.evidenceMap.set(ev.id, ev);
    });
  }

  isUnlocked(id) {
    return gameState.state.discoveredEvidence.includes(id);
  }

  unlockEvidence(id) {
    if (this.evidenceMap.has(id)) {
      gameState.addEvidence(id);
    }
  }

  getEvidenceDetail(id) {
    return this.evidenceMap.get(id);
  }
}

export const evidenceEngine = new EvidenceEngine();
