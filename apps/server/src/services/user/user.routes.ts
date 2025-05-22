import express from "express";
import userController from "./user.controllers";


const userRouter = express.Router();


userRouter.get("/", userController.getUser)


export default userRouter;