import express from 'express';
import transferControllers from './transfer.controllers';
import { checkInsufficientBalance } from 'middlewares/insufficientBalance.middleware';


const transferRouter = express.Router();


transferRouter.post("/tag", transferControllers.tagTransferController);


export default transferRouter;