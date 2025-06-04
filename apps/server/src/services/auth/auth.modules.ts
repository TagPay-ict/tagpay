import { NodePgDatabase } from "drizzle-orm/node-postgres"
import AuthControllers from "./auth.controllers"
import AuthServices from "./auth.services"
import AuthRoutes from "./auth.routes"
import * as schema from "../../db/schema"
import { Pool } from "pg"





export class AuthModules {
    public services: AuthServices
    public controllers: AuthControllers
    public routes: AuthRoutes

    constructor(private readonly db: NodePgDatabase<typeof schema> & {$client: Pool}) {
        this.services = new AuthServices(this.db)
        this.controllers = new AuthControllers(this.services)
        this.routes = new AuthRoutes(this.controllers)
    }
}
