// global variable
let getStartedBTN = document.getElementById('getStartedBTN');
let content = document.getElementById("content");
let MenuBar = document.getElementById("MainLINKS");
let content2 = document.getElementById("contentGuide2");
let ScrambledBTN = document.getElementById('ScrambledBTN');

if (localStorage.getItem('hasSeenContent')) {
    // content.style.display = "none";
    usingGETSTARTED();
} else {
    usingGETSTARTED();
}

function usingGETSTARTED() {
    getStartedBTN.addEventListener('click', function () {
        content.style.transform = "translateY(-50px)";
        content.style.opacity = "0";
        setTimeout(() => {
            // content.style.display = "none";
            localStorage.setItem('hasSeenContent', 'true');
        }, 200);

        // function called
        MenuBar_Initial();
        ScrambleText_Initial();
    });

    function ScrambleText_Initial() {
        scrambleText(targetElement, targetText, 25);
        content2.style.display = "block";
        setTimeout(() => {
            ScrambledBTN.style.display = "block";
        }, 1000);
        function PositionScrambleText_Button() {
            setTimeout(() => {
                // First pos with started with X pos and Y
                content2.style.transform = "translate(-50%, -65%)";
                // Toggle button that can display page
                ScrambledBTN.style.display = "block";
                setTimeout(() => {
                    ScrambledBTN.style.opacity = "1";
                }, 150);
            }, 7800);
        }
        PositionScrambleText_Button();
    }

    function MenuBar_Initial() {
        MenuBar.style.display = "flex";
        setTimeout(() => {
            MenuBar.style.transform = "translateX(0px)";
            setTimeout(() => {
                MenuBar.style.opacity = "1";
            }, 100);
        }, 50);
    }

    // Eventlistener for ScrambledBTN
    // Close get started and toggle list of all app

    function UsingAppcard() {
        function ScrambledBTN_Toggle() {
            let regularTimeout = 300;
            // wait animation to done
            setTimeout(() => {
                // Set transition for Faster close
                content2.style.transition = "ease 0.3s"
                content2.style.opacity = "0";
                content2.style.transform = "translate(-50%, -80%)";
                // display off
                setTimeout(() => {
                    content2.style.display = "none";
                }, regularTimeout);
                // ScrambledBTN
                ScrambledBTN.style.opacity = "0";
                setTimeout(() => {
                    ScrambledBTN.style.display = "none";
                    APPcard_Toggle();
                }, regularTimeout);
            }, 1800);
        }

        function APPcard_Toggle() {
            // Enable vertical scrolling
            document.querySelector('html').style.overflowY = "auto";
            const appCards = document.querySelector('.app-cards');
            if (appCards) {
                appCards.style.display = 'grid';
                appCards.style.opacity = '1';
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

    ScrambledBTN.addEventListener("click", UsingAppcard);
}

window.scrollTo({
    top: 0,
    behavior: "smooth" // ScrollChoice: smooth, instant, or auto
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

// Using function
const targetElement = document.getElementById("scrambled-text");
const targetText = "Introducing the one app that truly has it all,\nTailored specifically for you!\nEvery feature is meticulously crafted to\nEnhance your experience and bring a touch\nOf love to your daily activities discover the\nUltimate tool designed with\nyour needs in mind, Where every detail\nis hand-created For your enjoyment!";

// About button that after this text 

document.querySelector('.js-send-button').addEventListener('click', function () {
    this.classList.toggle('send-button--pressed');
});