# Fincore Bank

Full-stack banking application built with Spring Boot, React, MySQL, JWT authentication, PDF generation, Docker Compose, and Kubernetes manifests.

## Tech Stack

- Backend: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, MySQL
- Frontend: React 19, Vite, React Router, Axios, Tailwind CSS
- Auth: JWT-based role authentication
- Documents: iText PDF
- Deployment: Docker Compose and Kubernetes manifests

## Modules

- `src/`: Spring Boot backend
- `banking-frontend/`: React frontend
- `docker-compose.yml`: local multi-container setup
- `k8s/`: Kubernetes manifests
- `DEPLOYMENT.md`: deployment notes

## Features

### Admin

- Admin login
- Create customer and open account
- Search accounts by name, email, or phone
- Deposit and transfer operations
- Audit log view
- Dashboard stats
- Loan approval and rejection
- Password and PIN reset flow

### Customer

- Customer login and self-registration
- View dashboard and profile
- Masked account/email/balance display
- Transfer funds
- View transaction history
- Download account statement PDF
- Create and break fixed deposits
- Download FD receipt PDF
- Apply for loans
- Repay approved loans
- Download loan summary PDF

## Project Structure

```text
fincore-bank/
├── src/
├── banking-frontend/
├── k8s/
├── Dockerfile
├── docker-compose.yml
├── DEPLOYMENT.md
└── pom.xml
```

## Local Setup

### Prerequisites

- Java 17+
- Maven or `./mvnw`
- Node.js 20+
- MySQL 8

### Backend

```bash
cd /Users/abhishekajatdesai/fincore-bank
./mvnw spring-boot:run
```

Backend runs on:

- `http://localhost:8081`
- API base: `http://localhost:8081/api`

### Frontend

```bash
cd /Users/abhishekajatdesai/fincore-bank/banking-frontend
npm install
npm run dev
```

Frontend runs on Vite dev server, typically:

- `http://localhost:5173`

## Configuration

Backend reads values from environment variables with defaults defined in [application.properties](/Users/abhishekajatdesai/fincore-bank/src/main/resources/application.properties):

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

Default local database:

- Database name: `bank_db`
- Default backend port: `8081`

## Docker

Run the full application stack:

```bash
cd /Users/abhishekajatdesai/fincore-bank
docker compose up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8081/api`
- MySQL: `localhost:3306`

Stop containers:

```bash
docker compose down
```

Remove containers and DB volume:

```bash
docker compose down -v
```

## Kubernetes

Build images:

```bash
docker build -t fincore-backend:latest .
docker build -t fincore-frontend:latest ./banking-frontend
```

Apply manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

Check resources:

```bash
kubectl get all -n fincore
```

## Main Routes

### Frontend

- `/`
- `/admin-login`
- `/customer-login`
- `/register`
- `/admin`
- `/admin/accounts`
- `/admin/audit`
- `/admin/reset`
- `/admin/loans`
- `/customer`
- `/customer/profile`
- `/customer/investments`
- `/transfer`
- `/transactions`

### Backend API

- `/api/auth/*`
- `/api/admin/*`
- `/api/customer/*`
- `/api/transaction/*`

## Documentation

- Deployment details: [DEPLOYMENT.md](/Users/abhishekajatdesai/fincore-bank/DEPLOYMENT.md)
- Backend config: [application.properties](/Users/abhishekajatdesai/fincore-bank/src/main/resources/application.properties)
- Frontend app routes: [App.jsx](/Users/abhishekajatdesai/fincore-bank/banking-frontend/src/App.jsx)

## Status

This repository contains the integrated backend, frontend, containerization, and Kubernetes setup for the Fincore Bank project.
