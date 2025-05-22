import axios from "axios";
import config from "../../config/app.config";

const axiosInstance = axios.create({
    baseURL: config.TERMII_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

export abstract class TermiiBaseClass {
    protected readonly axios = axiosInstance;

    protected constructor() { }
}

export const SENDER_ID = "Soranix"
