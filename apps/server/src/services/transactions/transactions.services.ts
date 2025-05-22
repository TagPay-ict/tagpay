import {transaction} from "../../db/schema/transactions.model";
import db from "../../db/connectDb";
import {eq} from "drizzle-orm";
import {BadRequestException} from "../../utils/error";
import {ErrorCode} from "../../enum/errorCode.enum";
import {TransactionType} from "./transaction.types";



class TransactionsServices {

    public async getTransactionById(id:string):Promise<TransactionType> {

        if(!id){
            throw new BadRequestException("User Id is required ", ErrorCode.BAD_REQUEST)
        }

        const transactions = await db.select().from(transaction).where(eq(transaction.user_id, id)).execute()

        if(transactions.length === 0){
            throw new BadRequestException("No transactions found", ErrorCode.BAD_REQUEST)
        }

        return transactions[0]


    }

    public async createTransaction(data:TransactionType):Promise<TransactionType> {

        const transactions = await db.insert(transaction).values(data).returning().execute()

        if(transactions.length === 0){
            throw new BadRequestException("Transaction not created", ErrorCode.BAD_REQUEST)
        }

        return transactions[0]
    }




}


const transactionsServices = new TransactionsServices();
export default transactionsServices;