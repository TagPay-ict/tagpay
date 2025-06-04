import express from "express";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../db/schema";
import { WebhookModules } from "services/webhook/webhook.modules";
import { AuthModules } from "services/auth/auth.modules";

export class RootModule {
    private readonly router: express.Router;
    private readonly webhookModules: WebhookModules;
    private readonly authModules: AuthModules;

    constructor(db: NodePgDatabase<typeof schema> & { $client: Pool }) {
        this.router = express.Router();

        this.webhookModules = new WebhookModules(db);
        this.authModules = new AuthModules(db)

        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.use("/webhooks", this.webhookModules.routes.routes());
        this.router.use("/auth",  this.authModules.routes.routes());
        // this.router.use("/wallet", this.walletModules.routes.routes());
        // ...add more routes here
    }

    routes() {
        return this.router;
    }
}