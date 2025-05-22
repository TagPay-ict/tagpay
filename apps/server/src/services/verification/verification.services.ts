import {BadRequestException, NotFoundException} from "../../utils/error";
import {ErrorCode} from "../../enum/errorCode.enum";
import dojah from "../../config/dojah.config";

class VerificationServices {

    public async verifyUserBvn(bvn: string) {


        try {
            
            if(!bvn){
                throw new BadRequestException("Failed to provide Bank Verification Number", ErrorCode.BAD_REQUEST)
            }
    
            const formattedBvn = Number(bvn)
    
            const verifyBvnResponse = await dojah.nigeriaKyc.getNormalBvn({bvn: formattedBvn})
    
    
            return verifyBvnResponse
        } catch (error) {
            throw new NotFoundException("BVN not found or Invalid")
        }

    }


}

const verificationServices = new VerificationServices();
export default verificationServices;