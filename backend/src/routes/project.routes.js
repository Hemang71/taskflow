const express = require('express')
const { createProject, getProjects, getProject, updateProject, deleteProject, addMember } = require('../controllers/project.controller')
const { protect } = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/rbac.middleware')

const router = express.Router()

router.use(protect)

router.get('/', getProjects)
router.post('/', createProject)

router.get('/:projectId', getProject)
router.put('/:projectId', requireRole('ADMIN'), updateProject)
router.delete('/:projectId', requireRole('ADMIN'), deleteProject)

router.post('/:projectId/members', requireRole('ADMIN'), addMember)

module.exports = router
