class SearchBar {
  constructor() {
    this.input = document.getElementById('search-input');
    this.dropdown = document.getElementById('autocomplete-dropdown');
    this.history = document.getElementById('search-history');
    this.searchTimeout = null;
    this.currentResults = [];
    this.historyList = [];
    this.init();
  }

  init() {
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('focus', () => this.showHistoryIfEmpty());
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    document.addEventListener('click', (e) => this.handleClickOutside(e));
    this.loadHistory();
  }

  handleInput(e) {
    const query = e.target.value.trim();
    clearTimeout(this.searchTimeout);
    if (query.length === 0) {
      this.hideDropdown();
      this.showHistoryIfEmpty();
      return;
    }
    if (query.length < 2) {
      this.hideDropdown();
      return;
    }
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }

  async performSearch(query) {
    try {
      const results = await window.api.searchTMDB(query);
      this.currentResults = results;
      this.displayResults(results);
    } catch (error) {
      console.error('Search error:', error);
      this.displayError('Search failed. Try again.');
    }
  }

  displayResults(results) {
    if (results.length === 0) {
      this.dropdown.innerHTML = '<div class="autocomplete-item">No results found</div>';
      this.dropdown.classList.remove('hidden');
      this.history.classList.add('hidden');
      return;
    }

    const html = results.slice(0, 10).map((r, i) => `
      <div class="autocomplete-item" data-index="${i}">
        <div class="autocomplete-poster">
          ${r.poster ? `<img src="${r.poster}" alt="${r.title}">` : ''}
        </div>
        <div class="autocomplete-info">
          <div class="autocomplete-title">${r.title}</div>
          <div class="autocomplete-year">${r.year || 'N/A'}</div>
        </div>
        <div class="autocomplete-type ${r.type}">${r.type}</div>
      </div>
    `).join('');

    this.dropdown.innerHTML = html;
    this.dropdown.classList.remove('hidden');
    this.history.classList.add('hidden');
    this.dropdown.querySelectorAll('.autocomplete-item').forEach((item, i) => {
      item.addEventListener('click', () => this.selectResult(results[i]));
    });
  }

  selectResult(result) {
    window.api.addHistory(result.title);
    this.input.value = result.title;
    this.hideDropdown();
    window.dispatchEvent(new CustomEvent('select-result', { detail: result }));
  }

  showHistoryIfEmpty() {
    if (this.input.value.trim() === '') {
      this.loadHistory();
      this.displayHistory();
    }
  }

  loadHistory() {
    window.api.getHistory().then(history => {
      this.historyList = history || [];
    }).catch(() => {
      this.historyList = [];
    });
  }

  displayHistory() {
    if (!this.historyList || this.historyList.length === 0) {
      this.history.classList.add('hidden');
      return;
    }

    const html = `
      <div class="search-history-header">
        <h3>Recent Searches</h3>
        <button class="history-clear-all">Clear All</button>
      </div>
      ${this.historyList.map((item, i) => `
        <div class="history-item">
          <span>${item}</span>
          <button class="history-item-remove" data-index="${i}">✕</button>
        </div>
      `).join('')}
    `;

    this.history.innerHTML = html;
    this.history.classList.remove('hidden');
    this.dropdown.classList.add('hidden');

    this.history.querySelector('.history-clear-all').addEventListener('click', () => {
      window.api.clearHistory();
      this.historyList = [];
      this.displayHistory();
    });

    this.history.querySelectorAll('.history-item').forEach((item, i) => {
      item.querySelector('span').addEventListener('click', () => {
        this.input.value = this.historyList[i];
        this.performSearch(this.historyList[i]);
      });
      item.querySelector('.history-item-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        this.historyList.splice(i, 1);
        this.historyList = this.historyList;
        this.displayHistory();
      });
    });
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.hideDropdown();
      this.history.classList.add('hidden');
    }
    if (e.key === 'Enter') {
      const query = this.input.value.trim();
      if (query.length >= 2) {
        this.performSearch(query);
      }
    }
  }

  handleClickOutside(e) {
    if (!e.target.closest('.search-section')) {
      this.hideDropdown();
      this.history.classList.add('hidden');
    }
  }

  hideDropdown() {
    this.dropdown.classList.add('hidden');
  }

  displayError(message) {
    this.dropdown.innerHTML = `<div class="autocomplete-item">${message}</div>`;
    this.dropdown.classList.remove('hidden');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchBar;
}
