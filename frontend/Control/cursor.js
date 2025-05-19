export function initCursor() {
    const $bigBall = document.querySelector('.cursor__ball--big');
    const $hoverables = document.querySelectorAll('.hoverable');

    const CURSOR_CONFIG = {
        big: {
            offset: 15,     
            duration: 0.15,
            delay: 0.01,
            ease: "power1.out"
        },
        hover: {
            duration: 0.03,
            scale: 4
        }
    };

    let mouseX = 0;
    let mouseY = 0;

    function onMouseMove({ pageX, pageY }) {
        mouseX = pageX;
        mouseY = pageY;

        gsap.to($bigBall, {
            duration: CURSOR_CONFIG.big.duration,
            x: mouseX - CURSOR_CONFIG.big.offset,
            y: mouseY - CURSOR_CONFIG.big.offset,
            delay: CURSOR_CONFIG.big.delay,
            ease: CURSOR_CONFIG.big.ease
        });
    }

    function onMouseHover() {
        gsap.to($bigBall, {
            duration: CURSOR_CONFIG.hover.duration,
            scale: CURSOR_CONFIG.hover.scale,
            x: mouseX - CURSOR_CONFIG.big.offset,
            y: mouseY - CURSOR_CONFIG.big.offset,
            ease: "power2.out"
        });
    }

    function onMouseHoverOut() {
        gsap.to($bigBall, {
            duration: CURSOR_CONFIG.big.duration,
            scale: 1,
            x: mouseX - CURSOR_CONFIG.big.offset,
            y: mouseY - CURSOR_CONFIG.big.offset,
            ease: "power2.out"
        });
    }

    document.body.addEventListener('mousemove', onMouseMove);
    $hoverables.forEach(hoverable => {
        hoverable.addEventListener('mouseenter', onMouseHover);
        hoverable.addEventListener('mouseleave', onMouseHoverOut);
    });
}
