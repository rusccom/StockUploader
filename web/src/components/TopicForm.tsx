import { useState, FormEvent } from 'react'

interface Props {
  onTopicAdded: () => void
}

export default function TopicForm({ onTopicAdded }: Props) {
  const [topicName, setTopicName] = useState('')
  const [imageCount, setImageCount] = useState(20)
  const [model, setModel] = useState<'flux' | 'imagen4'>('flux')
  const [upscaleModel, setUpscaleModel] = useState<'flux-vision' | 'seedvr'>('flux-vision')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_name: topicName,
          image_count: imageCount,
          model,
          upscale_model: upscaleModel,
        }),
      })

      if (!response.ok) throw new Error('Failed to create topic')

      setSuccess(true)
      setTopicName('')
      setImageCount(20)
      onTopicAdded()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to create topic')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Add New Topic
      </h3>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">Topic added successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic Name
          </label>
          <input
            type="text"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., sunset beach"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Images
          </label>
          <input
            type="number"
            value={imageCount}
            onChange={(e) => setImageCount(Number(e.target.value))}
            min={1}
            max={100}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Generation Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as 'flux' | 'imagen4')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="flux">Flux</option>
            <option value="imagen4">Imagen 4</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upscale Model
          </label>
          <select
            value={upscaleModel}
            onChange={(e) => setUpscaleModel(e.target.value as 'flux-vision' | 'seedvr')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="flux-vision">Flux Vision</option>
            <option value="seedvr">SeedVR</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Topic'}
        </button>
      </form>
    </div>
  )
}

