# Community Hub 

## 🚀 **Live Demo:** [https://communityhub-1-ucxs.onrender.com]
* (Note: Initial load may take 30-60 seconds as Render's free tier spins up the server.)*

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
-go mod download

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

###
Every line of code in this repository has been thoroughly reviewed and implemented by me; AI was used strictly for research and troubleshooting, not as a code generator.

### Ai tools Used
- Github -used this for research,getting feedback on my code structre and also use this for debugging 
- Deepseek -used this for debugging tricky error,reserching and reviewing my login

### AI Usage Declaration - Commit by Commit

#### Commit: `fix the migration and setup for deployment`
**Date:** March 1, 2026  
**AI Tool Used:** ChatGPT,Deepseek 

**Purpose:** Research on how to deploy as this is my first time and remove models that i create intially which might need for some features but these features are not currently necessary for now so i remove these models 

**Challenge faced**: First time of making deployment,and when i deploy frontend the size is larger that the free render can deploy 

**Solution**
- Removed unnecessary models (Follow, SavedPost, Notification) to simplify the database schema
- Optimized frontend build by changing from using react to vite 

**How AI was used:** Asked about how to deploy  Go projects and React with Typescript. Researched about Render deployment limits and how to reduce bundle size.

**Code written by me:** All initial configuration files and boilerplate code 

---

#### Commit: `improve topic detail page UI and backend post count fetching error `
**Date:** March 4, 2026
**AI Tool Used:** ChatGPT, Deepseek

**Purpose:**
Improve the Topic Detail Page UI and by adding a responsive actions menu.
Refactor the Topic Detail Page and improve post fetching logic.


**Challenge faced:**
- Making the page responsive for both desktop and mobile screens.
- Handling API responses where posts is returning  null, causing rendering issues in React.
- Managing pagination and total counts correctly from backend responses.

**Solution:**

- Implemented a dropdown actions menu using **MUI Menu, MenuItem, and IconButton**.
- Updated backend logic to ensure posts return an empty array instead of nil to prevent frontend crashes.
- Improved the usePosts hook to safely handle missing API data using fallback values.

**How AI was used:**
- Asked questions about best practices for **Material UI menus, responsive layouts.
- Used AI  to research best practices for managing React state safely when data may be null. Also use ai as consultant to take guidance on improving the authentication hook structure and React data fetching patterns.
- Debug and make research on my code why the api return null 

**Code written by me:**
All component logic, responsive styling, and integration with existing topic and post services.

---

#### Commit: `implement user profile system to work with backend `
**Date:** March 5, 2026
**AI Tool Used:** ChatGPT, Deepseek

**Purpose:**
Implement a complete **User Profile system** including profile display, editing functionality, and profile activity tabs such as posts

**Challenge faced:**
- fetching user and users posts data from backend and show on frontend
- Structuring the profile system into reusable components and hooks while keeping the code maintainable.

**Solution:**

- first test the backend api to make sure it actually work by testing the api using postmen and then after it work i fetch from the frontend.
- Implemented a custom useProfile hook to manage profile state, API calls, and pagination logic.
- Added profileService to centralize all profile-related API requests.


**How AI was used:**
- Used AI tools to research best practices for **React component architecture, custom hooks for state managementapplications, and structuring profile-related API services
- make review for my code and debug for the 500 errors why this happen not blindly copy and paste.

**Code written by me:**
All components, hooks, API services, state management logic, UI layout, and integration with backend profile endpoints were implemented.

---

#### Commit: `add category support to topics and update topic UI with category fields`

**Date:** March 6, 2026

**AI Tool Used:** ChatGPT, Deepseek

**Purpose:**
Introduce **category support for topics** and update the frontend UI to display category information using visual chips. This update improves topic organization and enhances the user interface by clearly showing topic categories and privacy status.

**Challenge faced:**

- Integrating **category data into the existing topic structure** without breaking existing API responses.
- Updating **TypeScript types** to correctly support optional category relationships.
- Displaying category information in the UI while maintaining consistent styling with Material UI components.
- Handling cases where topics might not have a category assigned.

**Solution:**

- Updated **Topic and Post TypeScript interfaces** to include optional category relationships.
- Modified backend **Topic model** to include a `Category` relationship using a foreign key.
- updated the **topic repository** to correctly manage topic retrieval and relationships.
- Enhanced **TopicCard** and **TopicDetailPage** components to display category information using styled **Material UI Chips** with category icons and colors.
- Implemented conditional rendering to ensure the category chip only appears when a category exists.
- Organized UI elements so that **category and privacy chips** are displayed together in a responsive layout.

**How AI was used:**
Used AI tools to research best practices for **handling optional relational data in TypeScript interfaces, structuring React components with Material UI chips, and managing foreign key relationships in Go using GORM**.

**Code written by me:**
All backend model updates, repository adjustments, frontend component changes, TypeScript type definitions, and UI integration were implemented and tested by me.

---

#### Commit: fix comment replies editing and deletion affecting main comment

Date: March 7 to 8,2026

AI Tool Used: ChatGPT,DeepSeek

Purpose:
Fix the issue where editing or deleting a reply incorrectly affected the main/top-level comment and where replies displayed their UUID instead of the actual text. Ensured that all comment actions (edit, delete, like, reply) correctly work on nested replies without interfering with other comments.

Challenge faced:

- Recursive functions (updateInTree, removeFromTree) were only handling top-level comments, so nested replies were not updated properly.
- Editing a reply would sometimes replace the top-level comment content with a UUID instead of the new text.
- Delete actions on replies affected the main comment because the reply list was not correctly traversed.
- The frontend CommentCard and CommentSection needed adjustments to pass the correct comment ID for reply actions.

Solution:

- Updated CommentCard to always pass the comment.id when calling onEdit, onDelete, onReply, onPin, and onLike.
- Enhanced useComments hook with properly recursive functions for updating and deleting nested comments:
- Added logging in CommentCard for editing and reply actions to verify correct IDs and text values.
- Ensured nested replies are indented correctly and maintain separation from top-level comments.

How AI was used:
Used AI tools to research best practices for handling recursive updates in React state, managing nested data structures in TypeScript, and debugging common issues with comment threads in frontend applications.




