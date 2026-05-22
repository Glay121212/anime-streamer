class Settings {
  constructor() {
    this.modal = document.getElementById('settings-modal');
    this.openBtn = document.getElementById('settings-btn');
    this.closeBtn = document.getElementById('settings-close');
    this.playerSelect = document.getElementById('player-select');
    this.customPath = document.getElementById('custom-player-path');
    this.clearHistBtn = document.getElementById('clear-history-btn');
    this.saveBtn = document.getElementById('save-settings-btn');
    this.init();
  }

  init() {
    this.openBtn.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', () => this.close());
    this.saveBtn.addEventListener('click', () => this.save());
    this.clearHistBtn.addEventListener('click', () => this.clearHistory());
  }

  async open() {
    await this.loadSettings();
    this.modal.classList.remove('hidden');
  }

  close() {
    this.modal.classList.add('hidden');
  }

  async loadSettings() {
    try {
      const settings = await window.api.getSettings();
      this.playerSelect.value = settings.preferredPlayer || 'vlc';
      this.customPath.value = settings.customPlayerPath || '';
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async save() {
    const settings = {
      preferredPlayer: this.playerSelect.value,
      customPlayerPath: this.customPath.value,
    };
    try {
      await window.api.updateSettings(settings);
      alert('Settings saved!');
      this.close();
    } catch (error) {
      alert(`Failed to save settings: ${error.message}`);
    }
  }

  async clearHistory() {
    if (confirm('Clear all search history?')) {
      try {
        await window.api.clearHistory();
        alert('History cleared!');
      } catch (error) {
        alert(`Failed to clear history: ${error.message}`);
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Settings;
}
