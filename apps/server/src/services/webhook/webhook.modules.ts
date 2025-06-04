import { NodePgDatabase } from "drizzle-orm/node-postgres";
import WebhookControllers from "./webhook.controllers";
import WebhookHandlers from "./webhook.handlers";
import { WebhookRoutes } from "./webhook.routes";
import * as schema from "../../db/schema"
import { Pool } from "pg";

export class WebhookModules {
    public handlers: WebhookHandlers
    public controllers: WebhookControllers
    public routes: WebhookRoutes

    constructor(private readonly db: NodePgDatabase<typeof schema> & {$client: Pool}) {
        this.handlers = new WebhookHandlers(this.db)
        this.controllers = new WebhookControllers(this.handlers)
        this.routes = new WebhookRoutes(this.controllers)
    }
}