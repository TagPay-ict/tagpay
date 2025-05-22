import express from 'express';
import authContrller from './auth.controllers';


const authRouter = express.Router();


authRouter.post("/register", authContrller.registerUser)
authRouter.post("/login", authContrller.loginUser)
authRouter.post("/verify_phone", authContrller.verifyPhoneNumberOtp)
authRouter.post("/verify_passcode", authContrller.verifyPasscode)
authRouter.post("/refresh_token", authContrller.refreshToken)
authRouter.post("/logout", authContrller.logOut)
authRouter.post("/resend_otp", authContrller.resendOtp)
authRouter.post("/create_passcode", authContrller.createPasscode)


export default authRouter;