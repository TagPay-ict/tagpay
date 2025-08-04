import { z } from "zod"

export type Tier = "TIER_1" | "TIER_2" | "TIER_3";

export type TagPayTransactionType = 'DEBIT' | 'CREDIT';


type TransactionCategory = 
  | "BANK_TRANSFER"
  | "BANK_TRANSFER_COMMISSION"
  | "CARD_COMMISSION"
  | "CARD_DEBIT"
  | "CARD_DEBIT_LIEN"
  | "CARD_PLACE_LIEN"
  | "CARD_REVERSE"
  | "CREDIT_CUSTOMER_WALLET"
  | "CUSTOMER_BANK_TRANSFER"
  | "DEBIT_CUSTOMER_WALLET"
  | "MERCHANT_FUND_LOAD"
  | "NIP_CREDIT"
  | "REMITA_FUND_TRANSFER"
  | "STAMP_DUTY"
  | "STAMP_DUTY_COMMISSION"
  | "VAT_COMMISSION"
  | "WALLET_CREDITED_BY_MERCHANT"
  | "WALLET_DEBITED_BY_MERCHANT"
  | "WALLET_TO_WALLET_TRANSFER";


  type Mode = 'SANDBOX' | 'LIVE';

export const createWalletSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
    email: z.string().email({ message: "Please provide a valid email" }),
    dateOfBirth: z.string(),
    address: z.string(),
    bvn: z.string().optional(),
    nin: z.string().optional(),
    tier: z.enum(['TIER_1', 'TIER_2', 'TIER_3'])
})


export type CustomerToCustomerType = {
    fromCustomerId: string,
    toCustomerId: string,
    amount: number
}


export type WalletToWalletType = {
    fromWalletId: string;
    toWalletId: string;
    amount: number
}

export type WalletDetails = {
    id: string;
    tier: Tier;
    status: string;
    reason: string | null;
    email: string;
    customerId: string;
    address: string;
    lastName: string;
    firstName: string;
    phoneNumber: string;
    isNINVerified: boolean;
    isBVNVerificationRequired: boolean;
    bankName: string;
    bankCode: string;
    createdAt: string;
    updatedAt: string;
    accountName: string;
    postNoCredit: boolean;
    accountNumber: string;
    bookedBalance: number;
    availableBalance: number;
    accountReference: string;
}

export type CustomerDetailsType = {
    id: string;
    nin: string;
    bvn: string;
    address: string;
    firstName: string;
    lastName: string;
    BVNLastName: string;
    BVNFirstName: string;
    email: string;
    nameMatch: boolean;
    phoneNumber: string;
    dateOfBirth: string;
    metadata: unknown | null;
    tier: Tier;
    isNINVerified: boolean;
    isBVNVerificationRequired: boolean;
    createdAt: string;
    updatedAt: string;
    walletId: string;
}

export type TransactionDetails = {
    id: string;
    userId: string;
    category: TransactionCategory;
    currency: "NGN";
    amount: number;
    metadata: any | null;
    balance_after: number;
    balance_before: number;
    reference: string;
    source: any | null;
    destination: any | null;
    type: TagPayTransactionType;
    description: string;
    mode: Mode;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}

export type CreateWalletType = z.infer<typeof createWalletSchema>;
