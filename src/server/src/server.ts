import { createCaisseRoutes } from './api/caisse.routes';

import { AccController } from "../../main/controller/acc"
import { AuthController } from "../../main/controller/auth"
import session from "express-session";
import { UserController } from "../../main/controller/user";
import {ProduitController} from "../../main/controller/produit";
import {InventoryController} from "../../main/controller/inventaire";
import { StockMouvementController } from "../../main/controller/stock-mouvement";
import { AchatFournisseurController } from "../../main/controller/achat-fournisseur";
import { CommandeController } from "../../main/controller/commande";
import { ChargeController } from "../../main/controller/charge";
const cors = require("cors")
export const PORT = 5000
const serverHttp = express()


serverHttp.use(cors({
  origin: 'http://localhost:8081', 
  credentials: true
}))

serverHttp.use(express.json()) 

serverHttp.use(session({
  name: "connect.sid",
  secret: "3f8a9c2e-7b1d-4f56-9d2c-1e7a5b6c9g56",
  resave: false,
  saveUninitialized: false,
  cookie: {
      sameSite: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000,
      httpOnly: true,
    },
}));


declare module 'express-session'{
  interface SessionData {
    userId: string
  }
}

export function Server(prisma) {
  AccController(serverHttp, prisma)
  AuthController(serverHttp, prisma)
  UserController(serverHttp, prisma)
  ProduitController(serverHttp,prisma)
  InventoryController(serverHttp,prisma)
  StockMouvementController(serverHttp,prisma)
  AchatFournisseurController(serverHttp,prisma)
  CommandeController(serverHttp,prisma)
  ChargeController(serverHttp,prisma)
   serverHttp.use('/api/caisses', createCaisseRoutes(prisma));

  serverHttp.listen(PORT, () => {
    console.log("server listening on http://localhost:" + PORT)
  })
}
