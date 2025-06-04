// Make sure to install the 'pg' package
import { drizzle, } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import config from "../config/app.config";
import * as schema from "./schema"


const pool = new Pool({
    connectionString: config.DATABASE_URL as string,
});

const db = drizzle({client: pool, schema});

export default db

