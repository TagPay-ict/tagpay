import { asyncHandler } from "middlewares/asyncHandler";
import {Request, Response} from "express"
import { EventType, passcodeVerificationValidation, phoneNumberVerificationValidation, refreshTokenSchema, registrationValidationSchema } from "./auth.types";
import authServices from "./auth.services";
import { HTTPSTATUS } from "config/statusCode.config";



class  AuthController {


    public  registerUser = asyncHandler(async(req:Request, res:Response) => {


        console.log("hoooooooooooooola")

        const {phoneNumber} = registrationValidationSchema.parse({...req.body})


        await authServices.registerUser({phoneNumber})

        res.status(200).json({
            success: true,
            message: "Verification token has been sent to your number"
        })


    })

    public  loginUser = asyncHandler(async(req:Request, res:Response) => {


        console.log("hoooooooooooooola")

        const {phoneNumber} = registrationValidationSchema.parse({...req.body})


        await authServices.loginUser({phoneNumber})

        res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Verification token has been sent to your number"
        })


    })


    public verifyPhoneNumberOtp = asyncHandler(async (req: Request, res: Response) => {

        const event  = req.query.event as EventType

        const { otp, phoneNumber } = phoneNumberVerificationValidation.parse({ ...req.body })

        const { verified } = await authServices.verifyPhoneNumber(phoneNumber, otp);

        if (!verified) {
            return res.status(HTTPSTATUS.UNAUTHORIZED).json({
                success: false,
                message: "OTP verification failed",
            });
        }

        let tokens: { accessToken: string; refreshToken: string };

        switch (event) {
            case 'register':
                tokens = await authServices.createUser(phoneNumber);
                break;
            case 'login':
                tokens = await authServices.loginWithPhone(phoneNumber);
                break;
            default:
                return res.status(HTTPSTATUS.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid event type. Must be 'login' or 'register'.",
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

        const result = await authServices.verifyPasscode(passcode, userId);

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


        const {accessToken, refreshToken} = await authServices.refreshToken(token);

        console.log("we are fteching the motherfucking refresh token")


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Retrived the access token succesfully",
            data : {
                accessToken,
                refreshToken
            }
        });
    });

    public logOut = asyncHandler(async (req: Request, res: Response) => {

        const refreshToken = req.headers['x-refresh-token'];


         await authServices.logout(refreshToken as string);

        console.log("we are fucking signing out token")


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Logout succesful",
          
        });
    });


    public resendOtp = asyncHandler(async (req: Request, res: Response) => {

        const { phoneNumber } = registrationValidationSchema.parse({ ...req.body })


         await authServices.resendToken(phoneNumber as string);



        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Token resent succesfully",
          
        });
    });
    

    public createPasscode = asyncHandler(async (req: Request, res: Response) => {

        console.log(req.body, "this is the body form the req")


        const { passcode ,userId} = passcodeVerificationValidation.parse({ ...req.body })



        await authServices.createPasscode(userId, passcode)


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Passcode Created Succesfully",
        })

    })


}


const authContrller = new AuthController()
export default authContrller