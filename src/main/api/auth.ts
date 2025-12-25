import {ipcMain } from "electron" 
import { firstLogin } from "../service/auth"

export function AuthApi(prisma,ses){
      // IPC test
  ipcMain.on('/auth/firstlogin', async (event,data) => {
    try {
      const user = await firstLogin(data,prisma,ses)

      event.sender.send('/auth/firstlogin',user)
    } catch (error) {
      console.error("api/auth firstLogin: ",error);
    }
  })
}