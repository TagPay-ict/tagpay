// TagPay Environment Configuration
// This file contains environment-specific configurations

export interface EnvironmentConfig {
    environment: string;
    domainName?: string;
    enableWAF: boolean;
    enableCloudFront: boolean;
    enableSES: boolean;
    enableSNS: boolean;
    eksConfig: {
        instanceType: string;
        desiredCapacity: number;
        minSize: number;
        maxSize: number;
    };
    rdsConfig: {
        instanceClass: string;
        allocatedStorage: number;
        backupRetentionPeriod: number;
    };
    redisConfig: {
        nodeType: string;
        numCacheNodes: number;
    };
}

export const stagingConfig: EnvironmentConfig = {
    environment: "staging",
    domainName: "staging.tagpay.example.com",
    enableWAF: false,
    enableCloudFront: false,
    enableSES: false,
    enableSNS: true,
    eksConfig: {
        instanceType: "t3.medium",
        desiredCapacity: 2,
        minSize: 1,
        maxSize: 3,
    },
    rdsConfig: {
        instanceClass: "db.t3.micro",
        allocatedStorage: 20,
        backupRetentionPeriod: 7,
    },
    redisConfig: {
        nodeType: "cache.t3.micro",
        numCacheNodes: 1,
    },
};

export const productionConfig: EnvironmentConfig = {
    environment: "production",
    domainName: "tagpay.example.com",
    enableWAF: true,
    enableCloudFront: true,
    enableSES: true,
    enableSNS: true,
    eksConfig: {
        instanceType: "t3.large",
        desiredCapacity: 3,
        minSize: 2,
        maxSize: 5,
    },
    rdsConfig: {
        instanceClass: "db.t3.large",
        allocatedStorage: 100,
        backupRetentionPeriod: 30,
    },
    redisConfig: {
        nodeType: "cache.t3.micro",
        numCacheNodes: 1,
    },
};

export function getConfig(environment: string): EnvironmentConfig {
    switch (environment) {
        case "staging":
            return stagingConfig;
        case "production":
            return productionConfig;
        default:
            throw new Error(`Unknown environment: ${environment}`);
    }
}
