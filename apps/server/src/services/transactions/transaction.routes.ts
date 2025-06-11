import express from "express"
import TransactionControllers from "./transaction.controllers";






export default class TransactionRoutes {

    private readonly router: express.Router;

    constructor(private readonly controller: TransactionControllers) {
        this.router = express.Router();
    }

    routes = () => {

        this.router.get("/", this.controller.getUserTransactions);

        return this.router

    }

}


