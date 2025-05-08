const { contextBridge, ipcRenderer } = require('electron');

// Settings window title management
const settingsTitleChannels = {
  'theme-section': 'theme-rename-current-windows',
  'alwaysontop-section': 'alwaysontops-rename-current-windows',
  'navigation-section': 'navigation-rename-current-windows',
  'restore-title': 'restore-current-name'
};

contextBridge.exposeInMainWorld(
    'electronAPI', {
    showContextMenu: (pos) => ipcRenderer.invoke('show-context-menu', pos),
    navigate: (url) => ipcRenderer.send('navigate', url),
    keepOnTop: () => ipcRenderer.send('Keepontop'),
    onNavigate: (callback) => {
        ipcRenderer.on('navigate', (_, url) => callback(url));
        return () => {
            ipcRenderer.removeListener('navigate', callback);
        };
    },
    changeLanguage: (locale) => ipcRenderer.send('change-language', locale),
    safeNavigate: (url) => ipcRenderer.invoke('safe-navigate', url),
    openExternal: (url) => ipcRenderer.invoke('open-external-link', url),
    systemInfo: {
        platform: process.platform,
        runtime: 'electron'
    },
    getOSInfo: () => ({
        platform: process.platform,
        runtime: 'electron',
        arch: process.arch
    }),
    onOSInfo: (callback) => {
        ipcRenderer.on('os-info', (_, info) => callback(info));
        return () => {
            ipcRenderer.removeListener('os-info', callback);
        };
    },
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    onSystemInfo: (callback) => {
        ipcRenderer.on('system-info', (_, info) => callback(info));
        return () => {
            ipcRenderer.removeListener('system-info', callback);
        };
    },
    createNewWindow: (url) => ipcRenderer.invoke('create-new-window', url),
    openAboutWindow: () => ipcRenderer.invoke('open-about-window'),
    openSettingsWindow: () => ipcRenderer.invoke('open-settings-window'),
    settingsTitle: {
        changeToTheme: () => ipcRenderer.invoke('theme-section'),
        changeToAlwaysOnTop: () => ipcRenderer.invoke('alwaysontop-section'),
        changeToNavigation: () => ipcRenderer.invoke('navigation-section'),
        restore: () => ipcRenderer.invoke('restore-title')
    }
}
);

contextBridge.exposeInMainWorld('runtimeInfo', {
    runtime: process.versions.electron ? 'electron' : 'web',
    os: process.platform // 'win32', 'darwin', 'linux'
});

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        on: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});

// Secure the window object
delete window.module;
delete window.require;
delete window.exports;
delete window.Buffer;
delete window.process;

window.addEventListener('DOMContentLoaded', () => {
    // From localStorage
    const savedAccent = localStorage.getItem('theme-accent');
    if (savedAccent) {
        const root = document.documentElement;
        root.style.setProperty('--theme-accent', savedAccent);
        root.style.setProperty('--accent', savedAccent);
        root.style.setProperty('--ColorHighlight', savedAccent);
    }

    window.addEventListener('storage', (e) => {
        if (e.key === 'theme-accent') {
            const root = document.documentElement;
            root.style.setProperty('--theme-accent', e.newValue);
            root.style.setProperty('--accent', e.newValue);
            root.style.setProperty('--ColorHighlight', e.newValue);
        }
    });
});

ipcRenderer.on('open-settings-trigger', () => {
    ipcRenderer.invoke('open-settings-window');
});

