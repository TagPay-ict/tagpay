import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";
import { Worker } from "bullmq";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workersPath = path.resolve(__dirname, "workers"); // ensure clean resolution
console.log("Workers Path:", workersPath);

const workers: Array<Worker> = [];


(async () => {
    try {
        const files = await fs.readdir(workersPath);

        for (const file of files) {
            if (file.endsWith(".worker.ts") || file.endsWith(".worker.js")) {
                const workerPath = path.join(workersPath, file);
                const workerUrl = pathToFileURL(workerPath).href;

                console.log(`Loading worker: ${file}`);

                try {
                    const module = await import(workerUrl);
                    const workerInstances = module.default
                        ? [module.default]
                        : Object.values(module);

                    workerInstances.forEach((worker) => {
                        if (worker) {
                            worker.run()
                            workers.push(worker);
                            console.log(`Worker from ${file} is running.`);
                        } else {
                            console.warn(`No valid worker found in ${file}.`);
                        }
                    });
                } catch (error) {
                    console.error(`Failed to load worker ${file}:`, error);
                }
            }
        }

        console.log(`${workers.length} workers initialized.`);
    } catch (error) {
        console.error("Failed to load workers:", error);
    }
})();

console.log(workers)
