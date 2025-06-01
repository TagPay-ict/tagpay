import {Request, Response, NextFunction} from "express"
import { asyncHandler } from "./asyncHandler"
import { BadRequestException, NotFoundException } from "utils/error"
import { ErrorCode } from "enum/errorCode.enum"
import { wallet } from "db/schema/wallet.model"
import db from "db/connectDb"
import { eq } from "drizzle-orm"
import transferServices from "services/transfer/transfer.services"
import { calculateCharges } from "utils/calculateFee"


export const checkInsufficientBalance = asyncHandler(async(req:Request, res:Response, next:NextFunction) => {

    const {amount} = req.body
    const userId = req.user.id

    if (!amount || typeof amount !== "number" || amount <= 0) {
        throw new BadRequestException("Valid amount is required", ErrorCode.BAD_REQUEST);
    }

    const [userWallet] = await db
      .select()
      .from(wallet)
      .where(eq(wallet.user_id,userId))
      .limit(1);

      if(!userWallet) {
          throw new NotFoundException("Wallet not found ", ErrorCode.AUTH_NOT_FOUND)
      }



      if((userWallet.available_balance as number) < amount) {
          throw new BadRequestException("Insufficient funds", ErrorCode.BAD_REQUEST)
      }

      next()

})