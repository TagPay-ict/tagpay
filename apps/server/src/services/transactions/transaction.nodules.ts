import { NodePgDatabase } from "drizzle-orm/node-postgres"

import * as schema from "../../db/schema"
import { Pool } from "pg"
import {TransactionsServices} from "./transactions.services"
import TransactionControllers from "./transaction.controllers"
import TransactionRoutes from "./transaction.routes"



export class TransactionModules {


      public services: TransactionsServices
        public controllers: TransactionControllers
        public routes: TransactionRoutes
    
        constructor(private readonly db: NodePgDatabase<typeof schema> & {$client: Pool}) {
            this.services = new TransactionsServices(this.db)
            this.controllers = new TransactionControllers(this.services)
            this.routes = new TransactionRoutes(this.controllers)
        }


}