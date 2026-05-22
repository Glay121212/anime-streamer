class ResultsGrid {
  constructor() {
    this.grid = document.getElementById('results-grid');
    this.noResults = document.getElementById('no-results');
    this.currentResults = [];
  }

  displayResults(results) {
    if (!results || results.length === 0) {
      this.grid.innerHTML = '';
      this.noResults.classList.remove('hidden');
      return;
    }

    this.currentResults = results;
    this.noResults.classList.add('hidden');

    const html = results.map((result, i) => `
      <div class="result-card" data-index="${i}">
        <div class="result-poster">
          ${result.poster 
            ? `<img src="${result.poster}" alt="${result.title}" loading="lazy">` 
            : '<div class="no-poster">No Poster</div>'}
        </div>
        <div class="result-info">
          <div class="result-title">${result.title}</div>
          <div class="result-meta">
            <span>${result.year || 'N/A'}</span>
            <span class="result-type ${result.type}">${result.type}</span>
          </div>
        </div>
      </div>
    `).join('');

    this.grid.innerHTML = html;

    this.grid.querySelectorAll('.result-card').forEach((card, i) => {
      card.addEventListener('click', () => this.handleCardClick(results[i]));
    });
  }

  handleCardClick(result) {
    if (result.type === 'tv' || result.type === 'anime') {
      window.dispatchEvent(new CustomEvent('show-season-picker', { detail: result }));
    } else {
      window.dispatchEvent(new CustomEvent('launch-video-search', { detail: result }));
    }
  }

  clear() {
    this.grid.innerHTML = '';
    this.currentResults = [];
    this.noResults.classList.remove('hidden');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResultsGrid;
}
