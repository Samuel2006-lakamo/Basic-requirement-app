const { app, BrowserWindow, ipcMain, globalShortcut, Menu, screen, nativeTheme } = require('electron');
const path = require('node:path');
const fs = require('fs');
const v8 = require('v8');

require('dotenv').config();

// Using Environment Variable
const token = process.env.GITHUB_TOKEN;
console.log(`GitHub Token: ${token}`);

// Better performance
app.commandLine.appendSwitch('enable-features', 'Metal,NetworkServiceInProcess');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors,MediaRouter');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-hardware-overlays', 'single-fullscreen');
app.commandLine.appendSwitch('force_high_performance_gpu');

// Memory management
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');

if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', '1');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

// Optimize V8
v8.setFlagsFromString('--max_old_space_size=4096');
v8.setFlagsFromString('--optimize_for_size');

if (require('electron-squirrel-startup')) {
  app.quit();
}

// Platform-specific configurations without screen-dependent values
const PLATFORM_CONFIG = {
  darwin: {
    window: {
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 17.5, y: 12 }
    }
  },
  win32: {
    window: {
      titleBarStyle: 'hidden'
    }
  }
};

// Base window configurations
const BASE_WINDOW_CONFIG = {
  common: {
    backgroundMaterial: 'acrylic',
    vibrancy: 'fullscreen-ui',
    frame: false,
    titleBarOverlay: {
      color: '#141414',
      symbolColor: '#FFFFFF',
      height: 39
    },
    fullscreenable: false,
    fullscreen: false,
    maximizable: false,
    webPreferences: {
      backgroundThrottling: false,
      enablePreferredSizeMode: true,
      spellcheck: false,
      enableBlinkFeatures: 'CompositorThreading',
      v8CacheOptions: 'code',
    }
  }
};

let WINDOW_CONFIG;
let mainWindow;
let isAlwaysOnTop = false;
let centerX, centerY;

// Add this helper function after the initial constants
const getThemeIcon = () => {
  return nativeTheme.shouldUseDarkColors
    ? path.join(__dirname, 'assets', 'icons', 'EssentialAPPIcons.png')
    : path.join(__dirname, 'assets', 'icons', 'EssentialAPPIconsLight.png');
};

const createWindow = async () => {
  // Enable process reuse for better performance
  app.allowRendererProcessReuse = true;

  mainWindow = new BrowserWindow({
    ...WINDOW_CONFIG.common,
    ...WINDOW_CONFIG.default,
    icon: getThemeIcon(),
    minWidth: WINDOW_CONFIG.min.width,
    minHeight: WINDOW_CONFIG.min.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      autoHideMenuBar: true,
      backgroundThrottling: false,
      enablePreferredSizeMode: true,
      spellcheck: false,
      enableBlinkFeatures: 'CompositorThreading',
      v8CacheOptions: 'code',
      nodeIntegrationInWorker: true,
      webgl: true
    }
  });

  // Optimize window performance
  mainWindow.webContents.setZoomFactor(1);
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1);

  if (process.platform === 'win32') {
    mainWindow.setTouchBar(null);
  }

  try {
    const fullPath = path.join(__dirname, 'Aboutus.html');
    if (fs.existsSync(fullPath)) {
      await mainWindow.loadFile(fullPath);
    } else {
      await mainWindow.loadFile(path.join(__dirname, 'error.html'));
    }
  } catch (err) {
    console.error('Failed to load file:', err);
  }

  mainWindow.setMenuBarVisibility(false);
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
  const calculateOptimalWindowSize = () => {
    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;
    const aspectRatio = 16 / 9;

    // Base size for 1280x720 screen
    const baseWidth = 820;
    const baseHeight = 905;
    // Calculate scale factor based on screen width
    const scaleFactor = Math.min(screenWidth / 1280, screenHeight / 720);
    // Calculate dimensions ensuring they don't exceed 70% of screen
    let width = Math.min(baseWidth, Math.floor(screenWidth * 0.7));
    let height = Math.min(baseHeight, Math.floor(screenHeight * 0.7));
    // Ensure dimensions are divisible by 8 for better GPU rendering
    width = Math.floor(width / 8) * 8;
    height = Math.floor(height / 8) * 8;
    // Ensure minimum size
    width = Math.max(width, 640);
    height = Math.max(height, 480);
    return { width, height };
  };

  // Initialize window config with screen-dependent values
  const optimal = calculateOptimalWindowSize();
  WINDOW_CONFIG = {
    ...BASE_WINDOW_CONFIG,
    min: {
      width: Math.floor(optimal.width * 0.6),
      height: Math.floor(optimal.height * 0.6)
    },
    default: {
      ...PLATFORM_CONFIG[process.platform]?.window || PLATFORM_CONFIG.win32.window,
      ...optimal
    },
    alwaysOnTop: { width: 340, height: 570 }
  };

  // Calculate center position
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  centerX = Math.floor((screenWidth - WINDOW_CONFIG.default.width) / 2);
  centerY = Math.floor((screenHeight - WINDOW_CONFIG.default.height) / 2);

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
      ...WINDOW_CONFIG.common,
      ...WINDOW_CONFIG.default,
      icon: getThemeIcon(),
      x: centerX,
      y: centerY,
      minWidth: WINDOW_CONFIG.min.width,
      minHeight: WINDOW_CONFIG.min.height,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
        autoHideMenuBar: true,
        backgroundThrottling: false,
        enablePreferredSizeMode: true,
        spellcheck: false,
        enableBlinkFeatures: 'CompositorThreading',
        v8CacheOptions: 'code',
        nodeIntegrationInWorker: true,
        webgl: true
      }
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
    const xBottomPostion = Math.floor((screenWidth - (isAlwaysOnTop ? WINDOW_CONFIG.alwaysOnTop.width : WINDOW_CONFIG.default.width)) / 2);
    const yBottomPostion = screenHeight - (isAlwaysOnTop ? WINDOW_CONFIG.alwaysOnTop.height : WINDOW_CONFIG.default.height);

    const newIcon = getThemeIcon();

    focusedWindow.setIcon(newIcon);

    if (isAlwaysOnTop) {
      focusedWindow.setBounds({
        width: WINDOW_CONFIG.alwaysOnTop.width,
        height: WINDOW_CONFIG.alwaysOnTop.height,
        x: xBottomPostion, // For bottom y center x
        y: yBottomPostion
      });
    } else {
      focusedWindow.setBounds({
        width: WINDOW_CONFIG.default.width,
        height: WINDOW_CONFIG.default.height,
        x: centerX,
        y: centerY
      });
    }
  }
});

// RightClick Menu toggle & Include CSS

ipcMain.on('show-context-menu', (event, pos) => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;

  // Load CSS file
  const cssPath = path.join(__dirname, 'CSS', 'contextMenu.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  const menuHTML = `
    <div class="custom-menu" id="customMenu">
        <div class="custom-menu-item" data-action="todolist" data-href="./Aboutus.html">Go to Home Page</div>
        <div class="custom-menu-item" data-action="todolist" data-href="./index.html">Open To-Do List</div>
        <div class="custom-menu-item" data-action="clock" data-href="./Time.html">View Clock</div>
        <div class="custom-menu-item" data-action="notes" data-href="./Notes.html">Open Notes</div>
        <div class="custom-menu-item" data-action="paint" data-href="./Paint.html">Launch Paint App</div>
    </div>
  `;

  win.webContents.executeJavaScript(`
      try {
          // Add CSS if not exists
          if (!document.getElementById('contextMenuStyles')) {
              const style = document.createElement('style');
              style.id = 'contextMenuStyles';
              style.textContent = \`${cssContent}\`;
              document.head.appendChild(style);
          }

          // Remove existing menu
          const existingMenu = document.getElementById('customMenu');
          if (existingMenu) existingMenu.remove();

          // Add new menu with animation
          document.body.insertAdjacentHTML('beforeend', \`${menuHTML}\`);
          
          // Position menu
          const menu = document.getElementById('customMenu');
          menu.style.left = '${pos.x}px';
          menu.style.top = '${pos.y}px';
          
          // Trigger animation
          requestAnimationFrame(() => {
            menu.classList.add('show');
          });

          // Add click handlers with fade out
          menu.addEventListener('click', (e) => {
              const item = e.target.closest('.custom-menu-item');
              if (item) {
                  const href = item.dataset.href;
                  menu.classList.remove('show');
                  menu.addEventListener('transitionend', () => {
                      if (href) window.location.href = href;
                      menu.remove();
                  }, { once: true });
              }
          });

          // Close menu on outside click with fade out
          document.addEventListener('click', function closeMenu(e) {
              if (!e.target.closest('.custom-menu')) {
                  if (menu) {
                      menu.classList.remove('show');
                      menu.addEventListener('transitionend', () => {
                          menu.remove();
                      }, { once: true });
                  }
                  document.removeEventListener('click', closeMenu);
              }
          });
      } catch (err) {
          console.error('Context menu error:', err);
      }
  `).catch(console.error);
});

ipcMain.on('navigate', (event, url) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    const fullPath = path.join(__dirname, url);
    if (fs.existsSync(fullPath)) {
      win.loadFile(fullPath);
    } else {
      win.loadFile(path.join(__dirname, 'error.html'));
    }
  }
});