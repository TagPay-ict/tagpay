import { NodePgDatabase } from "drizzle-orm/node-postgres"
import TransferServices from "./transfer.services"
import { Pool } from "pg"
import TransferControllers from "./transfer.controllers"
import TransferRoutes from "./transfer.routes"
import * as schema from "../../db/schema"
import { TransactionsServices } from "services/transactions/transactions.services"




export class TransferModules {

     public services: TransferServices
        public controllers: TransferControllers
        public routes: TransferRoutes
        public transactions: TransactionsServices


        constructor(private readonly db: NodePgDatabase<typeof schema> & {$client: Pool}, transactions:TransactionsServices) {
            this.transactions = transactions
            this.services = new TransferServices(this.db, transactions)
            this.controllers = new TransferControllers(this.services)
            this.routes = new TransferRoutes(this.controllers)
        }

}