import { aiClient } from '../ai/AIClient.js';
import { gameState } from '../core/Store.js';
import { eventBus } from '../core/EventBus.js';
import { getFallbackResponse } from '../ai/FallbackMode.js';

export class InterrogationRoom {
  constructor(windowManager) {
    this.wm = windowManager;
    this.currentSuspectId = null;
    this.currentWindowId = null;
    this.chatContainer = null;
    this.inputField = null;
    this.sendBtn = null;
    this.evidenceStrip = null;
    this.loadingElement = null;
    this.spinnerInterval = null;
    
    eventBus.on('interrogation:start', (suspectId) => {
      this.open(suspectId);
    });

    eventBus.on('interrogation:stateChanged', ({ suspectId }) => {
      if (this.currentSuspectId === suspectId) {
        this._updateEmotionBars();
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
    this._restoreChatHistory();
    this._updateEmotionBars();
  }

  _render() {
    const body = this.wm.getWindowBody(this.currentWindowId);
    if (!body) return;

    const suspectId = this.currentSuspectId;
    const state = gameState.getInterrogationState(suspectId);

    body.innerHTML = `
      <div class="interrogation-container">
        <div class="emotion-bars">
          <div class="emotion-stat">
            <div class="stat-label">Trust</div>
            <div class="stat-bar-bg"><div class="stat-bar-fill trust" id="bar-trust-${suspectId}" style="width: ${state.trust}%"></div></div>
          </div>
          <div class="emotion-stat">
            <div class="stat-label">Stress</div>
            <div class="stat-bar-bg"><div class="stat-bar-fill stress" id="bar-stress-${suspectId}" style="width: ${state.stress}%"></div></div>
          </div>
          <div class="emotion-stat">
            <div class="stat-label">Fear</div>
            <div class="stat-bar-bg"><div class="stat-bar-fill fear" id="bar-fear-${suspectId}" style="width: ${state.fear}%"></div></div>
          </div>
          <div class="emotion-stat">
            <div class="stat-label">Anger</div>
            <div class="stat-bar-bg"><div class="stat-bar-fill anger" id="bar-anger-${suspectId}" style="width: ${state.anger}%"></div></div>
          </div>
        </div>
        <div class="chat-history" id="chat-messages-${suspectId}"></div>
        <div class="chat-input-area">
          <input type="text" class="chat-input" id="chat-input-${suspectId}" placeholder="Ketik pertanyaan...">
          <button class="chat-send-btn" id="chat-send-${suspectId}">Kirim</button>
        </div>
        <div class="evidence-strip" id="evidence-strip-${suspectId}"></div>
      </div>
    `;
    
    this.chatContainer = body.querySelector(`#chat-messages-${suspectId}`);
    this.inputField = body.querySelector(`#chat-input-${suspectId}`);
    this.sendBtn = body.querySelector(`#chat-send-${suspectId}`);
    this.evidenceStrip = body.querySelector(`#evidence-strip-${suspectId}`);

    this._setupEventListeners(suspectId);
    this._renderEvidenceStrip(suspectId);
  }

  _showLoading() {
    if (!this.chatContainer) return;
    this._hideLoading();

    const loadingEl = document.createElement('div');
    loadingEl.id = 'ai-loading';
    loadingEl.className = 'loading-indicator';
    
    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    spinner.textContent = '|';
    
    const text = document.createElement('span');
    text.className = 'thinking-text';
    text.textContent = 'Memproses deduksi...';
    
    loadingEl.appendChild(spinner);
    loadingEl.appendChild(text);
    this.chatContainer.appendChild(loadingEl);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    
    const chars = ['|', '/', '-', '\\'];
    let idx = 0;
    this.spinnerInterval = setInterval(() => {
      spinner.textContent = chars[idx % chars.length];
      idx++;
    }, 150);
    
    this.loadingElement = loadingEl;
  }

  _hideLoading() {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = null;
    }
    if (this.loadingElement) {
      this.loadingElement.remove();
      this.loadingElement = null;
    }
  }

  _restoreChatHistory() {
    if (!this.chatContainer) return;
    const history = gameState.getChatHistory(this.currentSuspectId) || [];
    this.chatContainer.innerHTML = '';
    history.forEach(msg => {
      this._appendMessageBubble(msg.role, msg.content, false);
    });
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  _appendMessageBubble(role, content, animate = false) {
    if (!this.chatContainer) return null;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    
    if (role === 'system') {
      bubble.innerHTML = `<em>${this._escapeHtml(content)}</em>`;
    } else if (role === 'assistant' && animate) {
      this._typewrite(bubble, content);
    } else {
      bubble.textContent = content;
    }

    this.chatContainer.appendChild(bubble);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    return bubble;
  }

  _typewrite(element, text, speed = 30) {
    let i = 0;
    element.textContent = '';
    const interval = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (this.chatContainer) this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, speed);
    
    element.addEventListener('click', () => {
      clearInterval(interval);
      element.textContent = text;
      if (this.chatContainer) this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }, { once: true });
  }

  _setupEventListeners(suspectId) {
    this.sendBtn.onclick = () => this._sendMessage();
    this.inputField.onkeypress = (e) => { if (e.key === 'Enter') this._sendMessage(); };
  }

  async _sendMessage() {
    const text = this.inputField.value.trim();
    if (!text) return;
    this.inputField.value = '';
    this.inputField.disabled = true;
    this.sendBtn.disabled = true;

    gameState.addChatMessage(this.currentSuspectId, { role: 'user', content: text });
    this._appendMessageBubble('user', text, false);

    this._showLoading();

    try {
      const result = await aiClient.sendMessage(this.currentSuspectId, text);
      this._hideLoading();
      
      if (!result.success) {
        const fallback = getFallbackResponse(this.currentSuspectId);
        gameState.addChatMessage(this.currentSuspectId, { role: 'assistant', content: `[ERROR] ${fallback}` });
        this._appendMessageBubble('assistant', `[ERROR] ${fallback}`, false);
      } else {
        this._appendMessageBubble('assistant', result.reply, true);
        
        // Cek reveals_evidence
        const suspect = gameState.state.activeCase.characters.find(c => c.id === this.currentSuspectId);
        if (suspect?.reveals_evidence && !gameState.state.interrogationFirstDone[this.currentSuspectId]) {
          gameState.state.interrogationFirstDone[this.currentSuspectId] = true;
          suspect.reveals_evidence.forEach(id => gameState.addEvidence(id));
          gameState.save();
          this._renderEvidenceStrip(this.currentSuspectId);
        }
      }
    } catch (error) {
      this._hideLoading();
      this._appendMessageBubble('system', 'Gagal menghubungi AI.', false);
    } finally {
      this.inputField.disabled = false;
      this.sendBtn.disabled = false;
      this.inputField.focus();
      this._updateEmotionBars();
    }
  }

  _renderEvidenceStrip(suspectId) {
    if (!this.evidenceStrip) return;
    const discovered = gameState.getDiscoveredEvidence() || [];
    if (discovered.length === 0) {
      this.evidenceStrip.innerHTML = '<span class="system-message">Belum ada bukti ditemukan.</span>';
      return;
    }
    
    this.evidenceStrip.innerHTML = discovered.map(ev => 
      `<button class="evidence-chip" data-id="${ev.id}">${ev.icon || '📄'} ${ev.title}</button>`
    ).join('');

    this.evidenceStrip.querySelectorAll('.evidence-chip').forEach(btn => {
      btn.onclick = async () => {
        const evId = btn.dataset.id;
        const ev = discovered.find(e => e.id === evId);
        
        gameState.addChatMessage(suspectId, { role: 'system', content: `*Anda menunjukkan: ${ev.title}*` });
        this._appendMessageBubble('system', `*Anda menunjukkan: ${ev.title}*`, false);
        
        this._showLoading();
        const result = await aiClient.sendMessage(suspectId, '', evId);
        this._hideLoading();
        
        if (!result.success) {
          gameState.addChatMessage(suspectId, { role: 'assistant', content: '[ERROR] AI Offline' });
          this._appendMessageBubble('assistant', '[ERROR] AI Offline', false);
        } else {
          this._appendMessageBubble('assistant', result.reply, true);
        }
      };
    });
  }

  _updateEmotionBars() {
    const state = gameState.getInterrogationState(this.currentSuspectId);
    const body = this.wm.getWindowBody(this.currentWindowId);
    if (!body) return;
    
    const trustBar = body.querySelector(`#bar-trust-${this.currentSuspectId}`);
    const stressBar = body.querySelector(`#bar-stress-${this.currentSuspectId}`);
    const fearBar = body.querySelector(`#bar-fear-${this.currentSuspectId}`);
    const angerBar = body.querySelector(`#bar-anger-${this.currentSuspectId}`);
    
    if (trustBar) trustBar.style.width = `${state.trust}%`;
    if (stressBar) stressBar.style.width = `${state.stress}%`;
    if (fearBar) fearBar.style.width = `${state.fear}%`;
    if (angerBar) angerBar.style.width = `${state.anger}%`;
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
