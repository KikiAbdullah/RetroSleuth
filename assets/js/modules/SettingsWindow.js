import { eventBus } from '../core/EventBus.js';

export class SettingsWindow {
  constructor(windowManager) {
    this.windowManager = windowManager;
    
    eventBus.on('settings:open', () => this.open());
  }

  open() {
    const endpoint = localStorage.getItem('retrosleuth_api_endpoint') || "http://localhost:20128/v1/chat/completions";
    const apiKey = localStorage.getItem('retrosleuth_api_key') || "sk-d9da44a505179175-7im48b-73d30919";

    const content = `
      <div style="padding: 15px;">
        <h3>AI Configuration</h3>
        <div style="margin-top: 15px;">
          <label style="display: block; font-size: 12px;">API Endpoint:</label>
          <input type="text" id="settings-endpoint" value="${endpoint}" style="width: 100%; margin-bottom: 10px; font-family: inherit; padding: 5px;">
          
          <label style="display: block; font-size: 12px;">API Key:</label>
          <input type="text" id="settings-key" value="${apiKey}" style="width: 100%; margin-bottom: 15px; font-family: inherit; padding: 5px;">
          
          <button id="settings-save" style="padding: 5px 15px; font-family: inherit; background: #c0c0c0; border: 2px solid #000;">SIMPAN</button>
          <p id="settings-status" style="font-size: 10px; margin-top: 10px; color: green; display: none;">Pengaturan disimpan!</p>
        </div>
        <hr style="margin: 20px 0;">
        <h3>Display</h3>
        <button id="toggle-crt" style="padding: 5px 15px; font-family: inherit; background: #c0c0c0; border: 2px solid #000;">TOGGLE CRT</button>
      </div>
    `;

    this.windowManager.register('settings', {
      title: 'Settings',
      content: content,
      width: '400px',
      height: '350px'
    });

    this.windowManager.open('settings');

    document.getElementById('settings-save').onclick = () => {
      const newEndpoint = document.getElementById('settings-endpoint').value;
      const newKey = document.getElementById('settings-key').value;
      
      localStorage.setItem('retrosleuth_api_endpoint', newEndpoint);
      localStorage.setItem('retrosleuth_api_key', newKey);
      
      const status = document.getElementById('settings-status');
      status.style.display = 'block';
      setTimeout(() => { status.style.display = 'none'; }, 2000);
      
      // Update running client (simplification)
      location.reload(); 
    };

    document.getElementById('toggle-crt').onclick = () => {
      const crt = document.getElementById('crt-overlay');
      crt.classList.toggle('crt-off');
    };
  }
}
