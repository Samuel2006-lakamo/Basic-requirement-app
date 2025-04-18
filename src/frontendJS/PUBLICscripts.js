// Initilaze Toggle always on top

let isClickedAlwaysOnTop = false;
isClickedAlwaysOnTop = !isClickedAlwaysOnTop;

document.getElementById('KeepONtop').addEventListener('click', () => {
  if (isClickedAlwaysOnTop) {
    document.getElementById('KeepONtop').style.backgroundColor = 'var(--color-primary)';
  } else {
    document.getElementById('KeepONtop').style.backgroundColor = 'transparent';
  }
  isClickedAlwaysOnTop = !isClickedAlwaysOnTop;
});

// Rightclick ipc send to main process

document.addEventListener('DOMContentLoaded', () => {
  if (window.electronAPI) {
    // For error heading
    document.addEventListener('contextmenu', async (e) => {
      e.preventDefault();
      try {
        await window.electronAPI.showContextMenu({ x: e.x, y: e.y });
      } catch (err) {
        console.error('Context menu error:', err);
      }
    });
    // Links to href
    window.electronAPI.onNavigate((url) => {
      window.location.href = url;
    });
  } else {
    console.error('API Not Available');
  }
});