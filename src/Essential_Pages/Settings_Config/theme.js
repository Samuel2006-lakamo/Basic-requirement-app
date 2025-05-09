// GLOBAL THEME SWITCHER FILE
const THEME_KEY = 'app_theme';

export async function applyTheme(theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--theme-bg', theme === 'light' ? '#FFF' : '#0f0f0f');
}

export function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.send('set-theme', theme);
    } else if (window.require) {
        // fallback for nodeIntegration
        try {
            require('electron').ipcRenderer.send('set-theme', theme);
        } catch { console.log("Set Titlebar Theme Error") }
    }
}

export async function initTheme() {
    let theme = 'dark';

    try {
        theme = localStorage.getItem(THEME_KEY) || 'dark';
    } catch (err) {
        console.error('Error initializing theme:', err);
    }

    applyTheme(theme);
    return theme;
}

export function listenThemeSync() {
    window.addEventListener('storage', (e) => {
        if (e.key === THEME_KEY && e.newValue) {
            applyTheme(e.newValue);
        }
    });
}