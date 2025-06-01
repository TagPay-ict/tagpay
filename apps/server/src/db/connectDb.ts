// Make sure to install the 'pg' package
import { drizzle, } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import config from "../config/app.config";
import { user , usersRelations} from "./schema/user.model";
import { wallet ,walletRelations} from "./schema/wallet.model";
import { transaction, transactionRelations } from "./schema/transactions.model";
import { session } from "./schema/session.model";
import { setup , setupRelations} from "./schema/setup.model";


const pool = new Pool({
    connectionString: config.DATABASE_URL as string,
});

const db = drizzle({client: pool, schema: {user, wallet,session,setup, transaction, transactionRelations, usersRelations, setupRelations, walletRelations}});

export default db

