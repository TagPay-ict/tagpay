import express from 'express';

import TransferControllers from './transfer.controllers';






export default class TransferRoutes {

    private readonly router: express.Router;

    constructor(private readonly controller: TransferControllers) {
        this.router = express.Router();
    }

    routes = () => {

        this.router.post("/tag", this.controller.tagTransferController);
        this.router.get("/bank_list", this.controller.getBankList)

        return this.router
    }

}