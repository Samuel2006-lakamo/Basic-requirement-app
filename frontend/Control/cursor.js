export function initCursor() {
    const $bigBall = document.querySelector('.cursor__ball--big');
    const $smallBall = document.querySelector('.cursor__ball--small');
    const $hoverables = document.querySelectorAll('.hoverable');

    const CURSOR_CONFIG = {
        big: {
            offset: 15,
            duration: 0.15,     
            delay: 0.01,        
            ease: "power1.out"  
        },
        small: {
            offset: 5,
            duration: 0.01,     
            ease: "none"
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
        gsap.to($smallBall, {
            duration: CURSOR_CONFIG.small.duration,
            x: mouseX - CURSOR_CONFIG.small.offset,
            y: mouseY - CURSOR_CONFIG.small.offset,
            ease: CURSOR_CONFIG.small.ease
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
        gsap.to($smallBall, {
            duration: CURSOR_CONFIG.hover.duration,
            opacity: 0,
            x: mouseX - CURSOR_CONFIG.small.offset,
            y: mouseY - CURSOR_CONFIG.small.offset
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
        gsap.to($smallBall, {
            duration: CURSOR_CONFIG.small.duration,
            opacity: 1,
            x: mouseX - CURSOR_CONFIG.small.offset,
            y: mouseY - CURSOR_CONFIG.small.offset
        });
    }

    // Listeners
    document.body.addEventListener('mousemove', onMouseMove);
    $hoverables.forEach(hoverable => {
        hoverable.addEventListener('mouseenter', onMouseHover);
        hoverable.addEventListener('mouseleave', onMouseHoverOut);
    });
}

export function removeCursor() {
    // Clean up function if needed
    document.body.removeEventListener('mousemove', onMouseMove);
    document.querySelectorAll('.hoverable').forEach(hoverable => {
        hoverable.removeEventListener('mouseenter', onMouseHover);
        hoverable.removeEventListener('mouseleave', onMouseHoverOut);
    });
}