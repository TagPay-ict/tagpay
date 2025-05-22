import { ErrorCode } from "../enum/errorCode.enum";
import { HTTPSTATUS, HttpStatusCode } from "../config/statusCode.config";

export default class GlobalError extends Error {

    public statusCode: HttpStatusCode;
    public errorCode?: ErrorCode;

    constructor(message: string, statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode?: ErrorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;

        Error.captureStackTrace(this, this.constructor);

    }

}


export class NotFoundException extends GlobalError {
    constructor(message = "Resource not found", errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.NOT_FOUND,
            errorCode || ErrorCode.RESOURCE_NOT_FOUND
        );
    }
}

export class BadRequestException extends GlobalError {
    constructor(message = "Bad Request", errorCode?: ErrorCode) {
        super(message, HTTPSTATUS.BAD_REQUEST, errorCode || ErrorCode.BAD_REQUEST);
    }
}

export class UnauthorizedException extends GlobalError {
    constructor(message = "Unauthorized Access", errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.UNAUTHORIZED,
            errorCode || ErrorCode.ACCESS_UNAUTHORIZED
        );
    }
}


export class InternalServerException extends GlobalError {
    constructor(message = "Internal Server Error", errorCode?: ErrorCode) {
        super(
            message,
            HTTPSTATUS.INTERNAL_SERVER_ERROR,
            errorCode || ErrorCode.INTERNAL_SERVER_ERROR
        );
    }
}

export class HttpException extends GlobalError {
    constructor(
        message = "Http Exception Error",
        statusCode: HttpStatusCode,
        errorCode?: ErrorCode
    ) {
        super(message, statusCode, errorCode);
    }
}
