import { HTTPSTATUS } from "../../config/statusCode.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { Request, Response } from "express";
import userServices from "./user.services";
import db from "db/connectDb";

class UserController {

    public getUser = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.user as string;


        const userRecord = await userServices.getUser(userId || req.user.id);


        res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "User retrieved successfully",
            data: userRecord
        });
    })


    public tags = asyncHandler(async (req: Request, res: Response) => {
        const { query } = req.query as { query: string };


        console.log(query, "thsi sis ther query")

        const results = await userServices.getUsersByTag(query);

        console.log(results , "these are the results fromthe search controlller")

        res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "User retrieved successfully",
            data: results
        });
    })



    public getUsers = asyncHandler(async (req: Request, res: Response) => {

        const users = await db.query.user.findMany({
            columns: {
                passcode: false,
                password: false,
                secure_pin: false,
                refresh_token: false,
                bvn: false,
            },
            with: {
                wallet: true
            }
        })



        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Users retrieved successfully",
            data: users
        })


    })


}


const userController = new UserController();

export default userController;