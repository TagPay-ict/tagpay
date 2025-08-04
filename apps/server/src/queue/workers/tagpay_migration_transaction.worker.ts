import { MetricsTime, Worker, Job } from "bullmq";
import { connection, QueueRegistry } from "../queue-registry";
import { systemLogger } from "utils/logger";
import { RootModule } from "services/root";
import TagPay from "providers/tagpay/tagpay-modules";



const TagPay_MigrationTransactionWorker = (root:RootModule) => {


    const worker = new Worker(
        QueueRegistry.migrate_transaction,
        async (job:Job) => {

            try {

                const {customerId} = job.data


                const userTransactionsData = await TagPay.transaction.fetchUserTransactionsData(customerId)


                


                
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






export default TagPay_MigrationTransactionWorker