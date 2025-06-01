import { RegisterUserType } from "./auth.types";
import { BadRequestException } from "../../utils/error";
import db from "../../db/connectDb";
import { user } from "../../db/schema/user.model";
import { eq, exists } from "drizzle-orm"
import { ErrorCode } from "../../enum/errorCode.enum";
import { generateRef } from "../../utils/generateRef";
import cache from "../../config/node-cache";
import termiiServices from "../../providers/termii/termii-services";
import { systemLogger } from "../../utils/logger";
import { SENDER_ID } from "../../providers/termii/termii-base";
import config from "../../config/app.config"
import { AccessTokenSignOptions, AudienceType, jwtUtility, RefreshTokenSignOptions, TokenPayload } from "../../utils/jwt";
import { session } from "../../db/schema/session.model";
import { PasswordUtils } from "../../utils/passwordUtils";
import { setup } from "db/schema/setup.model";
import { sendOtp } from "utils/sendOtp";


type UserType = typeof user.$inferSelect
class AuthService {


    private  RETRY_KEY = `passcode_attempts_`;



    public async registerUser(userdata: RegisterUserType): Promise<void> {

        const { phoneNumber } = userdata

        return await db.transaction(async (tx) => {

            const userExistsQuery = db.select().from(user).where(eq(user.phone_number, phoneNumber));
            const userExists = await tx.select().from(user).where(exists(userExistsQuery)).execute();

            if (userExists.length > 0) {
                throw new BadRequestException("User already exists", ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
            }

         
            await sendOtp(phoneNumber)

        })
    }


    public async loginUser(userdata: RegisterUserType): Promise<void> {

        const { phoneNumber } = userdata

        return await db.transaction(async (tx) => {

            const userExistsQuery = db.select().from(user).where(eq(user.phone_number, phoneNumber));
            const userExists = await tx.select().from(user).where(exists(userExistsQuery)).execute();

            if (userExists.length === 0) {
                throw new BadRequestException("User account does not exists", ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
            }

            await sendOtp(phoneNumber)


        })
    }


    public async resendToken(phoneNumber:string) {

       await sendOtp(phoneNumber)

    }


    public async verifyPhoneNumber(phoneNumber: string, otp: string): Promise<{ verified: true }> {
        if (!otp) {
            throw new BadRequestException("Verification code is required", ErrorCode.BAD_REQUEST);
        }

        const value = cache.take(phoneNumber);
        if (!value || value !== otp) {
            systemLogger.error(`Invalid or expired OTP for ${phoneNumber}`);
            throw new BadRequestException("Invalid or Expired OTP", ErrorCode.AUTH_INVALID_TOKEN);
        }

        systemLogger.info(`OTP verified successfully for ${phoneNumber}`);
        return { verified: true };
    }


    public async createUser(phoneNumber: string): Promise<{ accessToken: string, refreshToken: string }> {
        return await db.transaction(async (tx) => {

            const [newUser] = await tx.insert(user).values({ phone_number: phoneNumber }).returning({
                id: user.id,
            });

            const refreshTokenExpiresInSeconds = typeof RefreshTokenSignOptions.expiresIn === "number"
                ? RefreshTokenSignOptions.expiresIn
                : 4 * 60 * 60; // fallback to 4 hours if not set as number

            const [sessionId] = await tx.insert(session).values({
                user_id: newUser.id,
                expires_at: new Date(Date.now() + refreshTokenExpiresInSeconds * 1000)
            }).returning({ id: session.id });

            const tokenPayload: TokenPayload = {
                user_id: newUser.id,
                aud: AudienceType.MobileApp,
                session_id: sessionId.id,
            };

            const accessToken = jwtUtility.signToken('access', tokenPayload, AccessTokenSignOptions);
            const refreshToken = jwtUtility.signToken('refresh', tokenPayload, RefreshTokenSignOptions);

            await tx.update(user).set({ refresh_token: [refreshToken] }).where(eq(user.id, newUser.id));
            await tx.insert(setup).values({ is_phone_verified: true, user_id: newUser.id });

            return {
                accessToken,
                refreshToken,
            };
        });
    }


    public async loginWithPhone(phoneNumber: string): Promise<{ accessToken: string, refreshToken: string }> {
        return await db.transaction(async (tx) => {
            const [existingUser] = await tx.select().from(user).where(eq(user.phone_number, phoneNumber));

            if (!existingUser) {
                throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
            }

            const incomingRefreshTokens = existingUser.refresh_token || [];


            const reusedTokenDetected = incomingRefreshTokens.some(token => {
                try {

                    const decoded = jwtUtility.decodeToken(token)

                    const verifiedToken = jwtUtility.verifyRefreshToken(token, { audience: AudienceType.MobileApp, subject: existingUser.id, issuer: decoded?.iss as string });
                    return verifiedToken?.user_id !== existingUser.id; // foreign token
                } catch {
                    return false; 
                }
            });

            if (reusedTokenDetected) {
                systemLogger.warn(`Refresh token reuse suspected for user: ${existingUser.id}`);
                await tx.update(user).set({ refresh_token: [] }).where(eq(user.id, existingUser.id));
            }

            const refreshTokenExpiresInSeconds = typeof RefreshTokenSignOptions.expiresIn === "number"
                ? RefreshTokenSignOptions.expiresIn
                : 4 * 60 * 60; // fallback to 4 hours if not set as number

            const [sessionId] = await tx.insert(session).values({
                user_id: existingUser.id,
                expires_at: new Date(Date.now() + refreshTokenExpiresInSeconds * 1000)
            }).returning({ id: session.id });

            const tokenPayload: TokenPayload = {
                user_id: existingUser.id,
                aud: AudienceType.MobileApp,
                session_id: sessionId.id,
            };

            const accessToken = jwtUtility.signToken('access', tokenPayload, AccessTokenSignOptions);
            const newRefreshToken = jwtUtility.signToken('refresh', tokenPayload, RefreshTokenSignOptions);

            const validRefreshTokens = incomingRefreshTokens.filter(token => {
                try {
                    const decoded = jwtUtility.decodeToken(token)

                    jwtUtility.verifyRefreshToken(token, { audience: AudienceType.MobileApp, subject: existingUser.id, issuer: decoded?.iss as string }); return true;
                } catch {
                    return false;
                }
            });

            const updatedRefreshTokens = [...validRefreshTokens.slice(-4), newRefreshToken]; // keep latest 4
            await tx.update(user).set({ refresh_token: updatedRefreshTokens }).where(eq(user.id, existingUser.id));

            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        });
    }


    public async verifyPasscode(passcode: string, userId: string): Promise<{ number_of_attempts: number; has_exceeded_attempts: boolean } | void> {

        console.log(passcode)

        const MAX_ATTEMPTS = 3;
        const RETRY_KEY_FULL = `${this.RETRY_KEY}${userId}`

        if (!passcode) {
            throw new BadRequestException("Passcode is required", ErrorCode.BAD_REQUEST);
        }

        const [existingUser] = await db.select().from(user).where(eq(user.id, userId));

        if (!existingUser) {
            throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
        }

        // if (!existingUser.passcode) {
        //     throw new BadRequestException("Passcode not set for this user", ErrorCode.AUTH_INVALID_TOKEN);
        // }

        const attempts = cache.get<number>(RETRY_KEY_FULL) || 0;

        const hasExceeded = attempts >= MAX_ATTEMPTS

        if (hasExceeded) {
            await db.transaction(async (tx) => {
                await tx.update(user).set({ is_flagged: true }).where(eq(user.id, userId));
            });
            systemLogger.error(`User ${userId} account flagged due to too many failed passcode attempts.`);

            return {
                number_of_attempts: attempts,
                has_exceeded_attempts: hasExceeded
            }

        }

        const isPasscodeValid = await PasswordUtils.comparePassword(passcode, existingUser.passcode as string);

        if (!isPasscodeValid) {
            cache.set(RETRY_KEY_FULL, attempts + 1, 60 * 60);
            systemLogger.error(`Passcode verification failed for user ${userId}. Attempt ${attempts + 1} of ${MAX_ATTEMPTS}.`);
            throw new BadRequestException("Invalid passcode", ErrorCode.AUTH_INVALID_TOKEN);
        }

        cache.del(RETRY_KEY_FULL);

        systemLogger.info(`Passcode successfully verified for user ${userId}`);
    }

    public async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        if (!refreshToken) {
            throw new BadRequestException("Refresh token is required", ErrorCode.BAD_REQUEST);
        }

        try {
            const decoded = jwtUtility.decodeToken(refreshToken);

            const decodedToken = jwtUtility.verifyRefreshToken(refreshToken, {
                audience: AudienceType.MobileApp,
                subject: decoded?.sub as string,
                issuer: decoded?.iss as string
            }) as TokenPayload;

            if (!decodedToken || !decodedToken.user_id || !decodedToken.session_id) {
                throw new BadRequestException("Invalid refresh token", ErrorCode.AUTH_INVALID_TOKEN);
            }

            const [existingUser] = await db.select().from(user).where(eq(user.id, decodedToken.user_id));
            if (!existingUser) {
                throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
            }

            const [existingSession] = await db
                .select()
                .from(session)
                .where(eq(session.id, decodedToken.session_id as string));

            if (!existingSession) {
                throw new BadRequestException("Session not found", ErrorCode.AUTH_NOT_FOUND);
            }

            // ✅ Check session expiration
            const now = new Date();
            if (existingSession.expires_at && new Date(existingSession.expires_at) <= now) {
                systemLogger.warn(`Session ${existingSession.id} has expired for user ${decodedToken.user_id}`);
                throw new BadRequestException("Session has expired", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);
            }

            // ✅ Check token reuse
            if (!existingUser.refresh_token || !existingUser.refresh_token.includes(refreshToken)) {
                systemLogger.error(`Potential token compromise detected for user ${decodedToken.user_id}`);
                throw new BadRequestException("Invalid or compromised refresh token", ErrorCode.AUTH_INVALID_TOKEN);
            }

            // ✅ Generate and rotate tokens
            const tokenPayload: TokenPayload = {
                user_id: existingUser.id,
                aud: AudienceType.MobileApp,
                session_id: existingSession.id,
            };

            const newAccessToken = jwtUtility.signToken('access', tokenPayload, AccessTokenSignOptions);
            const newRefreshToken = jwtUtility.signToken('refresh', tokenPayload, RefreshTokenSignOptions);

            await db.transaction(async (tx) => {
                const updatedRefreshTokens = (existingUser.refresh_token || []).filter((token) => token !== refreshToken);
                updatedRefreshTokens.push(newRefreshToken);

                await tx.update(user).set({ refresh_token: updatedRefreshTokens }).where(eq(user.id, existingUser.id));
            });

            systemLogger.info(`Refresh token successfully used for user ${decodedToken.user_id}`);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            systemLogger.error(`Error during refresh token process: ${error}`);
            throw new BadRequestException("Failed to refresh token", ErrorCode.AUTH_INVALID_TOKEN);
        }
    }

    public async logout(refreshToken: string): Promise<{ success: true }> {
        if (!refreshToken) {
            throw new BadRequestException("Refresh token is required", ErrorCode.BAD_REQUEST);
        }

        try {
            // Decode and verify the refresh token
            const decoded = jwtUtility.decodeToken(refreshToken);

            const decodedToken =  jwtUtility.verifyRefreshToken(refreshToken, {
                audience: AudienceType.MobileApp,
                subject: decoded?.sub as string,
                issuer: decoded?.iss as string
            }) as TokenPayload;;

            if (!decodedToken || !decodedToken.user_id || !decodedToken.session_id) {
                throw new BadRequestException("Invalid refresh token", ErrorCode.AUTH_INVALID_TOKEN);
            }

            const [existingUser] = await db.select().from(user).where(eq(user.id, decodedToken.user_id));
            if (!existingUser) {
                throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
            }

            const [existingSession] = await db
                .select()
                .from(session)
                .where(eq(session.id, decodedToken.session_id as string));

            if (!existingSession) {
                systemLogger.warn(`Session already removed for user ${decodedToken.user_id}`);
                // Still proceed to remove token from user's list
            }

            const RETRY_KEY_FULL = `${this.RETRY_KEY}${existingUser.id}`


            cache.del(RETRY_KEY_FULL);


            await db.transaction(async (tx) => {
                // Remove session
                if (existingSession) {
                    await tx.delete(session).where(eq(session.id, decodedToken.session_id as string));
                }

                // Remove the refresh token from user's list
                const updatedTokens = (existingUser.refresh_token || []).filter((t) => t !== refreshToken);

                await tx.update(user).set({ refresh_token: updatedTokens }).where(eq(user.id, existingUser.id));
            });

            systemLogger.info(`User ${decodedToken.user_id} successfully logged out and session ${decodedToken.session_id} terminated`);
            return { success: true };

        } catch (error) {
            systemLogger.error(`Logout error: ${error}`);
            throw new BadRequestException("Logout failed", ErrorCode.AUTH_INVALID_TOKEN);
        }
    }

    public async createPasscode(userId: string, passcode: string): Promise<void> {
        if (!passcode) {
            throw new BadRequestException("Passcode is required", ErrorCode.BAD_REQUEST);
        }

        const hashedPasscode = await PasswordUtils.hashPassword(passcode);

        try {
            await db.transaction(async (tx) => {

                const updatedRows = await tx
                    .update(user)
                    .set({ passcode: hashedPasscode, })
                    .where(eq(user.id, userId));

                if (updatedRows.rowCount === 0) {
                    throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
                }

                systemLogger.info(`Passcode successfully created for user ${userId}`);
            });
        } catch (error) {
            systemLogger.error(`Error creating passcode for user ${userId}: ${error}`);
            throw error;
        }
    }

}


const authServices = new AuthService()
export default authServices