import { NodePgDatabase } from "drizzle-orm/node-postgres"

import * as schema from "../../db/schema"
import { Pool } from "pg"
import WalletServices from "./wallet.services"
import WalletControllers from "./wallet.controllers"
import WalletRoutes from "./wallet.routes"


export class WalletModules {


      public services: WalletServices
        public controllers: WalletControllers
        public routes: WalletRoutes
    
        constructor(private readonly db: NodePgDatabase<typeof schema> & {$client: Pool}) {
            this.services = new WalletServices(this.db)
            this.controllers = new WalletControllers(this.services)
            this.routes = new WalletRoutes(this.controllers)
        }


}