import {transaction} from "../../db/schema/transactions.model";
import {and, eq, inArray} from "drizzle-orm";
import {BadRequestException} from "../../utils/error";
import {ErrorCode} from "../../enum/errorCode.enum";
import {TransactionType} from "./transaction.types";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schemas from "../../db/schema"
import { notificationService } from "../notification/notification.services";


export  class TransactionsServices {



        private readonly db: NodePgDatabase<typeof schemas> & { $client: Pool };
    
    
        constructor(db: NodePgDatabase<typeof schemas> & { $client: Pool }) {
            this.db = db
        }


     async getTransactionById(id:string):Promise<TransactionType> {

        if(!id){
            throw new BadRequestException("User Id is required ", ErrorCode.BAD_REQUEST)
        }

        const transactions = await this.db.select().from(transaction).where(eq(transaction.user_id, id)).execute()

        if(transactions.length === 0){
            throw new BadRequestException("No transactions found", ErrorCode.BAD_REQUEST)
        }

        return transactions[0]


    }

    public async createTransaction(data:TransactionType):Promise<TransactionType> {

        const transactions = await this.db.insert(transaction).values(data).returning().execute()

        if(transactions.length === 0){
            throw new BadRequestException("Failed to create transaction", ErrorCode.BAD_REQUEST)
        }

        const newTransaction = transactions[0];

        // Send notification based on transaction type
        try {
            await this.sendTransactionNotification(newTransaction);
        } catch (error) {
            console.error('Failed to send transaction notification:', error);
            // Don't fail the transaction if notification fails
        }

        return newTransaction
    }

    /**
     * Send notification for transaction
     */
    private async sendTransactionNotification(transactionData: TransactionType) {
        const templateName = transactionData.payment_type === 'WALLET_TRANSFER' 
            ? 'TRANSACTION_RECEIVED' 
            : 'TRANSACTION_SENT';

        const notificationData = {
            userId: transactionData.user_id,
            templateName: templateName as any,
            data: {
                amount: transactionData.amount?.toString() || '0',
                sender: transactionData.sender_name || 'Unknown',
                recipient: transactionData.recipient_name || 'Unknown',
                reference: transactionData.reference || '',
            },
        };

        await notificationService.sendNotification(notificationData);
    }


    public async getUserTransactions(userId: string, includes?: string[], limit?:number) {
     

        const conditions = [eq(transaction.user_id, userId)];

        if (includes && includes.length > 0) {
            const validPaymentTypes = ["INTER_BANK", "WALLET_TRANSFER"] as const;
            const filteredIncludes = includes.filter((type): type is typeof validPaymentTypes[number] =>
                validPaymentTypes.includes(type as any)
            );
            if (filteredIncludes.length > 0) {
                conditions.push(inArray(transaction.payment_type, filteredIncludes));
            }
        }

        const transactions = await this.db.query.transaction.findMany({
            where: and(...conditions),
            orderBy: (t, { desc }) => [desc(t.created_at)],
            with: {
                user: true, 
            },
            limit: limit
        });

        console.log(transactions, "na the transactions be this ooooooooooooooo")

        return transactions;
  }


    public async moneyInAndMoneyOut(userId: string, includes?: string[], limit?:number) {
     


  }


}


