export async function getServerLink():Promise<string> {
    try {
        const link = await window.electron.ipcRenderer.invoke("/ip")
    return link
    } catch (error) {
        console.error("api /ip : ",error);
        throw "api /ip : "+error
    }
}