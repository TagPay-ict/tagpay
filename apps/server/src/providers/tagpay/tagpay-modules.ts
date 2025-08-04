import TagPayCustomerApi from "./tagpay-customer.api";
import TagPayTransactionApi from "./tagpay-transactions.api";
import TagPayTransferApi from "./tagpay-transfer.api";
import TagPayWalletApi from "./tagpay-wallet.api";



const tagpayTransferApi = new TagPayTransferApi();
const tagpayWalletApi = new TagPayWalletApi()
const tagpayCustomerApi = new TagPayCustomerApi()
const tagpayTransactionApi = new TagPayTransactionApi()



const TagPay = {
    payments: tagpayTransferApi,
    wallet: tagpayWalletApi,
    customer: tagpayCustomerApi,
    transaction: tagpayTransactionApi
}


export default TagPay