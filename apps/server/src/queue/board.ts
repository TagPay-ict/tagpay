import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { Express } from "express"
import { TagPay_ChargeTransferFeeQueue, TagPay_CreateAccountQueue } from "./queue-list";


const serverAdapter = new ExpressAdapter();

const basePath = "/api/v1/ui";

const { addQueue, removeQueue, replaceQueues, setQueues } = createBullBoard({
    queues: [
        new BullMQAdapter(TagPay_CreateAccountQueue),
        new BullMQAdapter(TagPay_ChargeTransferFeeQueue),

    ],
    serverAdapter,
    options: {
        uiConfig: {
            boardTitle: "Gabs Board",
            //   boardLogo: {
            //     path: "https://cdn.my-domain.com/logo.png",
            //     width: "100px",
            //     height: 200,
            //   },
            miscLinks: [{ text: "Logout", url: "/logout" }],
            //   favIcon: {
            //     default: "static/images/logo.svg",
            //     alternative: "static/favicon-32x32.png",
            //   },
        },
    },
});

serverAdapter.setBasePath(basePath);

export const setupBullBoard = (app: Express) => {
    app.use(basePath, serverAdapter.getRouter());
};
