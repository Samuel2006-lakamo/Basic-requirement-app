export function initDropdown() {
    const toggleButton = document.querySelector('.LanguageToggle');
    const menu = document.querySelector('.language-switcher');

    if (!toggleButton || !menu) {
        console.warn('Dropdown toggle button or menu not found.');
        return;
    }

    if (!menu.classList.contains('show')) {
        menu.setAttribute('aria-hidden', 'true');
    }

    toggleButton.addEventListener('click', (eventDropdown) => {
        eventDropdown.stopPropagation();
        menu.classList.toggle('show');
        // Toggle ARIA attribute for accessibility
        menu.setAttribute('aria-hidden', !menu.classList.contains('show'));
    });

    document.addEventListener('click', (eventDropdown) => {
        if (menu.classList.contains('show') && !toggleButton.contains(eventDropdown.target) && !menu.contains(eventDropdown.target)) {
            menu.classList.remove('show');
            menu.setAttribute('aria-hidden', 'true');
        }
    });
}