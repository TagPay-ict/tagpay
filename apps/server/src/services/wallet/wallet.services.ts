import { wallet } from "../../db/schema/wallet.model";
import { eq, exists } from "drizzle-orm";
import { BadRequestException, NotFoundException } from "../../utils/error";
import { ErrorCode } from "../../enum/errorCode.enum";
import TagPay from "providers/tagpay/tagpay-modules";
import { CreateWalletType } from "providers/tagpay/tagpay-types";
import { user } from "db/schema/user.model";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schemas from "../../db/schema";
import { systemLogger } from "utils/logger";

type WalletType = typeof wallet.$inferInsert;

export default class WalletServices {
  private readonly db: NodePgDatabase<typeof schemas> & { $client: Pool };

  constructor(db: NodePgDatabase<typeof schemas> & { $client: Pool }) {
    this.db = db;
  }

  public async createWalletService(data: CreateWalletType, userId: string) {
    const {
      firstName,
      bvn,
      dateOfBirth,
      email,
      lastName,
      nin,
      phoneNumber,
      address,
      tier,
    } = data;

    return await this.db.transaction(async (tx) => {
      // Check if a user has a wallet created already

      const walletExistQuery = tx
        .select()
        .from(wallet)
        .where(eq(wallet.user_id, userId));
      const walletExists = await tx
        .select()
        .from(wallet)
        .where(exists(walletExistQuery))
        .execute();

      if (walletExists.length > 0) {
        throw new BadRequestException(
          "Wallet Already Exist For User ",
          ErrorCode.BAD_REQUEST
        );
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
        firstName,
      });

      if (createWalletResponse?.data.status !== true) {
        throw new BadRequestException(
          "Failed to create wallet",
          ErrorCode.BAD_REQUEST
        );
      }

      const walletDetails = createWalletResponse?.data.wallet;
      const customerDetails = createWalletResponse?.data.customer;

      console.log(walletDetails, "this is the wallet details");
      console.log(customerDetails, "this is the customer details");

      const walletPayload: WalletType = {
        account_name: walletDetails?.accountName,
        account_number: walletDetails?.accountNumber,
        bank_code: walletDetails?.bankCode,
        alias: "Main Account",
        status: "active",
        user_id: userId,
        provider_wallet_id: walletDetails?.id,
        meta_data: {
          mode: walletDetails?.mode,
          wallet_ref: walletDetails.accountReference,
          merchant_wallet_id: walletDetails.walletId,
        },
        balance: 0,
        available_balance: 0,
        account_type: "Savings",
        bank_name: walletDetails?.bankName,
        frozen: false,
      };

      const [newWallet] = await tx
        .insert(wallet)
        .values(walletPayload)
        .returning({
          account_name: wallet.account_name,
          account_number: wallet.account_number,
          bank_name: wallet.bank_name,
          available_balance: wallet.available_balance,
          user_id: wallet.user_id,
          id: wallet.id,
        });

      await tx
        .update(user)
        .set({
          provider_id: customerDetails.id,
        })
        .where(eq(user.id, userId));

      return newWallet;
    });
  }

  public async getWalletByUserId(userId: string): Promise<WalletType | {}> {
    const walletRecord = await this.db.query.wallet.findFirst({
      where: eq(wallet.user_id, userId),
    });

    if (!walletRecord) {
      return {};
    }

    return walletRecord;
  }

  public async getUserBalance(userId: string): Promise<{
    balance: number;
    availableBalance: number;
    ledgerBalance: number;
    holdBalance: number;
    currency: string;
  } | null> {
    const walletRecord = await this.db.query.wallet.findFirst({
      where: eq(wallet.user_id, userId),
      columns: {
        balance: true,
        available_balance: true,
        ledger_balance: true,
        hold_balance: true,
        currency: true,
      },
    });

    if (!walletRecord) {
      return null;
    }

    return {
      balance: walletRecord.balance || 0,
      availableBalance: walletRecord.available_balance || 0,
      ledgerBalance: walletRecord.ledger_balance || 0,
      holdBalance: walletRecord.hold_balance || 0,
      currency: walletRecord.currency || "NGN",
    };
  }

  public async refreshWalletBalance(userId: string): Promise<{
    balance: number;
    availableBalance: number;
    ledgerBalance: number;
    holdBalance: number;
    currency: string;
  } | null> {
    const walletRecord = await this.db.query.wallet.findFirst({
      where: eq(wallet.user_id, userId),
      columns: {
        provider_wallet_id: true,
        balance: true,
        available_balance: true,
        ledger_balance: true,
        hold_balance: true,
        currency: true,
      },
    });

    if (!walletRecord) {
      return null;
    }

    try {
      // Fetch latest balance from TagPay provider
      const balanceResponse = await TagPay.wallet.getUserWallet(
        walletRecord.provider_wallet_id
      );

      if (balanceResponse?.data?.status === true) {
        const balanceData = balanceResponse.data.wallet;

        // Update local balance
        await this.db
          .update(wallet)
          .set({
            balance: balanceData.balance || 0,
            available_balance: balanceData.availableBalance || 0,
            ledger_balance: balanceData.ledgerBalance || 0,
            hold_balance: balanceData.holdBalance || 0,
          })
          .where(eq(wallet.user_id, userId));

        return {
          balance: balanceData.balance || 0,
          availableBalance: balanceData.availableBalance || 0,
          ledgerBalance: balanceData.ledgerBalance || 0,
          holdBalance: balanceData.holdBalance || 0,
          currency: walletRecord.currency || "NGN",
        };
      }
    } catch (error) {
      systemLogger.error(error)
    }

    // Return cached balance if provider call fails
    return {
      balance: walletRecord.balance || 0,
      availableBalance: walletRecord.available_balance || 0,
      ledgerBalance: walletRecord.ledger_balance || 0,
      holdBalance: walletRecord.hold_balance || 0,
      currency: walletRecord.currency || "NGN",
    };
  }
}
