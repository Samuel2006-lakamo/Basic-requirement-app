// global variable
let getStartedBTN = document.getElementById('getStartedBTN');
let content = document.getElementById("content");
let MenuBar = document.getElementById("MainLINKS");
let content2 = document.getElementById("contentGuide2");

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
            content.style.display = "none";
            localStorage.setItem('hasSeenContent', 'true');
        }, 200);

        MenuBar.style.display = "flex";
        setTimeout(() => {
            MenuBar.style.transform = "translateX(0px)";
            setTimeout(() => {
                MenuBar.style.opacity = "1";
            }, 100);
        }, 50);

        scrambleText(targetElement, targetText, 25);
        content2.style.display = "block";

    });
}

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
const targetText = "Introducing the one app that truly has it all,\nTailored specifically for you!\nEvery feature is meticulously crafted to\nEnhance your experience and bring a touch\nOf love to your daily activities discover the\nUltimate tool designed with\nyour needs in mind, Where every detail\nis hand-createdFor your enjoyment!";