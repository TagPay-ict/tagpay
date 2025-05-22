import { Dojah } from "dojah-typescript-sdk";
import appConfig from "./app.config";

const dojah = new Dojah({
    authorization: appConfig.DOJAH_API_KEY,
    appId: appConfig.DOJAH_APP_ID,
});

// const getScreeningInfoResponse = await dojah.aml.getScreeningInfo({});
//
// console.log(getScreeningInfoResponse);

export default dojah;

