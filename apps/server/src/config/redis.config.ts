import Redis, { Redis as RedisClient, RedisOptions } from "ioredis";
import chalk from "chalk";
import config from "./app.config";
import { systemLogger } from "../utils/logger";
import { InternalServerException } from "../utils/error";
import { ErrorCode } from "../enum/errorCode.enum";

const redisConfig: string | RedisOptions | null =
    config.NODE_ENV === "development"
        ? config.REDIS_URL
        : config.REDIS_URL ?? null;

const redis: RedisClient = redisConfig
    ? new Redis(redisConfig as string)
    : new Redis();

redis.on("error", (error: Error) => {
    systemLogger.error(`Redis error: ${error.message}`, error);
    throw new InternalServerException(
        "Redis client failed to start",
        ErrorCode.INTERNAL_SERVER_ERROR
    );
});

redis.on("ready", () => {
    console.log(chalk.bgCyan.bold("Redis client is ready. Server has started."));
});

redis.on("connect", () => {
    console.log(chalk.bgMagentaBright.bold("Redis connection established."));
});

export default redis;
