const BackgroundBlur = document.getElementById('AnimBackgroundBlur');

const CardElement = {
    card: {
        Todolist: document.getElementById("TodolistCard"),
        Clock: document.getElementById("ClockCard"),
        // Calc variable are shit so I using ScrollPosition id instend
        Calculator: document.getElementById("ScrollPosition"),
    }
}

const AnimationCardElement = {
    Animation: {
        TodolistCard_Anim: document.getElementById("AnimationForTodolistCard"),
    }
}

const ObjectContentVariable = {
    width: '47.5vw',
    height: '47.5vw'
}

// Define varaible object element
const TodolistTimingElement = AnimationCardElement.Animation.TodolistCard_Anim;
const TodolistCardElement = CardElement.card.Todolist;

function AnimTiming() {
    TodolistCardElement.style.opacity = "0";
    UsingScalingAnimElement();
    TodolistTimingElement.style.willChange = "opacity, transform, left, top, width, height";

    setTimeout(() => {
        TodolistTimingElement.style.cssText += `
            opacity: 1;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
        `;
        setTimeout(() => {
            TodolistTimingElement.style.willChange = "auto"; // Ex. malloc with free
        }, 600);
    }, 100);

    function UsingScalingAnimElement() {
        TodolistTimingElement.style.cssText += `
                width: ${ObjectContentVariable.width};
                height: ${ObjectContentVariable.height};
        `;
    }
    setTimeout(() => {
        BackgroundBlur.style.display = "block"; // Opacity next
        setTimeout(() => {
            BackgroundBlur.style.opacity = "1";
        }, 50);
    }, 300);
}


CardElement.card.Todolist.addEventListener("click", () => {
    AnimTiming();
})