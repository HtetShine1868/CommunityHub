# Community Hub 

## Student Information
**Name:** Htet Aung Shine  
**Matriculation Number:** TNT-2134

## Project Overview
Community Hub is a full-stack web forum application built for the CVWO assignment. It allows users to create topics, post discussions, comment on posts, and interact with content through likes and pins. The application features a React frontend with TypeScript and a Go backend with PostgreSQL database.

## Technology Stack
- **Frontend**: React.js with TypeScript, Material-UI (MUI)
- **Backend**: Go with Gin framework
- **Database**: PostgreSQL
- **Authentication**: JWT authentication
- **Deployment**: Render (backend + frontend + database)

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Go (v1.21 or higher)
- PostgreSQL (v14 or higher)
- Git


### Clone the Repository
-git clone https://github.com/HtetShine1868/CommunityHub.git
-cd CommunityHub

### Backend Setup
-cd backend
-go mod download

### Create .env file
-DATABASE_URL=postgresql://username:password@localhost:5432/communityhub?
-sslmode=disable
-JWT_SECRET=your-secret-jwt-key
-PORT=8080
-ENVIRONMENT=development
-FRONTEND_URL=http://localhost:3000

### Create PostgreSQL database
-CREATE DATABASE communityhub;

### Run the backend server
-go run cmd/api/main.go


### Frontend Setup
-cd frontend
-npm install

### Create .env file
-VITE_API_URL=http://localhost:8080/api

### Run the frontend server
-npm run dev
