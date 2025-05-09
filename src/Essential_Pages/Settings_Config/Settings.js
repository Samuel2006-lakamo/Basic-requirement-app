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
    },
    appearance: {
        toggleId: 'AppearanceContentToggle',
        contentId: 'ContentUpper_Appearance',
        backBtnId: 'BackBtnContentAppearance',
    },
    titlebar: {
        toggleId: 'TitlebarContentToggle',
        contentId: 'ContentUpper_Titlebar',
        backBtnId: 'BackBtnContentTitlebar',
    },
    alwaysOnTops: {
        toggleId: 'AlwaysOnTopsContentToggle',
        contentId: 'ContentUpper_AlwaysOnTops',
        backBtnId: 'BackBtnContentAlwaysOnTops',
    },
    navigation: {
        toggleId: 'NavigationContentToggle',
        contentId: 'ContentUpper_Navigation',
        backBtnId: 'BackBtnContentNavigation',
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
            }, 10);
            event.preventDefault();
        });
    }

    const backBtn = document.getElementById(config.backBtnId);
    if (backBtn) {
        backBtn.addEventListener("click", async (event) => {
            document.getElementById(config.contentId).style.transform = "translateY(600px)";
            event.preventDefault();
        });
    }
});

// Apply ripple effect
document.querySelectorAll('.NavContent').forEach(SettingsLinks => {
    createRippleEffect(SettingsLinks);
});

// colors
const themeColorSets = {
    dark: [
        '#E7F1FF', '#B9DCFC', '#8AC5FF', '#5EB0FF', '#2E96FF',
        '#E2F7DF', '#C3EAC6', '#9DDCA1', '#75CD7E', '#53BD63',
        '#FFF8E6', '#FFF0C0', '#FFE699', '#FFDC73', '#FFD34D',
        '#F2EADF', '#E5D6C3', '#D8C2A6', '#CBAE8A', '#BF9B6E',
        '#FFE4E4', '#FFC6C6', '#FFA7A7', '#FF8989', '#FF6C6C',
    ],
    light: [
        '#4B9BFF', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1',
        '#43A047', '#388E3C', '#2E7D32', '#1B5E20', '#1A4D1A',
        '#FFB300', '#FFA000', '#FF8F00', '#FF6F00', '#E65100',
        '#795548', '#6D4C41', '#5D4037', '#4E342E', '#3E2723',
        '#E53935', '#D32F2F', '#C62828', '#B71C1C', '#891515',
    ]
};

const picker = document.getElementById('picker');

// Update color
function updateAccentColor(color) {
    const root = document.documentElement;
    root.style.setProperty('--theme-accent', color);
    root.style.setProperty('--accent', color);
    root.style.setProperty('--ColorHighlight', color);
    localStorage.setItem('theme-accent', color);
}

// Update color picker based on theme
function updateColorPicker() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    // Switcher color
    const colors = themeColorSets[currentTheme];
    picker.innerHTML = ''; // Clear existing swatches
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
}

// Realtime sync
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            updateColorPicker();
        }
    });
});

observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    updateColorPicker();
});

// Listen for theme changes
window.electron?.theme.onChange(theme => {
    updateColorPicker();
});

// Initial setup
updateColorPicker();

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
BackBtnContentTheme.addEventListener("click", async () => {
    BackBtnContentTheme.classList.remove('visible');
    document.getElementById("ContentUpper_Theme").style.transform = "translateY(600px)";
});