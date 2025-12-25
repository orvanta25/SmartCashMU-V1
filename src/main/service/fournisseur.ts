import { Fournisseur } from "../model/fournisseur";

export async function addFournisseur(data:{
        entrepriseId:string,
        dto:Fournisseur
    },prisma
):Promise<Fournisseur>{
    try {
        const {entrepriseId,dto} = data

        if(!entrepriseId || !dto) throw "no data in addFournisseur"

        const {
            mails,
            fixedTel,
            mobileTel,
            denomination,
            matricule,
            secteur,
            rib,
            addresses,
        } =dto
        const addedFournisseur = await prisma.fournisseur.create({
            data:{
                mails:mails ? mails.join(","):"",
                fixedTel,
                mobileTel,
                denomination,
                matricule,
                secteur,
                rib,
                addresses:addresses ?addresses.join(","):"",
                entreprise:{
                    connect:{ id: entrepriseId }
                }
            }
        })
        return mapFournisseur(addedFournisseur)

    } catch (error) {
        console.error("service/fournisseur addFournisseur: ",error);
        throw "service/fournisseur addFournisseur: "+error
    }
}

export async function getFournisseursByParams(
    data:{
        entrepriseId:string,
        params:{denomination:string}
    },prisma
) :Promise<Fournisseur[]>{
    try {
        const {entrepriseId,params} = data

        if(!entrepriseId || !params) throw "no data in getFournisseursByParams"

        const where :any={entrepriseId:entrepriseId} 

        
        if(params.denomination)where.denomination = params.denomination

        const fournisseurs = await prisma.fournisseur.findMany({
            where:where
        })

        return fournisseurs && fournisseurs.map(fournisseur=>(
            mapFournisseur(fournisseur)
        ))
    } catch (error) {
        console.error("service/fournisseur getFournisseursByParams: ",error);
        throw "service/fournisseur getFournisseursByParams: "+error
        
    }
}



export async function updateFournisseur(data:{
        id:string,
        dto:Partial<Fournisseur>
    },prisma
):Promise<Fournisseur>{
    try {
        const {id,dto} = data

        if(!id || !dto) throw "no data in addFournisseur"

        const {
            mails,
            fixedTel,
            mobileTel,
            denomination,
            matricule,
            secteur,
            rib,
            addresses,
        } =dto

        const where :any = {}

        if(mails)where.mails = mails.join(",")
        if(addresses)where.addresses = addresses.join(",")
        if(fixedTel)where.fixedTel = fixedTel
        if(mobileTel)where.mobileTel = mobileTel
        if(matricule)where.matricule = matricule
        if(rib)where.rib = rib
        if(denomination)where.denomination = denomination
        if(secteur)where.secteur = secteur
        
        const updatedFournisseur = await prisma.fournisseur.update({
            where:{
                id:id
            },
            data:where
        })
        return mapFournisseur(updatedFournisseur)

    } catch (error) {
        console.error("service/fournisseur addFournisseur: ",error);
        throw "service/fournisseur addFournisseur: "+error
    }
}

export async function deleteFournisseur(
    data:{
        id:string
        
    },prisma
) :Promise<Fournisseur>{
    try {
        const {id} = data

        if(!id) throw "no data in deleteFournisseur"

        const deletedFournisseur = await prisma.fournisseur.delete({
            where:{
                id:id
            }
        })

        return mapFournisseur(deletedFournisseur)
        
    } catch (error) {
        console.error("service/fournisseur deleteFournisseur: ",error);
        throw "service/fournisseur deleteFournisseur: "+error
        
    }
}







const mapFournisseur = (fournisseur) =>{
    return {...fournisseur,
            mails:fournisseur.mails && fournisseur.mails.split(","),
            addresses:fournisseur.addresses && fournisseur.addresses.split(",")
        }
}