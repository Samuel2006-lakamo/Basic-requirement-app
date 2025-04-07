const { app, BrowserWindow, ipcMain, globalShortcut, Menu, screen, nativeTheme } = require('electron');
const path = require('node:path');

require('dotenv').config();

// Using Environment Variable
const token = process.env.GITHUB_TOKEN;
console.log(`GitHub Token: ${token}`);

// Better performance
app.commandLine.appendSwitch('enable-features', 'Metal');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let isAlwaysOnTop = false;
const DEFINE_WINDOWSIZE = { width: 820, height: 905 };
const DEFINE_MINWINSIZE = { width: 640, height: 480 };
const DEFINE_MINWIDTHSIZE = { width: 720, height: 480 };
const DEFINE_ALWAYSONTOP = { width: 340, height: 570 };

let centerX, centerY;

// Add this helper function after the initial constants
const getThemeIcon = () => {
  return nativeTheme.shouldUseDarkColors
    ? path.join(__dirname, 'assets', 'icons', 'EssentialAPPIcons.png')
    : path.join(__dirname, 'assets', 'icons', 'EssentialAPPIconsLight.png');
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: DEFINE_WINDOWSIZE.width,
    height: DEFINE_WINDOWSIZE.height,
    icon: getThemeIcon(),
    backgroundMaterial: 'acrylic',
    vibrancy: 'fullscreen-ui',
    titleBarStyle: 'hidden',
    frame: false,
    titleBarOverlay: {
      color: '#141414',
      symbolColor: '#FFFFFF',
      height: 39
    },
    minWidth: DEFINE_MINWIDTHSIZE.width,
    minHeight: DEFINE_MINWIDTHSIZE.height,
    fullscreenable: false,
    fullscreen: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      autoHideMenuBar: true,
      backgroundThrottling: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'Aboutus.html'));
  mainWindow.setMenuBarVisibility(false);

  // Add icon error handling
  mainWindow.on('page-title-updated', () => {
    try {
      mainWindow.setIcon(getThemeIcon());
    } catch (err) {
      console.error('Failed to set window icon:', err);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  centerX = Math.floor((screenWidth - DEFINE_WINDOWSIZE.width) / 2); // Calculate center X
  centerY = Math.floor((screenHeight - DEFINE_WINDOWSIZE.height) / 2); // Calculate center Y

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Update the theme listener
  nativeTheme.on('updated', () => {
    const windows = BrowserWindow.getAllWindows();
    const currentIcon = getThemeIcon();

    windows.forEach(win => {
      try {
        win.setIcon(currentIcon);
      } catch (err) {
        console.error('Failed to update window icon:', err);
      }
    });
  });

  // Update shortcut window creation
  globalShortcut.register('Control+Shift+N', () => {
    const newWindow = new BrowserWindow({
      width: DEFINE_WINDOWSIZE.width,
      height: DEFINE_WINDOWSIZE.height,
      icon: getThemeIcon(),
      x: centerX,
      y: centerY,
      minWidth: DEFINE_MINWIDTHSIZE.width,
      minHeight: DEFINE_MINWIDTHSIZE.height,
      fullscreenable: false,
      fullscreen: false,
      maximizable: false,
      backgroundMaterial: 'acrylic',
      vibrancy: 'fullscreen-ui',
      titleBarStyle: 'hidden',
      frame: false,
      titleBarOverlay: {
        color: '#141414',
        symbolColor: '#FFFFFF',
        height: 39
      },
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
        autoHideMenuBar: true,
        backgroundThrottling: true,
      },
    });

    newWindow.loadFile(path.join(__dirname, 'Aboutus.html'));
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

// On top window
ipcMain.on('Keepontop', (event, message) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    isAlwaysOnTop = !isAlwaysOnTop; // Toggle the state
    focusedWindow.setAlwaysOnTop(isAlwaysOnTop);
    focusedWindow.setVisibleOnAllWorkspaces(isAlwaysOnTop);
    focusedWindow.setResizable(!isAlwaysOnTop);

    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const xBottomPostion = Math.floor((screenWidth - (isAlwaysOnTop ? DEFINE_ALWAYSONTOP.width : DEFINE_WINDOWSIZE.width)) / 2);
    const yBottomPostion = screenHeight - (isAlwaysOnTop ? DEFINE_ALWAYSONTOP.height : DEFINE_WINDOWSIZE.height);

    const newIcon = getThemeIcon();

    focusedWindow.setIcon(newIcon);

    if (isAlwaysOnTop) {
      focusedWindow.setBounds({
        width: DEFINE_ALWAYSONTOP.width,
        height: DEFINE_ALWAYSONTOP.height,
        x: xBottomPostion, // For bottom y center x
        y: yBottomPostion
      });
    } else {
      focusedWindow.setBounds({
        width: DEFINE_WINDOWSIZE.width,
        height: DEFINE_WINDOWSIZE.height,
        x: centerX,
        y: centerY
      });
    }
  }
});

// Update drag & drop window creation
ipcMain.on('create-new-window', (event, position) => {
  const newWindow = new BrowserWindow({
    width: DEFINE_MINWINSIZE.width,
    height: DEFINE_MINWINSIZE.height,
    icon: getThemeIcon(),
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
      color: '#141414',
      symbolColor: '#FFFFFF',
      height: 39
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      autoHideMenuBar: true,
      backgroundThrottling: true,
    },
  });

  newWindow.loadFile('./src/Time.html');
  newWindow.setMenuBarVisibility(false);

  newWindow.on('closed', () => {
    newWindow.destroy();
  });
});