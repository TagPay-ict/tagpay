import { user } from "../../db/schema/user.model";
import db from "../../db/connectDb";
import { eq, ilike } from "drizzle-orm";
import { BadRequestException } from "../../utils/error";
import { ErrorCode } from "../../enum/errorCode.enum";
import { setup } from "db/schema/setup.model";
import { systemLogger } from "utils/logger";
import redis from "config/redis.config";
import { wallet } from "db/schema/wallet.model";

type UserType = typeof user.$inferInsert
class UserServices {

    public async getUser(userId: string) {

        const userRecord = await db.query.user.findFirst({
            where: eq(user.id, userId),
            with: {
                setup: true
            }
        })

        console.log(userRecord, "this is the user reord")

        return userRecord

    }

    public async updateUser(fields: Partial<Record<keyof UserType, any>>, userId: string): Promise<{ success: true }> {
        if (!userId) {
            throw new BadRequestException("User ID is required", ErrorCode.BAD_REQUEST);
        }

        if (!fields || Object.keys(fields).length === 0) {
            throw new BadRequestException("No fields provided for update", ErrorCode.BAD_REQUEST);
        }

        // Define sensitive fields that cannot be updated
        const sensitiveFields = ["passcode", "secure_pin", "refresh_token", "id", "phone_number"];

        // Check if any sensitive fields are being updated
        const attemptedSensitiveUpdates = Object.keys(fields).filter((field) => sensitiveFields.includes(field));
        if (attemptedSensitiveUpdates.length > 0) {
            throw new BadRequestException(
                `Cannot update sensitive fields: ${attemptedSensitiveUpdates.join(", ")}`,
                ErrorCode.AUTH_UNAUTHORIZED_ACCESS
            );
        }

        try {
            // Perform the update
            const [existingUser] = await db.select().from(user).where(eq(user.id, userId));
            if (!existingUser) {
                throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
            }

            await db.transaction(async (tx) => {
                await tx.update(user).set(fields).where(eq(user.id, userId));
            });

            systemLogger.info(`User ${userId} successfully updated`);
            return { success: true };
        } catch (error) {
            systemLogger.error(`Error updating user ${userId}: ${error}`);
            throw new BadRequestException("Failed to update user", ErrorCode.BAD_REQUEST);
        }
    }

    public async getUsersByTag(search: string) {
        const searchKey = `tag_search:${search}`;

        // Check 
        const cached = await redis.get(searchKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const results = await db
            .select({ id: user.id, tag: user.tag, full_name: user.full_name, first_name: user.first_name, last_name: user.last_name, account_name: wallet.account_name, account_number: wallet.account_number ,bank_name:wallet.bank_name})
            .from(user)
            .where(ilike(user.tag, `${search}%`))
            .leftJoin(wallet, eq(wallet.user_id, user.id));


        console.log(results, "these are the results from the search")


        await redis.set(searchKey, JSON.stringify(results), "EX", 30);

        return results;
    }

}

const userServices = new UserServices();

export default userServices