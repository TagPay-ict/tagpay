import { asyncHandler } from "middlewares/asyncHandler";
import { Request, Response } from "express"
import transactionsServices from "./transactions.services";

class TransactionControllers {


    public getUserTransactions = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const includesRaw = req.query.includes;

        console.log("i love that this is gettting called")

        // Parse includes from query string
        const includes = typeof includesRaw === "string"
            ? includesRaw.split(",").map((val) => val.trim())
            : undefined;

        const transactions = await transactionsServices.getUserTransactions(userId, includes);

        res.status(200).json({ success: true, message: "Transaction data fetched succesfully ", data: transactions });
    });




}


const transactionControllers = new TransactionControllers()
export default transactionControllers