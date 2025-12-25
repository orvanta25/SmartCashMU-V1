import { execSync } from 'child_process'
import * as crypto from 'crypto'
import * as os from 'os'

export function getMachineFingerprint(): string {
  const components: string[] = []

  try {
    if (os.platform() === 'win32') {
      // CPU ID
      try {
        const cpuId = execSync('wmic cpu get processorid').toString()
        const match = cpuId.match(/ProcessorId\s+(\S+)/)
        if (match) components.push(match[1])
      } catch (e) {
        console.warn('Cannot get CPU ID:', e)
      }

      // Motherboard Serial
      try {
        const motherboard = execSync('wmic baseboard get serialnumber').toString()
        const match = motherboard.match(/SerialNumber\s+(\S+)/)
        if (match && match[1] !== 'None') components.push(match[1])
      } catch (e) {
        console.warn('Cannot get motherboard ID:', e)
      }

      // Disk Serial
      try {
        const disk = execSync('wmic diskdrive get serialnumber').toString()
        const match = disk.match(/SerialNumber\s+(\S+)/)
        if (match && match[1] !== 'None') components.push(match[1])
      } catch (e) {
        console.warn('Cannot get disk serial:', e)
      }
    } else {
      // Linux / macOS
      try {
        const cpuInfo = execSync(
          'cat /proc/cpuinfo 2>/dev/null | grep -i serial || echo ""'
        ).toString()
        if (cpuInfo) components.push(cpuInfo.trim())
      } catch (e) {
        console.warn('Cannot get CPU info:', e)
      }

      try {
        const hostId = execSync('hostid 2>/dev/null || echo ""').toString()
        if (hostId) components.push(hostId.trim())
      } catch (e) {
        console.warn('Cannot get host ID:', e)
      }
    }

    // Fallback: utiliser des informations système de base
    if (components.length === 0) {
      components.push(os.hostname())
      components.push(os.arch())
      components.push(os.platform())
    }
  } catch (err) {
    console.error('Erreur récupération hardware ID:', err)
    // Fallback minimal
    components.push(os.hostname())
    components.push(os.arch())
  }

  const fingerprintRaw = components.filter(Boolean).join('-')
  return crypto.createHash('sha256').update(fingerprintRaw).digest('hex')
}
