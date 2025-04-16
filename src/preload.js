const { contextBridge, ipcRenderer } = require('electron');

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ipcRenderer.send('show-context-menu', { x: e.x, y: e.y });
});

contextBridge.exposeInMainWorld('electron', {
    navigateTo: (url) => ipcRenderer.send('navigate', url)
});

