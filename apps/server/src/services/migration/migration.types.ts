import {z} from "zod"

export const AccountNumberSchema = z.object({
    accountNumber: z.string().length(10, "Account number must be 10 digits")
})

export const MigrateSchema = z.object({
    customerId: z.string()
})