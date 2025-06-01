import express from "express";
import userController from "./user.controllers";


const userRouter = express.Router();


userRouter.get("/", userController.getUser)
userRouter.get("/tags", userController.tags)
userRouter.get("/users", userController.getUsers)


export default userRouter;