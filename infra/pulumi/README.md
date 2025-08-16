# TagPay Infrastructure as Code

This directory contains the Pulumi infrastructure code for TagPay, provisioning AWS resources for staging and production environments.

## 🏗️ Infrastructure Components

### Core Services
- **EKS Cluster** - Kubernetes orchestration
- **VPC & Networking** - Network isolation and security
- **RDS PostgreSQL** - Production database
- **ElastiCache Redis** - Caching and session storage
- **Application Load Balancer** - Traffic distribution
- **Route 53** - DNS management
- **Secrets Manager** - Secure secret storage
- **CloudWatch** - Monitoring and logging
- **S3** - Static file storage
- **IAM** - Service accounts and permissions

## 🚀 Quick Start

### Prerequisites
- Pulumi CLI installed
- AWS credentials configured
- Node.js 18+

### Installation
```bash
cd infra/pulumi
npm install
```

### Deploy to Staging
```bash
npm run deploy:staging
```

### Deploy to Production
```bash
npm run deploy:production
```

### Preview Changes
```bash
npm run preview:staging
npm run preview:production
```

## 📊 Resource Sizing

### Staging Environment
- EKS: 2-3 t3.medium nodes
- RDS: db.t3.micro (20GB)
- Redis: cache.t3.micro
- ALB: Application Load Balancer

### Production Environment
- EKS: 2-5 t3.large nodes
- RDS: db.t3.large (100GB)
- Redis: cache.t3.micro (can be upgraded)
- ALB: Application Load Balancer with deletion protection

## 🔒 Security Features

- VPC with private subnets for databases
- Security groups with minimal required access
- Secrets Manager for sensitive data
- IAM roles with least privilege
- Encryption at rest and in transit

## 📈 Monitoring

- CloudWatch logs for application logs
- CloudWatch metrics for resource monitoring
- RDS and ElastiCache monitoring
- EKS cluster monitoring

## 🧹 Cleanup

### Destroy Staging
```bash
npm run destroy:staging
```

### Destroy Production
```bash
npm run destroy:production
```

## 🔄 Updates

### Update Infrastructure
```bash
pulumi up --stack staging
pulumi up --stack production
```

### Refresh State
```bash
npm run refresh:staging
npm run refresh:production
```

## 📞 Support

For infrastructure issues:
1. Check Pulumi documentation
2. Review AWS service limits
3. Contact the DevOps team
