import { asyncHandler } from "../../middlewares/asyncHandler";
import { createWalletSchema } from "../../providers/tagpay/tagpay-types";
import walletService from "./wallet.services";
import { HTTPSTATUS } from "../../config/statusCode.config";
import { Request, Response } from "express";
import WalletServices from "./wallet.services";

export default class WalletControllers {



    private readonly services: WalletServices

    constructor(services: WalletServices) {
        this.services = services
    }


    public createWalletController = asyncHandler(async (req, res) => {

        const data = createWalletSchema.parse({ ...req.body })
        const user = req.query.user as string;

        await this.services.createWalletService({ ...data }, user)

        res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Wallet created successfully "
        })

    })


    public getWalletController = asyncHandler(async (req: Request, res: Response) => {

        const userId = req.query.userId as string
        const user = req.user

        const walletData = await this.services.getWalletByUserId(userId || user.id)


        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Wallet fetched successfully ",
            data: walletData
        })
    })



}

