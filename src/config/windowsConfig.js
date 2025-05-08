const path = require('path');

const themeColors = {
  dark: {
    background: '#0f0f0f',
    symbol: '#FFFFFF'
  },
  light: {
    background: '#FFF',
    symbol: '#0f0f0f'
  }
};

const PreferencesWindows = {
  defineNewWindowsPreload: {
    preload: path.join(__dirname, '../preload.js'),
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    autoHideMenuBar: true,
    backgroundThrottling: false,
    enablePreferredSizeMode: true,
    spellcheck: false,
    enableBlinkFeatures: 'CompositorThreading',
    v8CacheOptions: 'code',
    webgl: true,
    experimentalFeatures: true,
    hardwareAcceleration: true
  }
};

const DialogWindows_Config = {
  title: 'Essential App',
  frame: false,
  titleBarStyle: 'hidden',
  titleBarOverlay: {
    color: themeColors.dark.background,
    symbolColor: themeColors.dark.symbol,
    height: 39,
    buttons: ['close']
  },
  width: 320,
  height: 400,
  maximizable: false,
  minimizable: false,
  resizable: false,
  DialogWinConfig_webPreferences: {
    backgroundThrottling: false,
    enablePreferredSizeMode: true,
    spellcheck: false,
    enableBlinkFeatures: 'CompositorThreading',
    v8CacheOptions: 'bypassHeatCheck',
    offscreen: false,
    enableWebSQL: false,
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webgl: true,
    accelerator: 'gpu',
    paintWhenInitiallyHidden: false,
    experimentalFeatures: true,
    zoomFactor: 1.0,
    scrollBounce: true,
    defaultFontSize: 16
  }
};

// Add theme update function
function updateTitleBarTheme(window, theme) {
  if (!window) return;
  const colors = themeColors[theme];
  window.setTitleBarOverlay({
    color: colors.background,
    symbolColor: colors.symbol
  });
}

module.exports = { 
  PreferencesWindows, 
  DialogWindows_Config,
  updateTitleBarTheme 
};
