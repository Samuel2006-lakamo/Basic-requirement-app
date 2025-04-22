// Progress loaded
document.addEventListener("DOMContentLoaded", () => {
  NProgress.start();
});

// Unset if it done to load
window.addEventListener("load", () => {
  NProgress.done();
});

// Fix Always on top initialization
let isClickedAlwaysOnTop = false;

document.getElementById('KeepONtop')?.addEventListener('click', () => {
  if (window.electronAPI) {
    window.electronAPI.keepOnTop();
    isClickedAlwaysOnTop = !isClickedAlwaysOnTop;
    document.getElementById('KeepONtop').style.backgroundColor = 
      isClickedAlwaysOnTop ? 'var(--color-primary)' : 'transparent';
  }
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

// Set default new windows as bug set to featured.

// Shift+click
document.querySelectorAll('#MainLINKS .requestShiftkeyHolder').forEach(link => {
  link.addEventListener('click', (e) => {
    if ((e.shiftKey) && link.getAttribute('href') !== '#') {
      e.preventDefault();
      if (window.electronAPI) {
        window.electronAPI.createFunctionShiftkeyHolder(link.getAttribute('href'));
      }
    }
  });
});

// Ctrl+click
document.querySelectorAll('#MainLINKS a').forEach(link => {
  link.addEventListener('click', (e) => {
    if ((e.ctrlKey) && link.getAttribute('href') !== '#') {
      e.preventDefault();
      if (window.electronAPI) {
        window.electronAPI.createNewWindow(link.getAttribute('href'));
      }
    }
  });
});

// Separate handlers for CurrentPage and GotoHomePage
const currentPageHandler = e => {
  if (!e.ctrlKey && !e.shiftKey) return;
  e.preventDefault();
  const currentUrl = location.pathname.split('/').pop();
  window.electronAPI?.createNewWindow(currentUrl);
};

const homePageHandler = e => {
  if (!e.ctrlKey && !e.shiftKey) return;
  e.preventDefault();
  window.electronAPI?.createNewWindow('index.html');
};

// Add event listeners
document.getElementById('CurrentPage')?.addEventListener('click', currentPageHandler);
document.getElementById('GotoHomePage')?.addEventListener('click', homePageHandler);
