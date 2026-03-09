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
- git clone https://github.com/HtetShine1868/CommunityHub.git
- cd CommunityHub

### Backend Setup
- cd backend
- go mod download

### Create .env file
- DATABASE_URL=postgresql://username:password@localhost:5432/communityhub?
- sslmode=disable
- JWT_SECRET=your-secret-jwt-key
- PORT=8080
- ENVIRONMENT=development
- FRONTEND_URL=http://localhost:3000

### Create PostgreSQL database
- CREATE DATABASE communityhub;

### Run the backend server
- go run cmd/api/main.go


### Frontend Setup
- cd frontend
- npm install

### Create .env file
- VITE_API_URL=http://localhost:8080/api

### Run the frontend server
- npm run dev

---

## AI Usage Declaration

### Ai tools Used
- Github -used this for research,getting feedback on my code structre and also use this for debugging 
- Deepseek -used this for debugging tricky error,reserching and reviewing my login


#### AI Usage Declaration - Commit by Commit

##### Commit: `fix the migration and setup for deployment`
**Date:** March 1, 2026  
**AI Tool Used:** ChatGPT,Deepseek 

**Purpose:** Research on how to deploy as this is my first time and remove models that i create intially which might need for some features but these features are not currently necessary for now so i remove these models 

**Challenge faced**First time of making deployment,and when i deploy frontend the size is larger that the free render can deploy 

**Solution**
- Removed unnecessary models (Follow, SavedPost, Notification) to simplify the database schema
- Optimized frontend build by changing from using react to vite 

**How AI was used:** Asked about how to deploy  Go projects and React with Typescript. Researched about Render deployment limits and how to reduce bundle size.

**Code written by me:** All initial configuration files and boilerplate code 

