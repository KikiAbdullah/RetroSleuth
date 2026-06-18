import { gameState } from '../core/Store.js';

export class NotesApp {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.saveTimeout = null;
  }

  open() {
    const content = `
      <div class="notes-container" style="height: 100%; display: flex; flex-direction: column;">
        <textarea id="notes-area" class="notes-paper" placeholder="Ketik catatan penyelidikan di sini...">${gameState.state.notes || ''}</textarea>
      </div>
    `;

    this.windowManager.register('notes', {
      title: 'Detective Notes',
      content: content,
      width: '400px',
      height: '500px'
    });

    this.windowManager.open('notes');

    const area = document.getElementById('notes-area');
    area.focus();
    
    area.oninput = () => {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        gameState.state.notes = area.value;
        gameState.save();
      }, 1000);
    };
  }
}
