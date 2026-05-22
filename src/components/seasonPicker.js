class SeasonPicker {
  constructor() {
    this.modal = document.getElementById('season-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.seasonsContainer = document.getElementById('seasons-container');
    this.episodesContainer = document.getElementById('episodes-container');
    this.closeBtn = document.getElementById('modal-close');
    this.loading = document.getElementById('picker-loading');
    this.currentShow = null;
    this.currentSeason = null;
    this.seasons = [];
    this.init();
  }

  init() {
    this.closeBtn.addEventListener('click', () => this.close());
    window.addEventListener('show-season-picker', (e) => this.show(e.detail));
  }

  async show(result) {
    this.currentShow = result;
    this.modalTitle.textContent = result.title;
    this.showLoading();
    this.modal.classList.remove('hidden');

    try {
      const seasons = await window.api.getTMDBSeasons(result.id);
      this.seasons = seasons;
      this.displaySeasons(seasons);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load seasons:', error);
      this.seasonsContainer.innerHTML = '<p>Failed to load seasons</p>';
      this.hideLoading();
    }
  }

  displaySeasons(seasons) {
    const html = seasons.map(s => `
      <button class="season-btn" data-season="${s.seasonNumber}">
        S${String(s.seasonNumber).padStart(2, '0')}
      </button>
    `).join('');
    this.seasonsContainer.innerHTML = html;
    this.episodesContainer.classList.add('hidden');

    this.seasonsContainer.querySelectorAll('.season-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectSeason(parseInt(btn.dataset.season));
      });
    });
  }

  selectSeason(seasonNum) {
    this.currentSeason = seasonNum;
    const season = this.seasons.find(s => s.seasonNumber === seasonNum);
    if (!season) return;

    this.seasonsContainer.querySelectorAll('.season-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.season) === seasonNum);
    });

    const episodes = Array.from({ length: season.episodeCount }, (_, i) => i + 1);
    const html = episodes.map(ep => `
      <button class="episode-btn" data-episode="${ep}">
        E${String(ep).padStart(2, '0')}
      </button>
    `).join('');

    this.episodesContainer.innerHTML = html;
    this.episodesContainer.classList.remove('hidden');

    this.episodesContainer.querySelectorAll('.episode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectEpisode(parseInt(btn.dataset.episode));
      });
    });
  }

  async selectEpisode(episodeNum) {
    this.showLoading();
    this.close();

    try {
      const result = await window.api.searchSites(
        this.currentShow.title,
        this.currentShow.type,
        this.currentSeason,
        episodeNum
      );
      if (result.success) {
        const settings = await window.api.getSettings();
        const player = settings.preferredPlayer || 'vlc';
        await window.api.launchPlayer(result.videoURL, player);
      } else {
        alert(`Failed to find video: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  close() {
    this.modal.classList.add('hidden');
    this.episodesContainer.classList.add('hidden');
  }

  showLoading() {
    this.loading.classList.remove('hidden');
  }

  hideLoading() {
    this.loading.classList.add('hidden');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SeasonPicker;
}
