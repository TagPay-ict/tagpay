import axios from "axios";
import config from "../../config/app.config";

const axiosInstance = axios.create({
    baseURL: config.BUYPOWER_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${config.BUYPOWER_API_KEY}`
    },
});

export abstract class BuyPowerBase {
    protected readonly axios = axiosInstance;

    protected constructor() { }
}

