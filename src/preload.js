const { contextBridge, ipcRenderer } = require('electron');

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
    // Add OS info API
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
    openAboutWindow: () => ipcRenderer.invoke('open-about-window')
}
);

contextBridge.exposeInMainWorld('runtimeInfo', {
    runtime: process.versions.electron ? 'electron' : 'web',
    os: process.platform // 'win32', 'darwin', 'linux'
});

// Secure the window object
delete window.module;
delete window.require;
delete window.exports;
delete window.Buffer;
delete window.process;

