const prisma = require('../lib/prisma')

const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' })
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        createdById: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    })

    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.user.id } }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
        tasks: {
          select: { status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const getProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } }
          }
        }
      }
    })

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const updateProject = async (req, res) => {
  try {
    const { name, description, color } = req.body

    const project = await prisma.project.update({
      where: { id: req.params.projectId },
      data: { name, description, color }
    })

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.projectId }
    })

    res.json({ message: 'Project deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const addMember = async (req, res) => {
  try {
    const { email, role } = req.body

    const userToAdd = await prisma.user.findUnique({ where: { email } })
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' })
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: req.params.projectId,
          userId: userToAdd.id
        }
      }
    })

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member' })
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.projectId,
        userId: userToAdd.id,
        role: role || 'MEMBER'
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    res.status(201).json(member)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, addMember }