import {app, server} from "./app";
import dotenv from "dotenv"
import chalk from "chalk"
import { systemLogger } from "./utils/logger";

console.log("this is running ")

dotenv.config();
const PORT = process.env.PORT || 5000;

console.log(PORT, "this is the port")

server.listen(PORT, () => {
    console.log(
        `${chalk.green.bold("Connected")} Server tupac shakur running on ${chalk.yellow.bold(
            process.env.NODE_ENV
        )} on ${chalk.blue.bold(PORT)}`
    )
    console.log("this is running ")
    systemLogger.info(`Server running on ${PORT}`);
})


