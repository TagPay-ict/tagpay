import { integer, pgTable, serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./user.model";
import { timestamps } from "../columnHelpers";
import { createInsertSchema } from "drizzle-zod";



export const session = pgTable("session", {
    id: uuid("id").unique().primaryKey().defaultRandom().notNull(),
    user_id: uuid().notNull().references(() => user.id, { onDelete: 'cascade' }),
    expires_at: timestamp().notNull(),
    user_agent: varchar(),
    ...timestamps
})

export const sessionSchemaInsert = createInsertSchema(session);