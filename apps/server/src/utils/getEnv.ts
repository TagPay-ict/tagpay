import dotenv from "dotenv";

dotenv.config();

type getEnvFunc = (key: string, defaultValue?: string) => string;

export const getEnv: getEnvFunc = (key, defaultValue = ""): string => {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue === undefined) {
            throw new Error(`Environment variable "${key}" is not set and no default value was provided.`);
        }
        return defaultValue;
    }
    return value;
};
