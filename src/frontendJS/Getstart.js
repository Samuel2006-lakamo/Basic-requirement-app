const UI = {
    elements: {
        getStartedBTN: document.getElementById('getStartedBTN'),
        content: document.getElementById("content"),
        MenuBar: document.getElementById("MainLINKS"),
        content2: document.getElementById("contentGuide2"),
        ScrambledBTN: document.getElementById('ScrambledBTN'),
        APPcards: document.getElementById("APPcards"),
        getStartedContent: document.getElementById("getStartedContent"), // Wrapper Getstarted
        clearStorageBTN: document.getElementById('clearStorageBTN'),
    },
    opacity: {
        out: 0,
        in: 1
    },
    APPcards: {
        unShow: "none",
        toTop: "2rem"
    }
};

const APPcardsSTYLE = () => {
    // Direct for element but it fine will no error
    // But if the element does not have this error, it will show
    try {
        if (!UI.elements.content || !UI.elements.APPcards) {
            console.error(
                'Required elements not found:',
                'Try to reinstall to fix it',
                {
                    content: UI.elements.content,
                    APPcards: UI.elements.APPcards
                }
            );
            return;
        }
        UI.elements.content.style.display = UI.APPcards.unShow;
        UI.elements.APPcards.style.marginTop = UI.APPcards.toTop;
        // Menubar
        UI.elements.MenuBar.style.display = "flex";
        UI.elements.MenuBar.style.transform = "translateX(0px)";
        UI.elements.MenuBar.style.opacity = UI.opacity.in;
        console.log('APPcardsSTYLE applied');
    } catch (error) {
        console.error('Error in APPcardsSTYLE:', error);
    }
}

// Utility function at the start of the file after UI object
function rafTimeout(callback, delay) {
    let start;
    function timeoutLoop(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;

        if (elapsed < delay) {
            requestAnimationFrame(timeoutLoop);
        } else {
            callback();
        }
    }
    requestAnimationFrame(timeoutLoop);
}

// Check localStorage and apply styles with verification
if (localStorage.getItem('hasSeenContent')) {
    console.log('Content seen before');
    UI.elements.getStartedContent.style.display = "none";
    document.documentElement.style.removeProperty('overflow-y');
    APPcardsSTYLE();
} else {
    console.log('First visit');
    document.documentElement.style.setProperty('overflow-y', 'hidden');
    usingGETSTARTED();
}

// For who want to debug
if (UI.elements.clearStorageBTN) {
    UI.elements.clearStorageBTN.addEventListener('click', function () {
        localStorage.removeItem('hasSeenContent');
        window.location.reload();
    });
}

function usingGETSTARTED() {
    UI.elements.getStartedBTN.addEventListener('click', function () {
        UI.elements.content.style.transform = "translateY(-50px)";
        UI.elements.content.style.opacity = UI.opacity.out;
        rafTimeout(() => {
            localStorage.setItem('hasSeenContent', 'true');
        }, 200);

        // Using Effect
        MenuBar_Initial();
        ScrambleText_Initial();
    });

    function ScrambleText_Initial() {
        scrambleText(targetElement, targetText, 25);
        UI.elements.content2.style.display = "block";
        rafTimeout(() => {
            UI.elements.ScrambledBTN.style.display = "block";
        }, 1000);
        function PositionScrambleText_Button() {
            rafTimeout(() => {
                UI.elements.content2.style.transform = "translate(-50%, -65%)";
                UI.elements.ScrambledBTN.style.display = "block";
                rafTimeout(() => {
                    UI.elements.ScrambledBTN.style.opacity = UI.opacity.in;
                }, 150);
            }, 7800);
        }
        PositionScrambleText_Button();
    }

    function MenuBar_Initial() {
        UI.elements.MenuBar.style.display = "flex";
        rafTimeout(() => {
            UI.elements.MenuBar.style.transform = "translateX(0px)";
            rafTimeout(() => {
                UI.elements.MenuBar.style.opacity = UI.opacity.in;
            }, 100);
        }, 50);
    }

    function UsingAppcard() {
        function ScrambledBTN_Toggle() {
            let regularTimeout = 300;
            rafTimeout(() => {
                UI.elements.content2.style.transition = "ease 0.3s";
                UI.elements.content2.style.opacity = UI.opacity.out;
                UI.elements.content2.style.transform = "translate(-50%, -80%)";
                rafTimeout(() => {
                    UI.elements.content2.style.display = "none";
                }, regularTimeout);
                UI.elements.ScrambledBTN.style.opacity = UI.opacity.out;
                rafTimeout(() => {
                    UI.elements.ScrambledBTN.style.display = "none";
                    APPcard_Toggle();
                }, regularTimeout);
            }, 1800);
        }

        function APPcard_Toggle() {
            // Remove direct style manipulation
            document.documentElement.style.removeProperty('overflow-y');
            
            const appCards = document.querySelector('.app-cards');
            if (appCards) {
                appCards.style.display = 'grid';
                appCards.style.opacity = UI.opacity.in;
                
                // Smooth scroll with delay for animation
                setTimeout(() => {
                    appCards.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }, 100);
            }
            APPcardsSTYLE();
        }

        ScrambledBTN_Toggle();
    }

    UI.elements.ScrambledBTN.addEventListener("click", UsingAppcard);
}

window.scrollTo({
    top: 0,
    behavior: "smooth"
});

function scrambleText(element, text, speed = 50) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let iterations = 0;

    const interval = setInterval(() => {
        const scrambled = text
            .split("")
            .map((char, index) => {
                if (index < iterations) {
                    return char;
                }
                return characters[Math.floor(Math.random() * characters.length)];
            })
            .join("");

        element.innerHTML = scrambled.replace(/\n/g, "<br>");
        if (iterations >= text.length) {
            clearInterval(interval);
        }
        iterations++;
    }, speed);
}

const targetElement = document.getElementById("scrambled-text");
const targetText = "Introducing the one app that truly has it all,\nTailored specifically for you!\nEvery feature is meticulously crafted to\nEnhance your experience and bring a touch\nOf love to your daily activities discover the\nUltimate tool designed with\nyour needs in mind, Where every detail\nis hand-created For your enjoyment!";

document.querySelector('.js-send-button').addEventListener('click', function () {
    this.classList.toggle('send-button--pressed');
});

// Add ripple effect to cards
document.querySelectorAll('.card').forEach(card => {
    let ripple = null;
    let isPressed = false;

    // Handle mouseleave cleanup outside AfterRipple
    card.addEventListener('mouseleave', function() {
        if (ripple) {
            isPressed = false;
            ripple.remove();
        }
    });

    card.addEventListener('mousedown', function(e) {
        isPressed = true;
        ripple = document.createElement('div');
        ripple.className = 'ripple ripple-quick';
        ripple.style.left = `${e.clientX - this.getBoundingClientRect().left}px`;
        ripple.style.top = `${e.clientY - this.getBoundingClientRect().top}px`;
        this.appendChild(ripple);
    });

    card.addEventListener('mouseup', function() {
        if (ripple) {
            isPressed = false;
            const href = this.getAttribute('data-href');
            ripple.addEventListener('animationend', () => {
                ripple.remove();
                if (href) window.location.href = href;
            });
        }
    });
});