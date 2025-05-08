const { ipcMain, BrowserWindow, app } = require('electron');
const path = require('path');
const fs = require('fs');
const { PreferencesWindows, DialogWindows_Config } = require('../config/windowsConfig');

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// Simplified title management
const WINDOW_TITLES = {
    default: 'Settings',
};

const themeColors = {
    light: {
        background: '#FFF',
        titleBar: '#FFF',
        symbolColor: '#0f0f0f'
    },
    dark: {
        background: '#0f0f0f',
        titleBar: '#0f0f0f',
        symbolColor: '#FFFFFF'
    }
};

function loadSavedTheme() {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
            return data.theme || 'dark';
        }
    } catch (err) {
        console.error('Error loading theme:', err);
    }
    return 'dark';
}

function saveTheme(theme) {
    try {
        const settings = fs.existsSync(settingsPath) 
            ? JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
            : {};
        
        settings.theme = theme;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        return true;
    } catch (err) {
        console.error('Error saving theme:', err);
        return false;
    }
}

function ConfigWindowsProperties(windowType) {
    const bgColor = loadSavedTheme() === 'light' ? '#FFF' : '#0f0f0f';
    
    if (windowType === 'about' && aboutWindow && !aboutWindow.isDestroyed()) {
        aboutWindow.setBackgroundColor(bgColor);
    } else if (windowType === 'settings' && SettingsWindows && !SettingsWindows.isDestroyed()) {
        SettingsWindows.setBackgroundColor(bgColor);
    }
}

class SettingsWindowsComponent {
    constructor() {
        this.window = null;
        this.currentTitle = WINDOW_TITLES.default;
        this.setupIPCHandlers();
        this.setupThemeHandlers();
    }

    async injectCustomTitle() {
        if (!this.window?.webContents) return;

        const cssPath = path.join(__dirname, '../CSS/CSS_Essential_Pages/Titlebar.css');
        const css = fs.readFileSync(cssPath, 'utf8');

        await this.window.webContents.executeJavaScript(`
      (function() {
        const style = document.createElement('style');
        style.textContent = \`${css}\`;
        document.head.appendChild(style);
        
        document.body.insertAdjacentHTML('beforeend', \`
          <div id="CenterTitlebar" class="electron-only">
            <div class="Text">
              <div class="Title">
                <h2>${this.currentTitle}</h2>
              </div>
            </div>
          </div>
        \`);
      })();
    `);
    }

    getThemeColors() {
        const currentTheme = loadSavedTheme();
        return themeColors[currentTheme];
    }

    setupIPCHandlers() {
        ipcMain.handle('open-settings-window', async () => {
            if (!this.window || this.window.isDestroyed()) {
                const colors = this.getThemeColors();
                this.window = new BrowserWindow({
                    ...DialogWindows_Config,
                    titleBarOverlay: {
                        ...DialogWindows_Config.titleBarOverlay,
                        color: colors.titleBar,
                        symbolColor: colors.symbolColor
                    }
                });

                this.window.setBackgroundColor(colors.background);

                this.window.on('closed', () => {
                    this.window = null;
                });

                await this.window.loadFile(path.join(__dirname, '../Essential_Pages/Settings.html'));
                await this.injectCustomTitle();
                return true;
            }
            this.window.focus();
            return true;
        });
    }

    setupThemeHandlers() {
        ipcMain.on('save-theme', async (event, theme) => {
            const success = saveTheme(theme);
            if (success && this.window && !this.window.isDestroyed()) {
                const colors = themeColors[theme];
                await this.window.setBackgroundColor(colors.background);
                await this.window.setTitleBarOverlay({
                    color: colors.titleBar,
                    symbolColor: colors.symbolColor,
                    height: 39
                });

                // Send theme change to renderer
                this.window.webContents.send('theme-changed', theme);
                event.reply('theme-saved', success);
            }
        });

        ipcMain.handle('get-theme', () => {
            return loadSavedTheme();
        });
    }
}

module.exports = SettingsWindowsComponent;
