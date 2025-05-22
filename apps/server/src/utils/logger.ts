import { format, loggers, transports } from "winston";
import "winston-daily-rotate-file";
import morgan from "morgan"
import { Request, Response } from "express";
import config from "../config/app.config";

interface LogData {
    method: string | undefined;
    url: string | undefined;
    agent: string | undefined;
    remoteAddress: string | undefined;
    status: number;
    contentLength: string | undefined;
    responseTime: number;
}


const { combine, timestamp, colorize, json, printf, prettyPrint } = format;


const commonFormat = combine(
    colorize({ all: true }),
    timestamp({ format: "YYYY-MM_DD hh:mm:ss.SSS A" }),
    prettyPrint(),
    printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);

const errorFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${message}\n${stack || ""}`;
});

const fileRotateTransport = new transports.DailyRotateFile({
    dirname: "logs",
    filename: 'combined.log',
    datePattern: 'YYYY-MM-DD-HH',
    maxFiles: "2d",
    maxSize: "20m",

});
loggers.add("HttpLogger", {
    level: "http",
    format: commonFormat,
    transports: [
        fileRotateTransport,
        new transports.Console(),
        new transports.File({ dirname: "logs", filename: "error.log", level: "error", format: errorFormat }),
        new transports.File({ dirname: "logs", filename: "info.log", level: "info", format: json() }),
    ],
    exceptionHandlers: [
        new transports.File({ dirname: "logs", filename: "exceptions.log" }),
    ],
    rejectionHandlers: [
        new transports.File({ dirname: "logs", filename: "rejections.log" }),
    ],
});

// Debug/System Logger
loggers.add("Logger", {
    level: config.NODE_ENV === "development" ? "debug" : "info",
    format: commonFormat,
    transports: [
        new transports.Console(),
        new transports.File({ dirname: "logs", filename: "system-debug.log" }),
    ],
});


export const httpLogger = loggers.get("HttpLogger");
export const systemLogger = loggers.get("Logger");

export const morganMiddleware = morgan(
    function (tokens, req: Request, res: Response) {
        const logObject: LogData = {
            method: tokens.method(req, res),
            url: tokens.url(req, res),
            agent: tokens["user-agent"](req, res),
            remoteAddress: tokens["remote-addr"](req, res),
            status: parseFloat(tokens.status(req, res) || "0"),
            contentLength: tokens.res(req, res, "content-length"),
            responseTime: parseFloat(tokens["response-time"](req, res) || "0"),
        };

        return JSON.stringify(logObject);
    },
    {
        stream: {
            write: (message: string) => {
                try {
                    const data = JSON.parse(message);
                    httpLogger.http("incoming-request", data);
                } catch (error) {
                    systemLogger.error("Failed to parse log message", { error, message });
                }
            },
        },
    }
);