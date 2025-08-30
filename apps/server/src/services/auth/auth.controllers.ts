import { asyncHandler } from "middlewares/asyncHandler";
import { Request, Response } from "express"
import { EventType, passcodeVerificationValidation, phoneNumberVerificationValidation, refreshTokenSchema, registrationValidationSchema } from "./auth.types";
import authServices from "./auth.services";
import { HTTPSTATUS } from "config/statusCode.config";
import AuthServices from "./auth.services";



export default class AuthControllers {


    private readonly services: AuthServices

    constructor(services: AuthServices) {
        this.services = services
    }



    public registerUser = asyncHandler(async (req: Request, res: Response) => {



        const { phoneNumber } = registrationValidationSchema.parse({ ...req.body })


        await this.services.registerUser({ phoneNumber })

        res.status(200).json({
            success: true,
            message: "Verification token has been sent to your number"
        })


    })

    public loginUser = asyncHandler(async (req: Request, res: Response) => {



        const { phoneNumber } = registrationValidationSchema.parse({ ...req.body })


        await this.services.loginUser({ phoneNumber })

        res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Verification token has been sent to your number"
        })


    })


    public verifyPhoneNumberOtp = asyncHandler(async (req: Request, res: Response) => {

        const event = req.query.event as EventType

        const { otp, phoneNumber } = phoneNumberVerificationValidation.parse({ ...req.body })

        const { verified } = await this.services.verifyPhoneNumber(phoneNumber, otp);

        if (!verified) {
            return res.status(HTTPSTATUS.UNAUTHORIZED).json({
                success: false,
                message: "OTP verification failed",
            });
        }

        let tokens: { accessToken: string; refreshToken: string };

        switch (event) {
            case 'register':
                tokens = await this.services.createUser(phoneNumber);
                break;
            case 'login':
                tokens = await this.services.loginWithPhone(phoneNumber);
                break;
            case "migration":
                tokens = await this.services.migrateUser(phoneNumber);
                break
            default:
                return res.status(HTTPSTATUS.BAD_REQUEST).json({
                    success: false,
                    message: "Internal server error. Try again",
                });
        }

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Phone number verified successfully",
            data: tokens,
        });


    })

    public verifyPasscode = asyncHandler(async (req: Request, res: Response) => {

        const { passcode, userId } = req.body;

        const result = await this.services.verifyPasscode(passcode, userId);

        if (result && result.has_exceeded_attempts) {
            return res.status(HTTPSTATUS.ACCEPTED).json({
                success: false,
                message: "Maximum passcode attempts exceeded. Your account has been flagged.",
                data: {
                    number_of_attempts: result.number_of_attempts,
                    has_exceeded_attempt: result.has_exceeded_attempts,
                },
            });
        }

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Passcode verified successfully",
        });
    });


    public refreshToken = asyncHandler(async (req: Request, res: Response) => {

        const { refreshToken: token } = refreshTokenSchema.parse({ ...req.body })

        const refreshTokenHeader = req.headers['x-refresh-token'];

        console.log(refreshTokenHeader, "this is the refresh token header")
        console.log(token, "this is the refresh token from the body")


        const { accessToken, refreshToken } = await this.services.refreshToken(token);


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Retrived the access token succesfully",
            data: {
                accessToken,
                refreshToken
            }
        });
    });

    public logOut = asyncHandler(async (req: Request, res: Response) => {

        const refreshToken = req.headers['x-refresh-token'];

        await this.services.logout(refreshToken as string);

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Logout succesful",
        });

    });


    public resendOtp = asyncHandler(async (req: Request, res: Response) => {

        const { phoneNumber } = registrationValidationSchema.parse({ ...req.body })

        await this.services.resendToken(phoneNumber as string);

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Token resent succesfully",

        });
    });


    public createPasscode = asyncHandler(async (req: Request, res: Response) => {

        console.log(req.body, "this is the body form the req")

        const { passcode, userId } = passcodeVerificationValidation.parse({ ...req.body })

        await this.services.createPasscode(userId, passcode)

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Passcode Created Succesfully",
        })

    })


}

