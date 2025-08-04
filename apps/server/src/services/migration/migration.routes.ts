import express from "express"
import MigrationControllers from "./migration.controllers";

export default class MigrationRoutes {

    private readonly router: express.Router;

    constructor(private readonly controller: MigrationControllers) {
        this.router = express.Router();
    }

    routes = () => {

        this.router.post("/resolve_account", this.controller.resolveAccountNumber)
        this.router.post("/migrate", this.controller.migrateUser)
        return this.router;

    }


}