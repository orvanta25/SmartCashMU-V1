import { ipcMain } from "electron";
import { getUser, updateUserProfile } from "../service/user";


export function UserApi(prisma,ses){

    ipcMain.on("/user/profile",async (event,data) =>{
      try {
        const currentUser = await getUser(data,prisma,ses)

      event.sender.send("/user/profile", JSON.parse(JSON.stringify(currentUser)))
      } catch (error) {
        console.error("api/user getUser: ");
        
      }
    })

    ipcMain.on("/user/update",async (event,_) =>{

        try {
          const currentEntreprise = await prisma.entreprise.findFirst()


        const updatedUser = await prisma.user.update(
            {
                where: {
                    id:userId,
                },
                data: {
                    entreprise: {
                        connect: {
                            id:currentEntreprise.id
                        }
    }
                },
            }
        )
      event.sender.send("/user/update", JSON.parse(JSON.stringify(updatedUser)))
        } catch (error) {
        console.error(error);
         
        }
    })

    ipcMain.on("/user/profile/update",async (event,data) => {
      try {
        const user = await updateUserProfile(data,prisma)

        event.sender.send("/user/profile/update", JSON.parse(JSON.stringify(user)))
      } catch (error) {
        console.error("api/user /user/profile/update: ",error);
        
      }
    })

}