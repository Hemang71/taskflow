const prisma = require('../lib/prisma')

const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: req.params.projectId,
            userId: req.user.id
          }
        }
      })

      if (!member) {
        return res.status(403).json({ message: 'You are not a member of this project' })
      }

      if (!roles.includes(member.role)) {
        return res.status(403).json({ message: 'You do not have permission to do this' })
      }

      req.member = member
      next()
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong' })
    }
  }
}

module.exports = { requireRole }