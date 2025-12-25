import { app} from "electron";
import fs from "fs";
import path from "path";


export async function storeImage(data,_) {
    try {
        const { blob, fileName } = data
        const imagesDir = path.join(app.getPath("userData"), "images");
        await fs.promises.mkdir(imagesDir, { recursive: true });

        const filePath = path.join(imagesDir, fileName);
        const buffer = Buffer.from(blob); // Uint8Array or number[]

        await fs.promises.writeFile(filePath, buffer);

        // Ensure readable on Linux
        await fs.promises.chmod(filePath, 0o644);

        return { success: true, path: filePath };
    } catch (error) {
        console.error("image/renderer: ",error);
    
    return { success: false, error: error };
    }
}