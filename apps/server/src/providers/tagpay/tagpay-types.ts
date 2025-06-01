import {z} from "zod"


export const createWalletSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
    email: z.string().email({message: "Please provide a valid email"}),
    dateOfBirth: z.string(),
    address: z.string(),
    bvn: z.string().optional(),
    nin: z.string().optional(),
    tier: z.enum(['TIER_1', 'TIER_2', 'TIER_3'])
})


export type CustomerToCustomerType = {
    fromCustomerId:string,
    toCustomerId:string,
    amount:number
}


export type WalletToWalletType = {
    fromWalletId:string;
    toWalletId:string;
    amount:number
}


export type CreateWalletType = z.infer<typeof createWalletSchema>;
