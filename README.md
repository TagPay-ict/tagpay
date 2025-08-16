# TagPay - Financial Services Platform

TagPay is a modern financial technology application designed to streamline digital payments, enhance financial management, and empower users with secure and efficient transaction tools.

## 🏗️ **Architecture**

TagPay is built as a monorepo with the following components:

- **Server API**: Node.js/Express backend with TypeScript
- **Admin Dashboard**: React frontend with Vite
- **Infrastructure**: Kubernetes with Kustomize overlays
- **Development**: Skaffold for streamlined development workflow

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- Docker
- Kubernetes cluster (local or remote)
- Skaffold (for development)

### **Installation**

```bash
# Clone the repository
git clone https://github.com/TagPay-ict/tagpay.git
cd tagpay

# Install dependencies
npm install

# Install Skaffold (if not already installed)
# macOS: brew install skaffold
# Linux: curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
```

### **Development with Skaffold**

```bash
# Start development mode with hot reload
npm run skaffold:dev:hot

# Or use the script directly
./scripts/skaffold-dev.sh dev local-dev
```

### **Traditional Development**

```bash
# Start all services
npm run dev

# Start individual services
npm run start:server
npm run start:admin
```

## 🔧 **Development Workflows**

### **Skaffold Development (Recommended)**

Skaffold provides an optimized development experience with:

- **Hot Reload**: Automatic code syncing and container restart
- **Multi-Service Management**: Handle all services in one command
- **Port Forwarding**: Automatic local access to services
- **Environment Profiles**: Easy switching between dev/staging/prod

```bash
# Development commands
npm run skaffold:dev        # Start development mode
npm run skaffold:dev:hot    # Start with hot reload
npm run skaffold:run        # Build and deploy once
npm run skaffold:build      # Build images only
npm run skaffold:deploy     # Deploy only
npm run skaffold:cleanup    # Clean up resources
npm run skaffold:status     # Show status
npm run skaffold:logs       # Show logs
```

### **Docker Compose Development**

For local development without Kubernetes:

```bash
# Start all services
npm run docker:dev

# View logs
npm run docker:dev:logs

# Stop services
npm run docker:dev:down
```

### **Kubernetes Development**

For direct Kubernetes management:

```bash
# Deploy to development
./infra/k8s/scripts/deploy.sh deploy development

# View status
./infra/k8s/scripts/deploy.sh status development

# View logs
./infra/k8s/scripts/deploy.sh logs development server
```

## 📁 **Project Structure**

```
tagpay/
├── apps/
│   ├── server/              # Node.js API server
│   │   ├── src/            # Source code
│   │   ├── Dockerfile      # Production Dockerfile
│   │   └── Dockerfile.dev  # Development Dockerfile
│   └── admin/              # React admin dashboard
│       ├── src/            # Source code
│       ├── Dockerfile      # Production Dockerfile
│       └── Dockerfile.dev  # Development Dockerfile
├── infra/
│   ├── k8s/                # Kubernetes manifests
│   │   ├── base/           # Base configurations
│   │   ├── overlays/       # Environment overlays
│   │   ├── scripts/        # Deployment scripts
│   │   └── templates/      # Secret templates
│   └── nginx/              # Nginx configuration
│       ├── Dockerfile      # Production Dockerfile
│       └── Dockerfile.dev  # Development Dockerfile
├── scripts/
│   ├── skaffold-dev.sh     # Skaffold development script
│   └── test-skaffold.sh    # Skaffold test script
├── skaffold.yaml           # Skaffold configuration
├── docker-compose.yml      # Docker Compose for local dev
├── docker-compose.dev.yml  # Docker Compose for development
└── package.json            # Root package.json
```

## 🌍 **Environments**

### **Development**

- **Purpose**: Local development and testing
- **Features**: Hot reload, fast builds, local database
- **Access**: `localhost:3000` (API), `localhost:8080` (Admin)

### **Staging**

- **Purpose**: Pre-production testing
- **Features**: Production-like environment, external services
- **Access**: `staging.tagpay.example.com`

### **Production**

- **Purpose**: Live production environment
- **Features**: High availability, monitoring, security
- **Access**: `tagpay.example.com`

## 🔒 **Security**

The project implements comprehensive security measures:

- **Kubernetes Secrets**: Template-based secret management
- **Network Policies**: Pod-to-pod communication control
- **RBAC**: Role-based access control
- **Security Scanning**: Image vulnerability scanning

See [infra/k8s/SECURITY.md](infra/k8s/SECURITY.md) for detailed security guidelines.

## 📚 **Documentation**

- **[Skaffold Guide](SKAFFOLD.md)**: Complete Skaffold development guide
- **[Kubernetes Guide](infra/k8s/README.md)**: Kubernetes infrastructure documentation
- **[Security Guide](infra/k8s/SECURITY.md)**: Security best practices
- **[Quick Start](infra/k8s/QUICKSTART.md)**: Kubernetes quick start guide

## 🧪 **Testing**

```bash
# Run all tests
npm run test

# Run linting
npm run lint

# Test Skaffold configuration
./scripts/test-skaffold.sh all
```

## 🚀 **Deployment**

### **Development Deployment**

```bash
# Using Skaffold (recommended)
npm run skaffold:dev

# Using Kubernetes scripts
./infra/k8s/scripts/deploy.sh deploy development
```

### **Production Deployment**

```bash
# Using Skaffold
npm run skaffold:run production

# Using Kubernetes scripts
./infra/k8s/scripts/deploy.sh deploy production
```

## 🔧 **Configuration**

### **Environment Variables**

Key environment variables are managed through Kubernetes ConfigMaps and Secrets:

- Database configuration
- API keys (Dojah, Termii)
- JWT secrets
- Redis configuration

### **Build Configuration**

- **Development**: Fast builds with hot reload
- **Staging**: Optimized builds for testing
- **Production**: Production builds with security scanning

## 🐛 **Troubleshooting**

### **Common Issues**

**1. Skaffold Build Fails**

```bash
# Check Docker daemon
docker ps

# Validate configuration
./scripts/test-skaffold.sh config
```

**2. Kubernetes Deployment Fails**

```bash
# Check cluster connectivity
kubectl cluster-info

# Check namespace
kubectl get namespace tagpay-dev
```

**3. Port Forwarding Issues**

```bash
# Check if ports are in use
lsof -i :3000
lsof -i :8080
```

### **Getting Help**

- **Documentation**: Check the documentation files above
- **Issues**: Create an issue in the repository
- **Security**: Contact the security team for sensitive issues

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the ISC License.

## 👨‍💻 **Author**

**Ralph** - [GitHub](https://github.com/wealthralph)

---

**Happy Coding! 🚀**
