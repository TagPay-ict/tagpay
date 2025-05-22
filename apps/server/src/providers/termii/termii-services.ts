import { AxiosError } from "axios";
import { ErrorCode } from "../../enum/errorCode.enum";
import { BadRequestException } from "../../utils/error";
import { TermiiBaseClass } from "./termii-base";

type SendTokenOptions = {
    api_key: string; // Your API key found on the Termii dashboard
    message_type: "NUMERIC" | "ALPHANUMERIC"; // Type of message to be generated
    to: string; // Destination email or phone number in international format
    from: string; // Sender ID or Configuration ID (alphanumeric or numeric)
    channel: "dnd" | "whatsapp" | "generic" | "email"; // Route for sending the message
    pin_attempts: number; // Number of PIN attempts (minimum: 1)
    pin_time_to_live: number; // PIN validity time in minutes (min: 0, max: 60)
    pin_length: number; // Length of PIN code (min: 4, max: 8)
    pin_placeholder: string; // Placeholder to replace with generated PIN code
    message_text: string; // Text of the message sent to the destination
};


type VerifyTokenOptions = {
    api_key: string; // Your API key found on your Termii dashboard
    pin_id: string; // ID of the PIN sent (e.g., "c8dcd048-5e7f-4347-8c89-4470c3af0b")
    pin: string; // The PIN code to be verified (e.g., "195558")
};

type VerifyTokenResponse = {
    pinId: string; // ID of the PIN sent
    verified: "True" | "False"; // Status indicating whether the token was verified
    msisdn: string; // The mobile number in international format
};


type SendMessageOptions = {
    api_key: string; // Your API key from the Termii dashboard
    to: string | string[]; // Destination phone number(s) in international format, accepts single numbers or an array
    from: string; // Sender ID (Alphanumeric or Device name for WhatsApp)
    sms?: string; // Text of the message being sent (optional if using media object)
    type: "plain"; // The type of message sent (always plain)
    channel: "dnd" | "whatsapp" | "generic"; // Route through which the message is sent
    media?: {
        url: string; // URL of the file resource (optional, only available for WhatsApp High Volume)
        caption?: string; // Caption added to the media file (optional)
    };
};



class TermiServices extends TermiiBaseClass {

    constructor() {
        super();
    }


    public async sendToken(options: SendTokenOptions): Promise<Awaited<{ pinId: string, to: string, smsStatus: string }>> {

        try {

            const response = await this.axios.post("sms/otp/send", JSON.stringify(options));

            console.log(response?.data, "this is the termii response ")

            if (response.status !== 200) {
                throw new BadRequestException("Error sending OTP", ErrorCode.INTERNAL_SERVER_ERROR);
            }

            const { data } = response.data;

            return data;

        } catch (error: any) {
            console.log(error?.response, "this is the error from termii")

            throw new BadRequestException("Error sending OTP", ErrorCode.INTERNAL_SERVER_ERROR);

        }

    }

    public async verifyToken(options: VerifyTokenOptions): Promise<Awaited<VerifyTokenResponse>> {


        try {
            const response = await this.axios.post("sms/otp/verify", options)


            const { data } = response.data;

            return data

        } catch (error) {
            throw new BadRequestException("Error verifying OTP", ErrorCode.INTERNAL_SERVER_ERROR);

        }




    }
    public async sendSms(options: SendMessageOptions): Promise<void> {

        try {

            const response = await this.axios.post("sms/send", JSON.stringify(options))

            console.log(response?.data, "this is the termii response ")

            if (response.status !== 200) {
                throw new BadRequestException("Error verifying OTP", ErrorCode.INTERNAL_SERVER_ERROR);
            }

            const { data } = response.data;

            return data

        } catch (error: any) {

            console.log(error?.response.data, "this is the error from termii")

        }





    }

}

export default new TermiServices();