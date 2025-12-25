import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
// Augmenter la limite des listeners pour éviter le warning MaxListenersExceeded
ipcRenderer.setMaxListeners(50);

// Custom APIs for renderer
const api = {}

// Expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      ipc: {
        invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
        send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
        on: (channel: string, listener: (...args: any[]) => void) =>
          ipcRenderer.on(channel, listener)
      }
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = {
    ...electronAPI,
    ipc: {
      invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
      send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
      on: (channel: string, listener: (...args: any[]) => void) => ipcRenderer.on(channel, listener)
    }
  }
  // @ts-ignore
  window.api = api
}
