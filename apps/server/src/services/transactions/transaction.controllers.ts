import { asyncHandler } from "middlewares/asyncHandler";
import { Request, Response } from "express"
import { TransactionsServices } from "./transactions.services";

export default class TransactionControllers {

       private readonly services: TransactionsServices
    
    constructor(services: TransactionsServices) {
            this.services = services
        }


    public getUserTransactions = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const includesRaw = req.query.includes;
        const limit = req.query.limit 

        console.log("i love that this is gettting called")

        // Parse includes from query string
        const includes = typeof includesRaw === "string"
            ? includesRaw.split(",").map((val) => val.trim())
            : undefined;

        const transactions = await this.services.getUserTransactions(userId, includes, Number(limit));

        res.status(200).json({ success: true, message: "Transaction data fetched succesfully ", data: transactions });
    });




}

