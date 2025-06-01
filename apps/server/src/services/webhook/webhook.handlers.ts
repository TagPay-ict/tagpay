import { asyncHandler } from "middlewares/asyncHandler";
import { Request, Response} from "express";

class WebhookHandlers {


    public tagpay_handler = asyncHandler(async(req:Request, res:Response) => {

        res.sendStatus(200)

        const packet = req.body

        console.log(packet, "this is the packaet received from the webhook")

    })


}


const webhookHandlers = new WebhookHandlers()
export default webhookHandlers