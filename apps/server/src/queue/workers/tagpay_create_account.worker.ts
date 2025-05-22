import { MetricsTime, Worker, Job } from "bullmq";
import { connection, QueueRegistry } from "../queue-registry";
import { systemLogger } from "utils/logger";
import TagPay from "providers/tagpay/tagpay-modules";
import { CreateWalletType } from "providers/tagpay/tagpay-types";
import db from "db/connectDb";
import { wallet } from "db/schema/wallet.model";
import { user } from "db/schema/user.model";
import { setup } from "db/schema/setup.model";
import walletService from "services/wallet/wallet.services";


type WalletType = typeof wallet.$inferInsert

const TagPay_CreateAccountWorker = new Worker(
    QueueRegistry.create_tagpay_account,
    async (job: Job) => {


        try {

            const { firstName, lastName, dateOfBirth, email, address, phoneNumber, tier, bvn, userId } = job.data;


            const payload: CreateWalletType = {
                firstName,
                address,
                lastName,
                dateOfBirth,
                email,
                phoneNumber,
                tier,
                bvn,
            }

    
            const createWalletResponse = await walletService.createWalletService(payload, userId)

            return createWalletResponse


        } catch (error) {
            systemLogger.error(`Job ${job.id} failed: ${error}`);
            throw error;
        }


    },
    {
        connection: connection,
        metrics: {
            maxDataPoints: MetricsTime.ONE_WEEK * 2,
        },
        removeOnComplete: {
            age: 60,
        },
        autorun: false,
    }
)


TagPay_CreateAccountWorker.on("completed", (job: Job) => {
    console.log(`Job ${job.id} completed!`);
    

});


TagPay_CreateAccountWorker.on("failed", (job, error) => {
    if (job) {
        console.error(`Job ${job.id} failed with error: ${error.message}`);
    } else {
        console.error(`A job failed with error: ${error.message}`);
    }
});

TagPay_CreateAccountWorker.on("error", (error: any) => {
    console.error(`Worker error: ${error.message}`);
});


export default TagPay_CreateAccountWorker