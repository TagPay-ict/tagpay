import { asyncHandler } from "../../middlewares/asyncHandler";
import { createWalletSchema } from "../../providers/tagpay/tagpay-types";
import walletService from "./wallet.services";
import { HTTPSTATUS } from "../../config/statusCode.config";
import { Request, Response } from "express";
import WalletServices from "./wallet.services";

export default class WalletControllers {
  private readonly services: WalletServices;

  constructor(services: WalletServices) {
    this.services = services;
  }

  public createWalletController = asyncHandler(async (req, res) => {
    const data = createWalletSchema.parse({ ...req.body });
    const user = req.query.user as string;

    await this.services.createWalletService({ ...data }, user);

    res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Wallet created successfully ",
    });
  });

  public getWalletController = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.query.userId as string;
      const user = req.user;

      const walletData = await this.services.getWalletByUserId(
        userId || user.id
      );

      res.status(HTTPSTATUS.ACCEPTED).json({
        success: true,
        message: "Wallet fetched successfully ",
        data: walletData,
      });
    }
  );

  public getUserBalanceController = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.query.userId as string;
      const user = req.user;
      const refresh = req.query.refresh === "true";

      const targetUserId = userId || user.id;

      if (refresh) {
        const balanceData =
          await this.services.refreshWalletBalance(targetUserId);

        if (!balanceData) {
          return res.status(HTTPSTATUS.NOT_FOUND).json({
            success: false,
            message: "Wallet not found",
          });
        }

        return res.status(HTTPSTATUS.OK).json({
          success: true,
          message: "Balance refreshed successfully",
          data: balanceData,
        });
      }

      const balanceData = await this.services.getUserBalance(targetUserId);

      if (!balanceData) {
        return res.status(HTTPSTATUS.NOT_FOUND).json({
          success: false,
          message: "Wallet not found",
        });
      }

      res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Balance fetched successfully",
        data: balanceData,
      });
    }
  );
}
