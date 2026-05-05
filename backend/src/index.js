require('dotenv').config()
const express = require("express")
const cors = require('cors') 

const authRoutes = require('./routes/auth.routes')
const projectRoutes = require('./routes/project.routes')
const taskRoutes = require('./routes/task.routes')
const { protect } = require('./middleware/auth.middleware')
const { getDashboard } = require('./controllers/task.controller')

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())

app.get("/", ( req , res ) => {
    res.json({ message : "Taskflow API is running still"})
})

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects/:projectId/tasks', taskRoutes)
app.use('/api/dashboard', protect, getDashboard)

const PORT = process.env.PORT|| 5000

app.listen( PORT , () => {
    console.log(`Server is running on port ${PORT}`)
})