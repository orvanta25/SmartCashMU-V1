import express from "express"
import { AccController } from "./controller/acc"
import { AuthController } from "./controller/auth"
import session from "express-session";
import { UserController } from "./controller/user";
import {ProduitController} from "./controller/produit";
import {InventoryController} from "./controller/inventaire";
import { StockMouvementController } from "./controller/stock-mouvement";
import { AchatFournisseurController } from "./controller/achat-fournisseur";
import { CommandeController } from "./controller/commande";
import { ChargeController } from "./controller/charge";
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
  secret: "TON_SECRET",
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
  
  serverHttp.listen(PORT, () => {
    console.log("server listening on http://localhost:" + PORT)
  })
}
