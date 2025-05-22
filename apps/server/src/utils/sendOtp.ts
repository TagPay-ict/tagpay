import { SENDER_ID } from "providers/termii/termii-base";
import { generateRef } from "./generateRef";
import config from "config/app.config";
import cache from "config/node-cache";
import termiiServices from "providers/termii/termii-services";
import { systemLogger } from "./logger";



export const sendOtp = async (phoneNumber: string) => {

    const token = generateRef(undefined, 6, true);
    const message = `Your TagPay OTP is ${token} . Expires in 5 minutes. `;

    cache.set(phoneNumber, token, 5 * 60)


    await termiiServices.sendSms({
        channel: 'generic',
        from: SENDER_ID,
        to: phoneNumber,
        api_key: config.TERMII_API_KEY,
        type: 'plain',
        sms: message
    })


    console.log(token, "this is the token generated and sent to the frontend")
    systemLogger.info(`OTP sent to ${phoneNumber} : token is ${token}`);
}