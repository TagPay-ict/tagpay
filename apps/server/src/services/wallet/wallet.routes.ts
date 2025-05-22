import express from 'express';
import walletController from "./wallet.controllers";


const walletRouter = express.Router();


walletRouter.post("/", walletController.createWalletController);
walletRouter.get("/", walletController.getWalletController);


export default walletRouter;