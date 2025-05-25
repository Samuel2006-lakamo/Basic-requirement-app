const MenuOptionsKeys = {
    devTools: {
        mac: "COMMAND + SHIFT + I",
        win: "CTRL + SHIFT + I",
    },
    reload: {
        mac: "COMMAND + R",
        win: "CTRL + R",
    },
    newWindow: {
        mac: "COMMAND + SHIFT + N",
        win: "CTRL + SHIFT + N",
    }
};

const userOS = (() => {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('mac')) return 'mac';
    if (platform.includes('win')) return 'win';
    return null;
})();

const keytoggle = {
    devTools: document.getElementById("KeysToggleToggleDevtools"),
    newWindow: document.getElementById("KeysToggleToggleNewWindow"),
    reload: document.getElementById("KeysToggleToggleRefresh"),
    // if reload: document.getElementById("KeysToggleToggleReload") like that
};

if (userOS) {
    for (const key in keytoggle) {
        const el = keytoggle[key];
        if (el && MenuOptionsKeys[key]) {
            el.textContent = MenuOptionsKeys[key][userOS];
        }
    }
} else {
    for (const key in keytoggle) {
        if (keytoggle[key]) {
            keytoggle[key].textContent = "Unsupported OS";
        }
    }
}

// Add event listeners for AnimationMenuOptions buttons
window.addEventListener('DOMContentLoaded', () => {
    if (!window.electronAPI) return;
    const menuAnim = document.getElementById('AnimationForMenuOptions');
    if (menuAnim) {
        menuAnim.style.transition = 'opacity 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)';
        menuAnim.style.willChange = 'opacity, transform';
    }

    const devToolsBtn = document.querySelector('#AnimationForMenuOptions li:nth-child(2) a');
    if (devToolsBtn) {
        devToolsBtn.addEventListener('click', () => {
            window.electronAPI.ipcRenderer?.send('toggle-devtools');
            if (window.electronAPI.toggleDevTools) window.electronAPI.toggleDevTools();
        });
    }
    // Open new window
    const newWindowBtn = document.querySelector('#AnimationForMenuOptions li:nth-child(3) a');
    if (newWindowBtn) {
        newWindowBtn.addEventListener('click', () => {
            window.electronAPI.createNewWindow('index.html');
        });
    }
    // Refresh
    const refreshBtn = document.querySelector('#AnimationForMenuOptions li:nth-child(4) a');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            location.reload();
        });
    }
});
