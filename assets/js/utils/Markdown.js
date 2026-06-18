export class Markdown {
  constructor() {
    this.isLoaded = false;
    this._loadLib();
  }

  _loadLib() {
    if (window.marked) {
      this.isLoaded = true;
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.async = true;
    script.onload = () => {
      this.isLoaded = true;
    };
    document.head.appendChild(script);
  }

  renderMarkdown(mdText) {
    if (this.isLoaded && window.marked) {
      // Use marked.parse for newer versions
      return window.marked.parse ? window.marked.parse(mdText) : window.marked(mdText);
    }
    // Fallback to simple line breaks if marked not loaded
    return mdText.replace(/\n/g, '<br>');
  }
}

export const markdown = new Markdown();
