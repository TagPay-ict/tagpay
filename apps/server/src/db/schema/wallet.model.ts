import { boolean, integer, jsonb, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { user } from "./user.model";
import { timestamps } from "../columnHelpers";


export const walletTypeEnum = pgEnum('type', ["Savings", "Current"]);
export const walletStatusEnum = pgEnum('wallet_status', ["active", "open", "blocked", "inactive"]);


export const wallet = pgTable("wallet", {
    id: uuid("id").unique().primaryKey().defaultRandom(),
    account_type: walletTypeEnum().default('Savings').notNull(),
    user_id: uuid().notNull().references(() => user.id, { onDelete: 'cascade' }),
    provider_account_id: varchar().notNull(),
    currency: varchar().notNull().default("NGN"),
    status: walletStatusEnum().default("open"),
    balance: integer().default(0).notNull(),
    ledger_balance: integer().default(0),
    hold_balance: integer().default(0),
    available_balance: integer().default(0),
    alias: varchar().notNull(),
    account_name: varchar().notNull(),
    account_number: varchar().notNull(),
    post_no_credit: boolean().default(false),
    limit_profile: jsonb(),
    kyc_tier: integer().default(0),
    bank_name: varchar().notNull(),
    bank_code: varchar().notNull(),
    account_purpose: varchar(),
    frozen: boolean().default(false),
    meta_data: jsonb(),
    ...timestamps
})


export const walletRelations = relations(wallet, ({ one, many }) => ({
    user: one(user, { fields: [wallet.user_id], references: [user.id] }),

}));


export const accountSchemaInsert = createInsertSchema(wallet)