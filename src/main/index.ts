import { app, shell, BrowserWindow, session, ipcMain } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import * as path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { ensureProvisionalLicense, isActivated, validateActivationCode } from './utils/activation'
import Api from './api'
import { RetourApi } from "./api/retour";
import dotenv from 'dotenv'
import { Server } from './server'
dotenv.config()

let PrismaClient: any
let databaseFile: string

// ---------------------------
// Resolve icon path
// ---------------------------
const getIcon = () => {
  if (is.dev) {
    return path.join(__dirname, '../../resources/icon.ico')
  }
  return path.join(process.resourcesPath, 'icon.ico') // <-- production path
}

// ---------------------------
// Prisma setup
// ---------------------------
if (app.isPackaged) {
  const packagedDb = path.join(process.resourcesPath, 'prisma', 'dev.db')
  const userDataPath = app.getPath('userData')
  databaseFile = path.join(userDataPath, 'dev.db')

  if (!fs.existsSync(databaseFile)) {
    fs.mkdirSync(userDataPath, { recursive: true })
    fs.copyFileSync(packagedDb, databaseFile)
    console.log(`Copied database to writable path: ${databaseFile}`)
  }

  PrismaClient = require(
    path.join(process.resourcesPath, 'node_modules', '.prisma', 'client')
  ).PrismaClient
} else {
  databaseFile = path.join(__dirname, '../../prisma/dev.db')
  PrismaClient = require('../../node_modules/.prisma/client').PrismaClient
}

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${databaseFile}` } }
})

// ---------------------------
// Create main window
// ---------------------------
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 770,
    show: false,
    autoHideMenuBar: true,
    icon: getIcon(), // <-- FIXED HERE
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'm') {
      event.preventDefault()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ---------------------------
// Create activation window
// ---------------------------
function createActivationWindow(): BrowserWindow {
  const activationWindow = new BrowserWindow({
    width: 600,
    height: 300,
    show: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    autoHideMenuBar: true,
    icon: getIcon(), // <-- FIXED HERE ALSO
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  activationWindow.once('ready-to-show', () => activationWindow.show())

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    activationWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/activation.html')
  } else {
    activationWindow.loadFile(join(__dirname, '../renderer/activation.html'))
  }

  return activationWindow
}

// ---------------------------
// App ready
// ---------------------------
app.whenReady().then(async () => {
   const imagesDir = path.join(app.getPath('userData'), 'images')
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
    console.log(`Dossier créé : ${imagesDir}`)
  } else {
    console.log(`Dossier déjà existant : ${imagesDir}`)
  }
  electronApp.setAppUserModelId('SmartCash')
  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))

  const ses = session.fromPartition('persist:id')
  Server(prisma)
  Api(prisma, ses)
  RetourApi(prisma); 

  console.log("✅ [MAIN] API initialisées");
  //ensureProvisionalLicense()

  let activationWindow: BrowserWindow | null = null

  ipcMain.handle('activation:submit', async (_, code: string) => {
    const result = validateActivationCode(code)
    if (!result.ok && !result.reason) {
      result.reason = 'error'
    }
    return result
  })
  // ---------------------------
  // Fournir les infos de licence au renderer
  // ---------------------------
  ipcMain.removeHandler('activation:get-license-info')

  ipcMain.handle('activation:get-license-info', () => {
    const LICENSE_FILE = path.join(app.getPath('userData'), 'license.public.json')

    if (!fs.existsSync(LICENSE_FILE)) {
      console.warn('Licence non trouvée')
      return null
    }

    try {
      const data = JSON.parse(fs.readFileSync(LICENSE_FILE, 'utf-8'))

      return {
        type: data.type,
        activatedAt: data.activatedAt,
        expiresAt: data.expiresAt || null
      }
    } catch (err) {
      console.error('Erreur lecture JSON licence :', err)
      return null
    }
  })

  ipcMain.on('activation:hide-and-open', () => {
    if (activationWindow) {
      activationWindow.close()
      activationWindow = null
    }
    createWindow()
  })

  ipcMain.on('activation:quit', () => {
    app.quit()
  })

  if (isActivated()) {
    createWindow()
  } else {
    activationWindow = createActivationWindow()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (isActivated()) createWindow()
      else createActivationWindow()
    }
  })
})

// ---------------------------
// Quit app
// ---------------------------
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
