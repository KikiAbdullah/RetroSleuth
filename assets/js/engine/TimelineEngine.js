import { eventBus } from '../core/EventBus.js';

export class TimelineEngine {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.events = [];

    eventBus.on('case:loaded', (fullCase) => {
      this.events = fullCase.manifest.timeline || [];
    });
  }

  open() {
    let content = `
        <div style="padding: 15px; font-family: var(--font-mono); color: #000;">
            <h3 style="border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px;">KRONOLOGI KEJADIAN</h3>
    `;
    
    if (this.events.length === 0) {
      content += '<p>Data kronologi tidak ditemukan untuk kasus ini.</p>';
    } else {
      content += '<div style="display: flex; flex-direction: column; gap: 20px; position: relative; padding-left: 20px;">';
      // Vertical line
      content += '<div style="position: absolute; left: 5px; top: 0; bottom: 0; width: 2px; background: #000;"></div>';
      
      this.events.forEach(ev => {
        content += `
          <div style="position: relative;">
            <div style="position: absolute; left: -21px; top: 5px; width: 10px; height: 10px; background: #000; border-radius: 50%;"></div>
            <div style="font-weight: bold; color: #000080; font-size: 14px;">[ ${ev.time} ]</div>
            <div style="font-size: 13px; line-height: 1.4; margin-top: 5px;">${ev.description}</div>
          </div>
        `;
      });
      content += '</div>';
    }
    content += '</div>';

    this.windowManager.register('timeline', {
      title: 'Case Timeline',
      content: content,
      width: '450px',
      height: '400px'
    });

    this.windowManager.open('timeline');
  }
}
