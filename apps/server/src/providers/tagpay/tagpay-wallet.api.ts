import {TagPayBaseClass} from "./tagpay-base";
import {CreateWalletType} from "./tagpay-types";
import {systemLogger} from "../../utils/logger";




class TagPayWalletApi extends TagPayBaseClass {

    constructor() {
        super()
    }


    public async createUserWallet (data:CreateWalletType)  {

        try{

            const response = await this.axios.post("/wallet", JSON.stringify(data));

            return response

        }catch(error){
            console.log(error, "this is the error from the wallet")
            systemLogger.error(error)
        }


}

}

export default TagPayWalletApi;