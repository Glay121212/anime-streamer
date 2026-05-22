// electron.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
      },
    });

    const startURL = isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'src/index.html')}`;
    
    mainWindow.loadURL(startURL);
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  } catch (error) {
    console.error('Failed to create window:', error);
    app.quit();
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers - These will be implemented by downstream tasks
// For now, provide stubs to prevent runtime errors

const Store = require('electron-store');
const TMDB = require('./services/tmdb');
const Scraper = require('./services/scraper');
const Player = require('./services/player');
const store = new Store();
const scraper = new Scraper();

ipcMain.handle('search-tmdb', async (event, query) => {
  try {
    const tmdb = new TMDB(process.env.TMDB_API_KEY || '');
    const results = await tmdb.search(query);
    return results;
  } catch (error) {
    console.error('searchTMDB error:', error);
    return [];
  }
});

ipcMain.handle('search-sites', async (event, { title, type, season, episode }) => {
  try {
    const result = await scraper.searchAndExtract(title, type, season, episode);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-history', async (event) => {
  try {
    return store.get('searchHistory', []);
  } catch (error) {
    console.error('getHistory error:', error);
    return [];
  }
});

ipcMain.handle('add-history', async (event, query) => {
  try {
    let history = store.get('searchHistory', []);
    history = [query, ...history.filter(h => h !== query)].slice(0, 10);
    store.set('searchHistory', history);
    return history;
  } catch (error) {
    console.error('addHistory error:', error);
    throw error;
  }
});

ipcMain.handle('clear-history', async (event) => {
  try {
    store.set('searchHistory', []);
    return [];
  } catch (error) {
    console.error('clearHistory error:', error);
    throw error;
  }
});

ipcMain.handle('get-settings', async (event) => {
  try {
    return store.get('settings', {});
  } catch (error) {
    console.error('getSettings error:', error);
    return {};
  }
});

ipcMain.handle('update-settings', async (event, settings) => {
  try {
    store.set('settings', settings);
    return settings;
  } catch (error) {
    console.error('updateSettings error:', error);
    throw error;
  }
});

ipcMain.handle('get-tmdb-seasons', async (event, tvId) => {
  try {
    const tmdb = new TMDB(process.env.TMDB_API_KEY || '');
    return await tmdb.getSeasons(tvId);
  } catch (error) {
    console.error('get-tmdb-seasons error:', error);
    return [];
  }
});

ipcMain.handle('launch-player', async (event, { url, player: playerName }) => {
  try {
    const settings = store.get('settings', {});
    let playerPath = settings.customPlayerPath;
    const p = new Player();
    if (!playerPath) {
      playerPath = playerName === 'mpv' ? p.getMPVPath() : p.getVLCPath();
    }
    if (!playerPath) {
      return { success: false, error: `Player not found: ${playerName}` };
    }
    await p.launch(url, playerPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
