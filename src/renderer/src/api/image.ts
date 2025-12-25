export async function storeImage(e: React.ChangeEvent<HTMLInputElement>):Promise<{imageName:string,image64:any}|null>{
    try {
        const file = e.target.files?.[0];
    if (!file) return null;

    const arrayBuffer = await file.arrayBuffer();
    const blob = Array.from(new Uint8Array(arrayBuffer));
    const fileName = file.name;
    
    const newFileName = new Date().getTime()+"-"+fileName

    const result = await window.electron.ipcRenderer.invoke("save-image", { blob, fileName:newFileName });

    if (result.success) {
        console.log("Saved at:", result.path);

        // Load as base64 to display in React
        const base64Result = await window.electron.ipcRenderer.invoke("get-image-base64", newFileName);

        if (base64Result.success) return {image64:base64Result.dataUrl,imageName:newFileName}
        return {image64:null,imageName:newFileName}
    } else {
        console.error("Save failed:", result.error);
        return null
    }
    } catch (error) {
        console.error("store image: ",error);
        return null
    }
}

export async function getImage(fileName):Promise<string|null> {
    if(!fileName)return null
    try {
        const base64Result = await window.electron.ipcRenderer.invoke("get-image-base64", fileName);

        if (base64Result.success) return base64Result.dataUrl
        return null
    } catch (error) {
        console.error("get image: ",error);
        return null
    }
}
