import { aiClient } from '../ai/AIClient.js';
import { gameState } from '../core/Store.js';
import { eventBus } from '../core/EventBus.js';
import { typewrite } from '../utils/Typewriter.js';
import { getFallbackResponse } from '../ai/FallbackMode.js';

export class InterrogationRoom {
  constructor(windowManager) {
    this.wm = windowManager;
    this.currentSuspectId = null;
    this.currentWindowId = null;
    
    eventBus.on('interrogation:start', (suspectId) => {
      this.open(suspectId);
    });

    eventBus.on('interrogation:stateChanged', ({ suspectId, state }) => {
      if (this.currentSuspectId === suspectId) {
        this.updateEmotionBars(state);
      }
    });
  }

  open(suspectId) {
    this.currentSuspectId = suspectId;
    this.currentWindowId = `interrogation_${suspectId}`;
    
    const suspect = gameState.state.activeCase.characters.find(c => c.id === suspectId);
    if (!suspect) return;

    if (!this.wm.getWindow(this.currentWindowId)) {
        this.wm.register(this.currentWindowId, {
            title: `Interrogation: ${suspect.name}`,
            icon: '💬',
            content: '<div class="interrogation-container"></div>',
            isTerminal: true
        });
    }
    
    this.wm.open(this.currentWindowId);
    this._render();
  }

  _render() {
    const body = this.wm.getWindowBody(this.currentWindowId);
    if (!body) return;

    const suspectId = this.currentSuspectId;
    const history = gameState.getChatHistory(suspectId) || [];
    const state = gameState.getInterrogationState(suspectId);

    body.innerHTML = `
      <div class="interrogation-container">
        <div class="emotion-bars">
          <div class="emotion-stat">
            <div class="stat-label">Trust</div>
            <div class="stat-bar-bg"><div class="stat-bar-fill" id="trust-${suspectId}" style="width: ${state.trust}%"></div></div>
          </div>
          <div class="emotion-stat">
            <div class="stat-label">Stress</div>
            <div class="stat-bar-bg"><div class="stat-bar-fill" id="stress-${suspectId}" style="width: ${state.stress}%"></div></div>
          </div>
        </div>
        <div class="chat-history" id="chat-${suspectId}">
          ${history.map(msg => `<div class="chat-bubble ${msg.role}">${this._escapeHtml(msg.content)}</div>`).join('')}
        </div>
        <div class="input-area">
          <input type="text" class="interrogation-input" id="input-${suspectId}" placeholder="Ketik pertanyaan...">
          <button class="send-btn" id="send-${suspectId}">KIRIM</button>
        </div>
        <div class="evidence-strip" id="evidence-strip-${suspectId}"></div>
      </div>
    `;
    
    const chatContainer = body.querySelector(`#chat-${suspectId}`);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    this._setupEventListeners(suspectId);
    this._renderEvidenceStrip(suspectId);
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  _setupEventListeners(suspectId) {
    const body = this.wm.getWindowBody(this.currentWindowId);
    const input = body.querySelector(`#input-${suspectId}`);
    const sendBtn = body.querySelector(`#send-${suspectId}`);

    const handleSend = async () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      input.disabled = true;

      gameState.addChatMessage(suspectId, { role: 'user', content: text });
      this._render();

      const result = await aiClient.sendMessage(suspectId, text);
      
      if (!result.success) {
        const fallback = getFallbackResponse(suspectId);
        gameState.addChatMessage(suspectId, { role: 'assistant', content: `[ERROR] ${fallback}` });
      }
      this._render();
    };

    sendBtn.onclick = handleSend;
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
  }

  _renderEvidenceStrip(suspectId) {
    const body = this.wm.getWindowBody(this.currentWindowId);
    const strip = body.querySelector(`#evidence-strip-${suspectId}`);
    if (!strip) return;
    
    const discovered = gameState.getDiscoveredEvidence() || [];
    if (discovered.length === 0) {
      strip.innerHTML = '<span class="system-message">Belum ada bukti ditemukan.</span>';
      return;
    }
    
    strip.innerHTML = discovered.map(ev => 
      `<button class="evidence-chip" data-id="${ev.id}">${ev.icon || '📄'} ${ev.title}</button>`
    ).join('');

    strip.querySelectorAll('.evidence-chip').forEach(btn => {
      btn.onclick = async () => {
        const evId = btn.dataset.id;
        const ev = discovered.find(e => e.id === evId);
        
        gameState.addChatMessage(suspectId, { role: 'system', content: `*Anda menunjukkan: ${ev.title}*` });
        this._render();
        
        const result = await aiClient.sendMessage(suspectId, '', evId);
        if (!result.success) {
          gameState.addChatMessage(suspectId, { role: 'assistant', content: '[ERROR] AI Offline' });
        }
        this._render();
      };
    });
  }

  updateEmotionBars(state) {
    const body = this.wm.getWindowBody(this.currentWindowId);
    if (!body) return;
    const trustBar = body.querySelector(`#trust-${this.currentSuspectId}`);
    const stressBar = body.querySelector(`#stress-${this.currentSuspectId}`);
    if (trustBar) trustBar.style.width = `${state.trust}%`;
    if (stressBar) stressBar.style.width = `${state.stress}%`;
  }
}
