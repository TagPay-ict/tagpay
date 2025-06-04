import express from "express";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../db/schema";
import { WebhookModules } from "services/webhook/webhook.modules";
import { AuthModules } from "services/auth/auth.modules";
import { WalletModules } from "services/wallet/wallet.modules";
import { authMiddleware } from "middlewares/auth.middleware";

export class RootModule {
    private readonly router: express.Router;
    private readonly webhook: WebhookModules;
    private readonly auth: AuthModules;
    private readonly wallet: WalletModules;


    constructor(db: NodePgDatabase<typeof schema> & { $client: Pool }) {
        this.router = express.Router();

        this.webhook = new WebhookModules(db);
        this.auth = new AuthModules(db)
        this.wallet = new WalletModules(db)

        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.use("/webhooks", this.webhook.routes.routes());
        this.router.use("/auth",  this.auth.routes.routes());
        this.router.use("/wallet", authMiddleware,  this.wallet.routes.routes());
        // ...add more routes here
    }

    routes() {
        return this.router;
    }
}