import { useState, useEffect } from 'react'
import TopicList from './components/TopicList'
import TopicForm from './components/TopicForm'
import AdobeSettings from './components/AdobeSettings'

function App() {
  const [activeTab, setActiveTab] = useState<'topics' | 'settings'>('topics')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTopicAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Stock Uploader
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('topics')}
              className={`${
                activeTab === 'topics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Topics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Adobe Stock Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'topics' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TopicList refreshTrigger={refreshTrigger} />
              </div>
              <div>
                <TopicForm onTopicAdded={handleTopicAdded} />
              </div>
            </div>
          ) : (
            <AdobeSettings />
          )}
        </div>
      </main>
    </div>
  )
}

export default App

