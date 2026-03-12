# Banking Frontend

React frontend for the Fincore Bank application.

## Stack

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS

## Features

- Role selection landing page
- Separate admin and customer login
- Customer registration
- Admin dashboard and account operations
- Customer dashboard, profile, transfer, and transaction views
- Fixed deposit and loan sections
- JWT-based authenticated API calls

## Run Locally

```bash
cd /Users/abhishekajatdesai/fincore-bank/banking-frontend
npm install
npm run dev
```

Default dev URL:

- `http://localhost:5173`

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## API Integration

The frontend uses `/api` as the default API prefix.

- In local development, Vite proxies `/api` to the Spring Boot backend.
- In Docker and Kubernetes, nginx forwards `/api` requests to the backend service.

## Main Pages

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

## Source

- Main router: [App.jsx](/Users/abhishekajatdesai/fincore-bank/banking-frontend/src/App.jsx)
- API layer: [api.js](/Users/abhishekajatdesai/fincore-bank/banking-frontend/src/services/api.js)
