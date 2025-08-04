import { AxiosResponse } from "axios";
import { TagPayBaseClass } from "./tagpay-base";
import { TagPayTransactionType, TransactionDetails } from "./tagpay-types";
import { systemLogger } from "utils/logger";




class TagPayTransactionApi extends TagPayBaseClass {

    constructor() {
        super()
    }

    public async fetchUserTransactionsData(customerId: string, type?: TagPayTransactionType): Promise<AxiosResponse<{ status: boolean, transactions: TransactionDetails[] }>> {
        try {
            const params: { customerId: string; type?: TagPayTransactionType } = { customerId };
            if (type !== undefined) {
                params.type = type;
            }

            const response = await this.axios.get('/transaction/customer', { params });
            return response;
        } catch (error) {
            systemLogger.error(error);
            throw error;
        }
    }

}


export default TagPayTransactionApi