import { gameState } from '../core/Store.js';
import { eventBus } from '../core/EventBus.js';

export class ObjectivesTracker {
  constructor(windowManager) {
    this.windowManager = windowManager;
    
    eventBus.on('case:loaded', (fullCase) => {
      this.objectives = fullCase.manifest.objectives || [];
      this.render();
    });
  }

  render() {
    const content = `
      <div class="objectives-container" style="padding: 15px; font-family: var(--font-mono); color: #000;">
        <h3 style="border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px;">TUGAS DETEKTIF</h3>
        <ul style="list-style: none; padding: 0;">
          ${this.objectives.map(obj => {
            const isCompleted = gameState.state.completedObjectives.includes(obj.id);
            return `
              <li style="margin-bottom: 10px; display: flex; align-items: start; gap: 10px;">
                <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="window.toggleObjective('${obj.id}', this.checked)">
                <div>
                  <div style="${isCompleted ? 'text-decoration: line-through;' : ''}">${obj.text}</div>
                  <div style="font-size: 10px; color: #666; margin-top: 2px;">Hint: ${obj.hint}</div>
                </div>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `;

    this.windowManager.register('objectives', {
      title: 'Objectives',
      content: content,
      width: '350px',
      height: '400px'
    });
  }

  open() {
    this.windowManager.open('objectives');
  }
}

window.toggleObjective = (id, completed) => {
    gameState.markObjective(id, completed);
};
