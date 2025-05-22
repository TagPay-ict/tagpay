import {Queue} from "bullmq";
import { connection, QueueRegistry } from './queue-registry';


interface ChargeTransferFeeType {
    wallet_id:string;
    user_id:string;
    fee:number;
}


export interface CreateAccountQueueType {
    firstName:string,
    lastName:string,
    dateOfBorth: string,
    email:string,
    address:string,
    phoneNumber: string,
    bvn:string,
    tier:string,
    userId:string
}

const options = {
    connection:  connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 50000,
        },
        removeOnComplete: 24 * 3600,
        removeOnFail: {
            age: 24 * 3600,
        },
    },
}

export const TagPay_ChargeTransferFeeQueue = new Queue<ChargeTransferFeeType>(QueueRegistry.create_transfer_fee_charge, options)
export const TagPay_CreateAccountQueue = new Queue<CreateAccountQueueType>(QueueRegistry.create_transfer_fee_charge, options)