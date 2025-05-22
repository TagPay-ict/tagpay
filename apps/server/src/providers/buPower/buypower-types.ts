



export type CreateVTUType = {
    orderId: string;
    meter: string;
    disco: "MTN" | "AIRTEL" | "9MOBILE" | "GLO";
    phone: string;
    paymentType: "ONLINE";
    vendType: "PREPAID";
    amount: number;
    email?: string;
    name?: string;
    vertical: "VTU"

}