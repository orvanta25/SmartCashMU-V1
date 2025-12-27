import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

ipcRenderer.setMaxListeners(50);

const api = {}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      ipc: {
        invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
        send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
        on: (channel: string, listener: (...args: any[]) => void) =>
          ipcRenderer.on(channel, listener)
      },
      // ✅ AJOUTEZ L'API CAISSE ICI
      caisse: {
        getAll: () => ipcRenderer.invoke('caisse:getAll'),
        getById: (id: string) => ipcRenderer.invoke('caisse:getById', id),
        create: (data: any) => ipcRenderer.invoke('caisse:create', data),
        update: (id: string, data: any) => ipcRenderer.invoke('caisse:update', { id, data }),
        delete: (id: string) => ipcRenderer.invoke('caisse:delete', id),
        test: (id: string) => ipcRenderer.invoke('caisse:test', id),
        setCentral: (id: string) => ipcRenderer.invoke('caisse:setCentral', id),
        removeCentral: () => ipcRenderer.invoke('caisse:removeCentral')
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
    },
    caisse: {
      getAll: () => ipcRenderer.invoke('caisse:getAll'),
      getById: (id: string) => ipcRenderer.invoke('caisse:getById', id),
      create: (data: any) => ipcRenderer.invoke('caisse:create', data),
      update: (id: string, data: any) => ipcRenderer.invoke('caisse:update', { id, data }),
      delete: (id: string) => ipcRenderer.invoke('caisse:delete', id),
      test: (id: string) => ipcRenderer.invoke('caisse:test', id),
      setCentral: (id: string) => ipcRenderer.invoke('caisse:setCentral', id),
      removeCentral: () => ipcRenderer.invoke('caisse:removeCentral')
    }
  }
  // @ts-ignore
  window.api = api
}