import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const statusColors = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-yellow-50 text-yellow-600',
  IN_REVIEW: 'bg-blue-50 text-blue-600',
  DONE: 'bg-green-50 text-green-600',
}

const priorityColors = {
  LOW: 'bg-gray-50 text-gray-400',
  MEDIUM: 'bg-blue-50 text-blue-500',
  HIGH: 'bg-orange-50 text-orange-500',
  URGENT: 'bg-red-50 text-red-500',
}

const ProjectDetail = () => {
  const { projectId } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assignedToId: '' })
  const [memberEmail, setMemberEmail] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`)
      setProject(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = project?.members?.find(m => m.userId === user?.id)?.role === 'ADMIN'

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        ...taskForm,
        assignedToId: taskForm.assignedToId || undefined,
        dueDate: taskForm.dueDate || undefined
      })
      await fetchProject()
      setShowTaskModal(false)
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assignedToId: '' })
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email: memberEmail })
      setProject({ ...project, members: [...project.members, res.data] })
      setShowMemberModal(false)
      setMemberEmail('')
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (taskId, status) => {
    setProject({
      ...project,
      tasks: project.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    })
    try {
      await api.put(`/projects/${projectId}/tasks/${taskId}`, { status })
    } catch (err) {
      console.error(err)
      fetchProject()
    }
  }

  if (loading) return <Layout><div className="text-gray-400 text-sm">Loading...</div></Layout>

  const taskCounts = {
    TODO: project?.tasks?.filter(t => t.status === 'TODO').length || 0,
    IN_PROGRESS: project?.tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0,
    IN_REVIEW: project?.tasks?.filter(t => t.status === 'IN_REVIEW').length || 0,
    DONE: project?.tasks?.filter(t => t.status === 'DONE').length || 0,
  }

  const totalTasks = project?.tasks?.length || 0
  const progress = totalTasks > 0 ? Math.round((taskCounts.DONE / totalTasks) * 100) : 0

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project?.color }} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{project?.name}</h1>
            {project?.description && (
              <p className="text-gray-500 text-sm mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Add Member
            </button>
          )}
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            New Task
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'To Do', key: 'TODO', color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'In Progress', key: 'IN_PROGRESS', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'In Review', key: 'IN_REVIEW', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Done', key: 'DONE', color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ label, key, color, bg }) => (
          <div key={key} className={`${bg} rounded-2xl p-4`}>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-semibold ${color}`}>{taskCounts[key]}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500 font-medium">Overall Progress</span>
          <span className="text-gray-900 font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: project?.color }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{taskCounts.DONE} of {totalTasks} tasks completed</p>
      </div>

      {/* Team */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <span className="text-xs text-gray-400 mr-1">Team:</span>
        {project?.members?.map((member) => (
          <div key={member.id} className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1">
            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-600 font-medium">
              {member.user.name[0]}
            </div>
            <span className="text-xs text-gray-600">{member.user.name}</span>
            <span className={`text-xs font-medium ${member.role === 'ADMIN' ? 'text-indigo-500' : 'text-gray-400'}`}>
              {member.role}
            </span>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((status) => (
          <div key={status} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {status.replace('_', ' ')}
              </h3>
              <span className="text-xs text-gray-300">{taskCounts[status]}</span>
            </div>
            <div className="space-y-2">
              {taskCounts[status] === 0 && (
                <p className="text-xs text-gray-300 text-center py-6">No tasks</p>
              )}
              {project?.tasks?.filter(t => t.status === status).map((task) => (
                <div key={task.id} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.assignedTo && (
                      <span className="text-xs text-gray-400">{task.assignedTo.name}</span>
                    )}
                  </div>
                  {task.dueDate && (
                    <p className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-400' : 'text-gray-400'}`}>
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-1 flex-wrap border-t border-gray-100 pt-2">
                    {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(task.id, s)}
                        className={`text-xs px-1.5 py-0.5 rounded transition ${
                          task.status === s
                            ? statusColors[s] + ' font-semibold'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        {s === 'IN_PROGRESS' ? 'Doing' : s === 'IN_REVIEW' ? 'Review' : s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Task title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={taskForm.assignedToId}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {project?.members?.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="member@example.com"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {creating ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default ProjectDetail