import express from "express";
import NotificationController from "./notification.controllers";

export default class NotificationRoutes {
    private readonly router: express.Router;

    constructor(private readonly controller: NotificationController) {
        this.router = express.Router();
    }

    routes = () => {
        // Public routes (for internal server calls)
        this.router.post("/send", this.controller.sendNotification);
        this.router.post("/send-bulk", this.controller.sendBulkNotification);

        // Protected routes (for mobile app) - auth middleware will be applied in root module
        this.router.post("/devices/register", this.controller.registerDevice);
        this.router.delete("/devices/unregister", this.controller.unregisterDevice);
        this.router.get("/preferences", this.controller.getUserPreferences);
        this.router.put("/preferences", this.controller.updateUserPreferences);
        this.router.get("/history", this.controller.getNotificationHistory);

        return this.router;
    };
}
