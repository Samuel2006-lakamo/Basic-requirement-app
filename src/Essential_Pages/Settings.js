// Ripple Effect Function
function createRippleEffect(element) {
    let ripple = null;
    let isPressed = false;

    element.addEventListener('mousedown', function (e) {
        isPressed = true;
        ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${e.clientX - this.getBoundingClientRect().left}px`;
        ripple.style.top = `${e.clientY - this.getBoundingClientRect().top}px`;
        this.appendChild(ripple);
    });

    element.addEventListener('mouseup', function () {
        if (ripple) {
            isPressed = false;
            const href = this.getAttribute('data-href');
            ripple.addEventListener('animationend', () => {
                ripple.remove();
                if (href) window.location.href = href;
            });
        }
    });
}

// Content configuration
const contentConfig = {
    theme: {
        toggleId: 'ThemeContentToggle',
        contentId: 'ContentUpper_Theme',
        backBtnId: 'BackBtnContentTheme',
        ipcEvent: 'theme-rename-current-windows'
    },
    appearance: {
        toggleId: 'AppearanceContentToggle',
        contentId: 'ContentUpper_Appearance',
        backBtnId: 'BackBtnContentAppearance',
        ipcEvent: 'appearance-rename-current-windows'
    },
    titlebar: {
        toggleId: 'TitlebarContentToggle',
        contentId: 'ContentUpper_Titlebar',
        backBtnId: 'BackBtnContentTitlebar',
        ipcEvent: 'titlebar-rename-current-windows'
    },
    alwaysOnTops: {
        toggleId: 'AlwaysOnTopsContentToggle',
        contentId: 'ContentUpper_AlwaysOnTops',
        backBtnId: 'BackBtnContentAlwaysOnTops',
        ipcEvent: 'alwaysontops-rename-current-windows'
    },
    navigation: {
        toggleId: 'NavigationContentToggle',
        contentId: 'ContentUpper_Navigation',
        backBtnId: 'BackBtnContentNavigation',
        ipcEvent: 'navigation-rename-current-windows'
    }
};

// Helper function to hide all content except active
function hideOtherContent(activeContentId) {
    Object.values(contentConfig).forEach(config => {
        if (config.contentId !== activeContentId) {
            document.getElementById(config.contentId).style.transform = "translateY(500px)";
        }
    });
}

// Setup content toggles
Object.values(contentConfig).forEach(config => {
    const toggle = document.getElementById(config.toggleId);
    if (toggle) {
        toggle.addEventListener("click", async (event) => {
            setTimeout(() => {
                document.getElementById(config.contentId).style.transform = "translateY(0px)";
                hideOtherContent(config.contentId);
                setTimeout(() => {
                    document.getElementById(config.backBtnId).classList.add('visible');
                }, 300);
            }, 10);
            event.preventDefault();
            await window.electronAPI[config.ipcEvent]();
        });
    }

    const backBtn = document.getElementById(config.backBtnId);
    if (backBtn) {
        backBtn.addEventListener("click", async (event) => {
            backBtn.classList.remove('visible');
            document.getElementById(config.contentId).style.transform = "translateY(600px)";
            event.preventDefault();
            await window.electronAPI.RestoreCurrentName();
        });
    }
});

// Apply ripple effect
document.querySelectorAll('.NavContent').forEach(SettingsLinks => {
    createRippleEffect(SettingsLinks);
});

// colors

const colors = [
    // Blue shades
    '#E7F1FF', '#B9DCFC', '#8AC5FF', '#5EB0FF', '#2E96FF',

    // Green shades
    '#E2F7DF', '#C3EAC6', '#9DDCA1', '#75CD7E', '#53BD63',

    // Yellow shades
    '#FFF8E6', '#FFF0C0', '#FFE699', '#FFDC73', '#FFD34D',

    // Brown shades
    '#F2EADF', '#E5D6C3', '#D8C2A6', '#CBAE8A', '#BF9B6E',

    // Orange shades
    '#FFEDE4', '#FFD7C2', '#FFC19F', '#FFAA7F', '#FF935F',

    // Red shades
    '#FFE4E4', '#FFC6C6', '#FFA7A7', '#FF8989', '#FF6C6C',
];

const picker = document.getElementById('picker');

// Update color
function updateAccentColor(color) {
    const root = document.documentElement;
    root.style.setProperty('--theme-accent', color);
    root.style.setProperty('--accent', color);
    root.style.setProperty('--ColorHighlight', color);
    localStorage.setItem('theme-accent', color);
}

colors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.classList.add('color');
    swatch.setAttribute('tabindex', '0');
    swatch.style.backgroundColor = color;

    swatch.addEventListener('click', () => {
        updateAccentColor(color);
        swatch.focus();
    });

    picker.appendChild(swatch);
});

// Color loaded
const savedAccent = localStorage.getItem('theme-accent');
if (savedAccent) {
    updateAccentColor(savedAccent);
}

// define delay anim for NavContent
document.querySelectorAll('.NavContent').forEach((nav, index) => {
    nav.style.setProperty('--delay', index);
});

// Back button for theme content
BackBtnContentTheme.addEventListener("click", async (eventRestoreCurrentName) => {
    BackBtnContentTheme.classList.remove('visible');
    document.getElementById("ContentUpper_Theme").style.transform = "translateY(600px)";
    eventRestoreCurrentName.preventDefault();
    await window.electronAPI.RestoreCurrentName();
});