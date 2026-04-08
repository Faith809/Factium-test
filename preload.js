
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  fetch: (url, options) => ipcRenderer.invoke('electron-fetch', { url, options })
});
