import { asyncHandler } from "middlewares/asyncHandler"
import { Request, Response } from "express"
import { z } from "zod"
import userServices from "services/user/user.services"
import { setup } from "db/schema/setup.model"
import db from "db/connectDb"
import { HTTPSTATUS } from "config/statusCode.config"
import { user } from "db/schema/user.model"
import { eq, exists } from "drizzle-orm"
import { BadRequestException, InternalServerException, NotFoundException } from "utils/error"
import { ErrorCode } from "enum/errorCode.enum"
import verificationServices from "services/verification/verification.services"
import { PasswordUtils } from "utils/passwordUtils"
import { sendOtp } from "utils/sendOtp"
import cache from "config/node-cache"
import { systemLogger } from "utils/logger"
import { CreateAccountQueueType, TagPay_CreateAccountQueue } from "queue/queue-list"
import { QueueRegistry } from "queue/queue-registry"

const emailSchema = z.object({
    email: z.string().email()
})

const bvnSchema = z.object({
    bvn: z.string().length(11, "BVN must be 11 digits")
})

const usernameSchema = z.object({
    tag: z
        .string()
        .min(0, "Tag must be at least 3 characters")
        .max(20, "Tag must be at most 20 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Tag must contain only letters and numbers"),
});

const verifyBvnWithPhone = z.object({
    code: z.string()
})

const addAddressSchema = z.object({
    street: z.string().min(3, "Street name must be at least 3 characters"),
    city: z.string().min(1, "City name must be at least 3 characters"),
    state: z.string(),
    postalCode: z.string()
})


class OnboardingController {

    public addEmail = asyncHandler(async (req: Request, res: Response) => {


        const { email } = emailSchema.parse({ ...req.body })
        const userId = req.user.id

        const existingEmail = await db.query.user.findFirst({
            where: eq(user.email, email)
        })

        if (existingEmail) {
            throw new BadRequestException('Email already in use', ErrorCode.BAD_REQUEST)
        }

        await userServices.updateUser({ email }, userId)


        await db.update(setup).set({ is_email_verified: true })
        // await db.transaction(async (tx) => {
        // })


        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Email verified Successfully"
        })


    })


    public addBvn = asyncHandler(async (req: Request, res: Response) => {


        const { bvn } = bvnSchema.parse({ ...req.body })
        const userId = req.user.id

        const userBvnData = await verificationServices.verifyUserBvn(bvn)


        const hashedBvn = PasswordUtils.encryptCryptr(bvn)


        const payload: Partial<Record<keyof typeof user.$inferInsert, any>> = {
            first_name: userBvnData.data.entity?.first_name,
            last_name: userBvnData.data.entity?.last_name,
            gender: userBvnData.data.entity?.gender?.toLocaleLowerCase(),
            middle_name: userBvnData.data.entity?.middle_name,
            bvn_phone_number: userBvnData.data.entity?.phone_number1,
            state_of_origin: userBvnData.data.entity?.state_of_origin,
            date_of_birth: userBvnData.data.entity?.date_of_birth,
            bvn: hashedBvn,
            kyc_tier: 1
        }



        await userServices.updateUser(payload, userId)

        const userRecord = await userServices.getUser(userId)

        await sendOtp(payload.bvn_phone_number)

        await db.transaction(async (tx) => {
            tx.update(setup).set({ is_bvn_provided: true })
        })


        const createAccountQueuePayload: CreateAccountQueueType = {
            firstName: userRecord.user.first_name as string,
            lastName: userRecord.user.last_name as string,
            dateOfBirth: userRecord.user.date_of_birth as string,
            bvn: bvn,
            email: userRecord.user.email as string,
            phoneNumber: userRecord.user.phone_number as string,
            tier: "TIER_1",
            userId,
            address: (userRecord.user.address as { street: string })?.street
        }

        await TagPay_CreateAccountQueue.add(QueueRegistry.create_tagpay_account, createAccountQueuePayload)



        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Bvn added successfully",
            data: {
                bvnPhoneNumber: payload.bvn_phone_number
            }
        })


    })



    public verifyIdentityWithBvnPhoneNumber = asyncHandler(async (req: Request, res: Response) => {


        const { code } = verifyBvnWithPhone.parse({ ...req.body })
        const userId = req.user.id

        const userRecord = await userServices.getUser(userId)

        const phoneNumber = userRecord.user.bvn_phone_number as string

        const value = cache.take(phoneNumber);

        if (!value || value !== code) {
            systemLogger.error(`Invalid or expired OTP for ${phoneNumber}`);
            throw new BadRequestException("Invalid or Expired OTP", ErrorCode.AUTH_INVALID_TOKEN);
        }


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "BVN verified successfully with phone",
        });


    })


    public addAddress = asyncHandler(async (req: Request, res: Response) => {

        const { street, city, state, postalCode } = addAddressSchema.parse({ ...req.body })
        const userId = req.user.id

        await userServices.updateUser({ address: { street, city, state, postalCode } }, userId)
        await db.update(setup).set({ is_address_provided: true }).where(eq(setup.user_id, userId)).execute()


        return res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Address added successfully"
        })


    })



    public checkTagExist = asyncHandler(async (req: Request, res: Response) => {
        const parseResult = usernameSchema.safeParse(req.query);

        if (!parseResult.success) {
            return res.status(400).json({ error: "Invalid or missing username" });
        }

        const { tag } = parseResult.data;

        const reservedNames = ["gabs", "invest"];

        const usernameQuery = db
            .select()
            .from(user)
            .where(eq(user.tag, tag));

        const [usernameExist] = await db
            .select({ exists: exists(usernameQuery) }).from(user).execute()

        const existsInDb = usernameExist?.exists ?? false;
        const isReserved = reservedNames.includes(tag.toLowerCase());

        return res.status(200).json({ exists: existsInDb || isReserved });
    });



    public createTag = asyncHandler(async (req: Request, res: Response) => {


        const { tag } = usernameSchema.parse({ ...req.body });
        const userRecord = req.user


        console.log("thi is running for the create tag")

        try {

            if (!tag) {
                return res.status(400).json({ success: false, message: "Invalid or missing username" });
            }

            await db.transaction(async (tx) => {
                await tx.update(user).set({ tag: tag }).where(eq(user.id, userRecord.id))
                await tx.update(setup).set({ is_tag_created: true }).where(eq(setup.user_id, userRecord.id))

            })


            res.status(HTTPSTATUS.ACCEPTED).json({
                success: true,
                message: "Tag Created Successfull"
            })

        } catch (error) {
            throw new InternalServerException("Failed to create tag")
        }




    });


    public completeUserOnboarding = asyncHandler(async(req:Request, res:Response) => {

        const userId = req.user.id

        await userServices.updateUser({has_onboarded: true}, userId)


        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Onboarding completed successfully"
        })

    })

}


const onboardingControllers = new OnboardingController()
export default onboardingControllers