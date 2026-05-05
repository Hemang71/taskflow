const express = require('express')
const { createTask, getTasks, updateTask, deleteTask, getDashboard } = require('../controllers/task.controller')
const { protect } = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/rbac.middleware')

const router = express.Router({ mergeParams: true })

router.use(protect)

router.get('/dashboard', getDashboard)

router.get('/', getTasks)
router.post('/', requireRole('ADMIN', 'MEMBER'), createTask)

router.put('/:taskId', requireRole('ADMIN', 'MEMBER'), updateTask)
router.delete('/:taskId', requireRole('ADMIN'), deleteTask)

module.exports = router