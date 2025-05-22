import { user } from "../../db/schema/user.model";
import db from "../../db/connectDb";
import { eq } from "drizzle-orm";
import { BadRequestException } from "../../utils/error";
import { ErrorCode } from "../../enum/errorCode.enum";
import { setup } from "db/schema/setup.model";
import { systemLogger } from "utils/logger";

type UserType = typeof user.$inferInsert
class UserServices {

    public async getUser(userId: string) {

        const [userRecord] = await db
            .select()
            .from(user)
            .where(eq(user.id, userId))
            .leftJoin(setup, eq(setup.user_id, userId));

        return {
            user:userRecord.user,
            setup:userRecord.setup
        }

    }

    public async updateUser(fields: Partial<Record<keyof UserType, any>>, userId: string): Promise<{ success: true }> {
        if (!userId) {
            throw new BadRequestException("User ID is required", ErrorCode.BAD_REQUEST);
        }

        if (!fields || Object.keys(fields).length === 0) {
            throw new BadRequestException("No fields provided for update", ErrorCode.BAD_REQUEST);
        }

        // Define sensitive fields that cannot be updated
        const sensitiveFields = ["passcode",  "secure_pin", "refresh_token", "id",  "phone_number"];

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

}

const userServices = new UserServices();

export default userServices