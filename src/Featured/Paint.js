const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const brushColor = document.getElementById('brushColor');
const brushWidth = document.getElementById('brushWidth');
const brushOpacity = document.getElementById('brushOpacity');
const clearCtx = document.getElementById("clearCanvas");
const saveImg = document.querySelector(".saveImage");

let isDrawing = false;
let lastX = 0;
let lastY = 0;

const setupCanvas = () => {
    // anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 1;
    ctx.shadowColor = ctx.strokeStyle;
};

const getMousePos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX / window.devicePixelRatio,
        y: (e.clientY - rect.top) * scaleY / window.devicePixelRatio
    };
};

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const setScaleOfCanvas = () => {
    const { devicePixelRatio = 1 } = window;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    setupCanvas();
};

const startDrawing = (e) => {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
};

const endDrawing = () => {
    if (isDrawing) {
        ctx.closePath();
        isDrawing = false;
    }
};

const draw = (e) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = brushColor.value;
    ctx.lineWidth = parseFloat(brushWidth.value);

    const dx = pos.x - lastX;
    const dy = pos.y - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // You can chenge facter here
    const speedFactor = 0.05;
    const opacity = Math.max(0.05, Math.min(1, parseFloat(brushOpacity.value) / 100 * (1 / (distance * speedFactor + 0.1))));
    ctx.globalAlpha = opacity;

    const midX = (lastX + pos.x) / 2;
    const midY = (lastY + pos.y) / 2;

    ctx.quadraticCurveTo(lastX, lastY, midX, midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(midX, midY);

    lastX = pos.x;
    lastY = pos.y;
};


const clearPaintProgress = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setupCanvas();
};

const saveImage = () => {
    try {
        const scale = 2.5; // Scale image when export
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width * scale;
        tempCanvas.height = canvas.height * scale;
        const tempCtx = tempCanvas.getContext("2d");

        tempCtx.scale(scale, scale);
        tempCtx.drawImage(canvas, 0, 0);

        // tempCtx.font = "30px system-ui";
        // tempCtx.fillStyle = "#555555"; 
        // tempCtx.textAlign = "center";
        // tempCtx.textBaseline = "bottom"; 
        // tempCtx.fillText("Produce by Mint teams", canvas.width / 2, canvas.height - 10);

        const link = document.createElement("a");
        link.download = `Untitled.png`;
        link.href = tempCanvas.toDataURL('image/png', 1.0);
        link.click();
    } catch (error) {
        console.error('Error saving image:', error);
        alert('Cant save your image please retry');
    }
};

// Touch support for mobile devices

const handleTouch = (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX - rect.left,
        clientY: touch.clientY - rect.top
    });
    startDrawing(mouseEvent);
};

const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX - rect.left,
        clientY: touch.clientY - rect.top
    });
    draw(mouseEvent);
};

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseout', endDrawing);

canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchend', endDrawing);
canvas.addEventListener('touchmove', handleTouchMove);

window.addEventListener('resize', debounce(setScaleOfCanvas, 100));
clearCtx.addEventListener("click", clearPaintProgress);
saveImg.addEventListener("click", saveImage);

// Initialise
setupCanvas();
setScaleOfCanvas();