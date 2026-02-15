'use client'
import { useState, useEffect, memo } from 'react'

import BACKEND_URL from '../../lib/api'
const API_URL = BACKEND_URL

const PoseViewer = memo(function PoseViewer() {
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState('')
  const [poseData, setPoseData] = useState(null)
  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [processing, setProcessing] = useState(false)
  const [selectedSample, setSelectedSample] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/analytics/pose/list/available`)
      .then(res => res.json())
      .then(data => {
        if (data.available_videos) {
          setVideos(data.available_videos.map(v => ({
            name: v.video_name,
            path: v.file_path,
            frames: v.frames_processed
          })))
        }
      })
      .catch(err => console.error('Failed to fetch pose videos:', err))
  }, [])

  useEffect(() => {
    if (!selectedVideo) return

    setLoading(true)
    setError(null)
    setSamples([])
    setSelectedSample(null)

    fetch(`${API_URL}/analytics/pose/${encodeURIComponent(selectedVideo)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
          setPoseData(null)
        } else {
          setPoseData(data)
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })

    fetch(`${API_URL}/analytics/pose/samples/${encodeURIComponent(selectedVideo)}`)
      .then(res => res.json())
      .then(data => {
        if (data.samples) {
          setSamples(data.samples)
          if (data.samples.length > 0) {
            setSelectedSample(data.samples[0])
          }
        }
      })
      .catch(err => console.log('No rendered samples available'))
  }, [selectedVideo])

  const processPose = async () => {
    if (!selectedVideo) return
    setProcessing(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/analytics/pose/process/${encodeURIComponent(selectedVideo)}`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setPoseData(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const filteredVideos = videos.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = poseData?.results ? {
    totalFrames: poseData.frames_processed,
    avgPersons: (poseData.results.reduce((sum, r) => sum + r.num_persons, 0) / poseData.results.length).toFixed(1),
    maxPersons: Math.max(...poseData.results.map(r => r.num_persons)),
    framesWithPeople: poseData.results.filter(r => r.num_persons > 0).length
  } : null

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[280px]">
            <label className="block carbon-label-01 text-[color:var(--text-tertiary)] mb-1 uppercase tracking-wide">
              Video
            </label>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 px-3 carbon-body-01 border border-[color:var(--border-secondary)]
                         bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]
                         focus:outline-none focus:border-[color:var(--button-primary)]"
            />
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              className="filter-select w-full mt-1"
            >
              <option value="">Select a video</option>
              {filteredVideos.slice(0, 50).map((video, idx) => (
                <option key={idx} value={video.name}>
                  {video.name.length > 70 ? video.name.substring(0, 70) + '...' : video.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={processPose}
            disabled={!selectedVideo || processing}
            className={`h-10 px-4 carbon-body-01 font-medium border cursor-pointer
              ${!selectedVideo || processing
                ? 'bg-[color:var(--bg-tertiary)] text-[color:var(--text-tertiary)] border-[color:var(--border-primary)] cursor-not-allowed'
                : 'bg-[color:var(--button-primary)] hover:bg-[color:var(--button-primary-hover)] text-white border-[color:var(--button-primary)]'
              }`}
          >
            {processing ? 'Processing...' : 'Run Estimation'}
          </button>
        </div>

        {/* Loading */}
        {(loading || processing) && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[color:var(--button-primary)] border-t-transparent"></div>
            <span className="ml-2 carbon-body-01 text-[color:var(--text-secondary)]">{processing ? 'Running pose estimation...' : 'Loading...'}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-[color:var(--bg-secondary)] border-l-4 border-[color:var(--custom-preview-dark)] carbon-body-01 text-[color:var(--text-primary)]">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !processing && poseData && stats && (
          <div className="space-y-4">
            {/* Image Viewer */}
            {samples.length > 0 && (
              <div className="border border-[color:var(--border-primary)] bg-[color:var(--bg-inverse)]">
                {selectedSample && (
                  <img
                    src={`${API_URL}${selectedSample.url}`}
                    alt="Pose visualization"
                    className="w-full h-auto max-h-[50vh] object-contain"
                  />
                )}
                {/* Thumbnails */}
                <div className="flex gap-1 p-2 bg-[color:var(--bg-tertiary)] overflow-x-auto">
                  {samples.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSample(sample)}
                      className={`flex-shrink-0 w-16 h-10 overflow-hidden border-2 cursor-pointer
                        ${selectedSample?.filename === sample.filename
                          ? 'border-[color:var(--button-primary)]'
                          : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img
                        src={`${API_URL}${sample.url}`}
                        alt={`Sample ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-px bg-[color:var(--border-primary)] border border-[color:var(--border-primary)]">
              <div className="bg-[color:var(--bg-primary)] p-3 text-center">
                <div className="carbon-heading-03 font-light text-[color:var(--text-primary)]">{stats.totalFrames}</div>
                <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase">Frames</div>
              </div>
              <div className="bg-[color:var(--bg-primary)] p-3 text-center">
                <div className="carbon-heading-03 font-light text-[color:var(--text-primary)]">{stats.avgPersons}</div>
                <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase">Avg</div>
              </div>
              <div className="bg-[color:var(--bg-primary)] p-3 text-center">
                <div className="carbon-heading-03 font-light text-[color:var(--text-primary)]">{stats.maxPersons}</div>
                <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase">Max</div>
              </div>
              <div className="bg-[color:var(--bg-primary)] p-3 text-center">
                <div className="carbon-heading-03 font-light text-[color:var(--text-primary)]">
                  {((stats.framesWithPeople / stats.totalFrames) * 100).toFixed(0)}%
                </div>
                <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase">Rate</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-3">
              <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase mb-2">Person Count Timeline</div>
              <div className="h-16 flex items-end gap-px">
                {poseData.results.slice(0, 200).map((r, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-[color:var(--button-primary)] hover:bg-[color:var(--button-primary-hover)]"
                    style={{
                      height: `${Math.min(100, (r.num_persons / stats.maxPersons) * 100)}%`,
                      minHeight: r.num_persons > 0 ? '2px' : '0'
                    }}
                    title={`Frame ${r.frame}: ${r.num_persons}`}
                  />
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="carbon-label-01 text-[color:var(--text-tertiary)]">
              <span className="font-medium">FPS:</span> {poseData.fps?.toFixed(1)} |
              <span className="font-medium"> Model:</span> RTMPose Wholebody
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !processing && !error && !selectedVideo && (
          <div className="text-center py-12 carbon-body-01 text-[color:var(--text-tertiary)]">
            Select a video to view pose estimation results
          </div>
        )}
      </div>
    </div>
  )
})

export default PoseViewer
