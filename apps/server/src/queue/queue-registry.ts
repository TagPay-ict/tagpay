import config from "../config/app.config";
import Redis from "ioredis";

export enum QueueRegistry {
    create_transfer_fee_charge = "create_transfer_fee_charge",
    create_tagpay_account = "create_tagpay_account"
}

export const connection = new Redis(config.REDIS_URL, {maxRetriesPerRequest: null})