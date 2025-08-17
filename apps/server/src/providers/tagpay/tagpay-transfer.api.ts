import { TagPayBaseClass } from "./tagpay-base";
import { NipTransferType } from "../../services/transfer/transfer.types";
import { systemLogger } from "../../utils/logger";
import { CustomerToCustomerType, WalletToWalletType } from "./tagpay-types";

class TagPayTransferApi extends TagPayBaseClass {
  constructor() {
    super();
  }

  public async nipTransfer(data: NipTransferType) {
    try {
      const response = await this.axios.post(
        "/transfer/bank/customer",
        JSON.stringify(data)
      );

      return response;
    } catch (error) {
      systemLogger.error(
        error as string,
        "this is the error from the transfer"
      );
      throw error;
    }
  }

  public async customerToCustomer(data: CustomerToCustomerType) {
    try {
      const response = await this.axios.post(
        "/transfer/wallet",
        JSON.stringify(data)
      );

      return response;
    } catch (error) {
      console.log(error, "this is the error from the transfer");
      systemLogger.error(
        error as string,
        "this is the error from the transfer"
      );
      throw error;
    }
  }

  public async walletToWallet(data: WalletToWalletType) {
    try {
      const response = await this.axios.post(
        "/transfer/wallet-to-wallet",
        JSON.stringify(data)
      );

      return response;
    } catch (error: any) {
      console.log(error?.response.data, "this is the error from the transfer");
      systemLogger.error(
        error?.response.data.message as string,
        "this is the error from the transfer"
      );
      throw error?.response.data;
    }
  }

  public async getBankList() {
    try {
      const response = await this.axios.get("/transfer/banks");

      return response;
    } catch (error: any) {
      systemLogger.error(
        error?.response.data.message as string,
        "this is the error from the bank list"
      );
      throw error?.response.data;
    }
  }

  public async resolveAccount(sortCode: string, accountNumber: string) {
    try {
      const response = await this.axios.get(
        `/transfer/account/details?sortCode=${sortCode}&accountNumber=${accountNumber}`
      );

      return response;
    } catch (error: any) {
      systemLogger.error(
        error?.response.data.message as string,
        "this is the error from the transfer"
      );
      throw error?.response.data;
    }
  }
}

export default TagPayTransferApi;
