import { ipcMain } from "electron";
import os from "os";
const PORT = 3000; 
export function IpApi() {
  ipcMain.handle("/ip", async () => {
    const nets = os.networkInterfaces();
    let localIp = "127.0.0.1";

    // Cherche l'adresse IPv4 locale
    for (const name of Object.keys(nets)) {
      const netInfo = nets[name];
      if (!netInfo) continue;

      for (const net of netInfo) {
        if (net.family === "IPv4" && !net.internal) {
          localIp = net.address;
          break;
        }
      }
    }

    return `http://${localIp}:${PORT}`; // ← utilise maintenant la constante importée
  });
}
