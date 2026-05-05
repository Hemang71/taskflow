import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-semibold ${color}`}>{value}</p>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/dashboard')
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <Layout>
      <div className="text-gray-400 text-sm">Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's going on with your tasks</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tasks" value={data?.total ?? 0} color="text-gray-900" />
        <StatCard label="To Do" value={data?.todo ?? 0} color="text-indigo-600" />
        <StatCard label="In Progress" value={data?.inProgress ?? 0} color="text-yellow-500" />
        <StatCard label="Overdue" value={data?.overdue ?? 0} color="text-red-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Tasks</h2>
        {data?.recentTasks?.length === 0 ? (
          <p className="text-sm text-gray-400">No tasks yet. Join a project to get started.</p>
        ) : (
          <div className="space-y-3">
            {data?.recentTasks?.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-400">{task.project?.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  task.status === 'DONE' ? 'bg-green-50 text-green-600' :
                  task.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-600' :
                  task.status === 'IN_REVIEW' ? 'bg-blue-50 text-blue-600' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard