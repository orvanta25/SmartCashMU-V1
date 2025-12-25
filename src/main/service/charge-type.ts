//main/service/charge-type.ts

import { TypeCharge } from "@prisma/client";
import { CreateChargeTypeDto, UpdateChargeTypeDto } from "../model/charge-type";

export async function createChargeType(
    data:{
        entrepriseId:string,
        dto:CreateChargeTypeDto
    },
    prisma
):Promise<TypeCharge|null> {
    try {
        const {entrepriseId,dto} = data
        
        if(!entrepriseId || !dto)return null

        const {nom} = dto

        const createdChargeType = await prisma.typeCharge.create({
            data:{
                nom:nom,
                entreprise:{
                    connect:{
                        id:entrepriseId
                    }
                }
            }
        })
        return createdChargeType
    } catch (error) {
        console.error("service/chargetype createChargeType: ",error);
        return null
    }
}

export async function updateChargeType(
    data:{
        entrepriseId:string,
        id:string,
        dto:UpdateChargeTypeDto
    },
    prisma
):Promise<TypeCharge|null> {
    try {
        const {entrepriseId,dto,id} = data
        
        if(!entrepriseId || !dto || !id)return null

        const {nom} = dto

        const updatedChargeType = await prisma.typeCharge.update({
            where:{
                id:id
            },
            data:{
                nom:nom,
            }
        })
        return updatedChargeType
    } catch (error) {
        console.error("service/chargetype updateChargeType: ",error);
        return null
    }
}

export async function getAllChargeType(
    data:{
        entrepriseId:string,
    },
    prisma
):Promise<TypeCharge|null> {
    try {
        const {entrepriseId} = data
        
        if(!entrepriseId)return null

        const chargeTypes = await prisma.typeCharge.findMany({
            where:{
                entrepriseId:entrepriseId
            }
        })
        return chargeTypes
    } catch (error) {
        console.error("service/chargetype getAllChargeType: ",error);
        return null
    }
}

export async function deleteChargeType(
    data:{
        entrepriseId:string,
        id:string
    },
    prisma
):Promise<TypeCharge|null> {
    try {
        const {entrepriseId,id} = data
        
        if(!entrepriseId  || !id)return null

        const deletedChargeType = await prisma.typeCharge.delete({
            where:{
                
                    id:id
            }
        })
        return deletedChargeType
    } catch (error) {
        console.error("service/chargetype deleteChargeType: ",error);
        return null
    }
}
