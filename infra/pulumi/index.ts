import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import { getConfig } from "./config";
import { createTagPayInfrastructure } from "./infrastructure";

// Get configuration
const config = new pulumi.Config();
const environment = config.require("environment"); // "staging" or "production"
const envConfig = getConfig(environment);
const projectName = "tagpay";
const stackName = `${projectName}-${environment}`;

// Common tags
const commonTags = {
    Project: projectName,
    Environment: environment,
    ManagedBy: "pulumi",
    Owner: "tagpay-team"
};

// VPC Configuration
const vpc = new awsx.ec2.Vpc(`${stackName}-vpc`, {
    cidrBlock: "10.0.0.0/16",
    numberOfAvailabilityZones: 3,
    tags: commonTags,
});

// EKS Cluster
const cluster = new eks.Cluster(`${stackName}-cluster`, {
    vpcId: vpc.vpcId,
    subnetIds: vpc.privateSubnetIds,
    instanceType: envConfig.eksConfig.instanceType,
    desiredCapacity: envConfig.eksConfig.desiredCapacity,
    minSize: envConfig.eksConfig.minSize,
    maxSize: envConfig.eksConfig.maxSize,
    nodeRootVolumeSize: 20,
    tags: commonTags,
});

// RDS PostgreSQL
const dbSubnetGroup = new aws.rds.SubnetGroup(`${stackName}-db-subnet-group`, {
    subnetIds: vpc.privateSubnetIds,
    tags: commonTags,
});

const dbSecurityGroup = new aws.ec2.SecurityGroup(`${stackName}-db-sg`, {
    vpcId: vpc.vpcId,
    description: "Security group for RDS PostgreSQL",
    ingress: [{
        protocol: "tcp",
        fromPort: 5432,
        toPort: 5432,
        securityGroups: cluster.nodeSecurityGroup.apply(sg => sg ? [sg.id] : []),
    }],
    tags: commonTags,
});

const dbPassword = new aws.secretsmanager.Secret(`${stackName}-db-password`, {
    description: "Database password for TagPay",
    tags: commonTags,
});

const dbPasswordVersion = new aws.secretsmanager.SecretVersion(`${stackName}-db-password-version`, {
    secretId: dbPassword.id,
    secretString: "tagpay-db-password-2024", // In production, use a secure random password
});

const db = new aws.rds.Instance(`${stackName}-postgres`, {
    engine: "postgres",
    instanceClass: envConfig.rdsConfig.instanceClass,
    allocatedStorage: envConfig.rdsConfig.allocatedStorage,
    storageType: "gp2",
    dbName: `tagpay_${environment}`,
    username: "tagpay_user",
    password: dbPasswordVersion.secretString.apply(str => str || "default-password"),
    vpcSecurityGroupIds: [dbSecurityGroup.id],
    dbSubnetGroupName: dbSubnetGroup.name,
    backupRetentionPeriod: envConfig.rdsConfig.backupRetentionPeriod,
    backupWindow: "03:00-04:00",
    maintenanceWindow: "sun:04:00-sun:05:00",
    skipFinalSnapshot: environment !== "production",
    finalSnapshotIdentifier: environment === "production" ? `${stackName}-final-snapshot` : undefined,
    tags: commonTags,
});

// ElastiCache Redis
const redisSubnetGroup = new aws.elasticache.SubnetGroup(`${stackName}-redis-subnet-group`, {
    subnetIds: vpc.privateSubnetIds,
    tags: commonTags,
});

const redisSecurityGroup = new aws.ec2.SecurityGroup(`${stackName}-redis-sg`, {
    vpcId: vpc.vpcId,
    description: "Security group for ElastiCache Redis",
    ingress: [{
        protocol: "tcp",
        fromPort: 6379,
        toPort: 6379,
        securityGroups: cluster.nodeSecurityGroup.apply(sg => sg ? [sg.id] : []),
    }],
    tags: commonTags,
});

const redisPassword = new aws.secretsmanager.Secret(`${stackName}-redis-password`, {
    description: "Redis password for TagPay",
    tags: commonTags,
});

const redisPasswordVersion = new aws.secretsmanager.SecretVersion(`${stackName}-redis-password-version`, {
    secretId: redisPassword.id,
    secretString: "tagpay-redis-password-2024", // In production, use a secure random password
});

const redis = new aws.elasticache.Cluster(`${stackName}-redis`, {
    engine: "redis",
    nodeType: envConfig.redisConfig.nodeType,
    numCacheNodes: envConfig.redisConfig.numCacheNodes,
    parameterGroupName: "default.redis7",
    port: 6379,
    subnetGroupName: redisSubnetGroup.name,
    securityGroupIds: [redisSecurityGroup.id],
    tags: commonTags,
});

// Application Load Balancer
const albSecurityGroup = new aws.ec2.SecurityGroup(`${stackName}-alb-sg`, {
    vpcId: vpc.vpcId,
    description: "Security group for Application Load Balancer",
    ingress: [
        {
            protocol: "tcp",
            fromPort: 80,
            toPort: 80,
            cidrBlocks: ["0.0.0.0/0"],
        },
        {
            protocol: "tcp",
            fromPort: 443,
            toPort: 443,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    egress: [{
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
    }],
    tags: commonTags,
});

const alb = new aws.lb.LoadBalancer(`${stackName}-alb`, {
    internal: false,
    loadBalancerType: "application",
    securityGroups: [albSecurityGroup.id],
    subnets: vpc.publicSubnetIds,
    enableDeletionProtection: environment === "production",
    tags: commonTags,
});

// Route 53 Hosted Zone (if domain is provided)
let hostedZone: aws.route53.Zone | undefined;

if (envConfig.domainName) {
    hostedZone = new aws.route53.Zone(`${stackName}-hosted-zone`, {
        name: envConfig.domainName,
        tags: commonTags,
    });
}

// CloudWatch Log Group
const logGroup = new aws.cloudwatch.LogGroup(`${stackName}-logs`, {
    name: `/aws/eks/${stackName}/application`,
    retentionInDays: environment === "production" ? 30 : 7,
    tags: commonTags,
});

// IAM Role for EKS Service Account
const eksServiceAccountRole = new aws.iam.Role(`${stackName}-eks-service-account`, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: "eks.amazonaws.com",
    }),
    tags: commonTags,
});

// Attach necessary policies
const eksServiceAccountPolicy = new aws.iam.RolePolicyAttachment(`${stackName}-eks-service-account-policy`, {
    role: eksServiceAccountRole,
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
});

// S3 Bucket for application assets
const appAssetsBucket = new aws.s3.Bucket(`${stackName}-assets`, {
    acl: "private",
    versioning: {
        enabled: environment === "production",
    },
    serverSideEncryptionConfiguration: {
        rule: {
            applyServerSideEncryptionByDefault: {
                sseAlgorithm: "AES256",
            },
        },
    },
    tags: commonTags,
});

// Additional infrastructure components
const additionalInfra = createTagPayInfrastructure({
    environment,
    projectName,
    domainName: envConfig.domainName,
    enableWAF: envConfig.enableWAF,
    enableCloudFront: envConfig.enableCloudFront,
    enableSES: envConfig.enableSES,
    enableSNS: envConfig.enableSNS,
});

// Export outputs
export const clusterName = cluster.eksCluster.name;
export const clusterEndpoint = cluster.eksCluster.endpoint;
export const clusterKubeconfig = cluster.kubeconfig;
export const vpcId = vpc.vpcId;
export const privateSubnetIds = vpc.privateSubnetIds;
export const publicSubnetIds = vpc.publicSubnetIds;
export const dbEndpoint = db.endpoint;
export const dbName = db.dbName;
export const redisEndpoint = redis.cacheNodes[0].address;
export const albDnsName = alb.dnsName;
export const hostedZoneNameServers = hostedZone?.nameServers;
export const logGroupName = logGroup.name;
export const appAssetsBucketName = appAssetsBucket.id;
export const wafWebAclId = additionalInfra.wafWebAcl?.id;
export const cloudFrontDistributionId = additionalInfra.cloudFrontDistribution?.id;
export const sesDomainName = additionalInfra.sesDomain?.domain;
export const snsTopicArn = additionalInfra.snsTopic?.arn;
