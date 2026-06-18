import { gameState } from '../core/Store.js';

export class PromptBuilder {
  constructor(suspectId) {
    this.suspectId = suspectId;
  }

  build(presentedEvidenceId = null) {
    const activeCase = gameState.state.activeCase;
    if (!activeCase) return "Anda adalah tersangka. Case data missing.";

    const char = activeCase.characters.find(c => c.id === this.suspectId);
    if (!char) return "Karakter tidak ditemukan.";

    const emo = gameState.getInterrogationState(this.suspectId);
    const discoveredEvidence = gameState.getDiscoveredEvidence();
    
    // Ringkasan data untuk menghemat token
    let prompt = this._summarizeForPrompt(char, discoveredEvidence, emo);
    
    if (presentedEvidenceId) {
      const ev = discoveredEvidence.find(e => e.id === presentedEvidenceId);
      if (ev) {
        prompt += `\n[PENTING] Detektif baru saja menunjukkan bukti "${ev.title}".`;
        const reaction = char.reactions_to_evidence?.[ev.id];
        if (reaction) prompt += ` Reaksi Anda: ${reaction}`;
      }
    }
    
    prompt += `\nDetektif: "{question}"`;
    return prompt.trim();
  }

  _summarizeForPrompt(character, knownEvidence, state) {
    let prompt = `Anda adalah ${character.name}, ${character.age || '?'} tahun, ${character.role}.\n`;
    prompt += `Kepribadian: ${character.personality || 'Normal'}\n`;
    prompt += `Alibi: ${character.alibi || 'Tidak ada'}\n`;
    
    const keyFacts = character.known_facts?.slice(0, 5) || [];
    if (keyFacts.length) prompt += `Fakta penting:\n${keyFacts.map(f => `- ${f}`).join('\n')}\n`;
    
    if (character.secrets?.length) {
      prompt += `Rahasia:\n${character.secrets.map(s => `- ${s.detail.substring(0, 60)}... (syarat: ${s.condition})`).join('\n')}\n`;
    }
    
    prompt += `Status Emosi: Stres ${state.stress}%, Trust ${state.trust}%, Fear ${state.fear}%, Anger ${state.anger}%.\n`;
    
    if (knownEvidence.length) {
      prompt += `Bukti yang diketahui:\n${knownEvidence.map(ev => `- ${ev.title}`).join('\n')}\n`;
    }
    
    prompt += `Aturan: Jawab dalam karakter, maks 4 kalimat, konsisten, jangan mengaku kecuali terpojok bukti.\n`;
    return prompt;
  }
}
