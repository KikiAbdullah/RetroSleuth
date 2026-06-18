import { gameState } from '../core/Store.js';
import { eventBus } from '../core/EventBus.js';

export class SolutionEngine {
  constructor() {
    this.solution = null;
    
    eventBus.on('case:loaded', (fullCase) => {
      this.solution = fullCase.manifest.solution_matrix;
    });
  }

  checkAccusation({ culpritId, motive, primaryEvidence, secondaryEvidence }) {
    if (!this.solution) return { correct: false, message: "Data solusi tidak tersedia." };

    const culpritMatch = culpritId === this.solution.culprit_id;
    const primaryMatch = primaryEvidence === this.solution.primary_evidence;
    
    // Check if all required secondary evidence are present (or at least one if preferred, PRD says "sejumlah")
    // PRD Pillar 2 says "minimal satu bukti primer dan sejumlah bukti sekunder"
    const missingSecondary = this.solution.secondary_evidence.filter(id => 
      !secondaryEvidence.includes(id)
    );
    
    const secondaryMatch = missingSecondary.length === 0;

    gameState.state.accusationAttempts++;
    gameState.save();

    if (culpritMatch && primaryMatch && secondaryMatch) {
      gameState.state.caseStatus = 'solved';
      gameState.save();
      eventBus.emit('case:solved', this.solution);
      return { correct: true, message: "Tuduhan Anda tepat! Pelaku telah diamankan." };
    }

    // Give some hints
    let hint = "Tuduhan Anda ditolak karena kurangnya bukti atau kesimpulan yang salah.";
    if (!culpritMatch) {
        hint = "Pihak kepolisian merasa tersangka ini memiliki alibi yang kuat. Periksa kembali bukti-bukti Anda.";
    } else if (!primaryMatch) {
        hint = "Tersangka membantah tuduhan Anda. Anda butuh bukti fisik utama yang tak terbantahkan.";
    } else if (!secondaryMatch) {
        hint = "Tuduhan Anda masuk akal, tapi jaksa butuh lebih banyak bukti pendukung untuk menjerat pelaku.";
    }

    return { correct: false, message: hint };
  }
}

export const solutionEngine = new SolutionEngine();
