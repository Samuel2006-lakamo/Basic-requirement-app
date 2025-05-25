const AnimDrawerMenuOptions = document.getElementById("AnimationForMenuOptions");
const TodolistCardElement = document.getElementById("TodolistCard");
const TodolistTimingElement = document.getElementById("AnimationForTodolistCard");
const BackgroundBlur = document.getElementById("AnimBackgroundBlur");

// Use function to get fresh element references instead of storing potentially null values
function getElements() {
    return {
        MoreOptions: document.getElementById('MoreOptions'),
        Navbar: document.getElementById('MainNavbar'),
        AnimationMenuContent: document.getElementById("AnimationMenuContent")
    };
}

const ObjectMenuOptions = {
    width: '320px',
    height: '400px'
};

const ObjectContentVariable = {
    width: '340px',
    height: '340px'
};

function AnimMenuOptions() {
    if (!AnimDrawerMenuOptions) {
        console.error('AnimationForMenuOptions Error');
        return;
    }

    AnimDrawerMenuOptions.style.willChange = "opacity, transform, left, top, width, height";
    
    function InitialMenuPos() {
        AnimDrawerMenuOptions.style.cssText += `
            top: 100vh;
            left: 0;
            z-index: 11;
            width: 265px;
            height: 45px;
            transform: translate(0%, 0%);
        `;
        
        setTimeout(() => {
            AnimDrawerMenuOptions.style.opacity = "1";
        }, 50);
        
        setTimeout(() => {
            AnimDrawerMenuOptions.style.cssText += `
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: 11;
            `;
            setTimeout(() => {
                AnimDrawerMenuOptions.style.cssText += `
                    width: ${ObjectMenuOptions.width};
                    height: ${ObjectMenuOptions.height};
                    filter: brightness(1);
                `;
                const elements = getElements();
                if (elements.Navbar) {
                    elements.Navbar.style.display = "none";
                }
            }, 50);
        }, 100);
    }
    
    function InitialMenuInterface() {
        const elements = getElements();
        if (elements.MoreOptions) {
            elements.MoreOptions.style.cssText = "display: block !important;";
            setTimeout(() => {
                elements.MoreOptions.style.opacity = "1";
                if (elements.AnimationMenuContent) {
                    elements.AnimationMenuContent.style.display = "block";
                }
            }, 30);
        }
    }
    
    setTimeout(() => {
        InitialMenuPos();
        setTimeout(() => {
            InitialMenuInterface();
        }, 400);
        setTimeout(() => {
            AnimDrawerMenuOptions.style.willChange = "auto";
        }, 600);
    }, 100);
}

function resetMenuOptions() {
    // Reset main animation drawer
    if (AnimDrawerMenuOptions) {
        AnimDrawerMenuOptions.style.cssText = '';
        AnimDrawerMenuOptions.style.opacity = '';
        AnimDrawerMenuOptions.style.willChange = '';
        AnimDrawerMenuOptions.style.filter = '';
        AnimDrawerMenuOptions.style.display = '';
    }
    
    if (TodolistCardElement) {
        TodolistCardElement.style.opacity = '';
    }
    const elements = getElements();
    
    if (elements.MoreOptions) {
        elements.MoreOptions.style.cssText = 'display: none !important; opacity: 0 !important;';
    }

    if (elements.AnimationMenuContent) {
        elements.AnimationMenuContent.style.cssText = '';
    }

    if (elements.Navbar) {
        elements.Navbar.style.display = '';
    }

    if (TodolistTimingElement) {
        AnimDrawerMenuOptions.style.cssText += `
            display: none;
            width: 0px;
            height: 0px;
        `;
        TodolistTimingElement.style.cssText = '';
    }

    if (BackgroundBlur) {
        BackgroundBlur.style.cssText = '';
    }
}

function attachEventListeners() {
    const appOptions = document.getElementById('AppOptions');
    const moreOptionsIcon = document.getElementById('MoreOptionsIcon');
    const animBackgroundBlur = document.getElementById('AnimBackgroundBlur');
    const moreOptions = document.getElementById("MoreOptions");
    
    if (appOptions) {
        appOptions.addEventListener("click", (e) => {
            e.preventDefault();
            AnimMenuOptions();
        });
    }
    
    if (moreOptionsIcon) {
        moreOptionsIcon.addEventListener("click", (e) => {
            e.preventDefault();
            resetMenuOptions();
        });
    }
    
    if (animBackgroundBlur) {
        animBackgroundBlur.addEventListener("click", (e) => {
            e.preventDefault();
            resetMenuOptions();
        });
    }
    
    if (moreOptions) {
        moreOptions.addEventListener("click", (e) => {
            e.preventDefault();
            resetMenuOptions();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachEventListeners);
} else {
    attachEventListeners();
}

function debugElements() {
    console.log('Debug Element States:');
    console.log('AnimDrawerMenuOptions:', AnimDrawerMenuOptions);
    console.log('MoreOptions:', document.getElementById('MoreOptions'));
    console.log('Navbar:', document.getElementById('MainNavbar'));
    console.log('AnimationMenuContent:', document.getElementById("AnimationMenuContent"));
}