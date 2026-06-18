import { eventBus } from '../core/EventBus.js';

export class DesktopManager {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.desktopEl = document.getElementById('desktop');
    this.icons = [
      { id: 'case-files', label: 'Case Files', icon: '📁' },
      { id: 'evidence', label: 'Evidence', icon: '🔍' },
      { id: 'crime-scene', label: 'Crime Scene', icon: '🔎' },
      { id: 'dossier', label: 'Dossier', icon: '👤' },
      { id: 'timeline', label: 'Timeline', icon: '📅' },
      { id: 'notes', label: 'Notes', icon: '📝' },
      { id: 'accusation', label: 'Accusation', icon: '⚖️' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    
    this.render();
  }

  render() {
    this.desktopEl.innerHTML = '';
    const isTouch = 'ontouchstart' in window;
    
    this.icons.forEach(iconData => {
      const iconEl = document.createElement('div');
      iconEl.className = 'desktop-icon';
      iconEl.dataset.id = iconData.id;

      const imgEl = document.createElement('div');
      imgEl.className = 'icon-img';
      imgEl.textContent = iconData.icon;

      const labelEl = document.createElement('div');
      labelEl.className = 'icon-label';
      labelEl.textContent = iconData.label;

      iconEl.appendChild(imgEl);
      iconEl.appendChild(labelEl);

      iconEl.onclick = (e) => {
        e.stopPropagation();
        this.selectIcon(iconEl);
      };

      if (isTouch) {
        iconEl.ontouchend = (e) => {
          e.stopPropagation();
          eventBus.emit('desktop:open', iconData.id);
        };
      } else {
        iconEl.ondblclick = (e) => {
          e.stopPropagation();
          eventBus.emit('desktop:open', iconData.id);
        };
      }

      this.desktopEl.appendChild(iconEl);
    });

    this.desktopEl.onclick = () => {
      this.deselectAll();
    };
  }

  selectIcon(el) {
    this.deselectAll();
    el.classList.add('selected');
    eventBus.emit('desktop:iconClick', el.dataset.id);
  }

  deselectAll() {
    const selected = this.desktopEl.querySelectorAll('.desktop-icon.selected');
    selected.forEach(el => el.classList.remove('selected'));
  }
}
