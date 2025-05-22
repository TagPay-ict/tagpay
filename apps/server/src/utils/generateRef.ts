import crypto from 'crypto';
import GlobalError from './error';

/**
 * Generates a unique numeric reference with a given prefix and number of digits.
 * @param prefix - The prefix to add to the reference (optional for numeric-only mode).
 * @param digits - The number of digits for the reference number.
 * @param isNumericOnly - If true, the reference will consist of only numbers (no prefix).
 * @returns A unique alphanumeric or numeric reference.
 * @throws Error if `prefix` is not a string, `digits` is not a positive integer, or invalid input.
 */
export const generateRef = (
    prefix: string | undefined,
    digits: number,
    isNumericOnly: boolean = false
): string => {
    // Validate inputs
    if (prefix !== undefined && typeof prefix !== 'string') {
        throw new GlobalError('Prefix must be a string.');
    }

    if (!Number.isInteger(digits) || digits <= 0) {
        throw new GlobalError('Digits must be a positive integer.');
    }

    // Generate the maximum number based on the number of digits
    const maxNumber = Math.pow(10, digits) - 1;

    // Generate a random number within the specified range
    const randomNumber = crypto.randomInt(0, maxNumber + 1); // +1 to include maxNumber

    // If numeric-only mode, return a number as a string without the prefix
    if (isNumericOnly) {
        return randomNumber.toString().padStart(digits, '0');
    }

    // If not numeric-only, return the reference with the prefix
    if (prefix && typeof prefix === 'string') {
        return `${prefix}${randomNumber.toString().padStart(digits, '0')}`;
    }

    throw new GlobalError('Prefix must be provided if not generating numeric-only reference.');
};
