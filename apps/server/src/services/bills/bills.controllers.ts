import { asyncHandler } from "middlewares/asyncHandler";
import { Request, Response } from "express";
import { airtimeSchema } from "./bills.types";
import billsServices from "./bills.services";
import { HTTPSTATUS } from "config/statusCode.config";


class BillsControllers {


    public purchaseAirtime = asyncHandler(async (req: Request, res: Response) => {

        const { amount, phoneNumber, provider, customerPhone } = airtimeSchema.parse({ ...req.body })
        const userId = req.user.id

        const response = await billsServices.airtime({ amount, phoneNumber, provider, customerPhone }, userId)




        res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Airtime purchase successful",
            data: response
        })

    })


}


const billsControllers = new BillsControllers()
export default billsControllers