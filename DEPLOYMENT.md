# Fincore Bank Deployment

## Docker Compose (local)

### Build and start
```bash
docker compose up --build
```

### Access
- Frontend: `http://localhost:8080`
- Backend API (direct): `http://localhost:8081/api`
- MySQL: `localhost:3306`

### Stop
```bash
docker compose down
```

### Stop and remove DB volume
```bash
docker compose down -v
```

## Kubernetes

### 1) Build images
```bash
docker build -t fincore-backend:latest .
docker build -t fincore-frontend:latest ./banking-frontend
```

If your cluster cannot use local Docker images, push to a registry and update image names in:
- `k8s/backend.yaml`
- `k8s/frontend.yaml`

### 2) Apply manifests
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

### 3) Check resources
```bash
kubectl get all -n fincore
```

## Environment Variables (backend)

Backend now reads configuration from environment variables with defaults:
- `SERVER_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `JPA_DDL_AUTO`
- `JPA_SHOW_SQL`

## Frontend API Routing

Frontend API base is now `/api` by default.
- Local Vite dev server proxies `/api` to `http://localhost:8081`.
- Docker/Kubernetes nginx proxies `/api` to the backend service.
