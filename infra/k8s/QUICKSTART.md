# Quick Start Guide

## 🚀 **Get Started in 5 Minutes**

This guide will help you quickly set up and deploy the TagPay Kubernetes infrastructure with proper security measures.

## 📋 **Prerequisites**

- `kubectl` (v1.24+)
- `kustomize` (v4.5+)
- Access to a Kubernetes cluster
- `openssl` (for secret generation)

## ⚡ **Quick Setup**

### **1. Generate Secrets (First Time Only)**

```bash
# Navigate to the k8s directory
cd infra/k8s

# Generate secrets for all environments
./scripts/generate-secrets.sh all
```

### **2. Deploy to Development**

```bash
# Deploy to development environment
./scripts/deploy.sh deploy development

# Check status
./scripts/deploy.sh status development
```

### **3. Access Your Application**

```bash
# Port forward to access locally
./scripts/deploy.sh port-forward development server 3000 3000

# Or port forward admin dashboard
./scripts/deploy.sh port-forward development admin 8080 80
```

## 🔧 **Environment-Specific Setup**

### **Development Environment**

```bash
# Generate development secrets
./scripts/generate-secrets.sh dev

# Deploy
./scripts/deploy.sh deploy development

# View logs
./scripts/deploy.sh logs development server
```

### **Staging Environment**

```bash
# Generate staging secrets
./scripts/generate-secrets.sh staging

# Deploy
./scripts/deploy.sh deploy staging

# Check status
./scripts/deploy.sh status staging
```

### **Production Environment**

```bash
# Create production template
./scripts/generate-secrets.sh prod-template

# Edit template with real values
vim overlays/production/secret-template.yaml

# Validate secrets
./scripts/validate-secrets.sh prod

# Deploy
./scripts/deploy.sh deploy production
```

## 🛡️ **Security Validation**

### **Before Committing to Git**

```bash
# Validate all environments
./scripts/validate-secrets.sh all

# Check for sensitive files
./scripts/validate-secrets.sh scan

# Check git status
./scripts/validate-secrets.sh git
```

### **Pre-Deployment Checks**

```bash
# Validate specific environment
./scripts/validate-secrets.sh dev
./scripts/validate-secrets.sh staging
./scripts/validate-secrets.sh prod
```

## 📊 **Monitoring and Debugging**

### **Check Application Status**

```bash
# View all resources
kubectl get all -n tagpay-dev

# Check pod status
kubectl get pods -n tagpay-dev

# View events
kubectl get events -n tagpay-dev --sort-by='.lastTimestamp'
```

### **View Logs**

```bash
# Server logs
./scripts/deploy.sh logs development server

# Admin logs
./scripts/deploy.sh logs development admin

# Database logs
kubectl logs -f deployment/postgres -n tagpay-dev
```

### **Debug Issues**

```bash
# Describe resources
kubectl describe deployment/server -n tagpay-dev
kubectl describe service/server-service -n tagpay-dev

# Execute commands in pods
kubectl exec -it deployment/server -n tagpay-dev -- /bin/sh
```

## 🔄 **Common Operations**

### **Update Application**

```bash
# Update image and redeploy
kubectl set image deployment/server server=tagpay-server:new-tag -n tagpay-dev
kubectl rollout status deployment/server -n tagpay-dev
```

### **Scale Application**

```bash
# Scale server deployment
kubectl scale deployment/server --replicas=3 -n tagpay-dev

# Check HPA status
kubectl get hpa -n tagpay-dev
```

### **Delete Environment**

```bash
# Delete development environment
./scripts/deploy.sh delete development

# Delete staging environment
./scripts/deploy.sh delete staging

# Delete production environment
./scripts/deploy.sh delete production
```

## 🚨 **Troubleshooting**

### **Common Issues**

**1. Secret Generation Fails**

```bash
# Check if openssl is installed
which openssl

# Install openssl if missing
# macOS: brew install openssl
# Ubuntu: sudo apt-get install openssl
```

**2. Deployment Fails**

```bash
# Check cluster connectivity
kubectl cluster-info

# Check namespace exists
kubectl get namespace tagpay-dev

# View deployment events
kubectl describe deployment/server -n tagpay-dev
```

**3. Pods Not Starting**

```bash
# Check pod status
kubectl get pods -n tagpay-dev

# View pod logs
kubectl logs deployment/server -n tagpay-dev

# Check resource limits
kubectl describe pod -l app=tagpay -n tagpay-dev
```

**4. Network Issues**

```bash
# Check services
kubectl get services -n tagpay-dev

# Test connectivity
kubectl exec -it deployment/server -n tagpay-dev -- curl postgres-service:5432
```

### **Validation Commands**

```bash
# Validate secrets
./scripts/validate-secrets.sh all

# Check for sensitive files
./scripts/validate-secrets.sh scan

# Validate specific environment
./scripts/validate-secrets.sh dev
```

## 📚 **Next Steps**

1. **Read the Security Guide**: [SECURITY.md](./SECURITY.md)
2. **Review Architecture**: [README.md](./README.md)
3. **Customize Configuration**: Edit templates in `templates/`
4. **Set Up Monitoring**: Configure Prometheus/Grafana
5. **Implement CI/CD**: Set up automated deployments

## 🆘 **Need Help?**

- **Security Issues**: See [SECURITY.md](./SECURITY.md)
- **Deployment Issues**: Check troubleshooting section above
- **Configuration Questions**: Review [README.md](./README.md)
- **Emergency**: Contact the DevOps team

---

**Happy Deploying! 🚀**
