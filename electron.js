// electron.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

const isDev_legacy = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

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
      : `file://${path.join(__dirname, '../build/index.html')}`;
    
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
const store = new Store();

// Stub handlers that will be replaced/enhanced by actual implementations
ipcMain.handle('search-tmdb', async (event, query) => {
  try {
    // TODO: Implemented in Task 3
    console.log('searchTMDB handler called:', query);
    return [];
  } catch (error) {
    console.error('searchTMDB error:', error);
    throw error;
  }
});

ipcMain.handle('search-sites', async (event, params) => {
  try {
    // TODO: Implemented in Task 5
    console.log('searchSites handler called:', params);
    return { success: false, error: 'Not implemented yet' };
  } catch (error) {
    console.error('searchSites error:', error);
    throw error;
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
    return [];
  }
});

ipcMain.handle('clear-history', async (event) => {
  try {
    store.set('searchHistory', []);
    return [];
  } catch (error) {
    console.error('clearHistory error:', error);
    return [];
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

ipcMain.handle('launch-player', async (event, params) => {
  try {
    // TODO: Implemented in Task 4
    console.log('launchPlayer handler called:', params);
    return { success: false, error: 'Not implemented yet' };
  } catch (error) {
    console.error('launchPlayer error:', error);
    throw error;
  }
});
