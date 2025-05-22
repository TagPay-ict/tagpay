import {transaction} from "../../db/schema/transactions.model";
import {z} from "zod"



export type TransactionType = typeof transaction.$inferInsert



