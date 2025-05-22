import {TagPayBaseClass} from "./tagpay-base";
import {NipTransferType} from "../../services/transfer/transfer.types";
import {systemLogger} from "../../utils/logger";

class TagPayTransferApi  extends  TagPayBaseClass{

    constructor() {
        super();
    }

    public async nipTransfer (data:NipTransferType)  {

        try {

            const response  = await this.axios.post("/transfer/bank/customer", JSON.stringify(data) );

            return response


        }catch ( error) {
            console.log(error, "this is the error from the transfer")
            systemLogger.error(error as string, "this is the error from the transfer")
            throw error
        }

    }
}


export default TagPayTransferApi;