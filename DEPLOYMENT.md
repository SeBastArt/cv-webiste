# Deployment Setup

This document describes the deployment setup for Sebastian Schüler's portfolio website using GitHub Actions, Docker, and Kubernetes with Helm.

## Architecture

- **Static Website**: Served via nginx in Docker container
- **Container Registry**: Docker Hub (`sebastart/sebastianschueler-website`)
- **Orchestration**: Kubernetes with Helm charts
- **Service Mesh**: Istio for traffic management
- **Domain**: sebastianschueler.de (with www redirect)
- **Namespace**: `sebastianschueler`

## Required GitHub Secrets

Configure the following secrets in your GitHub repository settings:

### Docker Hub Access
- `DOCKERHUB_USERNAME`: Your Docker Hub username (likely `sebastart`)
- `DOCKERHUB_TOKEN`: Docker Hub access token (create at hub.docker.com/settings/security)

### Kubernetes Access
- `KUBECONFIG`: Base64-encoded kubeconfig file content for your Kubernetes cluster

## Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy_website.yaml`) triggers on:
- Manual dispatch with custom version
- Push to `main` branch (excluding markdown files)

### Pipeline Steps

1. **Prepare**: Generate version number (`v1.0.<run_number>`)
2. **Build**: 
   - Build Docker image with nginx serving static content
   - Push to Docker Hub with version tag and `latest`
3. **Deploy**:
   - Install kubectl and Helm
   - Configure cluster access
   - Deploy via Helm to `sebastianschueler` namespace

## Local Development

```bash
# Serve locally for development
python -m http.server 8000
# or
npx live-server

# Build Docker image locally
docker build -t sebastart/sebastianschueler-website:local .

# Run container locally
docker run -p 8080:80 sebastart/sebastianschueler-website:local
```

## Manual Deployment

```bash
# Deploy using Helm
helm upgrade --install sebastianschueler-website ./helm/sebastianschueler-website \
  --create-namespace \
  --namespace sebastianschueler \
  --set website.imageVersion=v1.0.123
```

## Istio Configuration

The deployment assumes:
- Istio service mesh is installed
- `istio-system/ingress-gateway` gateway exists
- DNS for `sebastianschueler.de` and `www.sebastianschueler.de` points to your cluster

## File Structure

```
├── .github/workflows/
│   └── deploy_website.yaml    # GitHub Actions workflow
├── helm/
│   └── sebastianschueler-website/
│       ├── Chart.yaml         # Helm chart metadata
│       ├── values.yaml        # Configuration values
│       └── templates/         # Kubernetes manifests
├── Dockerfile                 # Container definition
├── index.html                 # Main website file
├── assets/                    # Static assets (CSS, JS, images)
└── Sebastian_Schüler_Lebenslauf.pdf  # CV file
```

## Security Features

- Non-root container execution
- Read-only root filesystem
- Security headers in nginx
- Resource limits and requests
- Health checks (liveness/readiness probes)

## Monitoring

The deployment includes:
- Resource limits for CPU/memory
- Health check endpoints
- Optional horizontal pod autoscaler (disabled by default)
- Istio service mesh observability