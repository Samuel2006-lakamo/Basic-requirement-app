class ThemeManager {
    static init() {
        const theme = localStorage.getItem('app-theme') || 'dark';
        ThemeManager.applyTheme(theme);
        return theme;
    }

    static applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
    }

    static setupThemeSync() {
        if (!window.electron?.theme) return;

        window.electron.theme.load().then(theme => {
            ThemeManager.applyTheme(theme);
        });

        window.electron.theme.onChange(theme => {
            ThemeManager.applyTheme(theme);
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    ThemeManager.setupThemeSync();
});

module.exports = ThemeManager;
