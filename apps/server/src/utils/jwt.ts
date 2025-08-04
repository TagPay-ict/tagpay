import jwt, { JwtPayload, SignOptions, } from 'jsonwebtoken';
import ms from "ms";
import config from '../config/app.config';
import { BadRequestException, UnauthorizedException } from './error';
import { ErrorCode } from '../enum/errorCode.enum';

export interface TokenPayload {
    user_id: string;
    role?: string;
    aud: string;
    session_id: string | number;
}

interface JWTConfig {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    issuer: string;
}

export enum AudienceType {
    Web = "web",
    MobileApp = "mobileApp",
    AuthorizedServer = "authorizedServer"
}



export const AccessTokenSignOptions: SignOptions = {
    expiresIn: 4 * 60 * 60, 
};

export const RefreshTokenSignOptions: SignOptions = {
    // expiresIn: ms(config.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue),
    expiresIn: 7 * 60 * 60, // 3 hours in seconds
};

console.log(AccessTokenSignOptions.expiresIn, "this is the access token exxpiratio")

class JWTUtility {
    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly issuer: string;


    constructor(config: JWTConfig) {
        this.accessTokenSecret = config.accessTokenSecret;
        this.refreshTokenSecret = config.refreshTokenSecret;
        this.issuer = config.issuer
    }

    /**
     * Generate a JWT Token
     * @param type - Type of JWT to be generated, either "access" or "refresh"
     * @param payload - The payload to include in the token
     * @param options - Additional options for signing the token
     * @returns A signed JWT
     */
    public signToken(
        type: "access" | "refresh",
        payload: TokenPayload,
        options: SignOptions
    ): string {
        const secret = type === "access" ? this.accessTokenSecret : this.refreshTokenSecret;

        // Enforce required claims
        const baseClaims = {
            iss: this.issuer,
            sub: payload.user_id,
            aud: payload.aud,
        };

        const mergedPayload = { ...payload, ...baseClaims };

        return jwt.sign(mergedPayload, secret, { ...options });
    }

    /**
     * Verify and decode a JWT
     * @param token - token  The token to verify
     * @param secret - The secret to use for verification
     * @param options -
     * @returns Decoded token payload if valid
     * @throws Error if the token is invalid or expired
     */
    private verifyJwt<T>(
        token: string,
        secret: string,
        options: { audience: string; subject: string }
    ): T {
        try {
            const { audience, subject } = options || {};
            const decoded = jwt.verify(token, secret, {
                audience,
                issuer: this.issuer,
                subject,
            });
            return decoded as T;
        } catch (error) {
            throw new UnauthorizedException(error instanceof Error ? error.message : String(error), ErrorCode.VALIDATION_ERROR)
        }
    }


    /**
     * Verify and decode an Access Token
     * @param token - The token to verify
     * @param claims -
     * @returns Decoded token payload if valid
     */
    public verifyAccessToken(
        token: string,
        claims: { audience: string; subject: string }
    ): TokenPayload {
        return this.verifyJwt<TokenPayload>(token, this.accessTokenSecret, claims);
    }

    /**
     * Verify and decode a Refresh Token
     * @param token - The token to verify
     * @param claims - The Claims for the jwt
     * @returns Decoded token payload if valid
     */
    public verifyRefreshToken(
        token: string,
        claims: { audience: string; issuer: string; subject: string }
    ): TokenPayload {
        return this.verifyJwt<TokenPayload>(token, this.refreshTokenSecret, claims);
    }

    /**
     * Decode a token without verification (useful for extracting payload without validation)
     * @param token - The token to decode
     * @returns Decoded token payload or null if invalid
     */
    public decodeToken(token: string): JwtPayload | null {
        try {
            const decoded = jwt.decode(token);
            return decoded as JwtPayload;
        } catch {
            return null;
        }
    }
}



const jwtConfig: JWTConfig = {
    accessTokenSecret: config.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: config.REFRESH_TOKEN_SECRET,
    issuer: config.NODE_ENV === 'development' ? `http://localhost:${config.PORT}` : config.DOMAIN,
};

export const jwtUtility = new JWTUtility(jwtConfig);