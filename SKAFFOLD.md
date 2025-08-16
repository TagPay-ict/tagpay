# Skaffold Development Guide

## 🚀 **Overview**

Skaffold is a command-line tool that facilitates continuous development for Kubernetes applications. It handles the workflow for building, pushing, and deploying applications, allowing you to focus on writing code instead of managing deployments.

## 📋 **Prerequisites**

- [Skaffold](https://skaffold.dev/docs/install/) (v2.0+)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (v1.24+)
- [Docker](https://docs.docker.com/get-docker/) (v20.0+)
- Access to a Kubernetes cluster

## 🏗️ **Architecture**

### **Skaffold Configuration Structure**

```
tagpay/
├── skaffold.yaml              # Main Skaffold configuration
├── apps/
│   ├── server/
│   │   ├── Dockerfile         # Production Dockerfile (with Turbo prune)
│   │   └── Dockerfile.dev     # Development Dockerfile (with Turbo prune)
│   └── admin/
│       ├── Dockerfile         # Production Dockerfile (with Turbo prune)
│       └── Dockerfile.dev     # Development Dockerfile (with Turbo prune)
├── infra/
│   ├── k8s/                   # Kustomize overlays
│   └── nginx/
│       ├── Dockerfile         # Production Dockerfile
│       └── Dockerfile.dev     # Development Dockerfile
└── scripts/
    └── skaffold-dev.sh        # Development helper script
```

### **Turbo Prune Integration**

The development Dockerfiles use [Turbo prune](https://turborepo.com/docs/reference/prune) to:

1. **Analyze Dependencies**: Determine which internal packages are needed
2. **Create Pruned Workspace**: Generate a minimal workspace with only required dependencies
3. **Optimize Builds**: Reduce build context and improve layer caching
4. **Handle Monorepo Dependencies**: Ensure all internal packages are available in containers

### **Services**

1. **tagpay-server**: Node.js API server
2. **tagpay-admin**: React admin dashboard
3. **tagpay-nginx**: Nginx reverse proxy

## 🔧 **Profiles**

### **Development Profile**

- **Purpose**: Local development with fast builds
- **Features**: Hot reload, file watching, port forwarding
- **Target**: `development` Docker stage
- **Deploy**: `infra/k8s/overlays/development`

### **Staging Profile**

- **Purpose**: Pre-production testing
- **Features**: Optimized builds, staging environment
- **Target**: `staging` Docker stage
- **Deploy**: `infra/k8s/overlays/staging`

### **Production Profile**

- **Purpose**: Production deployment
- **Features**: Production builds, security scanning
- **Target**: `production` Docker stage
- **Deploy**: `infra/k8s/overlays/production`

### **Local-Dev Profile**

- **Purpose**: Local development with hot reload and Turbo prune
- **Features**: File sync, nodemon, Vite dev server, monorepo dependency handling
- **Target**: Development Dockerfiles with sync and Turbo prune
- **Deploy**: `infra/k8s/overlays/development`

## 🚀 **Quick Start**

### **1. Start Development Mode**

```bash
# Start with development profile (default)
./scripts/skaffold-dev.sh dev

# Start with hot reload
./scripts/skaffold-dev.sh dev local-dev

# Start with staging profile
./scripts/skaffold-dev.sh dev staging
```

### **2. Run Once (Build & Deploy)**

```bash
# Run once with development profile
./scripts/skaffold-dev.sh run

# Run once with production profile
./scripts/skaffold-dev.sh run production
```

### **3. Build Only**

```bash
# Build images only
./scripts/skaffold-dev.sh build

# Build for production
./scripts/skaffold-dev.sh build production
```

### **4. Deploy Only**

```bash
# Deploy only (assumes images are built)
./scripts/skaffold-dev.sh deploy
```

## 🔄 **Development Workflow**

### **Local Development with Hot Reload**

```bash
# Start development with hot reload
./scripts/skaffold-dev.sh dev local-dev
```

**What happens:**

1. Skaffold builds development Docker images using Turbo prune
2. Turbo prune analyzes dependencies and creates minimal workspace
3. Deploys to Kubernetes cluster
4. Sets up port forwarding
5. Watches for file changes
6. Syncs changes to running containers
7. Restarts services when needed

### **File Watching & Sync**

**Server (TypeScript):**

- Watches: `apps/server/src/**/*.ts`
- Syncs: TypeScript files, package.json, tsconfig.json
- Hot reload: Uses tsx (TypeScript execution engine)

**Admin (React):**

- Watches: `apps/admin/src/**/*.{ts,tsx,js,jsx}`
- Syncs: React files, package.json, vite.config.ts
- Hot reload: Uses Vite dev server

**Nginx:**

- Watches: Configuration files
- Syncs: nginx.conf, default.dev.conf
- Hot reload: Nginx configuration reload

## 🌐 **Port Forwarding**

### **Port Configuration Strategy**

The admin service uses different ports based on the environment:

- **Development**: Port 5173 (Vite dev server)
- **Production**: Port 80 (Nginx serving built files)

This is handled through Kustomize patches:

- `infra/k8s/overlays/development/admin-patch.yaml` - Sets port 5173
- `infra/k8s/overlays/production/admin-patch.yaml` - Sets port 80

Skaffold automatically sets up port forwarding:

- **Server API**: `localhost:3000` → `server-service:3000`
- **Admin Dashboard**: `localhost:8080` → `admin-service:5173` (dev) / `admin-service:80` (prod)
- **Nginx Proxy**: `localhost:8081` → `nginx-service:80`

### **Access Your Application**

```bash
# API Server
curl http://localhost:3000/api/v1/health

# Admin Dashboard
open http://localhost:8080

# Nginx Proxy
curl http://localhost:8081
```

## 🛠️ **Advanced Usage**

### **Custom Build Arguments**

```yaml
# In skaffold.yaml
build:
  artifacts:
    - image: tagpay-server
      docker:
        buildArgs:
          NODE_ENV: development
          BUILD_VERSION: "1.0.0"
```

### **Environment-Specific Configuration**

```bash
# Use different profiles for different environments
skaffold dev --profile development
skaffold dev --profile staging
skaffold dev --profile production
```

### **Custom Kustomize Flags**

```yaml
# In skaffold.yaml
deploy:
  kustomize:
    path: infra/k8s/overlays/development
    flags:
      global:
        - --enable-helm
        - --enable-alpha-plugins
```

### **Resource Limits**

```yaml
# In skaffold.yaml
build:
  local:
    useDockerCLI: true
    useBuildkit: true
    concurrency: 3 # Limit concurrent builds
```

## 🔍 **Monitoring & Debugging**

### **View Logs**

```bash
# View all service logs
./scripts/skaffold-dev.sh logs

# View specific service logs
kubectl logs -f deployment/server -n tagpay-dev
kubectl logs -f deployment/admin -n tagpay-dev
```

### **Check Status**

```bash
# Check Skaffold status
./scripts/skaffold-dev.sh status

# Check Kubernetes resources
kubectl get all -n tagpay-dev
```

### **Debug Build Issues**

```bash
# Build with verbose output
skaffold build --profile development --verbose

# Debug specific artifact
skaffold build --profile development --artifact=tagpay-server
```

## 🧹 **Cleanup**

### **Clean Up Resources**

```bash
# Clean up Skaffold resources
./scripts/skaffold-dev.sh cleanup

# Or manually
skaffold delete
```

### **Clean Up Images**

```bash
# Remove local images
docker rmi tagpay-server:latest
docker rmi tagpay-admin:latest
docker rmi tagpay-nginx:latest
```

## 🔧 **Configuration Reference**

### **Turbo Prune Integration**

The development workflow uses Turbo prune to handle monorepo dependencies:

```bash
# Turbo prune command used in Dockerfiles
turbo prune @tagpay/server --docker
turbo prune @tagpay/admin --docker
```

**What Turbo prune does:**

- Analyzes the dependency graph for the target package
- Creates a pruned workspace with only required dependencies
- Generates optimized `package.json` files
- Reduces build context size
- Ensures all internal packages are available

**Output structure:**

```
out/
├── json/           # Pruned package.json files
├── full/           # Full source code of required packages
└── package-lock.json  # Pruned lockfile
```

### **Build Configuration**

```yaml
build:
  local:
    useDockerCLI: true
    useBuildkit: true

  artifacts:
    - image: tagpay-server
      docker:
        dockerfile: apps/server/Dockerfile
        buildArgs:
          NODE_ENV: development
        target: development
      sync:
        manual:
          - src: "apps/server/src/**/*.ts"
            dest: .
```

### **Deploy Configuration**

```yaml
deploy:
  kustomize:
    path: infra/k8s/overlays/development
    flags:
      global:
        - --enable-helm
```

### **Port Forwarding**

```yaml
portForward:
  - resourceType: service
    resourceName: server-service
    port: 3000
    localPort: 3000
```

### **Profiles**

```yaml
profiles:
  - name: development
    patches:
      - op: replace
        path: /build/artifacts/0/docker/target
        value: development
```

## 🚨 **Troubleshooting**

### **Common Issues**

**1. Build Fails**

```bash
# Check Docker daemon
docker ps

# Check build context
skaffold build --profile development --verbose
```

**2. Deploy Fails**

```bash
# Check cluster connectivity
kubectl cluster-info

# Check namespace
kubectl get namespace tagpay-dev

# Check Kustomize
kustomize build infra/k8s/overlays/development
```

**3. Port Forwarding Issues**

```bash
# Check if ports are in use
lsof -i :3000
lsof -i :8080

# Check service status
kubectl get services -n tagpay-dev
```

**4. File Sync Not Working**

```bash
# Check sync configuration
skaffold dev --profile local-dev --verbose

# Check file permissions
ls -la apps/server/src/
```

### **Debug Commands**

```bash
# Enable verbose logging
skaffold dev --profile development --verbose

# Debug specific component
skaffold dev --profile development --artifact=tagpay-server

# Check Skaffold configuration
skaffold diagnose
```

## 📚 **Best Practices**

### **1. Use Profiles**

- Separate configurations for different environments
- Use meaningful profile names
- Document profile-specific settings

### **2. Optimize Builds**

- Use multi-stage Dockerfiles
- Leverage Docker layer caching
- Use BuildKit for faster builds

### **3. File Watching**

- Watch only necessary files
- Use appropriate sync patterns
- Avoid watching large directories

### **4. Resource Management**

- Set appropriate resource limits
- Clean up resources regularly
- Monitor cluster usage

### **5. Security**

- Use non-root containers
- Scan images for vulnerabilities
- Follow security best practices

## 🔄 **CI/CD Integration**

### **GitHub Actions Example**

```yaml
name: Deploy to Staging
on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Skaffold
        run: |
          curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
          chmod +x skaffold
          sudo mv skaffold /usr/local/bin
      - name: Deploy to Staging
        run: skaffold run --profile staging
```

### **Local Development Workflow**

```bash
# 1. Start development
./scripts/skaffold-dev.sh dev local-dev

# 2. Make changes to code
# 3. Changes are automatically synced

# 4. Test changes
curl http://localhost:3000/api/v1/health

# 5. Commit and push
git add .
git commit -m "Add new feature"
git push origin main
```

## 📞 **Support**

- **Documentation**: [Skaffold Docs](https://skaffold.dev/docs/)
- **GitHub**: [Skaffold Repository](https://github.com/GoogleContainerTools/skaffold)
- **Issues**: Create an issue in the TagPay repository

---

**Happy Developing with Skaffold! 🚀**
