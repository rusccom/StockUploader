import { useState, useEffect, FormEvent } from 'react'

export default function AdobeSettings() {
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [sftpHost, setSftpHost] = useState('sftp.contributor.adobestock.com')
  const [sftpUsername, setSftpUsername] = useState('')
  const [sftpPassword, setSftpPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoadingData(true)
      const response = await fetch('/api/adobe-settings')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setClientId(data.client_id || '')
      setClientSecret(data.client_secret || '')
      setSftpHost(data.sftp_host || 'sftp.contributor.adobestock.com')
      setSftpUsername(data.sftp_username || '')
      setSftpPassword(data.sftp_password || '')
    } catch (err) {
      setError('Failed to load settings')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/adobe-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          sftp_host: sftpHost,
          sftp_username: sftpUsername,
          sftp_password: sftpPassword,
        }),
      })

      if (!response.ok) throw new Error('Failed to update settings')

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Adobe Stock API Settings
      </h3>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800 mb-2">
          <strong>API Credentials:</strong> Get from{' '}
          <a
            href="https://developer.adobe.com/console"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Adobe I/O Console
          </a>
        </p>
        <p className="text-sm text-blue-800">
          <strong>SFTP Credentials:</strong> Get from{' '}
          <a
            href="https://contributor.stock.adobe.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Adobe Stock Contributor Portal
          </a>
          {' '}→ Submit → Upload Options → FTP/SFTP
        </p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">Settings updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 border-b pb-2">
            API Credentials (OAuth2)
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID (API Key)
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Adobe I/O Client ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Adobe I/O Client Secret"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 border-b pb-2">
            SFTP Upload Credentials
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SFTP Host
            </label>
            <input
              type="text"
              value={sftpHost}
              onChange={(e) => setSftpHost(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sftp.contributor.adobestock.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SFTP Username
            </label>
            <input
              type="text"
              value={sftpUsername}
              onChange={(e) => setSftpUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Adobe Stock SFTP username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SFTP Password
            </label>
            <input
              type="password"
              value={sftpPassword}
              onChange={(e) => setSftpPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Adobe Stock SFTP password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}

