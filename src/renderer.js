document.addEventListener('DOMContentLoaded', async () => {
  const SearchBar = require('./components/searchBar');
  const ResultsGrid = require('./components/resultsGrid');
  const SeasonPicker = require('./components/seasonPicker');
  const Settings = require('./components/settings');

  const searchBar = new SearchBar();
  const resultsGrid = new ResultsGrid();
  const seasonPicker = new SeasonPicker();
  const settings = new Settings();

  window.addEventListener('select-result', (e) => {
    const result = e.detail;
    resultsGrid.displayResults([result]);
  });

  window.addEventListener('show-season-picker', (e) => {
    seasonPicker.show(e.detail);
  });

  window.addEventListener('launch-video-search', async (e) => {
    const result = e.detail;
    const playerLoading = document.getElementById('player-loading');
    playerLoading.classList.remove('hidden');

    try {
      const scrapeResult = await window.api.searchSites(result.title, result.type);
      if (scrapeResult.success) {
        const settingsResult = await window.api.getSettings();
        const player = settingsResult.preferredPlayer || 'vlc';
        await window.api.launchPlayer(scrapeResult.videoURL, player);
      } else {
        alert(`Failed: ${scrapeResult.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      playerLoading.classList.add('hidden');
    }
  });

  const settingsResult = await window.api.getSettings();
  console.log('Installed players:', settingsResult.installedPlayers || 'None detected');
});
