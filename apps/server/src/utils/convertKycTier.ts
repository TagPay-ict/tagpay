

export function convertKyc (tier: "TIER_1" | "TIER_2" | "TIER_3") {


    if(tier === "TIER_1") return 1
    if(tier === "TIER_2") return 2
    if(tier === "TIER_3") return 3

}