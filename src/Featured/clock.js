// Ensure DOM is loaded before accessing elements
document.addEventListener('DOMContentLoaded', () => {
    let wasm, exports;
    let timer = null;
    let isRunning = false;
    let lastTick = null;

    const timeMain = document.getElementById('time-main');
    const timeMs = document.getElementById('time-ms');
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const resetButton = document.getElementById('reset');
    const lapButton = document.getElementById('lap');
    const lapsList = document.getElementById('laps');

    function formatTimeParts(ms) {
        const ms2 = Math.floor((ms % 1000) / 10);
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60)) % 60;
        const hours = Math.floor(ms / (1000 * 60 * 60));
        return {
            main: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            ms: `.${String(ms2).padStart(2, '0')}`
        };
    }

    function renderLaps() {
        lapsList.innerHTML = '';
        const count = exports.stopwatch_get_lap_count();
        for (let i = 0; i < count; i++) {
            const lapMs = Number(exports.stopwatch_get_lap(i));
            const parts = formatTimeParts(lapMs);
            const li = document.createElement('li');
            li.textContent = `Lap ${i + 1}: ${parts.main}${parts.ms}`;
            lapsList.appendChild(li);
        }
    }

    function updateTime() {
        if (isRunning) {
            const now = Date.now();
            exports.stopwatch_tick(BigInt(now));
            const ms = Number(exports.stopwatch_get_elapsed());
            const parts = formatTimeParts(ms);
            timeMain.textContent = parts.main;
            timeMs.textContent = parts.ms;
        }
    }

    async function loadWasm() {
        const response = await fetch('clockstopwatch.wasm');
        const buffer = await response.arrayBuffer();
        const { instance } = await WebAssembly.instantiate(buffer);
        exports = instance.exports;
        if (exports.stopwatch_create) exports.stopwatch_create();
        setupEvents();
    }

    function setupEvents() {
        startButton.addEventListener('click', () => {
            if (!isRunning) {
                exports.stopwatch_start(BigInt(Date.now()));
                timer = setInterval(updateTime, 31);
                isRunning = true;
            }
        });

        stopButton.addEventListener('click', () => {
            if (isRunning) {
                exports.stopwatch_stop(BigInt(Date.now()));
                clearInterval(timer);
                isRunning = false;
                updateTime();
            }
        });

        resetButton.addEventListener('click', () => {
            exports.stopwatch_reset();
            clearInterval(timer);
            isRunning = false;
            timeMain.textContent = "00:00:00";
            timeMs.textContent = ".00";
            renderLaps();
        });

        lapButton.addEventListener('click', () => {
            if (isRunning) {
                exports.stopwatch_lap();
                renderLaps();
            }
        });
    }

    loadWasm();
});
