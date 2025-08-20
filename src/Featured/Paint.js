const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const brushColor = document.getElementById('brushColor');
const brushWidth = document.getElementById('brushWidth');
const brushOpacity = document.getElementById('brushOpacity');
const clearCtx = document.getElementById("clearCanvas");
const saveImg = document.querySelector(".saveImage");
const brushType = document.getElementById('brushType');
const glowEffect = document.getElementById('glowEffect');
const particleEffect = document.getElementById('particleEffect');
const exportFormat = document.getElementById('exportFormat');
const exportQuality = document.getElementById('exportQuality');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let brushHistory = [];
let particles = [];
let animationId;
let scaleFactor = 1;
let isToolbarVisible = true;

const createParticle = (x, y, color) => {
    return {
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        size: 1 + Math.random() * 3,
        color: color
    };
};

const updateParticle = (particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.98;
    particle.vy *= 0.98;
    particle.life -= particle.decay;
    return particle.life > 0;
};

const renderParticle = (particle, ctx) => {
    ctx.save();
    ctx.globalAlpha = particle.life * 0.7;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

const createTexturePattern = (type) => {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 32;
    patternCanvas.height = 32;
    const pCtx = patternCanvas.getContext('2d');

    switch (type) {
        case 'rough':
            for (let i = 0; i < 200; i++) {
                pCtx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
                pCtx.fillRect(Math.random() * 32, Math.random() * 32, 1, 1);
            }
            break;
        case 'fur':
            for (let i = 0; i < 50; i++) {
                pCtx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
                pCtx.lineWidth = 0.5;
                pCtx.beginPath();
                const x = Math.random() * 32;
                const y = Math.random() * 32;
                pCtx.moveTo(x, y);
                pCtx.lineTo(x + Math.random() * 6 - 3, y + Math.random() * 6 - 3);
                pCtx.stroke();
            }
            break;
        case 'scatter':
            for (let i = 0; i < 100; i++) {
                pCtx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
                pCtx.beginPath();
                pCtx.arc(Math.random() * 32, Math.random() * 32, Math.random() * 2, 0, Math.PI * 2);
                pCtx.fill();
            }
            break;
    }
    return ctx.createPattern(patternCanvas, 'repeat');
};

const setupCanvas = () => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowOffsetX = 0.5;
    ctx.shadowOffsetY = 0.5;
    applyCanvasTheme();
};

const applyCanvasTheme = () => {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.body.classList.contains('dark-mode') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDarkMode) {
        canvas.style.backgroundColor = '#0f0f0f';
        if (brushColor && brushColor.value === '#000000') {
            brushColor.value = '#ffffff';
        }
    } else {
        canvas.style.backgroundColor = '#ffffff';
        if (brushColor && brushColor.value === '#ffffff') {
            brushColor.value = '#000000';
        }
    }
};

const watchThemeChanges = () => {
    const observer = new MutationObserver(() => {
        applyCanvasTheme();
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class']
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyCanvasTheme);
};

const getMousePos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x: x, y: y };
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
    scaleFactor = Math.min(devicePixelRatio, 2);

    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    canvas.width = displayWidth * scaleFactor;
    canvas.height = displayHeight * scaleFactor;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    ctx.scale(scaleFactor, scaleFactor);
    setupCanvas();
};

const startDrawing = (e) => {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);

    if (particleEffect && particleEffect.checked) {
        startParticleAnimation();
    }
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
    const currentBrushType = brushType ? brushType.value : 'smooth';
    const hasGlow = glowEffect && glowEffect.checked;
    const hasParticles = particleEffect && particleEffect.checked;

    const dx = pos.x - lastX;
    const dy = pos.y - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const speedFactor = 0.03;
    const baseOpacity = parseFloat(brushOpacity?.value || 100) / 100;
    const dynamicOpacity = Math.max(0.05, Math.min(1, baseOpacity * (1 / (distance * speedFactor + 0.1))));

    const brushSize = parseFloat(brushWidth?.value || 5);
    const color = brushColor?.value || '#000000';

    if (hasGlow) {
        ctx.save();
        ctx.shadowBlur = brushSize * 2;
        ctx.shadowColor = color;
        ctx.globalCompositeOperation = 'screen';
    }

    ctx.globalAlpha = dynamicOpacity;
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    switch (currentBrushType) {
        case 'smooth':
            ctx.globalCompositeOperation = hasGlow ? 'screen' : 'source-over';
            break;
        case 'textured':
            ctx.fillStyle = createTexturePattern('rough');
            ctx.globalCompositeOperation = 'multiply';
            break;
        case 'airbrush':
            ctx.globalCompositeOperation = 'multiply';
            drawAirbrush(pos.x, pos.y, brushSize, color, dynamicOpacity);
            break;
        case 'calligraphy':
            drawCalligraphy(lastX, lastY, pos.x, pos.y, angle, brushSize, color, dynamicOpacity);
            break;
    }

    if (currentBrushType === 'smooth' || currentBrushType === 'textured') {
        const midX = (lastX + pos.x) / 2;
        const midY = (lastY + pos.y) / 2;

        ctx.quadraticCurveTo(lastX, lastY, midX, midY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(midX, midY);
    }

    if (hasParticles && Math.random() < 0.3) {
        for (let i = 0; i < 3; i++) {
            particles.push(createParticle(pos.x, pos.y, color));
        }
    }

    if (hasGlow) {
        ctx.restore();
    }

    lastX = pos.x;
    lastY = pos.y;
};

const drawAirbrush = (x, y, size, color, opacity) => {
    const sprayDensity = size * 2;
    ctx.save();
    ctx.globalAlpha = opacity * 0.1;
    ctx.fillStyle = color;

    for (let i = 0; i < sprayDensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * size;
        const sprayX = x + Math.cos(angle) * radius;
        const sprayY = y + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(sprayX, sprayY, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
};

const drawCalligraphy = (x1, y1, x2, y2, angle, size, color, opacity) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;

    const pressure = Math.random() * 0.5 + 0.5;
    const width = size * pressure;
    const height = size * 0.3;

    ctx.translate(x2, y2);
    ctx.rotate(angle);
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.restore();
};

const startParticleAnimation = () => {
    if (animationId) return;

    const animate = () => {
        particles = particles.filter(particle => {
            const alive = updateParticle(particle);
            if (alive) {
                renderParticle(particle, ctx);
            }
            return alive;
        });

        if (particles.length > 0 || isDrawing) {
            animationId = requestAnimationFrame(animate);
        } else {
            animationId = null;
        }
    };

    animate();
};

const clearPaintProgress = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    setupCanvas();

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.body.classList.contains('dark-mode') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDarkMode) {
        ctx.fillStyle = '#0f0f0f';
    } else {
        ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const saveImage = async () => {
    try {
        const format = exportFormat?.value || 'png';
        const quality = parseFloat(exportQuality?.value || 0.9);
        const scale = 3;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width * scale;
        tempCanvas.height = canvas.height * scale;
        const tempCtx = tempCanvas.getContext("2d");

        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        tempCtx.scale(scale, scale);
        tempCtx.drawImage(canvas, 0, 0);

        let dataUrl, filename;

        switch (format) {
            case 'png':
                dataUrl = tempCanvas.toDataURL('image/png');
                filename = `artwork_${Date.now()}.png`;
                break;
            case 'jpg':
                const bgCanvas = document.createElement('canvas');
                bgCanvas.width = tempCanvas.width;
                bgCanvas.height = tempCanvas.height;
                const bgCtx = bgCanvas.getContext('2d');
                bgCtx.fillStyle = 'white';
                bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
                bgCtx.drawImage(tempCanvas, 0, 0);
                dataUrl = bgCanvas.toDataURL('image/jpeg', quality);
                filename = `artwork_${Date.now()}.jpg`;
                break;
            case 'webp':
                dataUrl = tempCanvas.toDataURL('image/webp', quality);
                filename = `artwork_${Date.now()}.webp`;
                break;
            case 'svg':
                await exportAsSVG();
                return;
            default:
                dataUrl = tempCanvas.toDataURL('image/png');
                filename = `artwork_${Date.now()}.png`;
        }

        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();

        tempCanvas.remove();

    } catch (error) {
        console.error('Error saving image:', error);
        alert('ไม่สามารถบันทึกภาพได้ กรุณาลองใหม่อีกครั้ง');
    }
};

const exportAsSVG = () => {
    const svgData = `
        <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
            <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml">
                    <canvas width="${canvas.width}" height="${canvas.height}"></canvas>
                </div>
            </foreignObject>
        </svg>
    `;

    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `artwork_${Date.now()}.svg`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
};

const toggleToolbar = () => {
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;

    isToolbarVisible = !isToolbarVisible;

    if (isToolbarVisible) {
        toolbar.style.transform = 'translateX(-100%)';
        toolbar.style.opacity = '0';
        toolbar.style.pointerEvents = 'none';
    } else {
        toolbar.style.transform = 'translateX(0)';
        toolbar.style.opacity = '1';
        toolbar.style.pointerEvents = 'auto';
    }
};

const handleKeyboardShortcuts = (e) => {
    if (e.code === 'Tab' || e.code === 'KeyT') {
        e.preventDefault();
        toggleToolbar();
    }

    if (e.code === 'KeyC' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        clearPaintProgress();
    }

    if (e.code === 'KeyS' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        saveImage();
    }

    if (e.code === 'Escape') {
        if (isDrawing) {
            endDrawing();
        }
    }
};

const createToggleButton = () => {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toolbar-toggle';
    toggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="auto" viewBox="0 -960 960 960" width="24px"
            fill="var(--theme-links)">
            <path
            d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
        </svg>
    `;
    toggleBtn.title = 'Toggle Toolbar (Tab)';
    toggleBtn.addEventListener('click', toggleToolbar);
    document.body.appendChild(toggleBtn);
    return toggleBtn;
};
const handleTouch = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    startDrawing(mouseEvent);
};

const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const touch = e.touches[0];
    const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    draw(mouseEvent);
};

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseout', endDrawing);

canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchend', endDrawing);
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

document.addEventListener('keydown', handleKeyboardShortcuts);
window.addEventListener('resize', debounce(setScaleOfCanvas, 100));
clearCtx?.addEventListener("click", clearPaintProgress);
saveImg?.addEventListener("click", saveImage);

if (brushWidth) {
    brushWidth.addEventListener('input', () => {
        const widthValue = document.getElementById('widthValue');
        if (widthValue) widthValue.textContent = brushWidth.value;
    });
}

if (brushOpacity) {
    brushOpacity.addEventListener('input', () => {
        const opacityValue = document.getElementById('opacityValue');
        if (opacityValue) opacityValue.textContent = brushOpacity.value + '%';
    });
}

const optimizePerformance = () => {
    if (particles.length > 1000) {
        particles = particles.slice(-500);
    }

    if (brushHistory.length > 100) {
        brushHistory = brushHistory.slice(-50);
    }
};

setInterval(optimizePerformance, 1000);

setupCanvas();
setScaleOfCanvas();
watchThemeChanges();
applyCanvasTheme();
createToggleButton();

window.DrawingEngine = {
    clearCanvas: clearPaintProgress,
    saveImage,
    setScaleOfCanvas,
    particles,
    addParticle: (x, y, color) => particles.push(createParticle(x, y, color)),
    applyTheme: applyCanvasTheme,
    setTheme: (isDark) => {
        if (isDark) {
            canvas.style.backgroundColor = '#0f0f0f';
            if (brushColor) brushColor.value = '#ffffff';
        } else {
            canvas.style.backgroundColor = '#ffffff';
            if (brushColor) brushColor.value = '#000000';
        }
    }
};