import { NodePgDatabase } from "drizzle-orm/node-postgres";
import MigrationControllers from "./migration.controllers";
import MigrationRoutes from "./migration.routes";
import * as schema from "../../db/schema"
import { Pool } from "pg";



export class MigrationModules {
    public controllers: MigrationControllers
    public routes: MigrationRoutes


    constructor(private readonly db: NodePgDatabase<typeof schema> & {$client: Pool}) {
        this.controllers = new MigrationControllers(this.db)
        this.routes = new MigrationRoutes(this.controllers)
    }       

    
}