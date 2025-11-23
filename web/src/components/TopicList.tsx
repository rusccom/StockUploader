import { useState, useEffect } from 'react'

interface Topic {
  id: number
  topic_name: string
  image_count: number
  model: string
  upscale_model: string
  status: string
  created_at: string
  uploaded_count: number
  uploaded_at: string | null
}

interface Props {
  refreshTrigger: number
}

export default function TopicList({ refreshTrigger }: Props) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [triggering, setTriggering] = useState(false)
  const [triggerMessage, setTriggerMessage] = useState('')

  useEffect(() => {
    fetchTopics()
  }, [refreshTrigger])

  const fetchTopics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/topics')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setTopics(data)
      setError('')
    } catch (err) {
      setError('Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  const triggerWorker = async () => {
    try {
      setTriggering(true)
      setTriggerMessage('')
      
      const response = await fetch('/api/trigger-worker', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger worker')
      }
      
      setTriggerMessage('✓ Worker started successfully! Check GitHub Actions.')
      setTimeout(() => setTriggerMessage(''), 5000)
    } catch (err: any) {
      setTriggerMessage(`✗ Error: ${err.message}`)
      setTimeout(() => setTriggerMessage(''), 5000)
    } finally {
      setTriggering(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'done':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Loading topics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Topics
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              List of all submitted topics
            </p>
          </div>
          <button
            onClick={triggerWorker}
            disabled={triggering}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {triggering ? 'Starting...' : '▶ Run Worker Now'}
          </button>
        </div>
        {triggerMessage && (
          <div className={`mt-3 text-sm ${triggerMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
            {triggerMessage}
          </div>
        )}
      </div>
      <ul className="divide-y divide-gray-200">
        {topics.length === 0 ? (
          <li className="px-4 py-5 sm:px-6">
            <p className="text-gray-500 text-center">No topics yet</p>
          </li>
        ) : (
          topics.map((topic) => (
            <li key={topic.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {topic.topic_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {topic.image_count} images • {topic.model} • {topic.upscale_model}
                  </p>
                  {topic.status === 'done' && topic.uploaded_count > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {topic.uploaded_count} photos uploaded to Adobe Stock
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {new Date(topic.created_at).toLocaleString()}
                  </p>
                  {topic.uploaded_at && (
                    <p className="text-xs text-gray-400">
                      Uploaded: {new Date(topic.uploaded_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    topic.status
                  )}`}
                >
                  {topic.status}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

