import express, { Express } from "express"
import * as http from "node:http";
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import errorHandler from "./middlewares/error.middleware";
import config from "./config/app.config";
import verificationService from "./services/verification/verification.services";
import { authMiddleware } from "middlewares/auth.middleware";
import userRouter from "services/user/user.routes";
import onboardingRouter from "services/onboarding/onboarding.routes";
import billsRouter from "services/bills/bills.routes";
import redis from "config/redis.config";
import { systemLogger } from "utils/logger";
import { ErrorCode } from "enum/errorCode.enum";
import { InternalServerException } from "utils/error";
import { setupBullBoard } from "./queue/board";
import { RootModule } from "services";
import db from "db/connectDb";
import { initializeWorkers } from "queue";


const root = new RootModule(db)

initializeWorkers(root)

const app: Express = express()


const server = http.createServer(app)

console.log('BASE_PATH:', config.BASE_PATH);



function listRoutes(router: express.Router, parentPath = ""): string[] {
    const routes: string[] = [];
    router.stack.forEach((layer: any) => {
        if (layer.route && layer.route.path) {
            routes.push(parentPath + layer.route.path);
        } else if (layer.name === "router" && layer.handle.stack) {
            const nestedPath = layer.regexp?.source
                .replace("^\\", "")
                .replace("\\/?(?=\\/|$)", "")
                .replace(/\\\//g, "/")
                .replace(/\$$/, "");
            routes.push(
                ...listRoutes(layer.handle, parentPath + (nestedPath || ""))
            );
        }
    });
    return routes;
}


console.log('All registered root routes:', listRoutes(root.routes()));



redis.on("error", (error: Error) => {
    systemLogger.error(`Redis error: ${error.message}`, error);
    throw new InternalServerException(
        "Redis client failed to start",
        ErrorCode.INTERNAL_SERVER_ERROR
    );
});

setupBullBoard(app)

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(`/${config.BASE_PATH}`, root.routes());


// app.use(`/${config.BASE_PATH}/user`, authMiddleware, userRouter)
// app.use(`/${config.BASE_PATH}/setup`, authMiddleware, onboardingRouter)
// app.use(`/${config.BASE_PATH}/bills`, authMiddleware, billsRouter)


// app.get("/api/v1", async (req: express.Request, res: express.Response) => {

//     try {


//         res.status(200).json({
//             success: true,
//             message: 'Welcome Tagpay!',

//         });

//     } catch (error) {
//         console.log(error, "is this the error being printed")
//         res.status(500).json({
//             success: false,
//             message: 'We failed you!',
//         });
//     }



// })

// app.use('/', (req, res, next) => {

//     res.status(200).json({
//         status: "success",

//     })

// });

// app.get("/api/v1/health", async (req: express.Request, res: express.Response) => {

//     try {

//         res.status(200).json({
//             success: true,
//             message: 'Health check passed !',
//         })

//     } catch (error) {

//     }

// });



app.use(errorHandler)

export {
    app,
    server
}