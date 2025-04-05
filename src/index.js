const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

// Enable hardware acceleration for better performance
app.commandLine.appendSwitch('enable-features', 'Metal');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    backgroundMaterial: 'acrylic',
    vibrancy: 'fullscreen-ui',
    titleBarStyle: 'hidden',
    frame: false,
    titleBarOverlay: {
      color: '#222',
      symbolColor: '#FFFFFF',
      height: 39
    },
    minWidth: 640,
    minHeight: 480,
    fullscreenable: false,
    fullscreen: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      autoHideMenuBar: true,
      // Enable lazy loading for better performance
      backgroundThrottling: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.setMenuBarVisibility(false);

  // Improve memory management by handling window close events
  mainWindow.on('closed', () => {
    mainWindow.destroy();
  });
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.on('create-new-window', (event, position) => {
  const newWindow = new BrowserWindow({
    width: 320,
    height: 550,
    x: position.x,
    y: position.y,
    autoHideMenuBar: true,
    fullscreenable: false,
    fullscreen: false,
    maximizable: false,
    backgroundMaterial: 'acrylic',
    vibrancy: 'fullscreen-ui',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#222',
      symbolColor: '#FFFFFF',
      height: 39
    },
    webPreferences: {
      // Enable lazy loading for better performance
      backgroundThrottling: true,
    },
  });

  newWindow.loadFile('./src/Time.html');
  newWindow.setMenuBarVisibility(false);

  // Improve memory management by handling window close events
  newWindow.on('closed', () => {
    newWindow.destroy();
  });
});

