import { systemLogger } from "utils/logger";
import { TagPayBaseClass } from "./tagpay-base";
import { AxiosResponse } from "axios";
import { CustomerDetailsType } from "./tagpay-types";

class TagPayCustomerApi extends TagPayBaseClass {

    constructor() {
        super()
    }

    public async getCustomerData(customerId: string):Promise<AxiosResponse<{status:boolean, customer:CustomerDetailsType}>> {

        try {

            const response = await this.axios.get(`/customer/${customerId}`)
            return response

        } catch (error) {
            systemLogger.error(error)
            throw error
        }

    }

}

export default TagPayCustomerApi