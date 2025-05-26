import { createState } from './DynamicContent.js';
import { injectCSS, injectHTML } from './Core/DymcScript.js';

const navLinks = [
    {
        href: "index.html",
        id: "bottomnav-home",
        title: "Home",
        icon: `<span class="material-symbols-outlined">home</span>`,
        label: "Home"
    },
    {
        href: "Todolist.html",
        id: "bottomnav-todo",
        title: "Todo",
        icon: `<span class="material-symbols-outlined">checklist</span>`,
        label: "Todo"
    },
    {
        href: "Time.html",
        id: "bottomnav-clock",
        title: "Clock",
        icon: `<span class="material-symbols-outlined">schedule</span>`,
        label: "Clock"
    },
    {
        href: "calc.html",
        id: "bottomnav-calc",
        title: "Calculator",
        icon: `<span class="material-symbols-outlined">calculate</span>`,
        label: "Calc"
    },
    {
        href: "Notes.html",
        id: "bottomnav-notes",
        title: "Notes",
        icon: `<span class="material-symbols-outlined">sticky_note_2</span>`,
        label: "Notes"
    }
];

const BottomNavbarCSS = `
/* Bottom navbar styles */
#bottom-navbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 65px;
    background: var(--theme-bg, #222);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1002;
    border-top: 1px solid var(--theme-border);
    transition: transform 0.2s;
}
#bottom-navbar .bottom-navbar-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    width: 100%;
    height: 100%;
    padding: 0 5px;
    gap: 0;
}
#bottom-navbar a {
    color: var(--theme-fg);
    opacity: 0.7;
    text-decoration: none;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1 1 0;
    height: 100%;
    justify-content: center;
    transition: color 0.2s;
    padding: 0 2px;
    min-width: 0;
    font-weight: 500;
}
#bottom-navbar a.active {
    color: var(--accent);
    opacity: 1;
    font-weight: 600;
}
#bottom-navbar .material-symbols-outlined {
    font-size: 22px;
    margin-bottom: 2px;
    line-height: 1;
}
@media (min-width: 341px) {
    #bottom-navbar {
        display: none !important;
    }
}
`;

function getBottomNavbarHTML(currentPage) {
    return `
        <div class="bottom-navbar-wrapper">
            ${navLinks.map(link => `
                <a href="${link.href}" id="${link.id}" title="${link.title}"${link.href === currentPage ? ' class="active"' : ''}>
                    ${link.icon}
                    <span>${link.label}</span>
                </a>
            `).join('')}
        </div>
    `;
}

injectCSS(BottomNavbarCSS);

const appState = createState();

// Ensure #bottom-navbar exists in <body>
function ensureBottomNavbarDiv() {
    if (!document.getElementById('bottom-navbar')) {
        const div = document.createElement('div');
        div.id = 'bottom-navbar';
        document.body.appendChild(div);
    }
}

function renderBottomNavbar() {
    ensureBottomNavbarDiv();
    if (window.innerWidth <= 340) {
        injectHTML('#bottom-navbar', getBottomNavbarHTML(appState.get ? appState.get().currentPage : location.pathname.split('/').pop()));
        document.querySelectorAll('#bottom-navbar a').forEach(a => {
            a.addEventListener('click', e => {
                if (appState.set) {
                    appState.set(s => ({ ...s, currentPage: a.getAttribute('href') }));
                }
            });
        });
    } else {
        const nav = document.querySelector('#bottom-navbar');
        if (nav) nav.innerHTML = '';
    }
}

// Initial render
renderBottomNavbar();
window.addEventListener('resize', renderBottomNavbar);

appState.subscribe(state => {
    renderBottomNavbar();
});

appState.set(s => ({
    ...s,
    currentPage: location.pathname.split('/').pop()
}));