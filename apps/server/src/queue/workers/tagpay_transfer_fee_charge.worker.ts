import {MetricsTime, Worker,Job} from "bullmq";
import {connection, QueueRegistry} from "../queue-registry";
import { RootModule } from "services";


const TagPay_TransferFeeChargeWorker = (root:RootModule) => {

   const worker =  new Worker(
        QueueRegistry.create_transfer_fee_charge,
        async (job: Job) => {
            console.log("Processing job:", job.id);
            // Your job processing logic here
            // For example, you can access job.data and perform the necessary operations
            // await processJob(job.data);
            console.log("Job processed successfully:", job.id);
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


    worker.on("completed", (job: Job) => {
        console.log(`Job ${job.id} completed!`);
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


export default TagPay_TransferFeeChargeWorker;