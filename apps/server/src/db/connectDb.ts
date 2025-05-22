// Make sure to install the 'pg' package
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import config from "../config/app.config";
import { user } from "./schema/user.model";
import { wallet } from "./schema/wallet.model";
import { transaction } from "./schema/transactions.model";
import { session } from "./schema/session.model";
import { setup } from "./schema/setup.model";


const pool = new Pool({
    connectionString: config.DATABASE_URL as string,
});

const db = drizzle({client: pool, schema: {user, wallet,session,setup, transaction}});

export default db

