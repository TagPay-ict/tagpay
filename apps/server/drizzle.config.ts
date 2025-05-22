import { defineConfig } from "drizzle-kit";
import config from "./src/config/app.config";

if (!config.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in the config.");
}

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema",
    out: "./src/db/migrations",
    dbCredentials: {
        url: config.DATABASE_URL as string,
    },
    verbose: true,
    strict: true
});
