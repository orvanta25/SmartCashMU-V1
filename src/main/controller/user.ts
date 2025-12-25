import { Request, Response } from "express";
import { getUser } from "../service/user";
import { authenticateJWT } from "./jwtMiddleware";

export function UserController(app,prisma){
    app.get("/user/profile",authenticateJWT, async (req:Request,res:Response) => {
        try {
          const id = req.user?.userId
          console.log("user/profile: ",id)
            if(!id)return res.status(404).json({error:"User not authentified"})

     const currentUser = await prisma.user.findFirst(
              {
                where:{
                  id:id
                },
                include:{
                  entreprise:{select:{
                    id: true,
                    nom: true,
                    email: true,
                    telephone: true,
                    denomination: true,
                    matriculeFiscale: true,
                    secteurActivite: true,
                    region: true,
                    ville: true,
                    pays: true,
                    hasRestaurantModule: true,
                    hasEpicerieModule: true,
                    type: true,
                    createdAt: true,
                    updatedAt: true,
                  }}
                }
              }  
            )
    return res.status(200).json({...currentUser})
   
        } catch (error) {
            console.error("controller/user /user/profile : ",error);
            return res.status(500).json({error:"Internal server error: "+error})
        }
    })
}
