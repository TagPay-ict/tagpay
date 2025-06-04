import db from "../../db/connectDb";
import { wallet } from "../../db/schema/wallet.model";
import { eq, exists } from "drizzle-orm";
import { BadRequestException } from "../../utils/error";
import { ErrorCode } from "../../enum/errorCode.enum";
import TagPay from "providers/tagpay/tagpay-modules";
import { CreateWalletType } from "providers/tagpay/tagpay-types";
import { user } from "db/schema/user.model";


type WalletType = typeof wallet.$inferInsert

class WalletService {

    public async createWalletService(data: CreateWalletType, userId: string) {
        const { firstName, bvn, dateOfBirth, email, lastName, nin, phoneNumber, address, tier } = data;

        return await db.transaction(async (tx) => {


            // Check if a user has a wallet created already

            const walletExistQuery = tx.select().from(wallet).where(eq(wallet.user_id, userId));
            const walletExists = await tx.select().from(wallet).where(exists(walletExistQuery)).execute();

            if (walletExists.length > 0) {
                throw new BadRequestException("Wallet Already Exist For User ", ErrorCode.BAD_REQUEST)
            }


            const createWalletResponse = await TagPay.wallet.createUserWallet({
                address,
                nin,
                email,
                phoneNumber,
                bvn,
                dateOfBirth,
                lastName,
                tier,
                firstName
            })


            if (createWalletResponse?.data.status !== true) {

                throw new BadRequestException("Failed to create wallet", ErrorCode.BAD_REQUEST)

            }

            const walletDetails = createWalletResponse?.data.wallet
            const customerDetails =createWalletResponse?.data.customer

            console.log(walletDetails, "this is the wallet details")
            console.log(customerDetails, "this is the customer details")

            const walletPayload: WalletType = {
                account_name: walletDetails?.accountName,
                account_number: walletDetails?.accountNumber,
                bank_code: walletDetails?.bankCode,
                alias: "Main Account",
                status: "active",
                user_id: userId,
                provider_wallet_id: walletDetails?.walletId,
                meta_data: {
                    mode: walletDetails?.mode,
                    wallet_ref: walletDetails.accountReference,
                    merchant_wallet_id: walletDetails.id
                },
                balance: 0,
                available_balance: 0,
                account_type: "Savings",
                bank_name: walletDetails?.bankName,
                frozen: false
            }

            const [newWallet] = await tx.insert(wallet).values(walletPayload).returning({
                account_name: wallet.account_name,
                account_number: wallet.account_number,
                bank_name: wallet.bank_name,
                available_balance: wallet.available_balance,
                user_id: wallet.user_id,
                id: wallet.id,
            });

            await tx.update(user).set({
                provider_id:customerDetails.id,
            }).where(eq(user.id, userId))

            return newWallet;


        })

    }

    public async getWalletByUserId(userId: string): Promise<WalletType > {

        const [walletRecord] = await db.select().from(wallet).where(eq(wallet.user_id, userId)).execute();



        return walletRecord;

    }

}

const walletService = new WalletService();
export default walletService