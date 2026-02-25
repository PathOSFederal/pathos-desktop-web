const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('pathosDesktop', {
  ready: true,
});
