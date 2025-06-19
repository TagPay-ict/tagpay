import { Request, Response} from "express";
import { TAGPAY_EVENTS_TYPE } from "./webhook.types";
import WebhookHandlers from "./webhook.handlers";
import { asyncHandler } from "middlewares/asyncHandler";

export default class WebhookControllers {

    private readonly handlers: WebhookHandlers

    constructor( handlers: WebhookHandlers){
        this.handlers = handlers
    }

    public tagpay_controllers = asyncHandler(async(req:Request, res:Response) => {

        res.sendStatus(200)

        const packet_event = req.body.event
        const packet_data = req.body.data

        console.log(packet_event, "this is the packaet received from the webhook")
        console.log(packet_data, "this is the packaet received from the webhook")

        switch (packet_event) {
            case packet_event === TAGPAY_EVENTS_TYPE.account_created:
              await  this.handlers.walletCreated_handler
                break;
        
            default:
                break;
        }

    })


}


