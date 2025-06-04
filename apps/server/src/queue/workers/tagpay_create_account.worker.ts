import { MetricsTime, Worker, Job } from "bullmq";
import { connection, QueueRegistry } from "../queue-registry";
import { systemLogger } from "utils/logger";
import { CreateWalletType } from "providers/tagpay/tagpay-types";
import db from "db/connectDb";
import { setup } from "db/schema/setup.model";
import { eq } from "drizzle-orm";
import { RootModule } from "services";



const TagPay_CreateAccountWorker = (root:RootModule) => {


    const worker =  new Worker(
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


                const createWalletResponse = await root.wallet.services.createWalletService(payload, userId)

                console.log(createWalletResponse, "this is the create wallet response")

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

    worker.on("completed", async (job: Job) => {
        console.log(`Job ${job.id} completed!`);

        const data = job.returnvalue

        console.log(data, "this is the return value of the data")

        await db.update(setup).set({ is_account_created: true }).where(eq(setup.user_id, data.user_id)).execute();

    });


    worker.on("failed", (job, error) => {
        if (job) {
            console.error(`Job ${job.id} failed with error: ${error.message}`);
        } else {
            console.error(`A job failed with error: ${error.message}`);
        }
    });

    worker.on("error", (error: any) => {
        console.error(`Worker error: ${error.message}`);
    });

    return worker

}





export default TagPay_CreateAccountWorker