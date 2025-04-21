const { app, BrowserWindow, ipcMain, globalShortcut, Menu, screen, nativeTheme } = require('electron');
const path = require('node:path');
const fs = require('fs');
const v8 = require('v8');

const Essential = {
  name: "Essential App",
}

require('dotenv').config();

// Using Environment Variable > DISABLE_GITHUB_TOKEN
// const token = process.env.GITHUB_TOKEN;
// console.log(`GitHub Token: ${token}`);

// Add after other requires
const menuTranslations = require('./locales/menu.js');
let currentLocale = 'en-US'; // Default locale

// Performance Optimization
app.commandLine.appendSwitch('enable-features', 'Metal,NetworkServiceInProcess,ParallelDownloading');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors,MediaRouter');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('use-gl', 'desktop');
app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode');
app.commandLine.appendSwitch('enable-accelerated-video');
app.commandLine.appendSwitch('disable-gpu-driver-bug-workarounds');

// CPU & Memory Optimization
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096 --optimize-for-size --max-inlined-source-size=1000');
v8.setFlagsFromString('--max_old_space_size=4096');
v8.setFlagsFromString('--optimize_for_size');
v8.setFlagsFromString('--max_inlined_source_size=1000');

// Process Priority (Windows)
if (process.platform === 'win32') {
  const { exec } = require('child_process');
  exec(`wmic process where name="electron.exe" CALL setpriority "high priority"`);
  app.commandLine.appendSwitch('high-dpi-support', '1');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

// Protocol handling for Windows
if (process.platform === 'win32') {
  app.setAsDefaultProtocolClient('essential');
}

// Pre-warm optimization
const preWarmApp = () => {
  const tempWindow = new BrowserWindow({ show: false });
  tempWindow.loadURL('about:blank');
  tempWindow.once('ready-to-show', () => {
    tempWindow.close();
  });
};

if (require('electron-squirrel-startup')) {
  app.quit();
}

// Platform-specific configurations without screen-dependent values
const PLATFORM_CONFIG = {
  darwin: {
    window: {
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 17.5, y: 12 },
    }
  },
  win32: {
    window: {
      titleBarStyle: 'hidden',
    }
  }
};

// Base window configurations
const BASE_WINDOW_CONFIG = {
  common: {
    backgroundMaterial: 'acrylic',
    vibrancy: 'fullscreen-ui',
    frame: false,
    title: Essential.name,
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

// Config Page

const Essential_links = {
  home: 'index.html',
  todolist: 'Todolist.html',
  clock: 'Time.html',
  notes: 'Notes.html',
  paint: 'Paint.html',
  settings: 'Settings.html',
  Error: {
    ErrorPage: 'error.html'
  }
};

// Add after Essential_links object
const validateMenuLink = (href) => {
  return Object.values(Essential_links).some(link => {
    if (typeof link === 'string') {
      return link === href;
    } else if (typeof link === 'object') {
      return Object.values(link).includes(href);
    }
    return false;
  });
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

// Global Error Handler Utilities
const handleError = async (win, error, context = '') => {
  console.error(`Error in ${context}:`, error);
  if (win && !win.isDestroyed()) {
    try {
      await win.webContents.send('error-notification', {
        message: error.message || 'An error occurred',
        context: context
      });
      if (context !== 'error-page-load') {
        await win.loadFile(path.join(__dirname, Essential_links.Error.ErrorPage));
      }
    } catch (e) {
      console.error('Error handler failed:', e);
    }
  }
  return Promise.reject(error);
};

// Window Management Promise Wrapper
const createWindowWithPromise = (config) => {
  return new Promise((resolve, reject) => {
    try {
      const window = new BrowserWindow(config);
      resolve(window);
    } catch (err) {
      reject(err);
    }
  });
};

// Enhanced safeLoad with protocol handling
const safeLoad = async (win, filePath) => {
  try {
    // Handle external URLs
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      await win.loadURL(filePath);
      return true;
    }

    // Handle internal file paths
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      await win.loadFile(fullPath);
      return true;
    } else {
      console.warn(`ESNTL: ${filePath} not found`);
      await win.loadFile(path.join(__dirname, Essential_links.Error.ErrorPage));
      return false;
    }
  } catch (err) {
    console.error('ESNTL Error: Safeload error:', err);
    await win.loadFile(path.join(__dirname, Essential_links.Error.ErrorPage));
    return false;
  }
};

// Handle deep linking
app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    // Handle protocol urls
    const url = commandLine.pop();
    if (url && url.startsWith('essential://')) {
      const path = url.replace('essential://', '');
      safeLoad(mainWindow, path);
    }
  }
});

// File Loading Promise Wrapper
const loadFileWithCheck = async (window, filePath, context) => {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      await window.loadFile(fullPath);
      return true;
    }
    throw new Error(`File not found: ${filePath}`);
  } catch (err) {
    await handleError(window, err, context);
    return false;
  }
};

// Load system config and initialize system info
const systemConfig = require('./config/system-info.json');
const { title } = require('node:process');
const systemInfo = {
  runtime: {
    type: 'electron',
    ...systemConfig.runtimes['electron']
  },
  platform: {
    type: process.platform,
    ...systemConfig.platforms[process.platform]
  },
  // details: {
  //   arch: process.arch,
  //   version: process.getSystemVersion?.() || 'unknown',
  //   electron: process.versions.electron,
  //   chrome: process.versions.chrome,
  //   node: process.versions.node,
  //   timestamp: Date.now(),
  //   appVersion: app.getVersion()
  // }
};

// Log system info once
console.log('[System Info]', JSON.stringify(systemInfo, null, 2));

// GPU error handling
app.on('gpu-process-crashed', async (event, killed) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    await handleError(
      focusedWindow,
      new Error('GPU process crashed. Falling back to software rendering.'),
      'gpu-crash'
    );

    // Disable GPU features and reload
    app.disableHardwareAcceleration();
    focusedWindow.reload();
  }
});

// Add global promise rejection handler
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    await handleError(focusedWindow, reason, 'unhandled-rejection');
  }
});

// Optimize startup
app.whenReady().then(async () => {
  try {
    await preWarmApp();

    // Enable process reuse
    app.allowRendererProcessReuse = true;

    // Increase resource limits
    if (process.platform === 'linux') {
      try {
        require('resource-usage').setrlimit('nofile', 100000);
      } catch (e) {
        console.error('ESNTL: Failed to set resource limit:', e);
      }
    }

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

    await createWindow();
    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
      }
    });

    // Update the theme listener
    nativeTheme.on('updated', async () => {
      const windows = BrowserWindow.getAllWindows();
      const currentIcon = getThemeIcon();

      windows.forEach(async win => {
        try {
          await win.setIcon(currentIcon);
        } catch (err) {
          await handleError(win, err, 'theme-update');
        }
      });
    });

    // Update shortcut window creation
    globalShortcut.register('Control+Shift+N', async () => {
      try {
        const newWindow = await createWindowWithPromise({
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
            webgl: true,
            enableWebSQL: false,
            experimentalFeatures: true,
            hardwareAcceleration: true
          }
        });

        await loadFileWithCheck(newWindow, Essential_links.home, 'new-window-shortcut');
        return newWindow;
      } catch (err) {
        await handleError(null, err, 'shortcut-window-creation');
      }
    });
  } catch (err) {
    console.error('ESNTL: initialization error:', err);
  }

  // Mac menubar
  if (process.platform !== 'darwin') {
    Menu.setApplicationMenu(null); // Disable menubar Windows, Linux
  } else {
    // Define links from Essential_links for Mac menubar
    const macMenuLinks = {
      home: Essential_links.home,
      todolist: Essential_links.todolist,
      clock: Essential_links.clock,
      notes: Essential_links.notes,
      paint: Essential_links.paint,
      settings: Essential_links.settings
    };

    try {
      const menuTemplate = Object.entries(macMenuLinks).map(([label, relativePath]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        click: async () => {
          const win = BrowserWindow.getFocusedWindow();
          if (win) {
            await safeLoad(win, relativePath).catch(async (err) => {
              await handleError(win, err, 'mac-menu-navigation');
            });
          }
        }
      }));
      const menu = Menu.buildFromTemplate(menuTemplate);
      Menu.setApplicationMenu(menu);
    } catch (err) {
      console.error('Failed to create Mac menu:', err);
      Menu.setApplicationMenu(null);
    }
  }

  // mainWindow.webContents.openDevTools();

  // Define name of this app
  mainWindow.setTitle("Essential App");
  process.title = "Essential App";
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Update window creation with better error handling
const createWindow = async () => {
  try {
    mainWindow = await createWindowWithPromise({
      ...WINDOW_CONFIG.common,
      ...WINDOW_CONFIG.default,
      icon: getThemeIcon(),
      minWidth: WINDOW_CONFIG.min.width,
      minHeight: WINDOW_CONFIG.min.height,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        enableRemoteModule: false
      }
    }).catch(async (err) => {
      await handleError(null, err, 'window-creation');
      throw err;
    });

    // Add error handler for navigation
    mainWindow.webContents.on('did-fail-load', async (event, errorCode, errorDescription) => {
      await handleError(mainWindow, new Error(`Navigation failed: ${errorDescription}`), 'page-load');
    });

    // Add window move handling
    // Fix Error: 2025-04-18 14:51:59.590 Electron[25627:535694] Warning: Window move completed without beginning
    let isMoving = false;
    mainWindow.on('will-move', () => {
      isMoving = true;
    });
    mainWindow.on('moved', () => {
      isMoving = false;
    });
    mainWindow.on('move', () => {
      if (!isMoving) {
        mainWindow.webContents.send('window-move-started');
      }
    });
    // Add position save on move end
    mainWindow.on('moved', () => {
      const bounds = mainWindow.getBounds();
      centerX = bounds.x;
      centerY = bounds.y;
    });

    // Send system info after window is ready
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('system-info', systemInfo);
    });

    // Optimize window performance
    mainWindow.webContents.setZoomFactor(1);
    mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
    mainWindow.webContents.setBackgroundThrottling(false);

    // Create windows here
    await loadFileWithCheck(mainWindow, Essential_links.home, 'main-window-creation')
      .catch(async (err) => {
        await handleError(mainWindow, err, 'initial-load');
        throw err;
      });

    // Listeners for error handling
    mainWindow.on('page-title-updated', async () => {
      try {
        await mainWindow.setIcon(getThemeIcon());
      } catch (err) {
        await handleError(mainWindow, err, 'icon-update');
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

  } catch (err) {
    await handleError(null, err, 'window-creation');
    throw err;
  }
};

// On top window
ipcMain.on('Keepontop', async (event, message) => {
  try {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) throw new Error('No window focused');

    isAlwaysOnTop = !isAlwaysOnTop;
    await Promise.all([
      focusedWindow.setAlwaysOnTop(isAlwaysOnTop),
      focusedWindow.setVisibleOnAllWorkspaces(isAlwaysOnTop),
      focusedWindow.setResizable(!isAlwaysOnTop),
      focusedWindow.setIcon(getThemeIcon())
    ]);

    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const xBottomPostion = Math.floor((screenWidth - (isAlwaysOnTop ? WINDOW_CONFIG.alwaysOnTop.width : WINDOW_CONFIG.default.width)) / 2);
    const yBottomPostion = screenHeight - (isAlwaysOnTop ? WINDOW_CONFIG.alwaysOnTop.height : WINDOW_CONFIG.default.height);

    if (isAlwaysOnTop) {
      focusedWindow.setBounds({
        width: WINDOW_CONFIG.alwaysOnTop.width,
        height: WINDOW_CONFIG.alwaysOnTop.height,
        x: xBottomPostion,
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
  } catch (err) {
    await handleError(BrowserWindow.getFocusedWindow(), err, 'keep-on-top');
  }
});

// RightClick Menu toggle & Include CSS

// Add IPC handler for language change
ipcMain.on('change-language', (event, locale) => {
  currentLocale = locale;
});

// Update show-context-menu handler
ipcMain.handle('show-context-menu', async (event, pos) => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;

  try {
    const cssPath = path.join(__dirname, 'CSS', 'contextMenu.css');
    const cssContent = await fs.promises.readFile(cssPath, 'utf8');
    const translations = menuTranslations[currentLocale] || menuTranslations['en-US'];

    let menuItems = [
      { label: translations.home, href: Essential_links.home, icon: 'home' },
      { label: translations.todolist, href: Essential_links.todolist, icon: 'list' },
      { label: translations.clock, href: Essential_links.clock, icon: 'schedule' },
      { label: translations.notes, href: Essential_links.notes, icon: 'note' },
      { label: translations.paint, href: Essential_links.paint, icon: 'brush' },
      { label: translations.settings, href: Essential_links.settings, icon: 'Settings' }
    ];

    // If data is corrupted
    menuItems = menuItems.filter(item => {
      const isValid = validateMenuLink(item.href);
      if (!isValid) {
        console.warn(`"${item.href}" Not found try to reinstall this app`);
      }
      return isValid;
    });

    if (menuItems.length === 0) {
      await handleError(win, new Error('Did you using crack version of our app?'), 'context-menu');
      return;
    }

    const menuHTML = `
      <div class="custom-context-menu" id="customContextMenu" data-lang="${currentLocale}" style="left: ${pos.x}px; top: ${pos.y}px;">
        ${menuItems.map(item => `
          <div class="menu-item" data-href="${item.href}">
            <span class="material-symbols-outlined">${item.icon}</span>
            <span class="menu-label">${item.label}</span>
          </div>
        `).join('')}
      </div>
    `;

    await win.webContents.executeJavaScript(`
      (function() {
        // Add font stylesheet if not present
        if (!document.getElementById('contextMenuFonts')) {
          const fontLink = document.createElement('link');
          fontLink.id = 'contextMenuFonts';
          fontLink.rel = 'stylesheet';
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Kanit:wght@400;500&family=Noto+Sans+Thai:wght@400;500&display=swap';
          document.head.appendChild(fontLink);
        }

        // Remove existing menu if any
        const existingMenu = document.getElementById('customContextMenu');
        if (existingMenu) existingMenu.remove();

        // Add CSS if not already present
        if (!document.getElementById('contextMenuStyles')) {
          const style = document.createElement('style');
          style.id = 'contextMenuStyles';
          style.textContent = \`${cssContent}\`;
          document.head.appendChild(style);
        }

        // Add menu HTML
        document.body.insertAdjacentHTML('beforeend', \`${menuHTML}\`);

        // Handle menu interactions
        const menu = document.getElementById('customContextMenu');
        
        // Add show animation
        requestAnimationFrame(() => menu.classList.add('show'));

        // Handle menu item clicks with safeLoad
        menu.addEventListener('click', (e) => {
          const menuItem = e.target.closest('.menu-item');
          if (menuItem) {
            const href = menuItem.dataset.href;
            menu.classList.remove('show');
            setTimeout(() => {
              if (href) {
                // Use IPC to trigger safeLoad
                window.electronAPI.safeNavigate(href);
              }
              menu.remove();
            }, 150);
          }
        });

        // Close menu when clicking outside
        function closeMenu(e) {
          if (!menu.contains(e.target)) {
            menu.classList.remove('show');
            setTimeout(() => menu.remove(), 150);
            document.removeEventListener('click', closeMenu);
          }
        }

        // Add slight delay before adding click listener
        setTimeout(() => document.addEventListener('click', closeMenu), 10);
      })();
    `);
  } catch (err) {
    await handleError(win, err, 'context-menu');
  }
});

// Add new IPC handler for safe navigation
ipcMain.handle('safe-navigate', async (event, url) => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;

  await safeLoad(win, url);
});

// Handle URLs in existing windows
ipcMain.handle('open-external-link', async (event, url) => {
  try {
    const { shell } = require('electron');
    await shell.openExternal(url);
    return true;
  } catch (err) {
    await handleError(BrowserWindow.getFocusedWindow(), err, 'external-link');
    return false;
  }
});

// Update IPC handlers with proper error handling
ipcMain.on('navigate', async (event, url) => {
  try {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) throw new Error('No active window');

    const success = await safeLoad(win, url).catch(async (err) => {
      await handleError(win, err, 'navigation');
      throw err;
    });

    if (!success) {
      throw new Error(`Failed to load: ${url}`);
    }
  } catch (err) {
    await handleError(BrowserWindow.getFocusedWindow(), err, 'navigation');
  }
});

ipcMain.on('show-error', async (event, message) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    try {
      await win.webContents.send('error-notification', message);
    } catch (err) {
      await handleError(win, err, 'error-notification');
    }
  }
});
