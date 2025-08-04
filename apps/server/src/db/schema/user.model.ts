import { boolean, integer, jsonb, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columnHelpers";
import { relations, sql } from "drizzle-orm";
import {transaction} from "./transactions.model";
import {wallet} from "./wallet.model";
import { setup } from "./setup.model";

export const genderEnum = pgEnum('user_gender', ["male", "female"])
export const statusEnum = pgEnum('status', ["active", "blocked", "inactive"])
export const mediumEnum = pgEnum('medium', ["friend", "referral", "facebook", "instagram", "google", "twitter", "linkedin", "others"])
export const platformEnum = pgEnum('platform', ["web", "mobile"])


export const user = pgTable('user', {
    id: uuid("id").unique().primaryKey().defaultRandom().notNull(),
    first_name: varchar(),
    last_name: varchar(),
    middle_name: varchar(),
    account_ref: uuid().unique().defaultRandom(),
    full_name: varchar(),
    tag: varchar().unique(),
    email: varchar().unique(),
    has_onboarded: boolean().default(false),
    password: varchar(),
    phone_number: varchar().unique(),
    bvn_phone_number: varchar(),
    country: varchar().default("NG"),
    status: statusEnum().default('active'),
    referral_code: varchar().unique(),
    referral_link: varchar().unique(),
    referred_by: uuid(),
    referrals: uuid().array().default(sql`'{}'::uuid[]`),
    gender: genderEnum(),
    providers: jsonb(),
    state_of_origin: varchar(),
    provider_id: varchar(),
    bvn: varchar(),
    kyc_tier: integer().default(0),
    kyc_verified: boolean().default(false),
    nin: varchar(),
    avatar: varchar(),
    medium: mediumEnum(),
    date_of_birth: varchar(),
    is_flagged: boolean(),
    platform: platformEnum(),
    terms: boolean().default(true),
    address: jsonb(),
    passcode: varchar(),
    secure_pin: varchar(),
    refresh_token: varchar().array(),
    ...timestamps
})





export const usersRelations = relations(user, ({ one, many }) => ({
    transactions: many(transaction),
    wallet: one(wallet),
    setup: one(setup, {
        fields: [user.id],
        references: [setup.user_id]
    })
}));


export type UserType = typeof user.$inferInsert 