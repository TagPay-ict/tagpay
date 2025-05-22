import {asyncHandler} from "../../middlewares/asyncHandler";
import { Response, Request} from "express"
import {nipTransferSchema} from "./transfer.types";
import transferServices from "./transfer.services";

class TransferController {

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

        const {} = transferServices.nipTransferService(payload  , user.id)

    })


}