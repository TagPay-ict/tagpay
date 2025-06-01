import {z} from "zod"


export enum ETF_CHARGES {


}


export const nipTransferSchema = z.object({

    amount: z.number(),
    sortCode: z.string(),
    narration: z.string().optional(),
    accountNumber: z.string(),
    bankName: z.string().optional(),
    customerId: z.string(),
    metadata: z.object({}).optional(),

})


export const tagTransferSchema = z.object({
    amount: z.number(),
    tag: z.string(),
})

export type NipTransferType = z.infer<typeof nipTransferSchema>
export type TagTransferType = z.infer<typeof tagTransferSchema>
