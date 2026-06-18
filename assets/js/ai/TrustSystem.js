import { gameState } from '../core/Store.js';

class TrustSystem {
  process(suspectId, userMessage, aiResponse) {
    const deltas = {
      stress: 0,
      trust: 0,
      fear: 0,
      anger: 0
    };

    const userLower = userMessage.toLowerCase();

    // Simple rule-based delta calculation as per PRD 9.3
    if (userLower.includes('bukti') || userLower.includes('tahu') || userLower.includes('mengaku')) {
      deltas.stress += 15;
      deltas.trust -= 5;
      deltas.fear += 10;
    }

    if (userLower.includes('bohong') || userLower.includes('salah')) {
      deltas.anger += 10;
      deltas.trust -= 10;
      deltas.stress += 5;
    }

    if (userLower.includes('maaf') || userLower.includes('mengerti') || userLower.includes('tolong')) {
      deltas.trust += 10;
      deltas.stress -= 5;
      deltas.fear -= 5;
    }

    // Mentioning specific evidence (basic check)
    const discoveredEvidence = gameState.getDiscoveredEvidence();
    discoveredEvidence.forEach(ev => {
      if (userLower.includes(ev.title.toLowerCase())) {
        deltas.stress += 20;
        deltas.fear += 15;
        deltas.trust -= 10;
      }
    });

    gameState.updateInterrogationState(suspectId, deltas);
  }
}

export const trustSystem = new TrustSystem();
