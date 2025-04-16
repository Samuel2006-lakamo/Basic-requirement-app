const { app, BrowserWindow, ipcMain, globalShortcut, Menu, screen, nativeTheme } = require('electron');
const path = require('node:path');
const fs = require('fs');

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

const createWindow = async () => {
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

ipcMain.on('navigate', async (event, url) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    try {
      const fullPath = path.join(__dirname, url);
      if (fs.existsSync(fullPath)) {
        await win.loadFile(fullPath);
      } else {
        await win.loadFile(path.join(__dirname, 'error.html'));
      }
    } catch (err) {
      console.error('Failed to navigate:', err);
    }
  }
});