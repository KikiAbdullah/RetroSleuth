// assets/js/modules/CrimeSceneViewer.js
import { eventBus } from "../core/EventBus.js";
import { gameState } from "../core/Store.js";

export class CrimeSceneViewer {
  constructor(windowManager) {
    this.wm = windowManager;
    this.currentCase = null;
    this.sceneData = null;
    this.selectedArea = null;
    this.selectedAreaIndex = null;
    this.audioCtx = null;
    this.isProcessing = false;
    this.notificationTimeout = null;
    this.objectStates = {}; // track per object if already examined
    this.unlockedObjects = {}; // track if locked object is unlocked
  }

  // ==================== PUBLIC API ====================
  open(caseData) {
    console.log("🔍 CrimeSceneViewer.open() called", caseData);
    this.currentCase = caseData;

    if (!this.currentCase || !this.currentCase.manifest) {
      console.error("❌ Invalid case data!");
      alert("Data kasus tidak valid.");
      return;
    }

    this.sceneData = this.currentCase.manifest.crime_scene;

    if (!this.sceneData) {
      console.error("❌ No crime scene data found!");
      alert("Data TKP tidak tersedia untuk kasus ini.");
      return;
    }

    // Ensure areas exist – use `areas` directly from JSON
    console.log("DEBUG: sceneData.areas:", this.sceneData.areas);
    this._ensureAreas();

    // Reset state
    this.objectStates = {};
    this.unlockedObjects = {};
    this.selectedArea = null;
    this.selectedAreaIndex = null;

    const windowId = "crime-scene";
    if (!this.wm.getWindow(windowId)) {
      this.wm.register(windowId, {
        title: "🔎 TKP – Tempat Kejadian Perkara",
        icon: "🔎",
        content: "",
        isTerminal: false,
      });
    }
    this.wm.open(windowId);

    setTimeout(() => {
      this._render();
      this._attachEvents();
      this._initAudio();
      this._updateAllStatuses();
    }, 100);
  }

  // ==================== ENSURE AREAS ====================
  _ensureAreas() {
    // If areas already exist (from JSON), ensure each has an objects array
    if (this.sceneData.areas && this.sceneData.areas.length > 0) {
      for (const area of this.sceneData.areas) {
        if (!area.objects) area.objects = [];
        // Add id to each object if missing
        for (const obj of area.objects) {
          if (!obj.id)
            obj.id = `obj_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 5)}`;
        }
      }
      return;
    }

    // Fallback: build from hotspots (backward compatibility)
    this.sceneData.areas = this._buildAreasFromHotspots();
  }

  _buildAreasFromHotspots() {
    const hotspots = this.sceneData.hotspots || [];
    if (hotspots.length === 0) {
      return [
        {
          name: "Meja",
          short_desc: "Meja kayu dengan tumpukan kertas",
          objects: [
            {
              id: "meja_1",
              label: "📄 Periksa kertas",
              type: "red_herring",
              narrative: "Kertas-kertas itu hanya catatan belanja biasa.",
            },
          ],
        },
      ];
    }
    return hotspots.map((h) => {
      const objects = [];
      if (h.interactions) {
        for (const interaction of h.interactions) {
          if (interaction.options) {
            for (const opt of interaction.options) {
              const targetAction = h.interactions.find(
                (i) => i.layer === opt.target_layer
              );
              objects.push({
                id: `obj_${opt.target_layer}_${Date.now()}`,
                label: opt.text,
                type: targetAction?.evidence_unlock ? "evidence" : "clue",
                evidence_unlock: targetAction?.evidence_unlock || null,
                narrative:
                  targetAction?.narrative || `Anda memilih: ${opt.text}`,
              });
            }
          } else {
            objects.push({
              id: `obj_${interaction.layer}_${Date.now()}`,
              label: interaction.action || `Periksa (L${interaction.layer})`,
              type: interaction.evidence_unlock ? "evidence" : "clue",
              evidence_unlock: interaction.evidence_unlock || null,
              narrative: interaction.narrative,
            });
          }
        }
      }
      return {
        name: h.label || "Area",
        short_desc: h.description || "Area mencurigakan",
        objects: objects,
        bounds: h.bounds,
      };
    });
  }

  // ==================== RENDERING ====================
  _render() {
    const body = this.wm.getWindowBody("crime-scene");
    if (!body) {
      console.error("❌ Window body not found!");
      return;
    }

    console.log("✅ Rendering Object-Exploration Crime Scene...");

    const discovered = gameState.state.discoveredEvidence || [];
    const totalEvidence = this._getTotalEvidence();

    let areasHTML = "";
    this.sceneData.areas.forEach((area, index) => {
      const status = this._getAreaStatus(area);
      const progress = this._getAreaProgress(area);

      areasHTML += `
        <div class="cs-area-item" data-area-index="${index}">
          <div class="cs-area-item-inner">
            <span class="cs-area-status ${status.class}">${status.icon}</span>
            <div class="cs-area-info">
              <span class="cs-area-name">${area.name}</span>
              <span class="cs-area-desc">${area.short_desc || ""}</span>
            </div>
            <div class="cs-area-progress">
              <div class="cs-progress-bar" style="width: ${progress}%"></div>
            </div>
            <span class="cs-area-badge">${progress}%</span>
          </div>
        </div>
      `;
    });

    const caseTitle = this.currentCase?.meta?.title || "Kasus Tanpa Nama";

    body.innerHTML = `
      <div class="crime-scene-container premium-scanner">
        <div class="cs-header">
          <div class="cs-header-left">
            <span class="cs-header-icon">🖥️</span>
            <span class="cs-header-path">C:\\INVESTIGATION\\TKP\\</span>
          </div>
          <div class="cs-header-right">
            <span class="cs-header-time">${this._getCurrentTime()}</span>
            <span class="cs-header-case">${caseTitle}</span>
          </div>
        </div>

        <div class="cs-toolbar">
          <div class="cs-toolbar-left">
            <span class="cs-toolbar-item cs-evidence-count">📦 EVIDENCE: ${
              discovered.length
            }/${totalEvidence}</span>
            <span class="cs-toolbar-item cs-progress-total">
              <span class="cs-total-bar" style="width: ${
                totalEvidence > 0
                  ? (discovered.length / totalEvidence) * 100
                  : 0
              }%"></span>
            </span>
          </div>
          <div class="cs-toolbar-right">
            <span class="cs-toolbar-status" id="cs-status">● READY</span>
            <button class="cs-toolbar-btn" id="cs-btn-reset" title="Reset investigasi">⟳</button>
          </div>
        </div>

        <div class="cs-main-panel">
          <div class="cs-area-list" id="cs-area-list">
            ${areasHTML}
          </div>
          <div class="cs-detail-panel" id="cs-detail-panel">
            <div class="cs-detail-placeholder">
              <div class="placeholder-icon">🔍</div>
              <div class="placeholder-text">Pilih area di sebelah kiri</div>
              <div class="placeholder-sub">Klik objek-objek di dalam area untuk menyelidiki</div>
            </div>
          </div>
        </div>

        <div class="cs-log" id="cs-log">
          <div class="log-line">
            <span class="prompt">></span>
            <span class="log-text" id="log-text">Pilih area, lalu klik objek yang ingin diperiksa.</span>
          </div>
        </div>

        <div class="cs-notification" id="cs-notification"></div>
      </div>
    `;

    this.areaList = body.querySelector("#cs-area-list");
    this.detailPanel = body.querySelector("#cs-detail-panel");
    this.logEl = body.querySelector("#log-text");
    this.statusEl = body.querySelector("#cs-status");
    this.evidenceCountEl = body.querySelector(".cs-evidence-count");
    this.notificationEl = body.querySelector("#cs-notification");
    this.totalBarEl = body.querySelector(".cs-total-bar");

    this._updateEvidenceCount();
    this._updateTotalProgress();
    console.log("✅ Object-Exploration crime scene rendered.");
  }

  // ==================== HELPERS ====================
  _getCurrentTime() {
    const now = new Date();
    return now.toTimeString().slice(0, 8);
  }

  _getTotalEvidence() {
    let count = 0;
    for (const area of this.sceneData.areas) {
      if (area.objects) {
        for (const obj of area.objects) {
          if (obj.evidence_unlock) count++;
        }
      }
    }
    return count;
  }

  _getAreaProgress(area) {
    const discovered = gameState.state.discoveredEvidence || [];
    const total =
      area.objects?.filter((obj) => obj.evidence_unlock).length || 0;
    if (total === 0) return 0;
    const found =
      area.objects?.filter(
        (obj) => obj.evidence_unlock && discovered.includes(obj.evidence_unlock)
      ).length || 0;
    return Math.round((found / total) * 100);
  }

  _getAreaStatus(area) {
    const discovered = gameState.state.discoveredEvidence || [];
    const allFound = area.objects?.every(
      (obj) => !obj.evidence_unlock || discovered.includes(obj.evidence_unlock)
    );
    const anyFound = area.objects?.some(
      (obj) => obj.evidence_unlock && discovered.includes(obj.evidence_unlock)
    );

    if (allFound && area.objects?.some((obj) => obj.evidence_unlock)) {
      return { icon: "✓", class: "completed" };
    } else if (anyFound) {
      return { icon: "◉", class: "partial" };
    } else {
      return { icon: "○", class: "pending" };
    }
  }

  _updateAllStatuses() {
    if (!this.areaList) return;
    const items = this.areaList.querySelectorAll(".cs-area-item");
    items.forEach((el, idx) => {
      const area = this.sceneData.areas[idx];
      if (!area) return;
      const status = this._getAreaStatus(area);
      const progress = this._getAreaProgress(area);

      const statusIcon = el.querySelector(".cs-area-status");
      if (statusIcon) {
        statusIcon.textContent = status.icon;
        statusIcon.className = `cs-area-status ${status.class}`;
      }

      const progressBar = el.querySelector(".cs-progress-bar");
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.style.transition =
          "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
      }

      const badge = el.querySelector(".cs-area-badge");
      if (badge) {
        badge.textContent = `${progress}%`;
      }
    });
    this._updateEvidenceCount();
    this._updateTotalProgress();
  }

  _updateEvidenceCount() {
    const discovered = gameState.state.discoveredEvidence || [];
    const total = this._getTotalEvidence();
    if (this.evidenceCountEl) {
      this.evidenceCountEl.textContent = `📦 EVIDENCE: ${discovered.length}/${total}`;
    }
  }

  _updateTotalProgress() {
    const discovered = gameState.state.discoveredEvidence || [];
    const total = this._getTotalEvidence();
    if (this.totalBarEl && total > 0) {
      const pct = (discovered.length / total) * 100;
      this.totalBarEl.style.width = `${pct}%`;
      this.totalBarEl.style.transition =
        "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
    }
  }

  // ==================== NOTIFICATIONS ====================
  _showNotification(message, type = "info") {
    if (!this.notificationEl) return;
    const icons = {
      info: "ℹ️",
      success: "🎉",
      warning: "⚠️",
      evidence: "🔍",
    };
    this.notificationEl.textContent = `${icons[type] || "📌"} ${message}`;
    this.notificationEl.className = `cs-notification show ${type}`;
    clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => {
      this.notificationEl.className = "cs-notification";
    }, 3000);
  }

  // ==================== EVENTS ====================
  _attachEvents() {
    const body = this.wm.getWindowBody("crime-scene");
    if (!body || !this.areaList) {
      console.error("❌ Cannot attach events");
      return;
    }

    console.log("✅ Attaching events...");

    // Click on area in sidebar
    this.areaList.addEventListener("click", (e) => {
      const item = e.target.closest(".cs-area-item");
      if (!item) return;
      if (this.isProcessing) return;

      const index = parseInt(item.dataset.areaIndex);
      if (isNaN(index)) return;

      const area = this.sceneData.areas[index];
      if (!area) return;

      this._selectArea(index, area);
    });

    // Hover effects on area items
    this.areaList.addEventListener(
      "mouseenter",
      (e) => {
        const item = e.target.closest(".cs-area-item");
        if (item) {
          item.style.transform = "translateX(4px)";
        }
      },
      true
    );
    this.areaList.addEventListener(
      "mouseleave",
      (e) => {
        const item = e.target.closest(".cs-area-item");
        if (item) {
          item.style.transform = "translateX(0)";
        }
      },
      true
    );

    // Reset button
    const resetBtn = body.querySelector("#cs-btn-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Reset semua progress investigasi di TKP?")) {
          this._resetInvestigation();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key) - 1;
        const area = this.sceneData.areas[idx];
        if (area && !this.isProcessing) {
          this._selectArea(idx, area);
        }
      }
      if (e.key === "Escape" && this.isProcessing) {
        this.isProcessing = false;
        this._setStatus("● READY");
      }
      if (e.key === "r" || e.key === "R") {
        const resetBtn = body.querySelector("#cs-btn-reset");
        if (resetBtn) resetBtn.click();
      }
    });
  }

  // ==================== AREA SELECTION ====================
  _selectArea(index, area) {
    this._playClick();
    this.selectedArea = area;
    this.selectedAreaIndex = index;

    this.areaList.querySelectorAll(".cs-area-item").forEach((el, i) => {
      el.classList.toggle("active", i === index);
      if (i === index) {
        el.style.transform = "scale(1.02)";
        setTimeout(() => {
          el.style.transform = "";
        }, 300);
      }
    });

    this._showAreaObjects(area);
    this._updateLog(`📂 Masuk ke area: ${area.name}`);
    this._setStatus("● EXPLORING");
  }

  // ==================== SHOW OBJECTS IN AREA ====================
  _showAreaObjects(area) {
    if (!this.detailPanel) return;

    const status = this._getAreaStatus(area);
    const progress = this._getAreaProgress(area);
    const statusText =
      status.icon === "✓"
        ? "✅ Selesai"
        : status.icon === "◉"
        ? "◉ Sebagian"
        : "🔍 Belum diperiksa";

    let objectsHTML = "";
    if (area.objects && area.objects.length > 0) {
      const discovered = gameState.state.discoveredEvidence || [];
      area.objects.forEach((obj, idx) => {
        const isFound =
          obj.evidence_unlock && discovered.includes(obj.evidence_unlock);
        const isExamined = this.objectStates[`${area.name}_${obj.id}`] || false;
        const isUnlocked =
          this.unlockedObjects[`${area.name}_${obj.id}`] || false;

        let icon = "📄";
        let extraClass = "";
        let statusBadge = "";
        let lockedClass = "";

        // Handle locked objects
        if (obj.type === "locked") {
          if (isUnlocked) {
            icon = "🔓";
            extraClass = "unlocked";
            statusBadge = " <span class='obj-badge unlocked'>✓</span>";
          } else {
            icon = "🔒";
            extraClass = "locked";
            lockedClass = "locked";
            statusBadge = " <span class='obj-badge locked'>🔒</span>";
          }
        } else if (obj.type === "evidence") {
          icon = isFound ? "✅" : "🔍";
          if (isFound) extraClass = "found";
          statusBadge = isFound
            ? " <span class='obj-badge found'>✓</span>"
            : " <span class='obj-badge'>?</span>";
        } else if (obj.type === "clue") {
          icon = "💡";
          if (isExamined) extraClass = "examined";
          statusBadge = isExamined
            ? " <span class='obj-badge examined'>◉</span>"
            : "";
        } else if (obj.type === "red_herring") {
          icon = "📄";
          if (isExamined) extraClass = "examined";
          statusBadge = isExamined ? " <span class='obj-badge'>✓</span>" : "";
        }

        // Locked objects can be unlocked if we have a key (evidence)
        // For simplicity, we'll allow clicking locked objects to attempt unlock
        // if the user has the correct evidence (we'll hardcode "kunci_cadangan" for demo)
        const isLocked = obj.type === "locked" && !isUnlocked;

        objectsHTML += `
          <div class="cs-object-item ${extraClass} ${lockedClass}" 
               data-area="${area.name}" 
               data-obj-id="${obj.id}" 
               data-locked="${isLocked}"
               style="animation-delay: ${idx * 0.06}s">
            <span class="cs-object-icon">${icon}</span>
            <span class="cs-object-label">${obj.label}</span>
            ${statusBadge}
          </div>
        `;
      });
    } else {
      objectsHTML = `<div class="cs-empty-objects">Tidak ada objek yang bisa diperiksa di sini.</div>`;
    }

    this.detailPanel.innerHTML = `
      <div class="cs-detail-content">
        <div class="cs-detail-header">
          <span class="cs-detail-name">${area.name}</span>
          <span class="cs-detail-status ${status.class}">${statusText}</span>
        </div>
        <div class="cs-detail-desc">${
          area.short_desc || "Area mencurigakan"
        }</div>
        <div class="cs-detail-progress">
          <div class="cs-detail-progress-label">Progress: ${progress}%</div>
          <div class="cs-detail-progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="cs-objects-grid">
          ${objectsHTML}
        </div>
      </div>
    `;

    // Attach click events to objects
    this.detailPanel.querySelectorAll(".cs-object-item").forEach((el) => {
      el.addEventListener("click", () => {
        if (this.isProcessing) return;
        const areaName = el.dataset.area;
        const objId = el.dataset.objId;
        const isLocked = el.dataset.locked === "true";
        const area = this.sceneData.areas.find((a) => a.name === areaName);
        if (!area) return;
        const obj = area.objects.find((o) => o.id === objId);
        if (!obj) return;

        if (isLocked) {
          this._attemptUnlock(area, obj, el);
        } else {
          this._examineObject(area, obj, el);
        }
      });
    });
  }

  // ==================== UNLOCK LOCKED OBJECTS ====================
  _attemptUnlock(area, obj, element) {
    this._playClick();
    this._updateLog(`🔒 Mencoba membuka: ${obj.label}`);

    // Check if user has kunci_cadangan
    const discovered = gameState.state.discoveredEvidence || [];
    if (discovered.includes("kunci_cadangan")) {
      // Unlock success
      this.unlockedObjects[`${area.name}_${obj.id}`] = true;
      this._playDing();
      this._updateLog(`🔓 Berhasil membuka! ${obj.narrative}`);
      this._showNotification("Objek terbuka!", "success");
      this._showAreaObjects(area);
      this._updateAllStatuses();
    } else {
      // Need key
      this._updateLog(
        `❌ ${obj.label} terkunci. Anda memerlukan kunci cadangan untuk membukanya.`
      );
      this._showNotification("Terkunci! Cari kunci cadangan.", "warning");
      // Flash the object red
      if (element) {
        element.style.transition = "background 0.2s";
        element.style.background = "rgba(255, 68, 68, 0.2)";
        setTimeout(() => {
          element.style.background = "";
        }, 500);
      }
    }
  }

  // ==================== EXAMINE OBJECT ====================
  _examineObject(area, obj, element) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this._setStatus("● EXAMINING...");
    this._playClick();

    // Mark as examined (for clues and red herrings)
    const key = `${area.name}_${obj.id}`;
    if (!this.objectStates[key]) {
      this.objectStates[key] = true;
    }

    // Show narrative
    this._updateLog(`🔍 ${obj.narrative}`);
    this._animateLog();

    // If evidence
    if (obj.type === "evidence" && obj.evidence_unlock) {
      const discovered = gameState.state.discoveredEvidence || [];
      if (!discovered.includes(obj.evidence_unlock)) {
        console.log(`🔓 Unlocking evidence: ${obj.evidence_unlock}`);
        gameState.addEvidence(obj.evidence_unlock);
        this._playDing();
        this._updateLog(
          `${
            obj.narrative
          }\n\n🔍 BUKTI BARU: ${obj.evidence_unlock.toUpperCase()}`
        );
        this._setStatus("● EVIDENCE FOUND!");
        this._updateEvidenceCount();
        this._updateAllStatuses();
        this._triggerFlash();
        this._showNotification(
          `${obj.evidence_unlock.toUpperCase()} ditemukan!`,
          "evidence"
        );
        // Update object appearance
        if (element) {
          element.classList.add("found");
          const icon = element.querySelector(".cs-object-icon");
          if (icon) icon.textContent = "✅";
          const badge = element.querySelector(".obj-badge");
          if (badge) badge.textContent = "✓";
        }
        // Refresh area objects to update status
        this._showAreaObjects(area);
      } else {
        this._updateLog(
          `ℹ️ Bukti "${obj.evidence_unlock}" sudah ditemukan sebelumnya.`
        );
      }
    } else if (obj.type === "clue") {
      this._showNotification("Petunjuk dicatat.", "info");
      if (element) element.classList.add("examined");
    } else if (obj.type === "red_herring") {
      this._showNotification("Tidak ada yang menarik.", "info");
      if (element) element.classList.add("examined");
    }

    // Check if area is complete after this
    const status = this._getAreaStatus(area);
    if (status.icon === "✓") {
      this._updateLog(`✅ Semua bukti di ${area.name} telah ditemukan.`);
      this._showNotification(`${area.name} selesai! 🎉`, "success");
      // Update area status in sidebar
      this._updateAllStatuses();
      // Refresh objects view to show updated statuses
      this._showAreaObjects(area);
    }

    setTimeout(() => {
      this.isProcessing = false;
      this._setStatus("● READY");
    }, 500);
  }

  // ==================== RESET ====================
  _resetInvestigation() {
    const allEvidence = [];
    for (const area of this.sceneData.areas) {
      if (area.objects) {
        for (const obj of area.objects) {
          if (obj.evidence_unlock) allEvidence.push(obj.evidence_unlock);
        }
      }
    }
    const current = gameState.state.discoveredEvidence || [];
    const newEvidence = current.filter((e) => !allEvidence.includes(e));
    gameState.state.discoveredEvidence = newEvidence;
    this.objectStates = {};
    this.unlockedObjects = {};
    this._updateAllStatuses();
    if (this.selectedArea) {
      this._showAreaObjects(this.selectedArea);
    } else if (this.sceneData.areas.length > 0) {
      this._showAreaObjects(this.sceneData.areas[0]);
    }
    this._updateLog("🔄 Investigasi di TKP telah direset.");
    this._showNotification("TKP direset!", "warning");
    this._playClick();
  }

  // ==================== UI HELPERS ====================
  _updateLog(text) {
    if (this.logEl) {
      this.logEl.innerHTML = text.replace(/\n/g, "<br>");
      const logContainer = document.getElementById("cs-log");
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }
  }

  _animateLog() {
    const logContainer = document.getElementById("cs-log");
    if (logContainer) {
      logContainer.style.transition = "background 0.3s";
      logContainer.style.background = "rgba(51, 255, 51, 0.05)";
      setTimeout(() => {
        logContainer.style.background = "";
      }, 400);
    }
  }

  _setStatus(status) {
    if (this.statusEl) {
      this.statusEl.textContent = status;
      this.statusEl.style.transition = "all 0.3s";
      if (status.includes("EVIDENCE")) {
        this.statusEl.style.color = "#ff8800";
        this.statusEl.style.textShadow = "0 0 20px rgba(255, 136, 0, 0.5)";
        setTimeout(() => {
          this.statusEl.style.color = "";
          this.statusEl.style.textShadow = "";
        }, 2000);
      } else {
        this.statusEl.style.color = "";
        this.statusEl.style.textShadow = "";
      }
    }
  }

  _triggerFlash() {
    if (this.detailPanel) {
      this.detailPanel.style.transition = "background 0.15s";
      this.detailPanel.style.background = "rgba(51, 255, 51, 0.15)";
      this.detailPanel.style.boxShadow =
        "inset 0 0 60px rgba(51, 255, 51, 0.1)";
      setTimeout(() => {
        this.detailPanel.style.background = "";
        this.detailPanel.style.boxShadow = "";
      }, 400);
    }
    const container = document.querySelector(".crime-scene-container");
    if (container) {
      container.style.transition = "filter 0.1s";
      container.style.filter = "brightness(1.2)";
      setTimeout(() => {
        container.style.filter = "";
      }, 200);
    }
  }

  // ==================== AUDIO ====================
  _initAudio() {
    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        if (this.audioCtx.state === "suspended") {
          this.audioCtx.resume();
        }
      } catch (e) {
        console.log("⚠️ Audio not available");
      }
    }
  }

  _playClick() {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "square";
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.frequency.value = 900 + Math.random() * 200;
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + 0.04
      );
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      /* silent fail */
    }
  }

  _playDing() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "triangle";
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.frequency.value = freq;
        const startTime = now + i * 0.08;
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch (e) {
      /* silent fail */
    }
  }

  // ==================== CLEANUP ====================
  destroy() {
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
    }
    clearTimeout(this.notificationTimeout);
    this.areaList = null;
    this.detailPanel = null;
    this.logEl = null;
    this.statusEl = null;
    this.evidenceCountEl = null;
    this.notificationEl = null;
    this.totalBarEl = null;
  }
}
