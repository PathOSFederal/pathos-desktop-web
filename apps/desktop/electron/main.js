const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;

function createMainWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  const nextWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: 'PathOS Desktop',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (typeof devServerUrl === 'string' && devServerUrl.length > 0) {
    nextWindow.loadURL(devServerUrl);
  } else {
    const rendererFile = path.join(__dirname, '..', 'renderer', 'dist', 'index.html');
    nextWindow.loadFile(rendererFile);
  }

  nextWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow = nextWindow;
}

app.whenReady().then(function () {
  createMainWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
