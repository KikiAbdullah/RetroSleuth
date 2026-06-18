import { WindowManager } from './ui/WindowManager.js';
import { DesktopManager } from './ui/DesktopManager.js';
import { Taskbar } from './ui/Taskbar.js';
import { eventBus } from './core/EventBus.js';
import { CaseLoader } from './engine/CaseLoader.js';
import { CaseHub } from './modules/CaseHub.js';
import { EvidenceFileManager } from './modules/EvidenceFileManager.js';
import { CharacterDossier } from './modules/CharacterDossier.js';
import { InterrogationRoom } from './modules/InterrogationRoom.js';
import { SettingsWindow } from './modules/SettingsWindow.js';
import { AccusationForm } from './modules/AccusationForm.js';
import { NotesApp } from './modules/NotesApp.js';
import { TimelineEngine } from './engine/TimelineEngine.js';
import { ObjectivesTracker } from './modules/ObjectivesTracker.js';
import { CrimeSceneViewer } from './modules/CrimeSceneViewer.js';
import { gameState } from './core/Store.js';
import { markdown } from './utils/Markdown.js';
import { DatabaseManager } from './utils/DatabaseManager.js';

async function migrateLocalStorageToIndexedDB() {
  const keysToMigrate = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('retrosleuth_') && 
        key !== 'retrosleuth_api_key' && 
        key !== 'retrosleuth_api_endpoint') {
      keysToMigrate.push(key);
    }
  }

  for (const key of keysToMigrate) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      const caseId = key.replace('retrosleuth_', '');
      await DatabaseManager.saveCaseState(caseId, data);
      localStorage.removeItem(key);
      console.log(`Migrasi ${key} berhasil ke IndexedDB.`);
    } catch (e) {
      console.warn(`Gagal migrasi ${key}:`, e);
    }
  }

  const apiEndpoint = localStorage.getItem('retrosleuth_api_endpoint');
  if (apiEndpoint) {
    await DatabaseManager.saveSetting('api_endpoint', apiEndpoint);
    localStorage.removeItem('retrosleuth_api_endpoint');
  }
  const apiKey = localStorage.getItem('retrosleuth_api_key');
  if (apiKey) {
    await DatabaseManager.saveSetting('api_key', apiKey);
    localStorage.removeItem('retrosleuth_api_key');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Mobile Detection
  const checkMobile = () => {
    if (window.innerWidth <= 768) {
      document.body.classList.add('mobile-mode');
    } else {
      document.body.classList.remove('mobile-mode');
    }
  };
  window.addEventListener('resize', checkMobile);
  checkMobile();

  // 1. Migrasi Data
  await migrateLocalStorageToIndexedDB();

  const windowManager = new WindowManager();
  const desktopManager = new DesktopManager(windowManager);
  const taskbar = new Taskbar(windowManager);
  
  // Initialize Modules
  const caseLoader = new CaseLoader();
  const caseHub = new CaseHub();
  const evidenceFM = new EvidenceFileManager(windowManager);
  const characterDossier = new CharacterDossier(windowManager);
  const interrogationRoom = new InterrogationRoom(windowManager);
  const settingsWindow = new SettingsWindow(windowManager);
  const accusationForm = new AccusationForm(windowManager);
  const notesApp = new NotesApp(windowManager);
  const timelineEngine = new TimelineEngine(windowManager);
  const objectivesTracker = new ObjectivesTracker(windowManager);
  const crimeSceneViewer = new CrimeSceneViewer(windowManager);

  // Register windows
  const windowConfigs = [
    { id: 'case-files', title: 'Case Files', icon: '📁', content: '<p>Pilih kasus dari menu utama.</p>' },
    { id: 'evidence', title: 'Evidence Locker', icon: '🔍', content: '<p>Muat kasus untuk melihat bukti.</p>' },
    { id: 'dossier', title: 'Character Dossier', icon: '👤', content: '<p>Muat kasus untuk melihat tersangka.</p>' },
    { id: 'timeline', title: 'Timeline', icon: '📅', content: '<p>Memuat timeline...</p>' },
    { id: 'objectives', title: 'Objectives', icon: '📋', content: '<p>Memuat tugas...</p>' },
    { id: 'interrogation', title: 'Interrogation Room', icon: '💬', content: '<p>Select a suspect to interrogate.</p>', type: 'terminal' },
    { id: 'notes', title: 'Detective Notes', icon: '📝', content: '<p>Memuat catatan...</p>' },
    { id: 'accusation', title: 'Submit Accusation', icon: '⚖️', content: '<p>Memuat formulir...</p>' },
    { id: 'crime-scene', title: 'Crime Scene', icon: '🔎', content: '<p>Memuat TKP...</p>' }
  ];

  windowConfigs.forEach(cfg => windowManager.register(cfg.id, cfg));

  // Global Actions for Desktop Icons
  eventBus.on('desktop:open', (id) => {
    if (id === 'case-files') {
      const win = windowManager.windows.get('case-files');
      if (win) {
        caseHub.open(win.body);
        windowManager.open('case-files');
      }
    }
    else if (id === 'evidence') {
      const win = windowManager.windows.get('evidence');
      if (win) {
        evidenceFM.open(win.body);
        windowManager.open('evidence');
      }
    }
    else if (id === 'crime-scene') {
      const caseData = caseHub.currentCase;
      if (caseData) {
        crimeSceneViewer.open(caseData);
      } else {
        alert('Silakan pilih kasus terlebih dahulu.');
      }
    }
    else if (id === 'notes') notesApp.open();
    else if (id === 'accusation') accusationForm.open();
    else if (id === 'timeline') timelineEngine.open();
    else if (id === 'objectives') objectivesTracker.open();
    else if (id === 'settings') settingsWindow.open();
    else windowManager.open(id);
  });

  // Navigation handlers
  eventBus.on('navigate:briefing', async () => {
    const caseFolder = gameState.state.currentCaseId;
    if (!caseFolder) return;
    const briefingMd = await caseLoader.loadBriefing(caseFolder);
    const htmlContent = markdown.renderMarkdown(briefingMd);
    
    const windowId = 'briefing-view';
    windowManager.register(windowId, { title: 'Briefing Kasus', content: `<div style="padding:15px; color:#000;">${htmlContent}</div>` });
    windowManager.open(windowId);
  });

  eventBus.on('navigate:solution', async () => {
    const caseFolder = gameState.state.currentCaseId;
    if (!caseFolder) return;
    
    const manifest = caseHub.currentCase.manifest;
    const solutionFile = manifest.solution_matrix?.explanation_file || 'solution.md';
    
    try {
      const response = await fetch(`./cases/${caseFolder}/${solutionFile}`);
      const mdText = await response.text();
      const htmlContent = markdown.renderMarkdown(mdText);
      
      const windowId = 'solution-view';
      windowManager.register(windowId, { title: 'Solusi Kasus', content: `<div style="padding:15px; color:#000;">${htmlContent}</div>` });
      windowManager.open(windowId);
    } catch (e) {
      console.error('Gagal memuat solusi:', e);
    }
  });

  // Listen for case selection
  eventBus.on('case:select', async (data) => {
    const { folder } = data;
    try {
      const fullCase = await caseLoader.loadFullCase(folder);
      gameState.setCase(fullCase);
    } catch (e) {
      alert("Gagal memuat kasus.");
    }
  });

  // Boot sequence
  runBootSequence(windowManager).then(() => {
    windowManager.close('boot');
    checkAndLoadInitialCase(caseLoader);
  });
});

async function checkAndLoadInitialCase(caseLoader) {
  try {
    const index = await caseLoader.loadGlobalIndex();
    const availableCases = index.cases_list.filter(c => c.is_active !== false);
    
    if (availableCases.length === 1) {
      const folder = availableCases[0].folder;
      const fullCase = await caseLoader.loadFullCase(folder);
      gameState.setCase(fullCase);
    }
  } catch (error) {
    console.error("Gagal memeriksa kasus awal:", error);
  }
}

async function runBootSequence(wm) {
  const bootWin = wm.register('boot', {
    title: 'System Terminal',
    type: 'terminal',
    width: '500px',
    height: '300px',
    top: '20%',
    left: '30%',
    isTerminal: true
  });

  wm.open('boot');
  const body = bootWin.body;
  
  const lines = [
    'Initializing RetroSleuth OS v2.0...',
    'Loading kernel modules... OK',
    'Checking hardware... CRT Detected',
    'Connecting to Case Database... OK',
    'System Ready.',
    'Welcome, Detective.',
    '',
    'Press any key or click to continue...'
  ];

  for (const line of lines) {
    await typeText(body, line + '<br>');
    await new Promise(r => setTimeout(r, 200));
  }

  return new Promise(resolve => {
    const finish = () => {
      document.removeEventListener('keydown', finish);
      body.removeEventListener('click', finish);
      resolve();
    };
    document.addEventListener('keydown', finish);
    body.addEventListener('click', finish);
  });
}

async function typeText(el, text, speed = 20) {
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        if (text.substr(i, 4) === '<br>') {
          el.innerHTML += '<br>';
          i += 4;
        } else {
          el.innerHTML += text.charAt(i);
          i++;
        }
        el.scrollTop = el.scrollHeight;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}
