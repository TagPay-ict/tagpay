import { Response, Request } from "express";
import { asyncHandler } from "middlewares/asyncHandler";
import { AccountNumberSchema, MigrateSchema } from "./migration.types";
import TagPay from "providers/tagpay/tagpay-modules";
import { BadRequestException, InternalServerException } from "utils/error";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schemas from "../../db/schema"
import { Pool } from "pg";
import { HTTPSTATUS } from "config/statusCode.config";
import redis from "config/redis.config";
import { WalletDetails } from "providers/tagpay/tagpay-types";
import { eq, exists } from "drizzle-orm";
import { convertKyc } from "utils/convertKycTier";
import { PasswordUtils } from "utils/passwordUtils";
import randomstring from "randomstring"
import { TagPay_MigrationTransactionQueue, TransactionMigrationtype } from "queue/queue-list";
import { QueueRegistry } from "queue/queue-registry";

type WalletType = typeof schemas.wallet.$inferInsert


export default class MigrationControllers {

    private readonly db: NodePgDatabase<typeof schemas> & { $client: Pool };
    private readonly WALLET_CACHE_KEY = "wallets_cache";
    private readonly WALLET_CACHE_TTL_SECONDS = 3000;


    constructor(db: NodePgDatabase<typeof schemas> & { $client: Pool }) {
        this.db = db
    }



    public resolveAccountNumber = asyncHandler(async (req: Request, res: Response) => {


        const { accountNumber } = AccountNumberSchema.parse({ ...req.body });


        return await this.db.transaction(async (tx) => {

            // check if account number already exists on our local database

            const walletExistQuery = this.db.select().from(schemas.wallet).where(eq(schemas.wallet.account_number, accountNumber));
            const walletExist = await tx.select().from(schemas.wallet).where(exists(walletExistQuery)).execute();


            if (walletExist.length > 0) {
                throw new BadRequestException("Account already exists ")
            }


            let wallets: WalletDetails[];

            const cached = await redis.get(this.WALLET_CACHE_KEY);

            if (cached) {
                wallets = JSON.parse(cached);
            } else {
                const allWallets = await TagPay.wallet.getAllUsersWallet();

                if (allWallets.data.status !== true) {
                    throw new InternalServerException("Something went wrong resolving account. Try again");
                }

                wallets = allWallets.data.wallets;

                await redis.setex(this.WALLET_CACHE_KEY, this.WALLET_CACHE_TTL_SECONDS, JSON.stringify(wallets));
            }

            const walletMap = new Map(wallets.map(w => [w.accountNumber, w]));
            const matchedWallet = walletMap.get(accountNumber);

            if (!matchedWallet) {
                throw new BadRequestException("Account not found");
            }

            return res.status(HTTPSTATUS.ACCEPTED).json({
                success: true,
                message: "Account resolved successfully",
                data: matchedWallet,
            });
        })

    });


    public migrateUser = asyncHandler(async (req: Request, res: Response) => {

        const { customerId } = MigrateSchema.parse({ ...req.body })

        try {

            return await this.db.transaction(async (tx) => {

                // fetch customer data from core banking 
                const customerDetails = await TagPay.customer.getCustomerData(customerId)


                const userTier = convertKyc(customerDetails.data.customer.tier)

                const hashedBvn = PasswordUtils.encryptCryptr(customerDetails.data.customer.bvn)

                const referral_code = randomstring.generate(5)
                const account_ref = randomstring.generate(7)
                // create user in local database

                const userPayload: schemas.UserType = {
                    first_name: customerDetails.data.customer.BVNFirstName,
                    last_name: customerDetails.data.customer.BVNLastName,
                    full_name: `${customerDetails.data.customer.BVNFirstName}" "${customerDetails.data.customer.BVNFirstName}`,
                    date_of_birth: customerDetails.data.customer.dateOfBirth,
                    kyc_tier: userTier,
                    bvn: hashedBvn,
                    nin: customerDetails.data.customer.nin,
                    referral_code,
                    account_ref,
                    provider_id: customerDetails.data.customer.id
                }

                const newUser = await tx.insert(schemas.user).values(userPayload).returning({
                    id: schemas.user.id
                })


                const walletDetails = await TagPay.wallet.getUserWallet(customerId)

                const walletPayload: WalletType = {
                    account_name: walletDetails.data.wallet.accountName,
                    account_number: walletDetails.data.wallet.accountNumber,
                    bank_code: walletDetails.data.wallet.bankCode,
                    bank_name: walletDetails.data.wallet.bankName,
                    provider_wallet_id: walletDetails.data.wallet.id,
                    user_id: newUser[0].id,
                    alias: "Main Account",
                    status: "active",
                    balance: walletDetails.data.wallet.bookedBalance,
                    available_balance: walletDetails.data.wallet.availableBalance,
                    meta_data: {
                        wallet_ref: walletDetails.data.wallet.accountReference,
                    },
                    account_type: "Savings",
                    frozen: false
                }

                const isAccountFunded = walletDetails.data.wallet.availableBalance > 0
                const isBvnProvided = !!customerDetails.data.customer.bvn
                const isNinProvided = !!customerDetails.data.customer.nin

                tx.insert(schemas.wallet).values(walletPayload)
                tx.insert(schemas.setup).values({ is_account_created: true, is_account_funded: isAccountFunded, user_id: newUser[0].id, is_bvn_provided: isBvnProvided, is_nin_provided: isNinProvided, is_nin_verified: customerDetails.data.customer.isNINVerified, is_bvn_verified:!customerDetails.data.customer.isBVNVerificationRequired })

                const createTransactionMigrationPayload:TransactionMigrationtype = {
                    customerId
                }

                await TagPay_MigrationTransactionQueue.add(QueueRegistry.migrate_transaction, createTransactionMigrationPayload)
                

                return res.status(HTTPSTATUS.ACCEPTED).json({
                    success: true,
                    message: "Migration completed",
                    data: customerDetails.data.customer,
                });


            })
        } catch (error) {
            console.log(error)
            throw new BadRequestException("Failed to migrate user")
        }





    })

}


// page&perPage