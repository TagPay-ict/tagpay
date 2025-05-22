import {HTTPSTATUS} from "../../config/statusCode.config";
import {asyncHandler} from "../../middlewares/asyncHandler";
import {Request, Response} from "express";
import userServices from "./user.services";

class UserController {

    public getUser = asyncHandler(async (req:Request, res: Response) => {
        const userId = req.params.user as string;


       const {user, setup} = await userServices.getUser(userId || req.user.id);


        res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "User retrieved successfully",
            data: {
                user,
                setup
            }
        });
    })

}


const userController = new UserController();

export default userController;