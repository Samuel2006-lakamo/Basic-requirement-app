const UI = {
    elements: {
        getStartedBTN: document.getElementById('getStartedBTN'),
        content: document.getElementById("content"),
        MenuBar: document.getElementById("MainLINKS"),
        content2: document.getElementById("contentGuide2"),
        ScrambledBTN: document.getElementById('ScrambledBTN')
    },
    opacity: {
        out: 0,
        in: 1
    }
};

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

if (localStorage.getItem('hasSeenContent')) {
    usingGETSTARTED(); // Show get started once
} else {
    usingGETSTARTED();
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
            document.querySelector('html').style.overflowY = "auto";
            const appCards = document.querySelector('.app-cards');
            if (appCards) {
                appCards.style.display = 'grid';
                appCards.style.opacity = UI.opacity.in;
            }
            const CardElement = document.querySelector('.app-cards');
            if (CardElement) {
                CardElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
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