import axios from "axios"
import config from "../../config/app.config";


const axiosInstance = axios.create({
    baseURL: config.TAGPAY_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${config.TAGPAY_API_KEY}`
    },
});


interface GetAccountNumberData {
    account_number: string;
}

export  class TagPayBaseClass {
    protected readonly axios = axiosInstance;

     constructor() { }

     public async getAccountNumber(data: GetAccountNumberData) { }
}