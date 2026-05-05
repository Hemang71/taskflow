const prisma = require('../lib/prisma')

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedToId } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.projectId,
        assignedToId,
        createdById: req.user.id
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    })

    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedToId } = req.query

    const tasks = await prisma.task.findMany({
      where: {
        projectId: req.params.projectId,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedToId && { assignedToId })
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedToId } = req.body

    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(assignedToId !== undefined && { assignedToId })
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    })

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } })
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id
    const now = new Date()

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      prisma.task.count({ where: { assignedToId: userId } }),
      prisma.task.count({ where: { assignedToId: userId, status: 'TODO' } }),
      prisma.task.count({ where: { assignedToId: userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { assignedToId: userId, status: 'DONE' } }),
      prisma.task.count({ where: { assignedToId: userId, dueDate: { lt: now }, status: { not: 'DONE' } } })
    ])

    const recentTasks = await prisma.task.findMany({
      where: { assignedToId: userId },
      include: {
        project: { select: { id: true, name: true, color: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    })

    res.json({ total, todo, inProgress, done, overdue, recentTasks })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask, getDashboard }