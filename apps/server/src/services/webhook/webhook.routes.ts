import express from "express";
import WebhookControllers from "./webhook.controllers";

export class WebhookRoutes {
    private readonly router: express.Router;

    constructor(private readonly controllers: WebhookControllers) {
        this.router = express.Router();
    }

    routes = () => {
        this.router.post("/tagpay", this.controllers.tagpay_controllers);
        return this.router;
    };
}