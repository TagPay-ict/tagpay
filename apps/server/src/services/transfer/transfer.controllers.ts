import {asyncHandler} from "../../middlewares/asyncHandler";
import { Response, Request} from "express"
import {nipTransferSchema, tagTransferSchema} from "./transfer.types";
import transferServices from "./transfer.services";
import { HTTPSTATUS } from "config/statusCode.config";

class TransferControllers {

    public nipTransferController = asyncHandler(async (req:Request, res: Response) => {

        const user = req.user

        const modifiedNipTransferSchema = nipTransferSchema.pick({amount: true, narration: true,accountNumber: true, sortCode: true,bankName: true,})

        const {amount, narration,accountNumber, sortCode,bankName} = modifiedNipTransferSchema.parse({...req.body})

        const payload = {
            amount: amount,
            narration: narration,
            accountNumber: accountNumber,
            sortCode: sortCode,
            bankName: bankName,
            customerId: user.provider_id,
            metadata: {
                userId: user.id
            }
        }

        const response = await transferServices.nipTransferService(payload  , user.id)

    })


    public tagTransferController = asyncHandler(async (req:Request, res: Response) => {

        const user = req.user

        console.log(req.body, "na the re.body be this ")

        const {amount,tag} = tagTransferSchema.parse({...req.body})

        const payload = {
            amount,
            tag
        }

        console.log("this transfer is fucking running")

         await transferServices.tagTransferService(payload  , user.id)


        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Transfer Processing"
        })
    })




}


const transferControllers = new TransferControllers()
export default transferControllers