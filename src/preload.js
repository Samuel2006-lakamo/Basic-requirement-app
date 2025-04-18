const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'electronAPI', {
        showContextMenu: (position) => ipcRenderer.invoke('show-context-menu', position),
        navigate: (url) => ipcRenderer.send('navigate', url),
        keepOnTop: () => ipcRenderer.send('Keepontop'),
        onNavigate: (callback) => {
            ipcRenderer.on('navigate-to', (_, url) => callback(url));
            return () => {
                ipcRenderer.removeListener('navigate-to', callback);
            };
        }
    }
);

// Secure the window object
delete window.module;
delete window.require;
delete window.exports;
delete window.Buffer;
delete window.process;

