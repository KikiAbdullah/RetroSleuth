export class Storage {
  static saveGame(caseId, state) {
    // Only save essential game state, not the whole manifest to avoid size limits
    const { activeCase, ...essentialState } = state;
    const data = JSON.stringify(essentialState);
    localStorage.setItem(`retrosleuth_${caseId}`, data);
  }

  static loadGame(caseId) {
    const data = localStorage.getItem(`retrosleuth_${caseId}`);
    return data ? JSON.parse(data) : null;
  }

  static clearGame(caseId) {
    localStorage.removeItem(`retrosleuth_${caseId}`);
  }
}
