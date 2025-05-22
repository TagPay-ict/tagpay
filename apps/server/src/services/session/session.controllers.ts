import { asyncHandler } from "middlewares/asyncHandler"
import { Request, Response } from "express"
import sessionServices from "./session.services"
import { HTTPSTATUS } from "config/statusCode.config"



class SessionControllers {


    public getUserSession = asyncHandler(async (req: Request, res: Response) => {

        const sessionId = req.sessionId

        const userData = await sessionServices.getSessionById(sessionId as string)


        return res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Email verification success",
            data: userData
        })

    })

}


const sessionControllers = new SessionControllers()
export default sessionControllers