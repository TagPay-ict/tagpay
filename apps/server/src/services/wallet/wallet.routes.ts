import express from 'express';
import WalletControllers from './wallet.controllers';







export default class WalletRoutes {

    private readonly router: express.Router;

    constructor(private readonly controller: WalletControllers) {
        this.router = express.Router();
    }

    routes = () => {

        this.router.post("/", this.controller.createWalletController);
        this.router.get("/", this.controller.getWalletController);

        return this.router

    }

}