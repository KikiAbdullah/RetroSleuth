import { eventBus } from '../core/EventBus.js';

export class CaseLoader {
  constructor(basePath = "./cases") {
    this.basePath = basePath;
    this.cache = new Map();
  }

  async loadGlobalIndex() {
    const response = await fetch(`${this.basePath}/index.json`);
    return await response.json();
  }

  async loadCaseManifest(caseFolder) {
    const response = await fetch(`${this.basePath}/${caseFolder}/case.json`);
    const manifest = await response.json();
    this.cache.set(`${caseFolder}/manifest`, manifest);
    return manifest;
  }

  async loadBriefing(caseFolder) {
    const manifest = this.cache.get(`${caseFolder}/manifest`) || await this.loadCaseManifest(caseFolder);
    const response = await fetch(`${this.basePath}/${caseFolder}/${manifest.assets.briefing_file}`);
    return await response.text();
  }

  async loadEvidenceContent(caseFolder, evidenceFile) {
    const response = await fetch(`${this.basePath}/${caseFolder}/evidence/${evidenceFile}`);
    return await response.text();
  }

  async loadCharacter(caseFolder, charId) {
    const response = await fetch(`${this.basePath}/${caseFolder}/characters/${charId}.json`);
    return await response.json();
  }

  async loadFullCase(caseFolder) {
    try {
      const manifest = await this.loadCaseManifest(caseFolder);
      
      const evidencePromises = manifest.evidence_registry.map(async (ev) => {
        const content = await this.loadEvidenceContent(caseFolder, ev.file);
        return { ...ev, content };
      });

      const charPromises = manifest.characters.map(async (ch) => {
        try {
          const details = await this.loadCharacter(caseFolder, ch.id);
          return { ...ch, ...details };
        } catch (e) {
          console.warn(`Failed to load details for character ${ch.id}`, e);
          return ch;
        }
      });

      const [evidence, characters, briefing] = await Promise.all([
        Promise.all(evidencePromises),
        Promise.all(charPromises),
        this.loadBriefing(caseFolder)
      ]);

      const caseIndex = await this.loadGlobalIndex();
      const caseEntry = caseIndex.cases_list.find(c => c.folder === caseFolder);
      const folderName = caseEntry?.folder || caseFolder;

      const fullCase = {
        folder: folderName,
        manifest,
        evidence,
        characters,
        briefing
      };

      eventBus.emit('case:loaded', fullCase);
      return fullCase;
    } catch (error) {
      console.error("Error loading case:", error);
      throw error;
    }
  }
}
