import express from "express"
import transactionControllers from "./transaction.controllers"


const transactionRouter = express.Router()


transactionRouter.get("/" ,transactionControllers.getUserTransactions)


export default transactionRouter