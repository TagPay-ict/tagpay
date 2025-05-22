import {z} from "zod"


export enum ETF_CHARGES {


}


export const nipTransferSchema = z.object({

    amount: z.number(),
    sortCode: z.string(),
    narration: z.string(),
    accountNumber: z.string(),
    bankName: z.string().optional(),
    customerId: z.string(),
    metadata: z.object({}).optional(),

})

export type NipTransferType = z.infer<typeof nipTransferSchema>