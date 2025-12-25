import { Client } from "../model/client";

export async function createClient(
    data:{
        entrepriseId:string,
        dto:Omit<Client,"id"|"createdAt"|"updatedAt">
    },
    prisma
) {
    try {
        const {entrepriseId,dto} = data

        if(!entrepriseId || !dto)throw "Recieved Emty data in createClient"

        const {
            nom ,
            prenom ,
            email ,
            cin,
            tel ,
            address ,
            credit 
        } =dto

        const createdClient = await prisma.client.create({
            data:{
                nom,
                prenom ,
                email ,
                cin : cin?cin:"",
                tel ,
                address:address?address:"" ,
                credit:credit?credit:0,
                entreprise:{
                    connect:{
                        id:entrepriseId
                    }
                }
            }
        })
        return createdClient
    } catch (error) {
        console.error("service/client createClient: ",error);
        throw "service/client createClient: "+error
    }
}

export async function getClientsByParams(
    data:{
        entrepriseId:string,
        params:{
            search:string|number
        }
    },
    prisma
) {
    try {
        const {entrepriseId,params} = data

        if(!entrepriseId || !params)throw "Recieved Empty data in getClientsByParams"

        const {
            search
        } =params

        const where :any = {entrepriseId:entrepriseId}
        const searchType = Number(search) 

        if(!searchType){
            where.prenom = {contains:search}
        }else if(searchType){
            where.cin = searchType
        }

        const clients = await prisma.client.findMany({
            where:where
        })

        return clients

    } catch (error) {
        console.error("service/client getClientsByParams: ",error);
        throw "service/client getClientsByParams: "+error
    }
}

export async function updateClient(
    data:{
        id:string,
        dto:Omit<Client,"id"|"createdAt"|"updatedAt">
    },
    prisma
) {
    try {
        const {id,dto} = data

        if(!id || !dto)throw "Recieved Emty data in updateClient"

        const {
            nom ,
            prenom ,
            email ,
            cin,
            tel ,
            address ,
            credit 
        } =dto

        const updatedClient = await prisma.client.update({
            where:{
                id:id
            },
            data:{
                nom:nom?nom:"",
                prenom:prenom?prenom:"",
                email:email?email:"" ,
                cin : cin?cin:0,
                tel:tel?tel:"" ,
                address:address?address:"" ,
                credit:credit?credit:0,
            }
        })
        return updatedClient
    } catch (error) {
        console.error("service/client updeateClient: ",error);
        throw "service/client updateClient: "+error
    }
}

export async function deleteClient(
    data:{
        id:string
    },prisma
) :Promise<Client>{
    try {
        const {id} = data

        if(!id) throw "no data in deleteClient"

        const deletedClient = await prisma.client.delete({
            where:{
                id:id
            }
        })

        return deletedClient
        
    } catch (error) {
        console.error("service/client deleteClient: ",error);
        throw "service/client deleteClient: "+error
        
    }
}