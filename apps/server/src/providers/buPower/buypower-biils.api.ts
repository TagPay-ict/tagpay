import { response } from "express";
import { BuyPowerBase } from "./buypower-base";
import { BadRequestException } from "utils/error";
import { CreateVTUType } from "./buypower-types";





class BuyPowerBillsApi extends BuyPowerBase {


    constructor() {
        super()
    }


    public async createBillPayment(data:CreateVTUType ){
        try {

            const response = await this.axios.post("/bills", JSON.stringify(data));

            return response 
            
        } catch (error) {
            console.log(response, "thi is the error from the bill")
            throw new BadRequestException("Airtime Purchase failde")
        }
    }

}


const buyPowerBillsApi = new BuyPowerBillsApi();
export default buyPowerBillsApi;