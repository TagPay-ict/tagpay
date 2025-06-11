import { NodePgDatabase } from "drizzle-orm/node-postgres"
import TransferServices from "./transfer.services"
import { Pool } from "pg"
import TransferControllers from "./transfer.controllers"
import TransferRoutes from "./transfer.routes"
import * as schema from "../../db/schema"




export class TransferModules {

     public services: TransferServices
        public controllers: TransferControllers
        public routes: TransferRoutes
    
        constructor(private readonly db: NodePgDatabase<typeof schema> & {$client: Pool}) {
            this.services = new TransferServices(this.db)
            this.controllers = new TransferControllers(this.services)
            this.routes = new TransferRoutes(this.controllers)
        }

}