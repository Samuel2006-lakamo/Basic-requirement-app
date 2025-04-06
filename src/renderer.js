const { ipcRenderer } = require('electron');
const draggable = document.getElementById('draggable');

draggable.addEventListener('dragstart', (event) => {
    const dragImage = document.createElement('img');
    dragImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgMBAp9lX2sAAAAASUVORK5CYII=';
    dragImage.style.visibility = 'hidden';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    const bounds = event.target.getBoundingClientRect();
    event.dataTransfer.setData('application/json', JSON.stringify({
        offsetX: event.clientX - bounds.left,
        offsetY: event.clientY - bounds.top,
    }));

    setTimeout(() => document.body.removeChild(dragImage), 0);
});

window.addEventListener('dragend', (event) => {
    const screenX = event.screenX;
    const screenY = event.screenY;

    ipcRenderer.send('create-new-window', { x: screenX, y: screenY });
});

document.getElementById('KeepONtop').addEventListener('click', () => {
    ipcRenderer.send('Keepontop', 'Hello from the button!');
});