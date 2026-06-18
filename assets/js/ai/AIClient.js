import { gameState } from '../core/Store.js';
import { PromptBuilder } from './PromptBuilder.js';
import { trustSystem } from './TrustSystem.js';

export class AIClient {
  constructor() {
    this.endpoint = localStorage.getItem('retrosleuth_api_endpoint') || "http://localhost:20128/v1/chat/completions";
    this.apiKey = localStorage.getItem('retrosleuth_api_key') || "sk-d9da44a505179175-7im48b-73d30919";
    this.modelName = "gemini-cli";
    this.timeout = 30000;
  }

  async sendMessage(suspectId, userMessage, presentedEvidenceId = null) {
    const builder = new PromptBuilder(suspectId);
    const systemPrompt = builder.build(presentedEvidenceId);
    let history = gameState.getChatHistory(suspectId);
    
    // Batasi riwayat chat
    const MAX_HISTORY = 8;
    if (history.length > MAX_HISTORY) {
        history = history.slice(-MAX_HISTORY);
    }
    
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages,
          temperature: 0.8,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const reply = data.choices[0].message.content.trim();

      gameState.addChatMessage(suspectId, { role: "user", content: userMessage });
      gameState.addChatMessage(suspectId, { role: "assistant", content: reply });

      // Update emotion state
      trustSystem.process(suspectId, userMessage, reply);

      return { success: true, reply };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("AIClient error:", error);
      return { success: false, error: error.message };
    }
  }

  async checkHealth() {
    try {
      const baseUrl = this.endpoint.replace('/v1/chat/completions', '');
      const response = await fetch(`${baseUrl}/health`, { method: 'GET' });
      return response.ok;
    } catch (e) {
      return false;
    }
  }
}

export const aiClient = new AIClient();
