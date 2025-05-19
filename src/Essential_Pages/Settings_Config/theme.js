// GLOBAL THEME SWITCHER FILE
const THEME_KEY = 'app_theme';

export async function applyTheme(theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--theme-bg', theme === 'light' ? '#faf8f0' : '#0f0f0f');
    
    // ส่ง theme ไปยัง main process ทันทีที่มีการเปลี่ยนแปลง
    if (window.titlebarAPI) {
        window.titlebarAPI.setTheme(theme);
    }
}

export function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    // Broadcast theme change
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }));
}

export async function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    try {
        await applyTheme(theme);
    } catch (err) {
        console.error('Error initializing theme:', err);
    }

    return theme;
}

export function listenThemeSync() {
    window.addEventListener('storage', (e) => {
        if (e.key === THEME_KEY && e.newValue) {
            applyTheme(e.newValue);
        }
    });
}