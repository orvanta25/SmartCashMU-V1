export const bgErrorRed = '\x1b[41m%s\x1b[0m'

export function dayToStartEnd(today:Date) :{startOfDay:Date,endOfDay:Date}{
    return {
        startOfDay:new Date(today.getFullYear(),today.getMonth(),today.getDate(),0,1),
        endOfDay:new Date(today.getFullYear(),today.getMonth(),today.getDate(),22,58)
    }
}