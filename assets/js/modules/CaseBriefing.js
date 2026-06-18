import { markdown } from '../utils/Markdown.js';
import { eventBus } from '../core/EventBus.js';

export class CaseBriefing {
  constructor(windowManager) {
    this.windowManager = windowManager;
    
    eventBus.on('case:loaded', (fullCase) => {
      this.displayBriefing(fullCase);
    });
  }

  displayBriefing(fullCase) {
    const htmlContent = markdown.renderMarkdown(fullCase.briefing);
    
    this.windowManager.register('case-briefing', {
      title: `Briefing: ${fullCase.manifest.meta.title}`,
      content: `<div class="briefing-content">${htmlContent}</div>`,
      width: '600px',
      height: '450px',
      left: '50px',
      top: '50px'
    });

    this.windowManager.open('case-briefing');
  }
}
