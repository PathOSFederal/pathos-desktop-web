const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function logMain(message, errorValue) {
  if (errorValue) {
    console.log('[desktop-main]', message, errorValue);
    return;
  }

  console.log('[desktop-main]', message);
}

function createMainWindow() {
  logMain('creating browser window');

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
  const rendererFile = path.join(__dirname, '..', 'renderer', 'dist', 'index.html');

  nextWindow.webContents.on('did-fail-load', function (_event, errorCode, errorDescription, validatedURL) {
    logMain('did-fail-load code=' + String(errorCode) + ' desc=' + String(errorDescription) + ' url=' + String(validatedURL));
  });

  nextWindow.webContents.on('render-process-gone', function (_event, details) {
    const reason = details && details.reason ? String(details.reason) : 'unknown';
    const exitCode = details && typeof details.exitCode === 'number' ? String(details.exitCode) : 'unknown';
    logMain('render-process-gone reason=' + reason + ' exitCode=' + exitCode);
  });

  if (typeof devServerUrl === 'string' && devServerUrl.length > 0) {
    logMain('loading dev URL: ' + devServerUrl);
    nextWindow
      .loadURL(devServerUrl)
      .then(function () {
        logMain('dev URL loaded');
      })
      .catch(function (error) {
        logMain('failed to load dev URL', error);
      });
  } else if (fs.existsSync(rendererFile)) {
    logMain('dev URL missing; loading file: ' + rendererFile);
    nextWindow
      .loadFile(rendererFile)
      .then(function () {
        logMain('renderer file loaded');
      })
      .catch(function (error) {
        logMain('failed to load renderer file', error);
      });
  } else {
    logMain('dev URL missing and renderer file not found: ' + rendererFile);
  }

  nextWindow.on('ready-to-show', function () {
    logMain('window ready-to-show');
  });

  nextWindow.on('closed', function () {
    logMain('window closed');
    mainWindow = null;
  });

  mainWindow = nextWindow;
  logMain('window created');
}

app.whenReady().then(function () {
  logMain('app ready');
  createMainWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      logMain('activate: no windows, recreating');
      createMainWindow();
    }
  });
});

app.on('window-all-closed', function () {
  logMain('window-all-closed');
  if (process.platform !== 'darwin') {
    logMain('quitting app for non-darwin platform');
    app.quit();
  }
});

app.on('before-quit', function () {
  logMain('before-quit');
});
