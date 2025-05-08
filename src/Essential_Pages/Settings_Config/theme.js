// GLOBAL THEME SWITCHER FILE
const THEME_KEY = 'app_theme';

export async function applyTheme(theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--theme-bg', theme === 'light' ? '#FFF' : '#0f0f0f');
    
    if (window.electron?.theme) {
        await window.electron.theme.save(theme);
    }
}

export function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
}

export async function initTheme() {
    let theme = 'dark'; // เปลี่ยนค่าเริ่มต้นเป็น dark
    
    try {
        if (window.electron?.theme) {
            theme = await window.electron.theme.load();
        } else {
            theme = localStorage.getItem(THEME_KEY) || 'dark';
        }
    } catch (err) {
        console.error('Error initializing theme:', err);
    }

    applyTheme(theme);
    return theme;
}
