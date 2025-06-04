import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";
import { Worker } from "bullmq";
import { RootModule } from "services";





export async function initializeWorkers(dependencies:RootModule) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const workersPath = path.resolve(__dirname, "workers");
    const workers: Array<Worker> = [];

    console.log("Workers Path:", workersPath);


    const files = await fs.readdir(workersPath);
    for (const file of files) {
        if (file.endsWith(".worker.ts") || file.endsWith(".worker.js")) {
            const workerPath = path.join(workersPath, file);
            const workerUrl = pathToFileURL(workerPath).href;

            try {

                const module = await import(workerUrl);
                if (typeof module.default === "function") {
                    const worker = module.default(dependencies);
                    worker.run()
                    workers.push(worker);
                }
                
            } catch (error) {
                console.error(`Failed to load worker ${file}:`, error);

            }

       
        }
    }

    console.log(workers.length, "workers running")
    return workers;
}