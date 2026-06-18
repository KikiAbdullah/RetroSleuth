import { eventBus } from '../core/EventBus.js';

export class Taskbar {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.taskbarWindowsEl = document.getElementById('taskbar-windows');
    this.clockEl = document.getElementById('clock');
    
    this._initListeners();
    this._startClock();
  }

  _initListeners() {
    eventBus.on('window:opened', () => this.render());
    eventBus.on('window:closed', () => this.render());
    eventBus.on('window:minimized', () => this.render());
    eventBus.on('window:focused', () => this.render());
  }

  render() {
    this.taskbarWindowsEl.innerHTML = '';
    this.windowManager.windows.forEach(win => {
      if (win.state === 'closed') return;

      const button = document.createElement('button');
      button.className = 'taskbar-button';
      if (this.windowManager.activeWindowId === win.id) {
        button.classList.add('active');
      }
      
      // Ikon
      const iconSpan = document.createElement('span');
      iconSpan.className = 'taskbar-button-icon';
      iconSpan.textContent = win.icon || '📄';
      button.appendChild(iconSpan);
      
      // Teks
      const textSpan = document.createElement('span');
      textSpan.className = 'taskbar-button-text';
      textSpan.textContent = win.options.title;
      button.appendChild(textSpan);
      
      button.onclick = () => {
        if (this.windowManager.activeWindowId === win.id) {
          this.windowManager.minimize(win.id);
        } else {
          this.windowManager.bringToFront(win.id);
        }
      };

      this.taskbarWindowsEl.appendChild(button);
    });
  }

  _startClock() {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      this.clockEl.textContent = `${h}:${m}`;
    };
    update();
    setInterval(update, 1000);
  }
}
