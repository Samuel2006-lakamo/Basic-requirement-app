const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvasContainer');

// const colorPicker = document.getElementById('brushColor');
const colorPickerTrigger = document.getElementById('color-picker-trigger');
const iroPickerContainer = document.getElementById('iro-picker-container');
let brushColor = '#000000';

const sizePicker = document.getElementById('brushSize');
const sizeDisplay = document.getElementById('sizeDisplay');
const brushType = document.getElementById('brushType');
const exportFormat = document.getElementById('exportFormat');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

// iro.js Color Picker
const colorPicker = new iro.ColorPicker(iroPickerContainer, {
    width: 150,
    borderWidth: 2,
    borderColor: '#2e2e2e',
    layoutDirection: 'horizontal',
    layout: [
        { component: iro.ui.Box, options: {} },
        { component: iro.ui.Slider, options: { sliderType: 'hue' } },       // hue slider
        { component: iro.ui.Slider, options: { sliderType: 'saturation' } },// saturation slider
        { component: iro.ui.Slider, options: { sliderType: 'value' } }      // value slider
    ]
});



colorPicker.on('color:change', (color) => {
    brushColor = color.hexString;
    colorPickerTrigger.style.backgroundColor = brushColor;
});

colorPickerTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = iroPickerContainer.style.display === 'flex';
    iroPickerContainer.style.display = isVisible ? 'none' : 'flex';
});

document.addEventListener('click', (e) => {
    if (!iroPickerContainer.contains(e.target) && e.target !== colorPickerTrigger) {
        iroPickerContainer.style.display = 'none';
    }
});


// Create SVG overlay for true vector drawing
let svg, svgGroup;
let isDrawing = false;
let currentPath = null;
let lastX = 0;
let lastY = 0;
let panX = 0;
let panY = 0;
let scale = 1;
let minScale = 0.1;
let maxScale = 10;

let drawingPaths = [];
let isInitialized = false;

// Triple click detection
let clickCount = 0;
let clickTimer = null;
const clickDelay = 400; // milliseconds

// Viewport constraints
const canvasWidth = 7680;
const canvasHeight = 4320;

// Sticky notes storage
let stickyNotes = [];
let currentSticky = null;
let isDraggingSticky = false;

// Initialize SVG overlay
const initSVG = () => {
    if (svg) {
        const existingPaths = svg.querySelectorAll('.drawing-path');
        drawingPaths = Array.from(existingPaths).map(path => path.cloneNode(true));
        svg.remove();
    }

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '10';

    // Create main group for transformations
    svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(svgGroup);

    canvasContainer.appendChild(svg);

    // Add filter for smooth paper texture
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'paperTexture');

    const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
    turbulence.setAttribute('baseFrequency', '0.04');
    turbulence.setAttribute('numOctaves', '5');
    turbulence.setAttribute('result', 'noise');
    turbulence.setAttribute('seed', '1');

    const displacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
    displacementMap.setAttribute('in', 'SourceGraphic');
    displacementMap.setAttribute('in2', 'noise');
    displacementMap.setAttribute('scale', '2');

    filter.appendChild(turbulence);
    filter.appendChild(displacementMap);
    defs.appendChild(filter);
    svg.appendChild(defs);

    drawingPaths.forEach(path => {
        svgGroup.appendChild(path);
    });
};

const setupCanvas = () => {
    const containerRect = canvasContainer.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = canvasWidth * devicePixelRatio;
    canvas.height = canvasHeight * devicePixelRatio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (!isInitialized) {
        panX = (containerRect.width - canvasWidth) / 2;
        panY = (containerRect.height - canvasHeight) / 2;
        isInitialized = true;
    }

    updateTransform();
    initSVG();
};

// Update transform for both canvas and SVG
const updateTransform = () => {
    const cssTransform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    canvas.style.transform = cssTransform;

    if (svgGroup) {
        const svgTransform = `translate(${panX}, ${panY}) scale(${scale})`;
        svgGroup.setAttribute("transform", svgTransform);
    }
};

// Get coordinates relative to canvas
const getCanvasCoords = (e) => {
    const rect = canvasContainer.getBoundingClientRect();
    // คำนวณตำแหน่งที่แท้จริงบน canvas
    const x = (e.clientX - rect.left - panX) / scale;
    const y = (e.clientY - rect.top - panY) / scale;
    return { x, y };
};

// Triple click detection
const handleTripleClick = (e) => {
    clickCount++;

    if (clickTimer) {
        clearTimeout(clickTimer);
    }

    clickTimer = setTimeout(() => {
        if (clickCount === 3) {
            // Create sticky note on triple click
            const coords = getCanvasCoords(e);
            const sticky = new StickyNote(coords.x, coords.y);
            stickyNotes.push(sticky);
        }
        clickCount = 0;
    }, clickDelay);
};

// Sticky note class
class StickyNote {
    constructor(x, y, width = 200, height = 150) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = 'Double-click to edit';
        this.color = '#ffeb3b';
        this.isEditing = false;
        this.createElement();
    }

    createElement() {
        this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.group.style.pointerEvents = 'auto';

        // Background rect
        this.rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.rect.setAttribute('x', this.x);
        this.rect.setAttribute('y', this.y);
        this.rect.setAttribute('width', this.width);
        this.rect.setAttribute('height', this.height);
        this.rect.setAttribute('fill', this.color);
        this.rect.setAttribute('stroke', '#fbc02d');
        this.rect.setAttribute('stroke-width', '2');
        this.rect.setAttribute('rx', '5');
        this.rect.style.cursor = 'move';

        // Text element
        this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.textElement.setAttribute('x', this.x + 10);
        this.textElement.setAttribute('y', this.y + 25);
        this.textElement.setAttribute('font-family', 'Arial, sans-serif');
        this.textElement.setAttribute('font-size', '14');
        this.textElement.setAttribute('fill', '#333');
        this.textElement.textContent = this.text;
        this.textElement.style.userSelect = 'none';

        this.group.appendChild(this.rect);
        this.group.appendChild(this.textElement);
        svgGroup.appendChild(this.group);

        this.addEventListeners();
    }

    addEventListeners() {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        const onMouseDown = (e) => {
            e.stopPropagation();
            isDragging = true;
            isDraggingSticky = true;
            const coords = getCanvasCoords(e);
            dragOffset.x = coords.x - this.x;
            dragOffset.y = coords.y - this.y;
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.stopPropagation();
            const coords = getCanvasCoords(e);
            this.x = coords.x - dragOffset.x;
            this.y = coords.y - dragOffset.y;
            this.updatePosition();
        };

        const onMouseUp = (e) => {
            if (isDragging) {
                e.stopPropagation();
                isDragging = false;
                isDraggingSticky = false;
            }
        };

        const onDoubleClick = (e) => {
            e.stopPropagation();
            this.startEditing();
        };

        this.rect.addEventListener('mousedown', onMouseDown);
        this.rect.addEventListener('dblclick', onDoubleClick);

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    updatePosition() {
        this.rect.setAttribute('x', this.x);
        this.rect.setAttribute('y', this.y);
        this.textElement.setAttribute('x', this.x + 10);
        this.textElement.setAttribute('y', this.y + 25);
    }

    startEditing() {
        if (this.isEditing) return;
        this.isEditing = true;

        const foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        foreign.setAttribute("x", this.x);
        foreign.setAttribute("y", this.y);
        foreign.setAttribute("width", this.width);
        foreign.setAttribute("height", this.height);

        const textarea = document.createElement("textarea");
        textarea.value = this.text;
        textarea.style.width = "100%";
        textarea.style.height = "100%";
        textarea.style.resize = "both"; // resize handle
        textarea.style.font = "14px Arial, sans-serif";
        textarea.style.background = "transparent";
        textarea.style.border = "none";
        textarea.style.outline = "none";

        textarea.addEventListener("blur", () => {
            this.text = textarea.value;
            this.textElement.textContent = this.text;
            foreign.remove();
            this.isEditing = false;
        });

        foreign.appendChild(textarea);
        this.group.appendChild(foreign);
        textarea.focus();
    }

    remove() {
        if (this.group && this.group.parentNode) {
            this.group.parentNode.removeChild(this.group);
        }
    }
}

// Create smooth paper texture pattern
const createSmoothTexture = (x1, y1, x2, y2, color, size) => {
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.max(1, Math.ceil(distance / 3));

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;

        // Create multiple overlapping circles for smooth texture
        for (let j = 0; j < 2; j++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const offsetX = (Math.random() - 0.5) * size * 0.3;
            const offsetY = (Math.random() - 0.5) * size * 0.3;
            const radius = size * (0.3 + Math.random() * 0.4);

            circle.setAttribute('cx', x + offsetX);
            circle.setAttribute('cy', y + offsetY);
            circle.setAttribute('r', radius);
            circle.setAttribute('fill', color);
            circle.setAttribute('opacity', 0.15 + Math.random() * 0.1);
            circle.setAttribute('filter', 'url(#paperTexture)');

            currentPath.appendChild(circle);
        }
    }
};

// Start drawing
const startDrawing = (e) => {
    if (e.button && e.button !== 0) return;
    if (isDraggingSticky) return;

    if (e.target && e.target.tagName && (e.target.tagName === 'rect' || e.target.tagName === 'text')) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Handle triple click detection
    handleTripleClick(e);

    isDrawing = true;
    const coords = getCanvasCoords(e);
    lastX = coords.x;
    lastY = coords.y;

    // Create SVG path element
    currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    currentPath.setAttribute('class', 'drawing-path');
    currentPath.style.pointerEvents = 'none';
    svgGroup.appendChild(currentPath);

    if (brushType && brushType.value === 'smooth') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${lastX} ${lastY}`);
        path.setAttribute('stroke', brushColor);
        path.setAttribute('stroke-width', sizePicker.value);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('fill', 'none');
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        currentPath.appendChild(path);
        currentPath.pathElement = path;
        currentPath.pathData = `M ${lastX} ${lastY}`;
    } else {
        createSmoothTexture(lastX, lastY, lastX, lastY, brushColor, parseFloat(sizePicker.value));
    }
};

// Draw
const draw = (e) => {
    if (!isDrawing || !currentPath || isDraggingSticky) return;

    const coords = getCanvasCoords(e);

    if (brushType && brushType.value === 'smooth' && currentPath.pathElement) {
        // Update smooth path
        currentPath.pathData += ` L ${coords.x} ${coords.y}`;
        currentPath.pathElement.setAttribute('d', currentPath.pathData);
    } else {
        // Default texture mode
        createSmoothTexture(lastX, lastY, coords.x, coords.y, brushColor, parseFloat(sizePicker.value));
    }

    lastX = coords.x;
    lastY = coords.y;
};

// Stop drawing
const stopDrawing = () => {
    if (isDrawing) {
        isDrawing = false;
        currentPath = null;
    }
};

// Handle zoom with viewport constraints
const handleWheel = (e) => {
    e.preventDefault();

    const rect = canvasContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.ctrlKey || e.metaKey) {

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(minScale, Math.min(maxScale, scale * delta));

        if (newScale !== scale) {
            // Calculate zoom constraints
            const containerWidth = rect.width;
            const containerHeight = rect.height;
            const scaledCanvasWidth = canvasWidth * newScale;
            const scaledCanvasHeight = canvasHeight * newScale;

            // Zoom towards mouse position
            const scaleDiff = newScale - scale;
            let newPanX = panX - (mouseX - panX) * scaleDiff / scale;
            let newPanY = panY - (mouseY - panY) * scaleDiff / scale;

            // Apply constraints to prevent zooming outside canvas
            if (scaledCanvasWidth > containerWidth) {
                newPanX = Math.min(0, Math.max(containerWidth - scaledCanvasWidth, newPanX));
            } else {
                newPanX = (containerWidth - scaledCanvasWidth) / 2;
            }

            if (scaledCanvasHeight > containerHeight) {
                newPanY = Math.min(0, Math.max(containerHeight - scaledCanvasHeight, newPanY));
            } else {
                newPanY = (containerHeight - scaledCanvasHeight) / 2;
            }

            panX = newPanX;
            panY = newPanY;
            scale = newScale;
            updateTransform();
        }
    } else if (e.shiftKey) {
        // Horizontal scroll
        const containerWidth = rect.width;
        const scaledCanvasWidth = canvasWidth * scale;
        if (scaledCanvasWidth > containerWidth) {
            panX = Math.min(0, Math.max(containerWidth - scaledCanvasWidth, panX - e.deltaY * 0.5));
            updateTransform();
        }
    } else {
        // Vertical scroll
        const containerHeight = rect.height;
        const scaledCanvasHeight = canvasHeight * scale;
        if (scaledCanvasHeight > containerHeight) {
            panY = Math.min(0, Math.max(containerHeight - scaledCanvasHeight, panY - e.deltaY * 0.5));
            updateTransform();
        }
    }
};

// Handle keyboard shortcuts
const handleKeyboard = (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && (e.code === "Equal" || e.code === "NumpadAdd")) {
        e.preventDefault();
        scale = Math.min(maxScale, scale * 1.1);
        updateTransform();
    } else if (ctrl && (e.code === "Minus" || e.code === "NumpadSubtract")) {
        e.preventDefault();
        scale = Math.max(minScale, scale * 0.9);
        updateTransform();
    } else if (ctrl && e.code === "Digit0") {
        e.preventDefault();
        scale = 1;
        const rect = canvasContainer.getBoundingClientRect();
        panX = (rect.width - canvasWidth) / 2;
        panY = (rect.height - canvasHeight) / 2;
        updateTransform();
    }
};

// Clear canvas and SVG
const clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const paths = svgGroup.querySelectorAll('.drawing-path');
    paths.forEach(path => path.remove());
    stickyNotes.forEach(sticky => sticky.remove());
    stickyNotes = [];
};

// Export with current window resolution scaling
const saveImage = () => {
    const format = exportFormat.value;
    const timestamp = Date.now();

    // Get current window/screen resolution
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let exportWidth = screenWidth || windowWidth;
    let exportHeight = screenHeight || windowHeight;

    // Upscale if resolution is smaller than 1600x900
    if (exportWidth < 1600 || exportHeight < 900) {
        exportWidth *= 2.5;
        exportHeight *= 2.5;
    }

    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');

    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;

    const scaleX = exportWidth / canvasWidth;
    const scaleY = exportHeight / canvasHeight;
    const exportScale = Math.min(scaleX, scaleY);

    exportCtx.scale(exportScale, exportScale);
    exportCtx.lineCap = 'round';
    exportCtx.lineJoin = 'round';

    // Convert SVG to canvas for export
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
        if (format === 'jpg') {
            exportCtx.fillStyle = 'white';
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }

        exportCtx.drawImage(img, 0, 0, canvasWidth * exportScale, canvasHeight * exportScale);

        let dataUrl, filename;
        switch (format) {
            case 'png':
                dataUrl = exportCanvas.toDataURL('image/png');
                filename = `drawing_${timestamp}.png`;
                break;
            case 'jpg':
                dataUrl = exportCanvas.toDataURL('image/jpeg', 0.95);
                filename = `drawing_${timestamp}.jpg`;
                break;
            case 'webp':
                dataUrl = exportCanvas.toDataURL('image/webp', 0.95);
                filename = `drawing_${timestamp}.webp`;
                break;
            default:
                dataUrl = exportCanvas.toDataURL('image/png');
                filename = `drawing_${timestamp}.png`;
        }

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();

        URL.revokeObjectURL(url);
    };

    img.src = url;
};

// Touch events for mobile
const handleTouch = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
        target: e.target,
        preventDefault: () => { },
        stopPropagation: () => { }
    };
    startDrawing(mouseEvent);
};

const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    draw(mouseEvent);
};

canvasContainer.addEventListener('mousedown', startDrawing);
canvasContainer.addEventListener('mousemove', draw);
document.addEventListener('mouseup', stopDrawing);
document.addEventListener('mouseleave', stopDrawing);
canvasContainer.addEventListener('contextmenu', e => e.preventDefault());

canvasContainer.addEventListener('wheel', handleWheel, { passive: false });

// Touch events
canvasContainer.addEventListener('touchstart', handleTouch, { passive: false });
canvasContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
canvasContainer.addEventListener('touchend', stopDrawing);

// Button events
if (clearBtn) clearBtn.addEventListener('click', clearCanvas);
if (saveBtn) saveBtn.addEventListener('click', saveImage);

// Size display update
if (sizePicker && sizeDisplay) {
    sizePicker.addEventListener('input', () => {
        sizeDisplay.textContent = sizePicker.value + 'px';
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    handleKeyboard(e);

    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        clearCanvas();
    }
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        saveImage();
    }
});

// Auto-adjust theme
const adjustTheme = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark && brushColor === '#000000') {
        brushColor = '#ffffff';
    } else if (!isDark && brushColor === '#ffffff') {
        brushColor = '#000000';
    }
    colorPicker.color.hexString = brushColor;
    colorPickerTrigger.style.backgroundColor = brushColor;
};

// Resize handler
const handleResize = () => {
    setTimeout(() => {
        setupCanvas();
    }, 100);
};

// Initialize
setupCanvas();
adjustTheme();

window.addEventListener('resize', handleResize);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', adjustTheme);