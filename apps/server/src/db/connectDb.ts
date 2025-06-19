// Make sure to install the 'pg' package
import { drizzle, } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema"
import config from "config/app.config";

const {Pool} = pg

const pool = new Pool({
    connectionString: config.DATABASE_URL as string,
});

const db = drizzle({client: pool, schema});

export default db

