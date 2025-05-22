import {z} from "zod"

export const airtimeSchema = z.object({
    phoneNumber: z.string().max(11),
    provider: z.enum(["MTN", "AIRTEL", "9MOBILE", "GLO"]),
    amount: z.number(),
    customerPhone: z.string().optional(),
})


export type AirtimeType = z.infer<typeof airtimeSchema>