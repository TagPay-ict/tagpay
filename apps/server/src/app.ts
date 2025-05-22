import express, { Express } from "express"
import * as http from "node:http";
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import errorHandler from "./middlewares/error.middleware";
import config from "./config/app.config";
import walletRouter from "./services/wallet/wallet.routes";
import verificationService from "./services/verification/verification.services";
import authRouter from "services/auth/auth.routes";
import { authMiddleware } from "middlewares/auth.middleware";
import userRouter from "services/user/user.routes";
import onboardingRouter from "services/onboarding/onboarding.routes";
import "queue/index"
import billsRouter from "services/bills/bills.routes";
import redis from "config/redis.config";
import { systemLogger } from "utils/logger";
import { ErrorCode } from "enum/errorCode.enum";
import { InternalServerException } from "utils/error";

const app: Express = express()

const server = http.createServer(app)

console.log(config.REDIS_URL, "this  is the redis url")
console.log(config.NODE_ENV, "this  is the node env url")
redis.on("error", (error: Error) => {
    systemLogger.error(`Redis error: ${error.message}`, error);
    throw new InternalServerException(
        "Redis client failed to start",
        ErrorCode.INTERNAL_SERVER_ERROR
    );
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/api/v1", async (req: express.Request, res: express.Response) => {

    try {

        const response = await verificationService.verifyUserBvn("22263221567")


        res.status(200).json({
            success: true,
            message: 'Welcome Backend!',
            data: response?.data.entity
        });

    } catch (error) {
        console.log(error, "is this the error being printed")
        res.status(500).json({
            success: false,
            message: 'We failed you!',
        });
    }



})



app.use(`/${config.BASE_PATH}/wallet`, authMiddleware, walletRouter)
app.use(`/${config.BASE_PATH}/auth`, authRouter)
app.use(`/${config.BASE_PATH}/user`, authMiddleware, userRouter)
app.use(`/${config.BASE_PATH}/setup`, authMiddleware, onboardingRouter)
app.use(`/${config.BASE_PATH}/bills`, authMiddleware, billsRouter)

app.use(errorHandler)

export {
    app,
    server
}