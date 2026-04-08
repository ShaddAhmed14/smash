'use client'
import { useState, useEffect, memo } from 'react'

import BACKEND_URL from '../../lib/api'
const API_URL = BACKEND_URL

const typeColors = {
  PERSON: 'var(--button-primary)',
  ORG: 'var(--custom-analysis-dark)',
  GPE: 'var(--custom-analytics-dark)',
  DATE: 'var(--custom-preview-dark)',
  EVENT: 'var(--points-color)',
  people: 'var(--button-primary)',
  organizations: 'var(--custom-analysis-dark)',
  locations: 'var(--custom-analytics-dark)',
  dates: 'var(--custom-preview-dark)',
  events: 'var(--points-color)',
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
  events: 'Events',
}

const EntityExplorer = memo(function EntityExplorer() {
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState('')
  const [method, setMethod] = useState('spacy')
  const [entities, setEntities] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredVideos = videos.filter(v =>
    v.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Video Search & Select */}
        <div className="flex-1 min-w-[300px]">
          <label className="block carbon-label-01 text-[color:var(--text-secondary)] mb-1">Select Video</label>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 px-3 carbon-body-01 border border-[color:var(--border-secondary)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] mb-2 focus:outline-none focus:border-[color:var(--button-primary)]"
          />
          <select
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
            className="filter-select w-full"
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
          <label className="block carbon-label-01 text-[color:var(--text-secondary)] mb-1">NER Method</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMethod('spacy')}
              className={`h-10 px-4 carbon-body-01 transition-colors duration-150 cursor-pointer border ${
                method === 'spacy'
                  ? 'bg-[color:var(--button-primary)] text-white border-[color:var(--button-primary)]'
                  : 'bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)] border-[color:var(--border-primary)] hover:bg-[color:var(--bg-tertiary)]'
              }`}
            >
              spaCy
            </button>
            <button
              onClick={() => setMethod('ollama')}
              className={`h-10 px-4 carbon-body-01 transition-colors duration-150 cursor-pointer border ${
                method === 'ollama'
                  ? 'bg-[color:var(--custom-analysis-dark)] text-[#161616] border-[color:var(--custom-analysis-dark)]'
                  : 'bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)] border-[color:var(--border-primary)] hover:bg-[color:var(--bg-tertiary)]'
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
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[color:var(--button-primary)] border-t-transparent"></div>
          <span className="ml-3 carbon-body-01 text-[color:var(--text-secondary)]">Extracting entities...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 border-l-4 border-[color:var(--custom-preview-dark)] bg-[color:var(--bg-secondary)] carbon-body-01 text-[color:var(--text-primary)]">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && entities && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(entities).map(([type, items]) => {
            if (!items || (Array.isArray(items) && items.length === 0)) return null
            const color = typeColors[type] || 'var(--text-tertiary)'

            return (
              <div key={type} className="bg-[color:var(--bg-secondary)] p-4 border border-[color:var(--border-primary)]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                  <h3 className="carbon-heading-02 text-[color:var(--text-primary)]">
                    {typeLabels[type] || type}
                  </h3>
                  <span className="carbon-label-01 text-[color:var(--text-tertiary)]">
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
                        className="inline-flex items-center gap-1 px-2 py-1 carbon-label-01 text-white"
                        style={{ backgroundColor: color, opacity: 0.9 }}
                      >
                        {text}
                        {count && (
                          <span className="bg-white/20 px-1 carbon-label-01">
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
        <div className="text-center p-8 carbon-body-01 text-[color:var(--text-tertiary)]">
          Select a video to extract named entities
        </div>
      )}

      {/* Method Info */}
      <div className="mt-6 p-4 bg-[color:var(--bg-tertiary)] carbon-body-01 text-[color:var(--text-secondary)]">
        <strong>Current Method:</strong> {method === 'spacy' ? 'spaCy (en_core_web_sm)' : 'NuExtract via Ollama'}
        <br />
        <span className="carbon-label-01 text-[color:var(--text-tertiary)]">
          {method === 'spacy'
            ? 'Fast, rule-based NER with statistical models'
            : 'LLM-based extraction, better for domain-specific entities'}
        </span>
      </div>
    </div>
  )
})

export default EntityExplorer
