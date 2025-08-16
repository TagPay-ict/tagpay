# TagPay Kubernetes Infrastructure

This directory contains the complete Kubernetes infrastructure for the TagPay application using Kustomize overlays for environment-specific configurations.

## Overview

The Kubernetes setup provides:

- **Multi-environment support**: Development, Staging, and Production
- **High availability**: Multiple replicas, health checks, and auto-scaling
- **Security**: Network policies, RBAC, and secrets management
- **Monitoring**: Health checks, readiness probes, and resource limits
- **Scalability**: Horizontal Pod Autoscalers and Pod Disruption Budgets

## 🔒 **Security First**

**⚠️ IMPORTANT**: This Kubernetes setup implements comprehensive security measures to protect sensitive data. See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

### **Key Security Features:**

- ✅ **Template-based secrets**: No real secrets in version control
- ✅ **Automated secret generation**: Safe development/staging secrets
- ✅ **Git protection**: .gitignore prevents accidental commits
- ✅ **Validation scripts**: Pre-deployment security checks
- ✅ **Environment isolation**: Separate namespaces and resources

## Architecture

### Resource Organization

- **Deployments + Services**: Combined in single files (e.g., `postgres.yaml` contains both deployment and service)
- **RBAC**: Role and RoleBinding in `rbac.yaml`
- **HPA**: Multiple HorizontalPodAutoscalers in `hpa.yaml`
- **PDB**: Multiple PodDisruptionBudget resources in `pdb.yaml`

This approach provides:

- **Better organization**: Related resources are grouped together
- **Easier maintenance**: Fewer files to manage
- **Logical grouping**: Resources that work together are in the same file
- **Cleaner structure**: Reduced file count while maintaining clarity

```
infra/k8s/
├── base/                    # Base configuration
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── pvc.yaml
│   ├── postgres.yaml        # Deployment + Service
│   ├── redis.yaml          # Deployment + Service
│   ├── server.yaml         # Deployment + Service
│   ├── admin.yaml          # Deployment + Service
│   ├── nginx.yaml          # Deployment + Service
│   ├── ingress.yaml
│   ├── service-account.yaml
│   ├── rbac.yaml           # Role + RoleBinding
│   ├── network-policy.yaml
│   ├── hpa.yaml            # Server + Admin HPAs
│   └── pdb.yaml            # Server + Admin + Nginx PDBs
└── overlays/               # Environment-specific configurations
    ├── development/        # Development environment
    │   ├── kustomization.yaml
    │   ├── namespace-patch.yaml
    │   ├── configmap-patch.yaml
    │   ├── server-patch.yaml
    │   ├── admin-patch.yaml
    │   ├── nginx-patch.yaml
    │   └── ingress-patch.yaml
    ├── staging/           # Staging environment
    │   ├── kustomization.yaml
    │   ├── namespace-patch.yaml
    │   ├── configmap-patch.yaml
    │   ├── server-patch.yaml
    │   ├── admin-patch.yaml
    │   ├── nginx-patch.yaml
    │   └── ingress-patch.yaml
    └── production/        # Production environment
        ├── kustomization.yaml
        ├── namespace-patch.yaml
        ├── configmap-patch.yaml
        ├── server-patch.yaml
        ├── admin-patch.yaml
        ├── nginx-patch.yaml
        └── ingress-patch.yaml
```

## Components

### Core Services

- **PostgreSQL**: Database with persistent storage
- **Redis**: Caching and session storage
- **Server**: Node.js API server
- **Admin**: React admin dashboard
- **Nginx**: Reverse proxy and load balancer

### Infrastructure Components

- **Ingress Controller**: External access and SSL termination
- **Service Accounts**: RBAC and permissions
- **Network Policies**: Security and traffic control
- **Horizontal Pod Autoscalers**: Automatic scaling
- **Pod Disruption Budgets**: High availability

## Environments

### Development

- **Namespace**: `tagpay-dev`
- **Replicas**: 1 per service
- **Resources**: Minimal (for cost optimization)
- **SSL**: Disabled
- **Rate Limiting**: Relaxed
- **Logging**: Debug level

### Staging

- **Namespace**: `tagpay-staging`
- **Replicas**: 2 per service
- **Resources**: Medium
- **SSL**: Enabled (Let's Encrypt staging)
- **Rate Limiting**: Moderate
- **Logging**: Info level

### Production

- **Namespace**: `tagpay-prod`
- **Replicas**: 3 per service
- **Resources**: High
- **SSL**: Enabled (Let's Encrypt production)
- **Rate Limiting**: Strict
- **Logging**: Warn level

## Prerequisites

### Required Tools

- `kubectl` (v1.24+)
- `kustomize` (v4.5+)
- `helm` (v3.8+)

### Required Components

- **Ingress Controller**: NGINX Ingress Controller
- **Cert Manager**: For SSL certificate management
- **Metrics Server**: For HPA functionality
- **Storage Class**: For persistent volumes

### Installation Commands

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.0/deploy/static/provider/cloud/deploy.yaml

# Install Cert Manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Install Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Usage

### Deploy to Development

```bash
# Build and apply development configuration
kubectl apply -k overlays/development

# Check deployment status
kubectl get all -n tagpay-dev

# View logs
kubectl logs -f deployment/server -n tagpay-dev
```

### Deploy to Staging

```bash
# Build and apply staging configuration
kubectl apply -k overlays/staging

# Check deployment status
kubectl get all -n tagpay-staging

# View ingress
kubectl get ingress -n tagpay-staging
```

### Deploy to Production

```bash
# Build and apply production configuration
kubectl apply -k overlays/production

# Check deployment status
kubectl get all -n tagpay-prod

# Monitor scaling
kubectl get hpa -n tagpay-prod
```

### Delete Deployment

```bash
# Delete development environment
kubectl delete -k overlays/development

# Delete staging environment
kubectl delete -k overlays/staging

# Delete production environment
kubectl delete -k overlays/production
```

## Configuration

### Environment Variables

Each environment has its own configuration through ConfigMaps and Secrets:

**ConfigMap Variables:**

- Database configuration
- Redis configuration
- Application settings
- Logging configuration
- Rate limiting settings
- CORS configuration

**Secret Variables:**

- Database passwords
- JWT secrets
- API keys
- SSL certificates

### Resource Limits

Each environment has different resource allocations:

**Development:**

- Server: 256Mi-512Mi RAM, 100m-250m CPU
- Admin: 128Mi-256Mi RAM, 50m-100m CPU
- Nginx: 64Mi-128Mi RAM, 50m-100m CPU

**Staging:**

- Server: 512Mi-1Gi RAM, 250m-500m CPU
- Admin: 256Mi-512Mi RAM, 100m-250m CPU
- Nginx: 128Mi-256Mi RAM, 100m-200m CPU

**Production:**

- Server: 1Gi-2Gi RAM, 500m-1000m CPU
- Admin: 512Mi-1Gi RAM, 250m-500m CPU
- Nginx: 256Mi-512Mi RAM, 200m-400m CPU

## Monitoring and Scaling

### Health Checks

All services include:

- **Liveness Probes**: Restart unhealthy pods
- **Readiness Probes**: Ensure pods are ready to serve traffic
- **Startup Probes**: Handle slow-starting containers

### Auto Scaling

- **Server HPA**: 2-10 replicas based on CPU/Memory
- **Admin HPA**: 2-8 replicas based on CPU/Memory
- **Scaling Policies**: Conservative scale-down, aggressive scale-up

### High Availability

- **Pod Disruption Budgets**: Ensure minimum availability during updates
- **Multiple Replicas**: Distributed across nodes
- **Anti-affinity**: Prevent single point of failure

## Security

### Network Policies

- **Ingress**: Allow traffic from ingress controller
- **Egress**: Allow DNS and external API access
- **Inter-service**: Allow communication between services

### RBAC

- **Service Account**: Limited permissions for application
- **Role**: Read access to configmaps, secrets, and services
- **Role Binding**: Bind role to service account

### Secrets Management

- **Opaque Secrets**: Store sensitive configuration
- **TLS Secrets**: SSL certificates (managed by Cert Manager)
- **Base64 Encoding**: All secret values are base64 encoded

## Troubleshooting

### Common Issues

1. **Image Pull Errors**

   ```bash
   # Check image availability
   kubectl describe pod <pod-name> -n <namespace>

   # Verify image tags
   kubectl get deployment <deployment-name> -n <namespace> -o yaml
   ```

2. **Database Connection Issues**

   ```bash
   # Check database pod status
   kubectl get pods -l component=postgres -n <namespace>

   # View database logs
   kubectl logs -f deployment/postgres -n <namespace>
   ```

3. **Ingress Issues**

   ```bash
   # Check ingress controller
   kubectl get pods -n ingress-nginx

   # View ingress events
   kubectl describe ingress tagpay-ingress -n <namespace>
   ```

4. **Scaling Issues**

   ```bash
   # Check HPA status
   kubectl get hpa -n <namespace>

   # View metrics server
   kubectl top pods -n <namespace>
   ```

### Debug Commands

```bash
# Get all resources in namespace
kubectl get all -n <namespace>

# View pod logs
kubectl logs -f deployment/<deployment-name> -n <namespace>

# Execute commands in pod
kubectl exec -it <pod-name> -n <namespace> -- /bin/sh

# Port forward for local access
kubectl port-forward service/<service-name> 8080:80 -n <namespace>

# View events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

## Customization

### Adding New Environments

1. Create new overlay directory: `overlays/<environment-name>/`
2. Create `kustomization.yaml` with appropriate patches
3. Create environment-specific patches
4. Update image tags and resource limits

### Modifying Base Configuration

1. Edit files in `base/` directory
2. Test changes with `kubectl apply -k base/`
3. Update overlays if needed

### Adding New Services

1. Create deployment and service YAML files
2. Add to base `kustomization.yaml`
3. Create environment-specific patches
4. Update network policies and RBAC

## Best Practices

### Security

- Use secrets for sensitive data
- Implement network policies
- Regular security updates
- Monitor resource usage

### Reliability

- Use health checks
- Implement proper resource limits
- Use persistent volumes for data
- Regular backups

### Performance

- Monitor resource usage
- Use horizontal pod autoscaling
- Optimize image sizes
- Use appropriate storage classes

### Maintenance

- Regular updates
- Monitor logs
- Backup configurations
- Test disaster recovery
