import { NodePgDatabase } from "drizzle-orm/node-postgres"
import NotificationController from "./notification.controllers"
import NotificationRoutes from "./notification.routes"
import * as schema from "../../db/schema"
import { Pool } from "pg"
import NotificationService  from "./notification.services"

export class NotificationModules {
    public services: NotificationService
    public controllers: NotificationController
    public routes: NotificationRoutes

    constructor(private readonly db: NodePgDatabase<typeof schema> & {$client: Pool}) {
        this.services = new NotificationService(this.db)
        this.controllers = new NotificationController(this.services)
        this.routes = new NotificationRoutes(this.controllers)
    }
}
