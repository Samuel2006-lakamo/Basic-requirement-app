// const notesEl = document.getElementById('NotesContent');
let notesEl = document.getElementById('NotesContent');
const placeholderHTML = '<span style="filter: brightness(80%);">Start write note here</span>';
let tabCounter = 1; // Ex. New Tab 2 => New Tab 3 like that

function loadNotesData() {
    localStorage.removeItem('notes_content');
    const saved = localStorage.getItem('notes_content_html');
    // notesEl.innerHTML = saved && saved.trim() ? saved : placeholderHTML;
    if (notesEl) {
        notesEl.innerHTML = saved && saved.trim() ? saved : placeholderHTML;
    } else {
        console.warn("NotesContent element not found during loadNotesData");
    }
}

function setNotesFontSize(size) {
    // notesEl.style.fontSize = `${size}em`;
    // localStorage.setItem('notes_content_fontsize', size);
    if (notesEl) {
        notesEl.style.fontSize = `${size}em`;
        localStorage.setItem('notes_content_fontsize', size);
    } else {
        console.warn("NotesContent element not found during setNotesFontSize");
    }
    notesFontSize = size;
}

let notesFontSize = parseFloat(localStorage.getItem('notes_content_fontsize')) || 1.1;
setNotesFontSize(notesFontSize);

function applyFontZoomWithWheel(e) {
    let zoomStep = 0.1;
    let minFont = 0.5;
    let maxFont = 5;

    // Keyboard shortcut
    if (e.type === 'keydown') {
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
            setNotesFontSize(Math.min(notesFontSize + zoomStep, maxFont));
            e.preventDefault();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
            setNotesFontSize(Math.max(notesFontSize - zoomStep, minFont));
            e.preventDefault();
        }
    }

    // Mouse wheel
    if (e.type === 'wheel' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); // ป้องกัน browser zoom
        if (e.deltaY < 0) {
            setNotesFontSize(Math.min(notesFontSize + zoomStep, maxFont));
        } else if (e.deltaY > 0) {
            setNotesFontSize(Math.max(notesFontSize - zoomStep, minFont));
        }
    }
}

function wrapSelectionWithStyle(cmd) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    if (!notesEl.contains(range.commonAncestorContainer) || range.collapsed) return;

    let container = range.commonAncestorContainer.nodeType === 3
        ? range.commonAncestorContainer.parentNode
        : range.commonAncestorContainer;

    const isBold = cmd === 'bold';
    const isItalic = cmd === 'italic';

    const alreadyStyled = container.nodeName === 'SPAN' && (
        (isBold && container.style.fontWeight === 'bold') ||
        (isItalic && container.style.fontStyle === 'italic')
    );

    if (alreadyStyled) {
        container.replaceWith(document.createTextNode(container.textContent));
    } else {
        const span = document.createElement('span');
        if (isBold) span.style.fontWeight = 'bold';
        if (isItalic) span.style.fontStyle = 'italic';
        span.textContent = range.toString();

        range.deleteContents();
        range.insertNode(span);

        const newRange = document.createRange();
        newRange.setStartAfter(span);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
    }

    notesEl.dispatchEvent(new Event('input'));
}

function handleEnterPreserveStyle(e) {
    if (e.key !== 'Enter') return;

    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    let container = range.startContainer;
    if (container.nodeType === 3) container = container.parentNode;

    if (container.nodeName !== 'SPAN') return;

    setTimeout(() => {
        let newNode = sel.anchorNode;
        if (newNode?.nodeType === 3) newNode = newNode.parentNode;
        if (newNode?.nodeName === 'DIV') {
            const span = document.createElement('span');
            span.style.fontWeight = container.style.fontWeight;
            span.style.fontStyle = container.style.fontStyle;
            span.style.fontFamily = 'Anuphan, "Leelawadee UI", var(--font-primary), sans-serif';
            span.textContent = '\u200B'; // zero-width space
            newNode.appendChild(span);

            const newRange = document.createRange();
            newRange.setStart(span, 1);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }
    }, 0);
}

function saveNotesContent() {
    const raw = notesEl.textContent.trim();
    if (raw === 'Start write note here' || raw === '') {
        localStorage.removeItem('notes_content_html');
    } else {
        localStorage.setItem('notes_content_html', notesEl.innerHTML);
    }
}

function createNewNotesArea() {
    const oldWrapper = document.getElementById('NotesContentWrapper');
    if (!oldWrapper) {
        console.error('Old NotesContentWrapper not found!');
        return;
    }
    const parent = oldWrapper.parentNode;
    if (!parent) {
        console.error('Parent of NotesContentWrapper not found!');
        return;
    }

    // Create new wrapper
    const newWrapper = document.createElement('div');
    newWrapper.id = 'NotesContentWrapper';
    newWrapper.style.width = '100%';
    newWrapper.style.height = 'calc(100vh - 40px)';

    // Create new content area
    const newNotesContent = document.createElement('div');
    newNotesContent.style.cssText = `
        width: 100%;
        height: 100%;
        resize: vertical;
        border-radius: 10px;
        box-sizing: border-box;
        overflow: auto;
        background: transparent;
        outline: none;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    `;
    newNotesContent.id = 'NotesContent';
    newNotesContent.contentEditable = 'true';
    newNotesContent.spellcheck = true;

    newWrapper.appendChild(newNotesContent);

    parent.replaceChild(newWrapper, oldWrapper);

    notesEl = document.getElementById('NotesContent'); // Update global notesEl reference

    if (notesEl) {
        notesEl.innerHTML = placeholderHTML;
        setNotesFontSize(notesFontSize); // Apply current/default font size

        // Re-attach event listeners
        notesEl.addEventListener('keydown', handleEnterPreserveStyle);
        notesEl.addEventListener('input', saveNotesContent);
        notesEl.addEventListener('paste', handlePasteClean);

        const tabNameInput = document.querySelector('.OutputTabbar .TabsName input');
        if (tabNameInput) {
            tabNameInput.value = "New Tab";
        }
        notesEl.dispatchEvent(new Event('input')); // Trigger save to clear old storage if placeholder
    } else {
        return;
    }

    function DisplayOtherTabsTitle(index = null) {
        if (index === null) {
            tabCounter++;
            index = tabCounter;
        }

        const tabName = index === 1 ? "New Tab 2" : `New Tab ${index}`;

        return `
                <div class="CurrentTabs" data-tab-index="${index}">
                    <div class="TabsName">
                        <input type="text" value="${tabName}" placeholder="Enter your tab name">
                    </div>
                </div>
        `;
    }
    const output = document.getElementById('Othertabs');
    output.innerHTML += DisplayOtherTabsTitle();
}

function handlePasteClean(e) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') || '';
    const span = document.createElement('span');
    span.textContent = text;

    const sel = window.getSelection();
    if (sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(span);

        range.setStartAfter(span);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    notesEl.dispatchEvent(new Event('input'));
}

document.addEventListener('keydown', applyFontSizeShortcut);
if (notesEl) {
    notesEl.addEventListener('keydown', handleEnterPreserveStyle);
    notesEl.addEventListener('input', saveNotesContent);
    notesEl.addEventListener('paste', handlePasteClean);
}
document.getElementById('HandleAdjustFontsWeight').addEventListener('click', () => wrapSelectionWithStyle('bold'));
document.getElementById('HandleAdjustItalicStyle').addEventListener('click', () => wrapSelectionWithStyle('italic'));

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', loadNotesData)
    : loadNotesData();

const newTabButton = document.getElementById('NewTabButtons');
if (newTabButton) {
    newTabButton.addEventListener('click', createNewNotesArea);
}

document.addEventListener('keydown', applyFontZoomWithWheel);
document.addEventListener('wheel', applyFontZoomWithWheel, { passive: false });