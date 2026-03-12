# Community Hub 

## 🚀 **Live Demo:** [https://communityhub-1-ucxs.onrender.com]
(Note: Initial load may take 30-60 seconds as Render's free tier spins up the server.)

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

### Code Ownership & AI Usage
I understand every part of this codebase. I reviewed and wrote every line myself. I used AI tools only for research, code review, and troubleshooting—not to generate the code.

### AI Tools Used
- Github: I used it for research, getting feedback on my code structure, and debugging.
- Deepseek: Assisted me in reviewing my code, investigating solutions, and debugging complex errors

 ### AI Usage Declaration - Commit by Commit

#### Commit: fix the migration and setup for deployment  
Date: 1 March 2026  
AI Tool Used: ChatGPT, Deepseek

**Purpose:**
I needed to figure out deployment steps (first time doing this) and clean up the project by removing some models I originally created. These models were for features I don’t need right now, so I took them out.

**Challenge:**
I had never deployed a project before. I immediately encountered difficulties because, as it turned out, the frontend bundle was far too large for the free Render plan.

**Solution:**
I removed the unused models from the code to clean code and consistent the databse.To deploy my frontend on free render, I changed the frontend build from Create React App (CRA) to Vite.

**How AI was used:**  
I asked about how to deploy Go projects and React with TypeScript, looked up Render’s deployment limits, and searched for ways to reduce bundle size.

**Code written by me:**
All the configuration files and boilerplate—everything hands-on.

---

#### Commit: Fix the backend post count fetching error and topic detail page user interface  
Date: 4 March 2026  
AI Tools Used: Deepseek and ChatGPT

**Purpose:** 
I wanted to fix the post fetching logic, clean up the code, and enhance the Topic Detail Page user interface with a responsive actions

**Challenge:**
- Fixing issues where the API sent back null for total amount of posts, which broke the React rendering.
- Making sure pagination and post counts worked right from the backend.

**Solution:**
- Built a dropdown actions menu using MUI Menu, MenuItem, and IconButton.
-The frontend crash was prevented by fixing the backend structure to return an empty array for posts rather than nil.
- Improved the usePosts hook to handle missing API data safely by using fallback values.

**How AI was used:**
- Looked up best practices for Material UI menus and responsive layouts.
- Searched for safe state management in React when API data is sometimes null. Used AI as a consultant for improving authentication hooks and data fetching patterns.
- Debugged why the API was returning null.

**Code written by me:** All the component logic, responsive styling, and tying everything into the existing topic and post services.

---

#### Commit: implement user profile system to work with backend  
Date:5 March 2026  
AI Tool Used: ChatGPT, Deepseek

**Purpose:**
Built a full User Profile system—profile display, editing, and tabs for activity like posts.

**Challenge:**
- Fetching user data and the total  posts created in topic from the backend, and showing the total posts amount on the frontend.
- I broke the profile system down into clean, reusable parts and hooks, so it’s way easier to manage now. When I ran into those 500 errors, I didn’t just slap on random fixes. I dug into the code, used AI to help me figure out what was really going wrong, and got to the bottom of the issue.

**Solution:** Before connecting the frontend, I ran the backend API through Postman to make sure everything worked. Built a custom useProfile hook to wrangle profile state, API calls, and pagination. Pulled all the profile-related API requests into a dedicated profileService. Keeps things tidy.


**How AI was used:**
- Researched best practices for React component architecture, custom hooks, and structuring profile-related API services.
- Used AI to review my code and make research about the errors 

**Code written by me:** I wrote the code for all the parts, hooks, API services, state management logic, UI layout, and backend integration.

---

#### Commit: Update the topic user interface with category fields and add category support to topics  
Date: 6 March 2026  
AI Tools Used: Deepseek and ChatGPT

**Purpose:** The frontend user interface was updated to display category information using visual chips, and category support was added to topics. Topics are now more arranged, and users can quickly view categories and privacy status.

**Challenge:** To add new features, I had to put category data into the topic structure, but I couldn't change the API responses that were already there. So I changed the TypeScript types to allow for optional category relationships. It was also hard to show category information in the UI. It had to fit with the Material UI design, but not every topic has a category. I made sure that those edge cases didn't break anything.

**Solution:** I adjusted the Topic and Post interfaces in TypeScript so they support categories which makes ux more flexible. On the backend, I set up a foreign key so every Topic links to a Category, no confusion there. Cleaned up the topic repository too, so fetching topics actually brings in the right category info.

---

#### Commit: Add the filter by category in topic page 
Date: 11 March 2026  
AI Tools Used: Deepseek and ChatGPT

**Purpose:** To enhance the user experience i add search topic by its category so now user can search topic not only by its name but also by its category

**Challenge:** The old TopicCard was a bit of a mess. Too many helper functions did basically the same thing, and the UI logic got tangled up, so it was tough to work with and hard to read.
Some of the UI parts—icons, headers, category tags—needed a better layout. We wanted it to look cleaner, but it still had to work with our current data setup.
The Topics page filtering didn’t really cut it, either. Searching and picking categories was clunky, and the interface just didn’t feel responsive enough.

**Solution:** On the Topics page, we made the search bar and category picker way more user-friendly. Now they use Material UI’s Select, MenuItem, and FormControl components.
Filtering logic is simpler, too. You can search by keyword or pick a category, and the results update quickly.
