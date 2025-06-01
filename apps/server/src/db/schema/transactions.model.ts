import {integer, jsonb, pgEnum, pgTable, uuid, varchar} from "drizzle-orm/pg-core";
import {user} from "./user.model";
import {wallet} from "./wallet.model";
import {timestamps} from "../columnHelpers";
import {relations} from "drizzle-orm";
import {createInsertSchema} from "drizzle-zod";


export const paymentTypeEnum = pgEnum("payment_type", ["INTER_BANK", "WALLET_TRANSFER", ])
export const transactionTypeEnum = pgEnum("transaction_type", ["DEBIT", "CREDIT"])
export const transactionStatusEnum = pgEnum("transaction_status", ["PENDING", "COMPLETED", "FAILED", "REVERSED"])

export const transaction = pgTable("transaction", {
    id: uuid("id").unique().primaryKey().defaultRandom().notNull(),
    reference: varchar().notNull(),
    amount: integer().notNull(),
    fee: integer(),
    type: transactionTypeEnum().notNull(),
    payment_type: paymentTypeEnum().notNull(),
    sender: jsonb(),
    status: transactionStatusEnum().default("PENDING").notNull(),
    user_id: uuid().notNull().references(() => user.id, { onDelete: 'cascade' }),
    wallet_id: uuid().notNull().references(() => wallet.id, { onDelete: 'cascade' }),
    narration: varchar(),
    metadata: jsonb(),
    recipient: jsonb(),
    session_id: varchar(),
    ...timestamps
})


export const transactionRelations = relations(transaction, ({ one }) => ({
    user: one(user, { fields: [transaction.user_id], references: [user.id] }),
    wallet: one(wallet, { fields: [transaction.wallet_id], references: [wallet.id] }),
}));



export const transactionSchemaInsert = createInsertSchema(transaction)