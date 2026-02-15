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
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
              Video
            </label>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:border-blue-500"
            />
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              className="w-full h-9 px-3 mt-1 text-sm border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:border-blue-500"
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
            className={`h-9 px-4 text-sm font-medium
              ${!selectedVideo || processing
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            {processing ? 'Processing...' : 'Run Estimation'}
          </button>
        </div>

        {/* Loading */}
        {(loading || processing) && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="ml-2 text-sm text-gray-500">{processing ? 'Running pose estimation...' : 'Loading...'}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !processing && poseData && stats && (
          <div className="space-y-4">
            {/* Image Viewer */}
            {samples.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 bg-gray-900">
                {selectedSample && (
                  <img
                    src={`${API_URL}${selectedSample.url}`}
                    alt="Pose visualization"
                    className="w-full h-auto max-h-[50vh] object-contain"
                  />
                )}
                {/* Thumbnails */}
                <div className="flex gap-1 p-2 bg-gray-800 overflow-x-auto">
                  {samples.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSample(sample)}
                      className={`flex-shrink-0 w-16 h-10 overflow-hidden border-2
                        ${selectedSample?.filename === sample.filename
                          ? 'border-blue-500'
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
            <div className="grid grid-cols-4 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-800 p-3 text-center">
                <div className="text-xl font-light text-gray-900 dark:text-gray-100">{stats.totalFrames}</div>
                <div className="text-xs text-gray-500 uppercase">Frames</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 text-center">
                <div className="text-xl font-light text-gray-900 dark:text-gray-100">{stats.avgPersons}</div>
                <div className="text-xs text-gray-500 uppercase">Avg</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 text-center">
                <div className="text-xl font-light text-gray-900 dark:text-gray-100">{stats.maxPersons}</div>
                <div className="text-xs text-gray-500 uppercase">Max</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 text-center">
                <div className="text-xl font-light text-gray-900 dark:text-gray-100">
                  {((stats.framesWithPeople / stats.totalFrames) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500 uppercase">Rate</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
              <div className="text-xs text-gray-500 uppercase mb-2">Person Count Timeline</div>
              <div className="h-16 flex items-end gap-px">
                {poseData.results.slice(0, 200).map((r, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-500 hover:bg-blue-400"
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
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">FPS:</span> {poseData.fps?.toFixed(1)} |
              <span className="font-medium"> Model:</span> RTMPose Wholebody
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !processing && !error && !selectedVideo && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Select a video to view pose estimation results
          </div>
        )}
      </div>
    </div>
  )
})

export default PoseViewer
