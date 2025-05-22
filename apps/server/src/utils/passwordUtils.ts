import bcrypt from "bcrypt";
import Cryptr from "cryptr";
import config from "../config/app.config";

export class PasswordUtils {
    private static readonly saltRounds: number = 10;
    private static cryptr = new Cryptr(config.ENCRYPTION_SECRET)

    /**
     * Hashes a password.
     * @param password - The plain text password to hash.
     * @returns A promise that resolves to the hashed password.
     */
    static async hashPassword(password: string): Promise<string> {
        if (!password) {
            throw new Error("Password cannot be empty");
        }
        const salt = await bcrypt.genSalt(this.saltRounds);
        return bcrypt.hash(password, salt);
    }

    /**
     * Compares a plain text password with a hashed password.
     * @param password - The plain text password.
     * @param hash - The hashed password to compare with.
     * @returns A promise that resolves to true if the passwords match, otherwise false.
     */
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        if (!password || !hash) {
            throw new Error("Password and hash are required");
        }
        return bcrypt.compare(password, hash);
    }

    /**
     * Encrypts a secret using Cryptr.
     * @param secret - The plain text secret to encrypt.
     * @returns The encrypted secret.
     */
    static encryptCryptr(secret: string): string {
        if (!secret) {
            throw new Error("Secret cannot be empty");
        }
        return this.cryptr.encrypt(secret);
    }

    /**
     * Decrypts an encrypted secret using Cryptr.
     * @param encryptedSecret - The encrypted secret to decrypt.
     * @returns The decrypted plain text secret.
     */
    static decryptCryptr(encryptedSecret: string): string {
        if (!encryptedSecret) {
            throw new Error("Encrypted secret cannot be empty");
        }
        return this.cryptr.decrypt(encryptedSecret);
    }

    /**
     * Generates a salt.
     * @param rounds - Optional number of salt rounds; defaults to the class's saltRounds.
     * @returns A promise that resolves to the generated salt.
     */
    static async generateSalt(rounds: number = this.saltRounds): Promise<string> {
        return bcrypt.genSalt(rounds);
    }

}



