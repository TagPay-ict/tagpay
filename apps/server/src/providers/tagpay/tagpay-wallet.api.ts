import { TagPayBaseClass } from "./tagpay-base";
import { CreateWalletType, WalletDetails } from "./tagpay-types";
import { systemLogger } from "../../utils/logger";
import { AxiosResponse } from "axios";

class TagPayWalletApi extends TagPayBaseClass {
  constructor() {
    super();
  }

  public async createUserWallet(data: CreateWalletType) {
    try {
      const response = await this.axios.post("/wallet", JSON.stringify(data));

      return response;
    } catch (error) {
      console.log(error, "this is the error from the wallet");
      systemLogger.error(error);
      throw error;
    }
  }

  public async getAllUsersWallet(): Promise<
    AxiosResponse<{ status: boolean; wallets: WalletDetails[] }>
  > {
    try {
      const response = await this.axios.get("/wallet");

      return response;
    } catch (error) {
      console.log(error, "this is the error from the wallet");
      systemLogger.error(error);
      throw error;
    }
  }

  public async getUserWallet(
    customerId: string
  ): Promise<AxiosResponse<{ status: boolean; wallet: WalletDetails }>> {
    try {
      const response = await this.axios.get(
        `/wallet/customer?customerId=${customerId}`
      );

      return response;
    } catch (error) {
      console.log(error, "this is the error from the wallet");
      systemLogger.error(error);
      throw error;
    }
  }

  public async getWalletBalance(walletId: string): Promise<
    AxiosResponse<{
      status: boolean;
      balance: {
        balance: number;
        availableBalance: number;
        ledgerBalance: number;
        holdBalance: number;
        currency: string;
      };
    }>
  > {
    try {
      const response = await this.axios.get(`/wallet/${walletId}/balance`);
      return response;
    } catch (error) {
      console.log(error, "this is the error from getting wallet balance");
      systemLogger.error(error);
      throw error;
    }
  }
}

export default TagPayWalletApi;
