import express from "express";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../db/schema";
import { WebhookModules } from "services/webhook/webhook.modules";
import { AuthModules } from "services/auth/auth.modules";
import { WalletModules } from "services/wallet/wallet.modules";
import { authMiddleware } from "middlewares/auth.middleware";
import { TransactionModules } from "services/transactions/transaction.nodules";
import { TransferModules } from "services/transfer/transfer.modules";

export class RootModule {
    private readonly router: express.Router;
    public readonly webhook: WebhookModules;
    public readonly auth: AuthModules;
    public readonly wallet: WalletModules;
    public readonly transactions: TransactionModules;
    public readonly transfer: TransferModules;


    constructor(db: NodePgDatabase<typeof schema> & { $client: Pool }) {
        this.router = express.Router();

        this.webhook = new WebhookModules(db);
        this.auth = new AuthModules(db)
        this.wallet = new WalletModules(db)
        this.transactions = new TransactionModules(db)
        this.transfer = new TransferModules(db, this.transactions.services)

        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.use("/webhooks", this.webhook.routes.routes());
        this.router.use("/auth",  this.auth.routes.routes());
        this.router.use("/wallet", authMiddleware,  this.wallet.routes.routes());
        this.router.use("/transaction", authMiddleware,  this.transactions.routes.routes());
        this.router.use("/transfer", authMiddleware,  this.transfer.routes.routes());
    }

    routes() {
        return this.router;
    }
}