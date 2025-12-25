import { Request, Response } from "express";
import { JWT_SECRET } from "./jwtMiddleware";
import jwt,{ Jwt } from "jsonwebtoken";

export function AuthController(app,prisma) {
   app.post("/auth/login", async (req: Request, res: Response) => {
    try {
        const {pin}  = req.body;

        const user = await prisma.user.findFirst({
        where: { pin },
        select: {
            id: true,
            nom: true,
            prenom: true,
            role: true,
        },
        });

        if (!user) {
        return res.status(401).json({ success: false, error: "Invalid PIN" });
        }
        
        const payload = {
      userId: user.id,
      entrepriseId: user.entrepriseId,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" }); // 30 days

        return res.json({ success: true, token,user });
    } catch (err) {
        console.error("controller/auth : "+err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
    });


      app.get("/",async (req:Request,res:Response) => {
        try {
            res.json({"Hello From SmartCash":"Le serveur tourne !"})
        } catch (error) {
            console.error("error");
            
        }
      })
}