import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { getMachineFingerprint } from './machineFingerPrint'
import crypto from 'crypto'

// ---------------------------
// CHEMINS DES FICHIERS
// ---------------------------
const LICENSE_PRIVATE = path.join(app.getPath('userData'), 'license.enc')
const LICENSE_PUBLIC = path.join(app.getPath('userData'), 'license.public.json')

// ---------------------------
// SECRET ENCRYPTION KEY
// (32 chars → AES-256)
// ---------------------------
const ENCRYPT_KEY = crypto
  .createHash('sha256')
  .update(import.meta.env.VITE_ENCRYPT_SECRET)
  .digest()

const ENCRYPT_IV = Buffer.alloc(16, 0)

// --- 2 clés dans le .env ---
const KEY_YEARLY = import.meta.env.VITE_SECRET_CODE_YEARLY
const KEY_LIFETIME = import.meta.env.VITE_SECRET_CODE_LIFETIME

// ----------------------------------------------------
// 🔐 Chiffrement AES
// ----------------------------------------------------
function encrypt(data: any): Buffer {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPT_KEY, ENCRYPT_IV)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()])
  return encrypted
}

// ----------------------------------------------------
// 🔐 Déchiffrement AES
// ----------------------------------------------------
function decrypt(buffer: Buffer) {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPT_KEY, ENCRYPT_IV)
    const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()])
    return JSON.parse(decrypted.toString('utf8'))
  } catch (e) {
    console.error('Erreur de déchiffrement licence:', e)
    return null
  }
}

// ----------------------------------------------------
// 🔥 Sauvegarde sécurisée + publique
// ----------------------------------------------------
function saveLicense(license: any) {
  // 1️⃣ PRIVATE ENCRYPTED FILE
  const enc = encrypt(license)
  fs.writeFileSync(LICENSE_PRIVATE, enc)

  // 2️⃣ PUBLIC NON-SENSIBLE FILE
  const publicData = {
    type: license.type,
    activatedAt: license.activatedAt,
    expiresAt: license.expiresAt || null
  }

  fs.writeFileSync(LICENSE_PUBLIC, JSON.stringify(publicData, null, 2), 'utf8')
}

// ----------------------------------------------------
// 🔥 Lire licence déchiffrée
// ----------------------------------------------------
function readPrivateLicense() {
  if (!fs.existsSync(LICENSE_PRIVATE)) return null

  try {
    const raw = fs.readFileSync(LICENSE_PRIVATE)
    return decrypt(raw)
  } catch (err) {
    console.log('Erreur lecture license.enc', err)
    return null
  }
}

// ----------------------------------------------------
// 🔥 Vérifier activation
// ----------------------------------------------------
export function isActivated(): boolean {
  const lic = readPrivateLicense()
  if (!lic) return false

  const currentFP = getMachineFingerprint()
  if (lic.fingerprint !== currentFP) return false

  if (lic.type === 'yearly') {
    const expires = new Date(lic.expiresAt)
    if (new Date() > expires) return false
  }

  return true
}

// ----------------------------------------------------
// 🔥 Validation code d’activation
// ----------------------------------------------------
export function validateActivationCode(input: string) {
  const fingerprint = getMachineFingerprint()

  // LICENCE À VIE
  if (input === KEY_LIFETIME) {
    const license = {
      type: 'lifetime',
      activatedAt: new Date().toISOString(),
      fingerprint
    }
    saveLicense(license)
    return { ok: true, type: 'lifetime' }
  }

  // LICENCE ANNUELLE
  if (input === KEY_YEARLY) {
    const license = {
      type: 'yearly',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      fingerprint
    }
    saveLicense(license)
    return { ok: true, type: 'yearly' }
  }

  return { ok: false, reason: 'wrong' }
}

// ----------------------------------------------------
// 🔥 Pour la top navbar → fichier public seulement
// ----------------------------------------------------
export function getLicenseInfo() {
  try {
    if (!fs.existsSync(LICENSE_PUBLIC)) return null
    return JSON.parse(fs.readFileSync(LICENSE_PUBLIC, 'utf8'))
  } catch {
    return null
  }
}
