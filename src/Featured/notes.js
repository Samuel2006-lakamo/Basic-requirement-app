const notesEl = document.getElementById('NotesContent');
const placeholderHTML = '<span style="filter: brightness(80%);">Start write note here</span>';

function loadNotesData() {
    localStorage.removeItem('notes_content');
    const saved = localStorage.getItem('notes_content_html');
    notesEl.innerHTML = saved && saved.trim() ? saved : placeholderHTML;
}

function setNotesFontSize(size) {
    notesEl.style.fontSize = `${size}em`;
    localStorage.setItem('notes_content_fontsize', size);
    notesFontSize = size;
}

let notesFontSize = parseFloat(localStorage.getItem('notes_content_fontsize')) || 1.1;
setNotesFontSize(notesFontSize);

function applyFontSizeShortcut(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        setNotesFontSize(Math.min(notesFontSize + 0.1, 5));
        e.preventDefault();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        setNotesFontSize(Math.max(notesFontSize - 0.1, 0.5));
        e.preventDefault();
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
    if (raw === 'Start write note here') {
        localStorage.removeItem('notes_content_html');
    } else {
        localStorage.setItem('notes_content_html', notesEl.innerHTML);
    }
}

function handlePasteClean(e) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') || '';
    const span = document.createElement('span');
    span.style.fontSize = `${notesFontSize}em`;
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
notesEl.addEventListener('keydown', handleEnterPreserveStyle);
notesEl.addEventListener('input', saveNotesContent);
notesEl.addEventListener('paste', handlePasteClean);
document.getElementById('HandleAdjustFontsWeight').addEventListener('click', () => wrapSelectionWithStyle('bold'));
document.getElementById('HandleAdjustItalicStyle').addEventListener('click', () => wrapSelectionWithStyle('italic'));

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', loadNotesData)
    : loadNotesData();