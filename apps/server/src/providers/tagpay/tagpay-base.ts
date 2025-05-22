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


export abstract class TagPayBaseClass {
    protected readonly axios = axiosInstance;

    protected constructor() { }
}