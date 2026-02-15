'use client'
import { useState, useEffect, memo } from 'react'

import BACKEND_URL from '../../lib/api'
const API_URL = BACKEND_URL

const EntityExplorer = memo(function EntityExplorer() {
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState('')
  const [method, setMethod] = useState('spacy') // 'spacy' or 'ollama'
  const [entities, setEntities] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch available videos on mount (using pose list which has processed videos)
  useEffect(() => {
    fetch(`${API_URL}/analytics/pose/list/available`)
      .then(res => res.json())
      .then(data => {
        if (data.available_videos) {
          setVideos(data.available_videos.map(v => v.video_name))
        }
      })
      .catch(err => console.error('Failed to fetch videos:', err))
  }, [])

  // Fetch entities when video or method changes
  useEffect(() => {
    if (!selectedVideo) return

    setLoading(true)
    setError(null)

    const endpoint = method === 'ollama'
      ? `${API_URL}/analytics/entities/ollama/${encodeURIComponent(selectedVideo)}`
      : `${API_URL}/analytics/entities/spacy/${encodeURIComponent(selectedVideo)}`

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
          setEntities(null)
        } else {
          setEntities(data.entities)
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [selectedVideo, method])

  // Filter videos by search term
  const filteredVideos = videos.filter(v =>
    v.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Entity type colors
  const typeColors = {
    PERSON: 'bg-blue-500',
    ORG: 'bg-green-500',
    GPE: 'bg-yellow-500',
    DATE: 'bg-purple-500',
    EVENT: 'bg-red-500',
    people: 'bg-blue-500',
    organizations: 'bg-green-500',
    locations: 'bg-yellow-500',
    dates: 'bg-purple-500',
    events: 'bg-red-500'
  }

  const typeLabels = {
    PERSON: 'People',
    ORG: 'Organizations',
    GPE: 'Locations',
    DATE: 'Dates',
    EVENT: 'Events',
    people: 'People',
    organizations: 'Organizations',
    locations: 'Locations',
    dates: 'Dates',
    events: 'Events'
  }

  return (
    <div className="p-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Video Search & Select */}
        <div className="flex-1 min-w-[300px]">
          <label className="block text-sm text-secondary mb-1">Select Video</label>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-2 border border-primary rounded bg-primary text-primary"
          />
          <select
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
            className="w-full p-2 border border-primary rounded bg-primary text-primary"
          >
            <option value="">-- Select a video --</option>
            {filteredVideos.slice(0, 50).map((video, idx) => (
              <option key={idx} value={video}>
                {video.length > 60 ? video.substring(0, 60) + '...' : video}
              </option>
            ))}
          </select>
        </div>

        {/* Method Toggle */}
        <div>
          <label className="block text-sm text-secondary mb-1">NER Method</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMethod('spacy')}
              className={`px-4 py-2 rounded transition-colors ${
                method === 'spacy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-secondary text-secondary hover:bg-tertiary'
              }`}
            >
              spaCy
            </button>
            <button
              onClick={() => setMethod('ollama')}
              className={`px-4 py-2 rounded transition-colors ${
                method === 'ollama'
                  ? 'bg-green-600 text-white'
                  : 'bg-secondary text-secondary hover:bg-tertiary'
              }`}
            >
              NuExtract (Ollama)
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-secondary">Extracting entities...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && entities && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(entities).map(([type, items]) => {
            if (!items || (Array.isArray(items) && items.length === 0)) return null

            return (
              <div key={type} className="bg-secondary rounded-lg p-4 border border-primary">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-3 h-3 rounded-full ${typeColors[type] || 'bg-gray-500'}`}></span>
                  <h3 className="font-semibold text-primary">
                    {typeLabels[type] || type}
                  </h3>
                  <span className="text-xs text-tertiary">
                    ({Array.isArray(items) ? items.length : 0})
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                  {Array.isArray(items) && items.map((item, idx) => {
                    const text = typeof item === 'string' ? item : item.text
                    const count = typeof item === 'object' ? item.count : null

                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm text-white ${typeColors[type] || 'bg-gray-500'}`}
                        style={{ opacity: 0.9 }}
                      >
                        {text}
                        {count && (
                          <span className="bg-white/20 px-1 rounded text-xs">
                            {count}
                          </span>
                        )}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !selectedVideo && (
        <div className="text-center p-8 text-tertiary">
          Select a video to extract named entities
        </div>
      )}

      {/* Method Info */}
      <div className="mt-6 p-4 bg-tertiary rounded text-sm text-secondary">
        <strong>Current Method:</strong> {method === 'spacy' ? 'spaCy (en_core_web_sm)' : 'NuExtract via Ollama'}
        <br />
        <span className="text-tertiary">
          {method === 'spacy'
            ? 'Fast, rule-based NER with statistical models'
            : 'LLM-based extraction, better for domain-specific entities'}
        </span>
      </div>
    </div>
  )
})

export default EntityExplorer
