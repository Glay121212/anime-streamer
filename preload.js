// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  searchTMDB: (query) => ipcRenderer.invoke('search-tmdb', query),
  searchSites: (title, type, season, episode) => 
    ipcRenderer.invoke('search-sites', { title, type, season, episode }),
  getHistory: () => ipcRenderer.invoke('get-history'),
  addHistory: (query) => ipcRenderer.invoke('add-history', query),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  launchPlayer: (url, player) => ipcRenderer.invoke('launch-player', { url, player }),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  getTMDBSeasons: (tvId) => ipcRenderer.invoke('get-tmdb-seasons', tvId),
});
