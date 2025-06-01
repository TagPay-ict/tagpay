import {transaction} from "../../db/schema/transactions.model";
import db from "../../db/connectDb";
import {and, eq, inArray} from "drizzle-orm";
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



    public async getUserTransactions(userId: string, includes?: string[]) {
     

        const conditions = [eq(transaction.user_id, userId)];

        if (includes && includes.length > 0) {
            // Only allow valid enum values
            const validPaymentTypes = ["INTER_BANK", "WALLET_TRANSFER"] as const;
            const filteredIncludes = includes.filter((type): type is typeof validPaymentTypes[number] =>
                validPaymentTypes.includes(type as any)
            );
            if (filteredIncludes.length > 0) {
                conditions.push(inArray(transaction.payment_type, filteredIncludes));
            }
        }

        const transactions = await db.query.transaction.findMany({
            where: and(...conditions),
            orderBy: (t, { desc }) => [desc(t.created_at)],
            with: {
                user: true, // this includes the associated user record
            },
        });

        console.log(transactions, "na the transactions be this ooooooooooooooo")

        return transactions;
  }




}


const transactionsServices = new TransactionsServices();
export default transactionsServices;