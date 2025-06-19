import {asyncHandler} from "../../middlewares/asyncHandler";
import { Response, Request} from "express"
import {nipTransferSchema, tagTransferSchema} from "./transfer.types";
import transferServices from "./transfer.services";
import { HTTPSTATUS } from "config/statusCode.config";
import TransferServices from "./transfer.services";

export default class TransferControllers {


        private readonly services: TransferServices
        
            constructor( services: TransferServices){
                this.services = services
            }


    public nipTransferController = asyncHandler(async (req:Request, res: Response) => {

        const user = req.user

        const modifiedNipTransferSchema = nipTransferSchema.pick({amount: true, narration: true,accountNumber: true, sortCode: true,bankName: true,accountName:true})

        const {amount, narration,accountNumber, sortCode,bankName,accountName } = modifiedNipTransferSchema.parse({...req.body})

        const payload = {
            amount: amount,
            narration: narration,
            accountNumber: accountNumber,
            sortCode: sortCode,
            bankName: bankName,
            customerId: user.provider_id,
            metadata: {
                userId: user.id
            },
            accountName
        }

        const response = await this.services.nipTransfer(payload  , user.id)

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

         await this.services.tagTransfer(payload  , user.id)


        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Transfer Processing"
        })
    })


    public getBankList = asyncHandler(async (req:Request, res: Response) => {

       
       const data = await this.services.getBankList()


        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Bank list fetched successfully",
            data
        })
    })


    public resolveBank = asyncHandler(async (req:Request, res: Response) => {

        const { sortCode, accountNumber } = req.query;


        if (typeof sortCode !== "string" || typeof accountNumber !== "string") {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "sortCode and accountNumber are required ",
            });
        }

        const data = await this.services.resolveBank(sortCode, accountNumber);

        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Account details resolved sucessfully",
            data
        })
    })



}


