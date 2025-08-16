# Kubernetes Security Guide

## 🔒 **Security Overview**

This document outlines the security measures implemented in the TagPay Kubernetes infrastructure to ensure sensitive data is protected and not accidentally committed to version control.

## 🚨 **Critical Security Rules**

### **NEVER Commit These Files:**

- ❌ `**/secret.yaml` - Contains actual secret values
- ❌ `**/secret-patch.yaml` - Contains environment-specific secrets
- ❌ `**/configmap-patch.yaml` - Contains sensitive configuration
- ❌ `**/production/` - Production environment files
- ❌ `**/staging/` - Staging environment files

### **SAFE to Commit:**

- ✅ `**/templates/` - Template files with placeholders
- ✅ `**/base/` - Base Kubernetes manifests
- ✅ `**/overlays/development/` - Development environment (with generated secrets)
- ✅ `**/scripts/` - Utility scripts
- ✅ `**/README.md` - Documentation

## 🛡️ **Security Implementation**

### **1. .gitignore Protection**

The `.gitignore` file automatically excludes sensitive files:

```gitignore
# Never commit actual secret files
**/secret.yaml
**/secret-patch.yaml
**/secrets/
**/secret-template.yaml

# Environment-specific configs with real values
**/configmap-patch.yaml
**/production/
**/staging/
```

### **2. Template-Based Approach**

All sensitive data uses templates with placeholders:

```yaml
# templates/secret-template.yaml
apiVersion: v1
kind: Secret
metadata:
  name: tagpay-secrets
  namespace: ${NAMESPACE}
data:
  DATABASE_PASSWORD: ${DATABASE_PASSWORD}
  JWT_SECRET: ${JWT_SECRET}
  DOJAH_API_KEY: ${DOJAH_API_KEY}
```

### **3. Automated Secret Generation**

Development and staging secrets are generated automatically:

```bash
# Generate development secrets
./scripts/generate-secrets.sh dev

# Generate staging secrets
./scripts/generate-secrets.sh staging

# Create production template
./scripts/generate-secrets.sh prod-template
```

## 🔧 **Environment-Specific Security**

### **Development Environment**

- ✅ **Safe to commit**: Generated secrets for local development
- ✅ **Automated**: Secrets generated automatically
- ✅ **Isolated**: Separate namespace and resources

### **Staging Environment**

- ✅ **Safe to commit**: Generated secrets for testing
- ✅ **Automated**: Secrets generated automatically
- ✅ **Isolated**: Separate namespace and resources

### **Production Environment**

- ❌ **Never commit**: Real production secrets
- ⚠️ **Manual**: Secrets must be created manually from template
- 🔒 **Secure**: Uses external secret management (AWS Secrets Manager)

## 📋 **Secret Management Workflow**

### **For Development/Staging:**

```bash
# 1. Generate secrets automatically
./scripts/generate-secrets.sh dev
./scripts/generate-secrets.sh staging

# 2. Deploy safely
./scripts/deploy.sh deploy development
./scripts/deploy.sh deploy staging
```

### **For Production:**

```bash
# 1. Create template
./scripts/generate-secrets.sh prod-template

# 2. Edit template with real values
vim overlays/production/secret-template.yaml

# 3. Validate before deployment
./scripts/validate-secrets.sh prod

# 4. Deploy
./scripts/deploy.sh deploy production
```

## 🔍 **Validation and Monitoring**

### **Pre-Deployment Validation:**

```bash
# Validate all environments
./scripts/validate-secrets.sh all

# Check for sensitive files
./scripts/validate-secrets.sh scan

# Check git status
./scripts/validate-secrets.sh git
```

### **Continuous Monitoring:**

- Automated validation before deployment
- Git hooks to prevent accidental commits
- Regular security scans
- Audit logs for secret access

## 🚀 **Best Practices**

### **1. Secret Creation**

```bash
# Generate base64 encoded secrets
echo -n "your_password" | base64

# Generate random secrets
openssl rand -hex 32
```

### **2. Template Usage**

```yaml
# Replace placeholders with actual values
DATABASE_PASSWORD: $(echo -n "your_db_password" | base64)
JWT_SECRET: $(echo -n "your_jwt_secret" | base64)
```

### **3. External Secret Management**

For production, use AWS Secrets Manager:

```yaml
# external-secret.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: tagpay-external-secret
spec:
  secretStoreRef:
    name: aws-secrets-manager
  target:
    name: tagpay-secrets
  data:
    - secretKey: DATABASE_PASSWORD
      remoteRef:
        key: tagpay/database/password
```

## 🔐 **Network Security**

### **Network Policies**

- Pod-to-pod communication restricted
- Database access limited to application pods
- External API access controlled
- DNS resolution allowed

### **RBAC**

- Service accounts with minimal permissions
- Role-based access control
- Namespace isolation

## 📊 **Security Checklist**

### **Before Committing:**

- [ ] Run `./scripts/validate-secrets.sh scan`
- [ ] Check `git status` for sensitive files
- [ ] Verify `.gitignore` is working
- [ ] Test deployment locally

### **Before Production Deployment:**

- [ ] Validate production secrets
- [ ] Check network policies
- [ ] Verify RBAC permissions
- [ ] Test security configurations

### **Regular Maintenance:**

- [ ] Rotate secrets regularly
- [ ] Update security policies
- [ ] Monitor access logs
- [ ] Review permissions

## 🆘 **Emergency Procedures**

### **If Secrets Are Accidentally Committed:**

1. **Immediate Action:**

   ```bash
   # Remove from git history
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch infra/k8s/**/secret*.yaml' \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Rotate All Secrets:**

   ```bash
   # Generate new secrets
   ./scripts/generate-secrets.sh all
   ```

3. **Update External Systems:**
   - Change database passwords
   - Rotate API keys
   - Update JWT secrets

### **If Production Secrets Are Compromised:**

1. **Immediate Response:**

   - Revoke all API keys
   - Change database passwords
   - Rotate encryption keys

2. **Investigation:**
   - Audit access logs
   - Review security policies
   - Update security measures

## 📞 **Security Contacts**

- **Security Issues**: Create a private issue in the repository
- **Emergency**: Contact the security team immediately
- **Questions**: Review this document or contact the DevOps team

## 🔄 **Security Updates**

This security guide is updated regularly. Always check for the latest version before deployment.

---

**Remember**: Security is everyone's responsibility. When in doubt, ask before committing!
