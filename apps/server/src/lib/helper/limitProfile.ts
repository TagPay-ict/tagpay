// limitProfiles.ts

interface LimitProfile {
    kycTier: number;
    dailyTransactionLimit: number;
    singleTransactionLimit: number;
    maxBalance: number | null; // null represents 'Unlimited'
    description: string;
}

export const limitProfiles: Record<number, LimitProfile> = {
    1: {
        kycTier: 1,
        dailyTransactionLimit: 50000,
        singleTransactionLimit: 20000,
        maxBalance: 300000,
        description: "Tier 1 - Basic Verification",
    },
    2: {
        kycTier: 2,
        dailyTransactionLimit: 200000,
        singleTransactionLimit: 100000,
        maxBalance: 500000,
        description: "Tier 2 - Enhanced Verification",
    },
    3: {
        kycTier: 3,
        dailyTransactionLimit: 5000000,
        singleTransactionLimit: 5000000,
        maxBalance: null,
        description: "Tier 3 - Advanced Verification",
    },
};

export function getLimitProfile(tier: number): LimitProfile | null {
    return limitProfiles[tier] || null;
}
  