import {asyncHandler} from "../../middlewares/asyncHandler";
import {createWalletSchema} from "../../providers/tagpay/tagpay-types";
import walletService from "./wallet.services";
import {HTTPSTATUS} from "../../config/statusCode.config";
import {Request, Response } from "express";

class WalletController {

 public createWalletController =  asyncHandler(async (req, res) => {

     const data = createWalletSchema.parse({...req.body})
     const user = req.query.user as string;

        await walletService.createWalletService({...data}, user)

     res.status(HTTPSTATUS.CREATED).json({
         success: true,
         message: "Wallet created successfully "
     })

 })


 public getWalletController = asyncHandler(async(req:Request, res:Response) => {

    const userId = req.query.userId as string
    const user = req.user

    const walletData = await walletService.getWalletByUserId(userId || user.id)


     res.status(HTTPSTATUS.ACCEPTED).json({
         success: true,
         message: "Wallet fetched successfully ",
         data: walletData
     })
 })



}


const walletController = new WalletController()
export default walletController