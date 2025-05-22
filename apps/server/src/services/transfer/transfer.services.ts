import {NipTransferType} from "./transfer.types";
import {BadRequestException} from "../../utils/error";
import {ErrorCode} from "../../enum/errorCode.enum";
import {wallet} from "../../db/schema/wallet.model";
import db from "../../db/connectDb";
import {eq} from "drizzle-orm";
import tagpayWalletApi from "../../providers/tagpay/tagpay-wallet.api";
import tagpayTransferApi from "../../providers/tagpay/tagpay-transfer.api";
import {transaction} from "../../db/schema/transactions.model";
import transactionsServices from "../transactions/transactions.services";
import {TransactionType} from "../transactions/transaction.types";
import {TagPay_ChargeTransferFeeQueue} from "../../queue/queue-list";
import {QueueRegistry} from "../../queue/queue-registry";
import TagPay from "providers/tagpay/tagpay-modules";


class TransferServices {



    protected calculateCharges(amount: number): number {
        if (amount <= 5000) {
            return 10;
        } else if (amount <= 50000) {
            return 25;
        } else {
            return 50;
        }
    }


    public async nipTransferService(data: NipTransferType, userId: string) {

        const {amount, customerId, metadata , narration, sortCode, accountNumber} = data


        if (!userId) {
            throw new BadRequestException("User Id is required ", ErrorCode.BAD_REQUEST)
        }


        await db.transaction(async (tx) => {

            // check if the user has a wallet
            const userWallet = await tx.select().from(wallet).where(eq(wallet.user_id, userId)).execute()

            if (userWallet.length === 0) {
                throw new BadRequestException("User wallet not found", ErrorCode.BAD_REQUEST)
            }

            // check if the user has sufficient balance in their wallet
            const userBalance = userWallet[0].balance

            const charges = this.calculateCharges(amount)

            const totalAmount = amount + charges

            if(totalAmount < amount ) {
                throw new BadRequestException("Insufficient balance", ErrorCode.BAD_REQUEST)
            }


            const transferPayload:NipTransferType = {
                amount: amount,
                accountNumber: accountNumber,
                sortCode: sortCode,
                narration: narration,
                customerId: customerId,
                metadata: metadata,
            }

            const transferResponse = await TagPay.payments.nipTransfer(transferPayload)

            if(transferResponse.data.status !== true) {
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

            const transactionPayload:TransactionType = {
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



            await transactionsServices.createTransaction(transactionPayload)

            // charge the user transfer fee

            await TagPay_ChargeTransferFeeQueue.add(QueueRegistry.create_transfer_fee_charge, {
                user_id: userId,
                wallet_id: userWallet[0].id,
                fee: charges,
            })

        })
    }
}


const transferServices = new TransferServices()
export default transferServices;