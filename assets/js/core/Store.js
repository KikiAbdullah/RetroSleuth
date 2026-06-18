import { eventBus } from './EventBus.js';
import { DatabaseManager } from '../utils/DatabaseManager.js';

class Store {
  constructor() {
    this.state = this._getInitialState();
  }

  _getInitialState() {
    return {
      currentCaseId: null,
      activeCase: null,
      discoveredEvidence: [],
      analyzedEvidence: [],
      chatHistories: {},
      notes: "",
      interrogationStates: {},
      accusationAttempts: 0,
      caseStatus: 'inactive',
      completedObjectives: []
    };
  }

  async setCase(caseData) {
    const caseId = caseData.manifest.id;
    const saved = await DatabaseManager.loadCaseState(caseId);
    
    if (saved) {
        this.state = { ...this._getInitialState(), ...saved };
        this.state.activeCase = caseData; 
    } else {
        this.state = this._getInitialState();
        this.state.activeCase = caseData;
        this.state.currentCaseId = caseId;
        this.state.caseStatus = 'active';
        
        caseData.characters.forEach(char => {
          this.state.interrogationStates[char.id] = char.emotional_state || {
            stress: 10,
            trust: 30,
            fear: 10,
            anger: 5
          };
          this.state.chatHistories[char.id] = [];
        });
    }

    this.save();
    eventBus.emit('state:updated', this.state);
  }

  getChatHistory(suspectId) {
    return this.state.chatHistories[suspectId] || [];
  }

  addChatMessage(suspectId, msg) {
    if (!this.state.chatHistories[suspectId]) {
      this.state.chatHistories[suspectId] = [];
    }
    this.state.chatHistories[suspectId].push(msg);
    this.save();
    eventBus.emit('chat:updated', { suspectId, history: this.state.chatHistories[suspectId] });
  }

  getInterrogationState(suspectId) {
    return this.state.interrogationStates[suspectId] || { stress: 0, trust: 0, fear: 0, anger: 0 };
  }

  updateInterrogationState(suspectId, deltas) {
    const current = this.getInterrogationState(suspectId);
    Object.keys(deltas).forEach(key => {
      if (current[key] !== undefined) {
        current[key] = Math.max(0, Math.min(100, current[key] + deltas[key]));
      }
    });
    this.save();
    eventBus.emit('interrogation:stateChanged', { suspectId, state: current });
  }

  getDiscoveredEvidence() {
    if (!this.state.activeCase) return [];
    return this.state.activeCase.evidence.filter(ev => 
      this.state.discoveredEvidence.includes(ev.id)
    );
  }

  addEvidence(id) {
    if (!this.state.discoveredEvidence.includes(id)) {
      this.state.discoveredEvidence.push(id);
      this.save();
      eventBus.emit('evidence:discovered', id);
    }
  }

  markObjective(id, completed) {
    if (completed) {
      if (!this.state.completedObjectives.includes(id)) this.state.completedObjectives.push(id);
    } else {
      this.state.completedObjectives = this.state.completedObjectives.filter(oid => oid !== id);
    }
    this.save();
    eventBus.emit('objectives:updated', { id, completed });
    eventBus.emit('state:updated', this.state);
  }

  async save() {
    if (this.state.currentCaseId) {
      await DatabaseManager.saveCaseState(this.state.currentCaseId, this.state).catch(console.error);
    }
  }

  static restoreFromSave(state, data) {
    state.discoveredEvidence = data.discoveredEvidence || [];
    state.analyzedEvidence = data.analyzedEvidence || [];
    state.chatHistories = data.chatHistories || {};
    state.notes = data.notes || '';
    state.interrogationStates = data.interrogationStates || {};
    state.accusationAttempts = data.accusationAttempts || 0;
    state.caseStatus = data.caseStatus || 'active';
    state.completedObjectives = data.completedObjectives || [];
    eventBus.emit('state:restored');
  }
}

export const gameState = new Store();
