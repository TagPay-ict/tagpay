import express from "express"
import webhookHandlers from "./webhook.handlers"



const webhookRouter = express.Router()



webhookRouter.route("/tagpay").post(webhookHandlers.tagpay_handler)



export default webhookRouter