import { integer, jsonb, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./user.model";
import { timestamps } from "../columnHelpers";


const billTypeEnum = pgEnum("type", ['airtime', 'data', 'electricity', 'television'])
const billStatusEnum = pgEnum('status', ["PENDING", "FAILED", "COMPLETED"])


export const billPayment = pgTable("bill_payment", {
    id: uuid("id").unique().primaryKey().defaultRandom(),
    user_id: uuid().notNull().references(() => user.id, { onDelete: 'cascade' }),
    status: billStatusEnum().notNull(),
    type: billTypeEnum().notNull(),
    reference: varchar().notNull(),
    provider: varchar().notNull(),
    external_bill_id: varchar().notNull(),
    amount: integer().notNull(),
    attributes: jsonb().notNull(),
    ...timestamps
})

