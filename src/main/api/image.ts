import { ipcMain,app } from "electron";
import { storeImage } from "../service/image";
import path from "path";
import fs from "fs";

export function ImageApi(prisma) {
    ipcMain.handle("save-image", async (_, data) => {
        try {
            const storedImage = await storeImage(data,prisma)
            return  storedImage
        } catch (err) {
            console.error("Error saving image:", err);
            return { success: false, error: err };
        }
    });


    ipcMain.handle("get-image-base64", async (_, fileName) => {
        try {
            const filePath = path.join(app.getPath("userData"), "images", fileName);
            const buffer = await fs.promises.readFile(filePath);
            const base64 = `data:image/png;base64,${buffer.toString("base64")}`;
            return { success: true, dataUrl: base64 };
        } catch (err) {
            console.error("Error reading image:", err);
            return { success: false, error: (err as Error).message };
        }
});
}