# Finance Dashboard

A comprehensive full-stack finance tracking application built with modern web technologies, featuring secure authentication, real-time analytics, and role-based access control.

## 🚀 Live Demo
- **URL**: [https://login-1-opal.vercel.app/](https://login-1-opal.vercel.app/)

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS for responsive and modern UI
- **Icons**: Lucide-React
- **Authentication**: Firebase Client SDK
- **Data Fetching**: Custom API hooks with Fetch API

### Backend
- **Runtime**: Node.js + Express (TypeScript)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Firebase Admin SDK for secure token verification
- **Deployment**: Vercel Serverless Functions

## ✨ Core Features

- **Robust Authentication**: Secure login and signup powered by Firebase Auth.
- **Transaction Management**: 
  - Add, edit, and delete income/expense records.
  - Categorize transactions for better tracking.
  - Filter records by date, type, and category.
- **Dynamic Dashboard**:
  - Real-time balance, income, and expense summaries.
  - Visual analytics for financial health monitoring.
- **Role-Based Access Control (RBAC)**:
  - **ADMIN**: Full access to add/edit/delete/view all records and manage users.
  - **ANALYST**: Access to view and filter all records.
  - **VIEWER**: Basic access to their own dashboard.
- **Automated User Sync**: Firebase users are automatically synchronized with the PostgreSQL database upon their first login to ensure data consistency.

## ⚙️ Configuration & Setup

### Prerequisites
- Node.js (v18+)
- Firebase Project
- Supabase PostgreSQL Database

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database Connections
DATABASE_URL="postgresql://postgres.project-id:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@host:5432/postgres"

# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-client-email"
FIREBASE_PRIVATE_KEY="your-private-key"

# Application Configuration
ADMIN_EMAILS="admin@example.com,developer@example.com"

# Frontend Firebase Config (Prefix with VITE_)
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
```

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install && cd frontend && npm install && cd ..
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

- **`src/`**: Backend Express application.
  - `routes/`: API endpoints for dashboard, records, and health checks.
  - `middleware/`: Authentication and RBAC logic.
  - `db/`: Drizzle schema and client initialization.
- **`frontend/`**: React client application.
  - `src/components/`: Reusable UI components.
  - `src/services/`: API communication layer.
  - `src/context/`: Auth state management.

## 📄 License
This project is for demonstration purposes. All rights reserved.
