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