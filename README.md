# Taskflow

A modern full-stack project management application for teams to collaborate on projects, manage tasks, and track progress in real-time.

## ✨ Features

- **Project Management** — Create and organize projects with team members
- **Task Tracking** — Create, assign, and manage tasks with status tracking (TODO, IN_PROGRESS, DONE)
- **Progress Visualization** — Real-time progress bars showing task completion percentage
- **Team Collaboration** — Add team members to projects and assign tasks
- **User Authentication** — Secure JWT-based authentication with password hashing
- **Responsive Design** — Modern UI with Tailwind CSS
- **Database Integration** — PostgreSQL with Prisma ORM for type-safe database queries

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express** — REST API server
- **Prisma** — ORM for database management
- **PostgreSQL** — Relational database
- **JWT (jsonwebtoken)** — Authentication
- **bcryptjs** — Password hashing

### Frontend
- **React** — UI framework
- **React Router** — Client-side routing
- **Tailwind CSS** — Styling
- **Axios** — HTTP client
- **Vite** — Build tool

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL database
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file with your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file with API URL
# VITE_API_URL="http://localhost:5000"

# Start development server
npm run dev
```

## 🚀 Running the Project

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) and API at `http://localhost:5000` (backend).

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── lib/              # Utilities (Prisma client)
│   │   └── index.js          # Server entry point
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── api/              # API client
│   │   └── main.jsx          # App entry point
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` — Register new user
- `POST /auth/login` — User login

### Projects
- `GET /projects` — Get all user projects
- `POST /projects` — Create new project
- `GET /projects/:id` — Get project details
- `PUT /projects/:id` — Update project
- `DELETE /projects/:id` — Delete project

### Tasks
- `GET /projects/:id/tasks` — Get project tasks
- `POST /projects/:id/tasks` — Create task
- `PUT /tasks/:id` — Update task status
- `DELETE /tasks/:id` — Delete task

### Team Members
- `POST /projects/:id/members` — Add team member
- `DELETE /projects/:id/members/:memberId` — Remove member

## 📹 Demo

Check out a demo video to see Taskflow in action! [Add your demo link here]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.

---

**Built with ❤️ using React, Node.js, and PostgreSQL**
