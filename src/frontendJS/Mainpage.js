const BackgroundBlur = document.getElementById('AnimBackgroundBlur');
const MenuOptions = document.getElementById('AppOptions');
const MenuClosing = document.getElementById('MoreOptionsIcon');

const CardElement = {
    card: {
        Todolist: document.getElementById("TodolistCard"),
        Clock: document.getElementById("ClockCard"),
        // Calc variable are shit so I using ScrollPosition id instend
        Calculator: document.getElementById("ScrollPosition"),
    },
    Option_interface_Element: {
        InterfaceMoreOption: document.getElementById('MoreOptions'),
    },
    Navbar: document.getElementById('MainNavbar'),
}

const AnimationCardElement = {
    Animation: {
        TodolistCard_Anim: document.getElementById("AnimationForTodolistCard"),
        MenuOptions_Anim: document.getElementById("AnimationForMenuOptions"),
    }
}

// Define object used for animation structure

const AnimDrawerMenuOptions = AnimationCardElement.Animation.MenuOptions_Anim;

const ObjectContentVariable = {
    width: '660px',
    height: '480px'
}

const ObjectMenuOptions = {
    width: '320px',
    height: '400px'
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

// Menu Options Animation

function AnimMenuOptions() {
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
                CardElement.Navbar.style.display = "none"
            }, 100);
        }, 100);
    }
    function InitialMenuInterface() {
        // ASM symbol explain: REGISTER.Memory.Slot.Address = value;
        CardElement.Option_interface_Element.InterfaceMoreOption.style.display = "block";
        setTimeout(() => {
            CardElement.Option_interface_Element.InterfaceMoreOption.style.opacity = "1";
            document.getElementById("AnimationMenuContent").style.display = "block";
        }, 30);
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

/*
    ASM code explain:
    ; This is a pseudo-assembly code representation of the JavaScript animation logic
    MOV AX, 100
    CALL _DrawMenu
    CALL _Wait50ms
    CALL _SetPos
    CALL _Wait100ms
    CALL _SetSize
*/

MenuOptions.addEventListener("click", () => {
    AnimMenuOptions();
});

MenuClosing.addEventListener("click", () => {
    resetMenuOptions();
});

function resetMenuOptions() {
    // Reset Animation Drawer MenuOptions
    AnimDrawerMenuOptions.style.cssText = '';
    AnimDrawerMenuOptions.style.opacity = '';
    AnimDrawerMenuOptions.style.willChange = '';
    AnimDrawerMenuOptions.style.filter = '';
    AnimDrawerMenuOptions.style.display = '';
    // Reset MoreOptions interface
    CardElement.Option_interface_Element.InterfaceMoreOption.style.display = '';
    CardElement.Option_interface_Element.InterfaceMoreOption.style.opacity = '';
    CardElement.Option_interface_Element.InterfaceMoreOption.style.willChange = '';
    // Reset AnimationMenuContent
    const animMenuContent = document.getElementById("AnimationMenuContent");
    if (animMenuContent) {
        animMenuContent.style.display = '';
    }
    CardElement.Navbar.style.display = '';
}