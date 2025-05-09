// This script for public app electron need to be define in the all html files
// ** Make by Peakk - Mint teams **
// Sync with main process

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
  NProgress.start();

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

  const menu = document.querySelector('.menu');
  const content = document.querySelector('.content');
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize-handle';
  menu.appendChild(resizeHandle);

  let isResizing = false;
  let startX, startWidth;

  const updateWidth = (width) => {
    // Check reset
    if (window.innerWidth <= 340) {
      menu.style.width = '';
      content.style.width = '100%';
      content.style.marginLeft = '0';
      return;
    }

    // Normal width handling
    width = Math.max(170, Math.min(350, width));
    menu.style.width = `${width}px`;
    content.style.width = `calc(100vw - ${width}px)`;
    content.style.marginLeft = `${width}px`;
    localStorage.setItem('EssentialApp.Electron.sidebar-width', width);
  };

  // Reset
  const resetOnMobile = () => {
    if (window.innerWidth <= 340) {
      updateWidth(0);
    } else {
      const savedWidth = localStorage.getItem('EssentialApp.Electron.sidebar-width');
      if (savedWidth) updateWidth(parseInt(savedWidth));
    }
  };

  window.addEventListener('resize', resetOnMobile);
  resetOnMobile(); // Initial check

  // Load width
  const savedWidth = localStorage.getItem('EssentialApp.Electron.sidebar-width');
  if (savedWidth) {
    requestAnimationFrame(() => updateWidth(parseInt(savedWidth)));
  }

  const startResizing = (e) => {
    isResizing = true;
    startX = e.pageX;
    startWidth = menu.offsetWidth;

    menu.style.transition = 'none';
    content.style.transition = 'none';
    menu.style.willChange = 'width';
    content.style.willChange = 'width';
    document.body.style.cursor = 'col-resize';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    requestAnimationFrame(() => {
      const diff = e.pageX - startX;
      updateWidth(startWidth + diff);
    });
  };

  const stopResizing = () => {
    isResizing = false;
    document.body.style.cursor = '';
    menu.style.transition = '';
    content.style.transition = '';
    menu.style.willChange = 'auto';
    content.style.willChange = 'auto';

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  resizeHandle.addEventListener('mousedown', startResizing);
});

window.addEventListener("load", () => {
  NProgress.done();
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

const createWindows = {
  Aboutus: {
    AboutEssential: document.getElementById("NewWindow_AboutMint"),
  },
  Settings: {
    SettingsEssential: document.getElementById("NewWindow_Settings"),
  }
}

createWindows.Aboutus.AboutEssential.addEventListener('click', async (eventToggleNewwindows_Aboutus) => {
  eventToggleNewwindows_Aboutus.preventDefault();
  await window.electronAPI.openAboutWindow();
});

createWindows.Settings.SettingsEssential.addEventListener('click', async (eventToggleNewwindows_Settings) => {
  eventToggleNewwindows_Settings.preventDefault();
  await window.electronAPI.openSettingsWindow('settings.html');
});

// Add event listeners
document.getElementById('CurrentPage')?.addEventListener('click', currentPageHandler);
document.getElementById('GotoHomePage')?.addEventListener('click', homePageHandler);