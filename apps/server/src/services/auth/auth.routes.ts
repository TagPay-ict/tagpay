import express from 'express';
import AuthControllers from './auth.controllers';

export default class AuthRoutes {
    private readonly router: express.Router;

    constructor(private readonly controller: AuthControllers) {
        this.router = express.Router();
    }

    routes = () => {
        this.router.post("/register", this.controller.registerUser);
        this.router.post("/login", this.controller.loginUser);
        this.router.post("/verify_phone", this.controller.verifyPhoneNumberOtp);
        this.router.post("/verify_passcode", this.controller.verifyPasscode);
        this.router.post("/refresh_token", this.controller.refreshToken);
        this.router.post("/logout", this.controller.logOut);
        this.router.post("/resend_otp", this.controller.resendOtp);
        this.router.post("/create_passcode", this.controller.createPasscode);
        return this.router;
    };
}