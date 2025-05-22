import { Router } from "express";
import onboardingControllers from "./onboarding.controllers";

const onboardingRouter = Router()

onboardingRouter.post("/add_email", onboardingControllers.addEmail)
onboardingRouter.post("/add_bvn", onboardingControllers.addBvn)
onboardingRouter.post("/verify_bvn_phone", onboardingControllers.verifyIdentityWithBvnPhoneNumber)
onboardingRouter.get("/check_tag", onboardingControllers.checkTagExist)
onboardingRouter.post("/create_tag", onboardingControllers.createTag)
onboardingRouter.post("/add_address", onboardingControllers.addAddress)
onboardingRouter.post("/complete_onboarding", onboardingControllers.completeUserOnboarding)

export default onboardingRouter