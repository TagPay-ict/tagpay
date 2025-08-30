import { z } from "zod";

export const registrationValidationSchema = z.object({
    phoneNumber: z.string(),
})

export type EventType = "login" | "register" | "migration"

export const phoneNumberVerificationValidation = z.object({
    phoneNumber: z.string(),
    otp: z.string().length(6),
})

export const refreshTokenSchema = z.object({
    refreshToken: z.string(),
})

export const passcodeVerificationValidation = z.object({
    passcode: z.string().length(6),
    userId: z.string()
})


export type RegisterUserType = z.infer<typeof registrationValidationSchema>