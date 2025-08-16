// TagPay Infrastructure Configuration
// This file contains additional infrastructure components for TagPay

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Additional infrastructure components for TagPay

export interface TagPayInfrastructureConfig {
    environment: string;
    projectName: string;
    domainName?: string;
    enableWAF?: boolean;
    enableCloudFront?: boolean;
    enableSES?: boolean;
    enableSNS?: boolean;
}

export function createTagPayInfrastructure(config: TagPayInfrastructureConfig) {
    const stackName = `${config.projectName}-${config.environment}`;
    
    // Common tags
    const commonTags = {
        Project: config.projectName,
        Environment: config.environment,
        ManagedBy: "pulumi",
        Owner: "tagpay-team"
    };

    // WAF Web ACL for API protection
    const wafWebAcl = config.enableWAF ? new aws.wafv2.WebAcl(`${stackName}-waf`, {
        defaultAction: {
            allow: {},
        },
        description: "WAF for TagPay API protection",
        name: `${stackName}-waf`,
        scope: "REGIONAL",
        visibilityConfig: {
            cloudwatchMetricsEnabled: true,
            metricName: `${stackName}-waf-metric`,
            sampledRequestsEnabled: true,
        },
        rules: [
            {
                name: "RateLimitRule",
                priority: 1,
                action: {
                    block: {},
                },
                statement: {
                    rateBasedStatement: {
                        limit: 2000,
                        aggregateKeyType: "IP",
                    },
                },
                visibilityConfig: {
                    cloudwatchMetricsEnabled: true,
                    metricName: "RateLimitRule",
                    sampledRequestsEnabled: true,
                },
            },
        ],
        tags: commonTags,
    }) : undefined;

    // CloudFront distribution for static assets
    const cloudFrontDistribution = config.enableCloudFront ? new aws.cloudfront.Distribution(`${stackName}-cf`, {
        enabled: true,
        isIpv6Enabled: true,
        defaultRootObject: "index.html",
        priceClass: "PriceClass_100",
        aliases: config.domainName ? [config.domainName] : [],
        origins: [
            {
                domainName: "tagpay-assets.s3.amazonaws.com", // This would be your S3 bucket
                originId: "S3-tagpay-assets",
                s3OriginConfig: {
                    originAccessIdentity: "origin-access-identity/cloudfront/EXAMPLE",
                },
            },
        ],
        defaultCacheBehavior: {
            allowedMethods: ["GET", "HEAD"],
            cachedMethods: ["GET", "HEAD"],
            targetOriginId: "S3-tagpay-assets",
            forwardedValues: {
                queryString: false,
                cookies: {
                    forward: "none",
                },
            },
            viewerProtocolPolicy: "redirect-to-https",
            minTtl: 0,
            defaultTtl: 86400,
            maxTtl: 31536000,
        },
        restrictions: {
            geoRestriction: {
                restrictionType: "none",
            },
        },
        viewerCertificate: {
            cloudfrontDefaultCertificate: !config.domainName,
            acmCertificateArn: config.domainName ? "arn:aws:acm:us-east-1:123456789012:certificate/example" : undefined,
            sslSupportMethod: "sni-only",
            minimumProtocolVersion: "TLSv1.2_2021",
        },
        tags: commonTags,
    }) : undefined;

    // SES for email notifications
    const sesDomain = config.enableSES ? new aws.ses.DomainIdentity(`${stackName}-ses-domain`, {
        domain: config.domainName || "tagpay.example.com",
    }) : undefined;

    // SNS for notifications
    const snsTopic = config.enableSNS ? new aws.sns.Topic(`${stackName}-notifications`, {
        name: `${stackName}-notifications`,
        tags: commonTags,
    }) : undefined;

    return {
        wafWebAcl,
        cloudFrontDistribution,
        sesDomain,
        snsTopic,
    };
}
