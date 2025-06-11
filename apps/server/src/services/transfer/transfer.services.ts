import { NipTransferType, TagTransferType } from "./transfer.types";
import { BadRequestException, InternalServerException } from "../../utils/error";
import { ErrorCode } from "../../enum/errorCode.enum";
import { wallet } from "../../db/schema/wallet.model";
import db from "../../db/connectDb";
import { eq } from "drizzle-orm";
import { transaction } from "../../db/schema/transactions.model";
import { TransactionType } from "../transactions/transaction.types";
import { TagPay_ChargeTransferFeeQueue } from "../../queue/queue-list";
import { QueueRegistry } from "../../queue/queue-registry";
import TagPay from "providers/tagpay/tagpay-modules";
import { user } from "db/schema/user.model";
import { CustomerToCustomerType, WalletToWalletType } from "providers/tagpay/tagpay-types";
import { systemLogger } from "utils/logger";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schemas from "../../db/schema"
import { Pool } from "pg";


export default class TransferServices {


        private readonly db: NodePgDatabase<typeof schemas> & { $client: Pool };
    
    
        constructor(db: NodePgDatabase<typeof schemas> & { $client: Pool }) {
            this.db = db
        }


    public calculateCharges(amount: number): number {
        if (amount <= 5000) {
            return 10;
        } else if (amount <= 50000) {
            return 25;
        } else {
            return 50;
        }
    }


    public async nipTransfer(data: NipTransferType, userId: string) {

        const { amount, customerId, metadata, narration, sortCode, accountNumber } = data


        if (!userId) {
            throw new BadRequestException("Cannot find user ", ErrorCode.BAD_REQUEST)
        }


        await this.db.transaction(async (tx) => {

            // check if the user has a wallet
            const userWallet = await tx.select().from(wallet).where(eq(wallet.user_id, userId)).execute()

            if (userWallet.length === 0) {
                throw new BadRequestException("User wallet not found", ErrorCode.BAD_REQUEST)
            }

            // check if the user has sufficient balance in their wallet
            const userBalance = userWallet[0].balance

            const charges = this.calculateCharges(amount)

            const totalAmount = amount + charges

            if (totalAmount < amount) {
                throw new BadRequestException("Insufficient balance", ErrorCode.BAD_REQUEST)
            }


            const transferPayload: NipTransferType = {
                amount: amount,
                accountNumber: accountNumber,
                sortCode: sortCode,
                narration: narration,
                customerId: customerId,
                metadata: metadata,
            }

            const transferResponse = await TagPay.payments.nipTransfer(transferPayload)

            if (transferResponse.data.status !== true) {
                throw new BadRequestException("Failed to transfer funds", ErrorCode.BAD_REQUEST)
            }

            // update the user wallet balance

            const newBalance = userBalance - totalAmount

            await tx.update(wallet).set({
                balance: newBalance,
                ledger_balance: newBalance,
                available_balance: newBalance,
            }).where(eq(wallet.user_id, userId)).execute()

            // create a transaction record

            const transactionPayload: TransactionType = {
                amount: amount,
                fee: charges,
                type: "DEBIT",
                payment_type: "INTER_BANK",
                user_id: userId,
                wallet_id: userWallet[0].id,
                narration: narration,
                metadata: metadata,
                reference: transferResponse.data.reference,
                status: "COMPLETED",
                session_id: transferResponse.data.sessionId,
            }



            // await TransactionsServices.(transactionPayload)

            // charge the user transfer fee

            await TagPay_ChargeTransferFeeQueue.add(QueueRegistry.create_transfer_fee_charge, {
                user_id: userId,
                wallet_id: userWallet[0].id,
                fee: charges,
            })

        })
    }


    public async tagTransfer(data: TagTransferType, userId: string) {

        const { amount, tag } = data

        // find the sender data which is the user 

        try {
            
            await this.db.transaction(async (tx) => {
    
    
                const sender = await tx.query.user.findFirst({
                    where: eq(user.id, userId),
                    with: {
                        wallet: true
                    }
                })
    
    
                console.log(sender, "this is the sender")
    
    
                if (!sender) {
                    throw new BadRequestException("Sender not found", ErrorCode.BAD_REQUEST)
                }
    
                const recipient = await tx.query.user.findFirst({
                    where: eq(user.tag, tag),
                    with: {
                        wallet: true
                    }
                })
                if (!recipient) {
                    throw new BadRequestException(`Recipient with tag ${tag} not found`, ErrorCode.BAD_REQUEST)
                }
    
    
                // create the transfer payload 
    
                const transferPayload: CustomerToCustomerType = {
                    amount,
                    fromCustomerId: sender.provider_id as string,
                    toCustomerId: recipient.provider_id as string
                }
    
                const transferResponse = await TagPay.payments.customerToCustomer(transferPayload)
    
                //  create new trasaction
    
                // const transactionPayload:TransactionType = {
    
                // } 
    
                // await db.insert(transaction).values(transactionPayload)
    
                console.log(transferResponse.data, "this is the transfer response")
    
            })
            
        } catch (error) {
            console.log(error)
            systemLogger.error(error)
            throw new InternalServerException("Failed to make transfer")
        }







    }

    public async getBankList(): Promise<Array<{ code: string; name: string }>> {

        const bankList = await TagPay.payments.getBankList()


        if (bankList.data.status !== true) {
            throw new InternalServerException("Failed to get bank list")
        }

        return bankList.data.banks as Array<{ code: string; name: string }>;

    }
}


