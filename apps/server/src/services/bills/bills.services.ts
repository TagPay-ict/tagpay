import buyPowerBillsApi from "providers/buPower/buypower-biils.api";
import { AirtimeType } from "./bills.types";
import { CreateVTUType } from "providers/buPower/buypower-types";
import { generateRef } from "utils/generateRef";
import { BadRequestException } from "utils/error";
import db from "db/connectDb";
import { billPayment } from "db/schema/billPayment.model";

type CreateBillPaymentType = typeof billPayment.$inferInsert


class BillsServices {


    public async airtime(data: AirtimeType, userId: string): Promise<Pick<CreateBillPaymentType, "amount" | "id" | "provider" | "status" | "reference">> {

        const { phoneNumber, provider, amount, customerPhone } = data;

        const payload: CreateVTUType = {
            orderId: generateRef('bil', 10),
            amount,
            disco: provider,
            meter: phoneNumber,
            paymentType: "ONLINE",
            vendType: "PREPAID",
            phone: customerPhone || phoneNumber,
            vertical: "VTU",

        }

       return  await db.transaction(async (tx) => {


            const response = await buyPowerBillsApi.createBillPayment(payload)

            if (response.data.status !== true || response.data.error === true) {
                throw new BadRequestException("Airtime purchase failed")
            }

            const reference = generateRef("bil", 8)


            const billPaymentPayload: CreateBillPaymentType = {
                provider: data.provider,
                type: "airtime",
                reference,
                status: "PENDING",
                user_id: userId,
                external_bill_id: response.data?.data.id,
                amount: data.amount,
                attributes: {
                    phone_number: data.phoneNumber,
                }
            }


            const [newBillPayment] = await tx.insert(billPayment).values(billPaymentPayload).returning({ id: billPayment.id, provider: billPayment.provider, amount: billPayment.amount, status: billPayment.status, reference: billPayment.reference }).execute()


            return newBillPayment
        })




    }


}


const billsServices = new BillsServices()
export default billsServices