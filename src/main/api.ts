import { AccApi } from "./api/acc"
import { AchatFournisseurApi } from "./api/achat-fournisseur"
import { AuthApi } from "./api/auth"
import { BalanceApi } from "./api/balance"
import { CategorieApi } from "./api/categorie"
import { ChargeApi } from "./api/charge"
import { ChargeTypeApi } from "./api/charge-type"
import { ClientApi } from "./api/client"
import { CommandeApi } from "./api/commande"
import { EntreeApi } from "./api/entree"
import { EntrepriseApi } from "./api/entreprise"
import { FactureApi } from "./api/facture"
import { FournisseurApi } from "./api/fournisseur"
import { ImageApi } from "./api/image"
import { InventaireApi } from "./api/inventaire"
import { IpApi } from "./api/ip"
import { MagasinApi } from "./api/magasin"
import { MyFactureApi } from "./api/my-facture"
import { PrinterApi } from "./api/printer"
import { ProduitApi } from "./api/produit"
import { MouvementStockApi } from "./api/stock-movement"
import { TicketRestoApi } from "./api/ticket-resto"
import { UserApi } from "./api/user"
import { UserManagementApi } from "./api/user-management"
import { VenteApi } from "./api/vente"
import { RetourApi } from "./api/retour";
import { ClotureJourApi } from "./api/cloture-jour";
import { RapportCaissierApi } from "./api/rapport-caissier";
import { setupVariantFamilyApi } from './api/variant-family.api';
import { setupVariantValueApi } from './api/variant-value.api';
import { setupProductVariantApi } from './api/product-variant.api';
import { registerQRRemiseHandlers } from './api/qr-remise.handlers';
import { CaisseApi } from './api/caisse.api';


export default function Api(prisma,ses){
      console.log('🔧 [API] Initialisation, prisma:', !!prisma);
      UserApi(prisma,ses)
      AuthApi(prisma,ses)
      EntrepriseApi(prisma,ses)
      CategorieApi(prisma)
      ProduitApi(prisma)
      MagasinApi(prisma)
      AccApi(prisma)
      InventaireApi(prisma)
      ChargeApi(prisma)
      ChargeTypeApi(prisma)
      FactureApi(prisma)
      AchatFournisseurApi(prisma)
      EntreeApi(prisma)
      MyFactureApi(prisma)
      BalanceApi(prisma)
      PrinterApi(prisma,ses)
      UserManagementApi(prisma,ses)
      CommandeApi(prisma,ses)
      TicketRestoApi(prisma)
      ImageApi(prisma)
      MouvementStockApi(prisma)
      VenteApi(prisma)
      FournisseurApi(prisma)
      ClientApi(prisma)
      IpApi()
      ClotureJourApi(prisma, ses);
      RapportCaissierApi(prisma, ses);
      RetourApi(prisma, ses);
      setupVariantFamilyApi(prisma);
      setupVariantValueApi(prisma);
      setupProductVariantApi(prisma);
      registerQRRemiseHandlers();
      CaisseApi(prisma);
}