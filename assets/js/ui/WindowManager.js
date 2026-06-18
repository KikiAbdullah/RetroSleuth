import { eventBus } from '../core/EventBus.js';

export class WindowManager {
  constructor() {
    this.windows = new Map();
    this.zIndexBase = 100;
    this.activeWindowId = null;
    this.dragState = null;

    this._initGlobalListeners();
  }

  _randomPosition(winWidth = 400, winHeight = 300) {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return { left: 0, top: 0 };
    
    const taskbarHeight = 56;
    const padding = 40;
    const maxLeft = Math.max(padding, window.innerWidth - winWidth - padding);
    const maxTop = Math.max(padding, window.innerHeight - winHeight - taskbarHeight - padding);
    const minLeft = padding;
    const minTop = padding;

    const left = Math.floor(Math.random() * (maxLeft - minLeft + 1)) + minLeft;
    const top = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
    
    return { left, top };
  }

  register(id, options = {}) {
    if (this.windows.has(id)) {
        const win = this.windows.get(id);
        if (options.content && win.element) {
          const body = win.element.querySelector('.window-body');
          if (body) body.innerHTML = options.content;
        }
        return win;
    }

    const winWidth = options.width || 400;
    const winHeight = options.height || 300;
    const pos = options.left && options.top 
      ? { left: options.left, top: options.top } 
      : this._randomPosition(winWidth, winHeight);

    const windowEl = document.createElement('div');
    windowEl.id = `window-${id}`;
    windowEl.className = 'retro-window';
    windowEl.style.left = typeof pos.left === 'number' ? `${pos.left}px` : pos.left;
    windowEl.style.top = typeof pos.top === 'number' ? `${pos.top}px` : pos.top;
    windowEl.style.width = typeof winWidth === 'number' ? `${winWidth}px` : winWidth;
    windowEl.style.height = typeof winHeight === 'number' ? `${winHeight}px` : winHeight;
    windowEl.dataset.id = id;
    windowEl.style.display = 'none';

    const header = document.createElement('div');
    header.className = 'window-header';
    
    // Icon
    const iconEl = document.createElement('span');
    iconEl.className = 'window-icon';
    iconEl.textContent = options.icon || '📄';
    header.appendChild(iconEl);

    // Title
    const title = document.createElement('div');
    title.className = 'window-title';
    title.textContent = options.title || 'New Window';

    const controls = document.createElement('div');
    controls.className = 'window-controls';

    const minBtn = document.createElement('div');
    minBtn.className = 'window-btn min-btn';
    minBtn.textContent = '_';
    minBtn.onclick = (e) => { e.stopPropagation(); this.minimize(id); };

    const maxBtn = document.createElement('div');
    maxBtn.className = 'window-btn max-btn';
    maxBtn.textContent = '□';
    maxBtn.onclick = (e) => { e.stopPropagation(); this.maximize(id); };

    const closeBtn = document.createElement('div');
    closeBtn.className = 'window-btn close-btn';
    closeBtn.textContent = 'X';
    closeBtn.onclick = (e) => { e.stopPropagation(); this.close(id); };

    controls.appendChild(minBtn);
    controls.appendChild(maxBtn);
    controls.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(controls);

    const body = document.createElement('div');
    body.className = options.isTerminal ? 'window-body terminal' : `window-body ${options.type || ''}`;
    if (options.content) body.innerHTML = options.content;

    windowEl.appendChild(header);
    windowEl.appendChild(body);

    document.getElementById('desktop').appendChild(windowEl);

    const windowObj = {
      id,
      element: windowEl,
      header,
      body,
      state: 'closed',
      options,
      pos,
      icon: options.icon || '📄'
    };

    this.windows.set(id, windowObj);

    header.onmousedown = (e) => this._onMouseDown(e, id);
    header.ontouchstart = (e) => this._onMouseDown(e, id);
    windowEl.onmousedown = () => this.bringToFront(id);

    return windowObj;
  }

  open(id) {
    const win = this.windows.get(id);
    if (!win) {
      console.warn(`Window dengan ID "${id}" tidak ditemukan.`);
      return;
    }
    
    if (win.state === 'minimized' || win.state === 'closed') {
      win.element.style.display = 'flex';
      win.state = 'active';
    }
    
    this.bringToFront(id);
    eventBus.emit('window:opened', win);
  }

  close(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.element.style.display = 'none';
    win.state = 'closed';
    if (this.activeWindowId === id) this.activeWindowId = null;
    eventBus.emit('window:closed', win);
  }

  getWindow(id) {
    return this.windows.get(id) || null;
  }

  getWindowBody(id) {
    const win = this.windows.get(id);
    if (!win || !win.element) return null;
    return win.element.querySelector('.window-body');
  }

  minimize(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.element.style.display = 'none';
    win.state = 'minimized';
    if (this.activeWindowId === id) this.activeWindowId = null;
    eventBus.emit('window:minimized', win);
  }

  maximize(id) {
    const win = this.windows.get(id);
    if (!win) return;
    if (win.state === 'maximized') {
      win.element.style.width = win.options.width ? `${win.options.width}px` : '400px';
      win.element.style.height = win.options.height ? `${win.options.height}px` : '300px';
      win.element.style.top = `${win.pos.top}px`;
      win.element.style.left = `${win.pos.left}px`;
      win.state = 'open';
    } else {
      win.element.style.width = '100%';
      win.element.style.height = '100%';
      win.element.style.top = '0';
      win.element.style.left = '0';
      win.state = 'maximized';
    }
    eventBus.emit('window:maximized', win);
  }

  bringToFront(id) {
    const win = this.windows.get(id);
    if (!win) return;

    this.windows.forEach(w => w.element.classList.remove('active'));
    
    this.zIndexBase += 1;
    win.element.style.zIndex = this.zIndexBase;
    win.element.classList.add('active');
    this.activeWindowId = id;
    
    if (win.state === 'minimized') {
        win.element.style.display = 'flex';
        win.state = 'open';
    }

    eventBus.emit('window:focused', win);
  }

  _onMouseDown(e, id) {
    const win = this.windows.get(id);
    if (!win || win.state === 'maximized') return;

    this.bringToFront(id);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const rect = win.element.getBoundingClientRect();
    
    this.dragState = {
      id,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  }

  _initGlobalListeners() {
    window.addEventListener('mousemove', (e) => this._onMouseMove(e));
    window.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    window.addEventListener('mouseup', () => this.dragState = null);
    window.addEventListener('touchend', () => this.dragState = null);
  }

  _onMouseMove(e) {
    if (!this.dragState) return;
    
    const win = this.windows.get(this.dragState.id);
    if (!win) return;

    const x = e.clientX - this.dragState.offsetX;
    const y = e.clientY - this.dragState.offsetY;

    win.element.style.left = `${x}px`;
    win.element.style.top = `${y}px`;
    win.pos.left = x;
    win.pos.top = y;
  }

  _onTouchMove(e) {
    if (!this.dragState) return;
    e.preventDefault();
    const touch = e.touches[0];
    const win = this.windows.get(this.dragState.id);
    if (!win) return;

    const x = touch.clientX - this.dragState.offsetX;
    const y = touch.clientY - this.dragState.offsetY;

    win.element.style.left = `${x}px`;
    win.element.style.top = `${y}px`;
    win.pos.left = x;
    win.pos.top = y;
  }
}
