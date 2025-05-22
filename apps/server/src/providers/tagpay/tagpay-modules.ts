import TagPayTransferApi from "./tagpay-transfer.api";
import TagPayWalletApi from "./tagpay-wallet.api";



const tagpayTransferApi = new TagPayTransferApi();
const tagpayWalletApi = new TagPayWalletApi()



const TagPay = {
    payments: tagpayTransferApi,
    wallet: tagpayWalletApi
}


export default TagPay