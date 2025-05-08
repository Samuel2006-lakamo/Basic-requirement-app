const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { PreferencesWindows, DialogWindows_Config } = require('../config/windowsConfig');

// Simplified title management
const WINDOW_TITLES = {
    default: 'Settings',
};

class SettingsWindowsComponent {
    constructor() {
        this.window = null;
        this.currentTitle = WINDOW_TITLES.default;
        this.setupIPCHandlers();
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

    setupIPCHandlers() {
        // Handle window creation
        ipcMain.handle('open-settings-window', async () => {
            if (!this.window || this.window.isDestroyed()) {
                this.window = new BrowserWindow({ ...DialogWindows_Config });

                this.window.on('closed', () => {
                    this.window = null;
                    //   this.currentTitle = WINDOW_TITLES.default;
                });

                await this.window.loadFile(path.join(__dirname, '../Essential_Pages/Settings.html'));
                await this.injectCustomTitle();
                return true;
            }
            this.window.focus();
            return true;
        });
    }
}

module.exports = SettingsWindowsComponent;
