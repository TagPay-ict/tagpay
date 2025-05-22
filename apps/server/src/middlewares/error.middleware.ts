import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import config from "../config/app.config";
import GlobalError from "../utils/error";
import { HTTPSTATUS } from "../config/statusCode.config";
import { systemLogger } from "../utils/logger";


const errorHandler: ErrorRequestHandler = (error, req, res, next) => {

    const isDevelopment = config.NODE_ENV === "development";

    const response: {
        success: boolean;
        message: string;
        details?: any;
        stack?: string;
    } = {
        success: false,
        message: "Something went wrong",
    };

    // Handle custom application errors
    if (error instanceof GlobalError) {
        response.message = error.message;
        res.status(error.statusCode).json(response);
        return;
    }

    if (error instanceof ZodError) {
        response.message = "Validation error";
        response.details = error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
        }));
        response.stack = error.stack
        res.status(HTTPSTATUS.BAD_REQUEST).json(response);
        return;
    }

    if (error instanceof SyntaxError && "body" in error) {
        response.message = "Invalid JSON payload";
        response.details = error.message;
        res.status(HTTPSTATUS.BAD_REQUEST).json(response);
        return;
    }

    if (isDevelopment) {
        response.message = error.message || "Internal server error";
        response.stack = error.stack;
    } else {
        response.message = "Internal server error";
    }

    console.error(error);
    systemLogger.error(error);

    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json(response);

    next()

}

export default errorHandler;