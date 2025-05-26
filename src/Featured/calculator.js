let currentNumber = '0';
let previousNumber = '';
let operation = null;
let shouldResetScreen = false;

const display = document.querySelector('.display');

let wasmExports = null;

async function loadWasm() {
    try {
        // สมมติ calculator.wasm อยู่ที่เดียวกับ calc.html
        const response = await fetch('calculator.wasm');
        const buffer = await response.arrayBuffer();
        const { instance } = await WebAssembly.instantiate(buffer);
        wasmExports = instance.exports;
    } catch (e) {
        alert('Failed to load calculator.wasm');
    }
}
loadWasm();

function updateDisplay() {
    display.textContent = currentNumber;
}

function appendNumber(number) {
    if (shouldResetScreen) {
        currentNumber = number.toString();
        shouldResetScreen = false;
    } else {
        currentNumber = currentNumber === '0' ? number.toString() : currentNumber + number;
    }
    updateDisplay();
}

function appendDecimal() {
    if (!currentNumber.includes('.')) {
        currentNumber += '.';
        updateDisplay();
    }
}

function clearDisplay() {
    currentNumber = '0';
    previousNumber = '';
    operation = null;
    updateDisplay();
}

function toggleSign() {
    if (!wasmExports) return;
    currentNumber = wasmExports.toggle_sign(parseFloat(currentNumber)).toString();
    updateDisplay();
}

function percentage() {
    if (!wasmExports) return;
    currentNumber = wasmExports.percent(parseFloat(currentNumber)).toString();
    updateDisplay();
}

function setOperator(op) {
    if (operation !== null) calculate();
    previousNumber = currentNumber;
    operation = op;
    shouldResetScreen = true;
}

function calculate() {
    if (operation === null || shouldResetScreen || !wasmExports) return;

    const prev = parseFloat(previousNumber);
    const current = parseFloat(currentNumber);
    let result;

    switch (operation) {
        case '+':
            result = wasmExports.add(prev, current);
            break;
        case '-':
            result = wasmExports.subtract(prev, current);
            break;
        case '×':
            result = wasmExports.multiply(prev, current);
            break;
        case '÷':
            result = current !== 0 ? wasmExports.divide(prev, current) : 'Error';
            break;
        default:
            return;
    }

    currentNumber = result.toString();
    operation = null;
    shouldResetScreen = true;
    updateDisplay();
}

// ฟังก์ชันที่เรียกใช้จาก C เท่านั้น
function sqrtValue() {
    if (!wasmExports) return;
    currentNumber = wasmExports.sqrt_value(parseFloat(currentNumber)).toString();
    updateDisplay();
}

function powerValue(exp) {
    if (!wasmExports) return;
    currentNumber = wasmExports.power(parseFloat(currentNumber), parseFloat(exp)).toString();
    updateDisplay();
}

function reciprocal() {
    if (!wasmExports) return;
    currentNumber = wasmExports.reciprocal(parseFloat(currentNumber)).toString();
    updateDisplay();
}

function floorValue() {
    if (!wasmExports) return;
    currentNumber = wasmExports.floor_value(parseFloat(currentNumber)).toString();
    updateDisplay();
}

function ceilValue() {
    if (!wasmExports) return;
    currentNumber = wasmExports.ceil_value(parseFloat(currentNumber)).toString();
    updateDisplay();
}

function truncateValue() {
    if (!wasmExports) return;
    currentNumber = wasmExports.truncate_value(parseFloat(currentNumber)).toString();
    updateDisplay();
}