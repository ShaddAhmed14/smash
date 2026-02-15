'use client'
import { useState, useEffect, memo } from 'react'

import BACKEND_URL from '../../lib/api'
const API_URL = BACKEND_URL

const SpeakerAwareViewer = memo(function SpeakerAwareViewer() {
  const [comparison, setComparison] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/analytics/pose/speaker-aware/compare`)
      .then(res => res.json())
      .then(data => {
        if (data.videos) {
          setComparison(data)
          if (data.videos.length > 0) {
            setSelectedVideo(data.videos[0])
          }
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch comparison:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!selectedVideo) return

    // Get image for selected video
    const videoKey = selectedVideo.video.split(' ')[0]
    fetch(`${API_URL}/analytics/pose/speaker-aware/images/${encodeURIComponent(videoKey)}`)
      .then(res => res.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          setImageUrl(`${API_URL}${data.images[0].url}`)
        }
      })
      .catch(err => console.log('No image available'))
  }, [selectedVideo])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[color:var(--button-primary)] border-t-transparent"></div>
        <span className="ml-2 carbon-body-01 text-[color:var(--text-tertiary)]">Loading...</span>
      </div>
    )
  }

  if (!comparison) {
    return (
      <div className="text-center py-12 text-[color:var(--text-tertiary)] carbon-body-01">
        No speaker-aware results available. Run speaker_aware_pose.py to generate data.
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-px bg-[color:var(--border-primary)] border border-[color:var(--border-primary)]">
          <div className="bg-[color:var(--bg-primary)] p-3 text-center">
            <div className="carbon-heading-04 font-light text-[color:var(--text-primary)]">
              {comparison.totals?.total_frames || 0}
            </div>
            <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase">Total Frames</div>
          </div>
          <div className="bg-[color:var(--bg-primary)] p-3 text-center">
            <div className="carbon-heading-04 font-light text-[color:var(--text-primary)]">
              {comparison.totals?.baseline_detections || 0}
            </div>
            <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase">Baseline</div>
          </div>
          <div className="bg-[color:var(--bg-primary)] p-3 text-center">
            <div className="carbon-heading-04 font-light text-[color:var(--text-primary)]">
              {comparison.totals?.speaker_aware_detections || 0}
            </div>
            <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase">Speaker-Aware</div>
          </div>
          <div className="bg-[color:var(--bg-primary)] p-3 text-center">
            <div className="carbon-heading-04 font-light text-[color:var(--custom-analysis-dark)]">
              {comparison.totals?.overall_reduction_pct || 0}%
            </div>
            <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase">Reduction</div>
          </div>
        </div>

        {/* Video Selector */}
        <div className="flex gap-2 flex-wrap">
          {comparison.videos?.map((video, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedVideo(video)}
              className={`px-3 py-1.5 carbon-body-01 font-medium border ${
                selectedVideo?.video === video.video
                  ? 'bg-[color:var(--button-primary)] text-white border-[color:var(--button-primary)]'
                  : 'bg-[color:var(--bg-primary)] text-[color:var(--text-secondary)] border-[color:var(--border-secondary)] hover:border-[color:var(--button-primary)]'
              }`}
            >
              {video.video.substring(0, 30)}...
            </button>
          ))}
        </div>

        {/* Selected Video Details */}
        {selectedVideo && (
          <div className="space-y-4">
            {/* Preview Image */}
            {imageUrl && (
              <div className="border border-[color:var(--border-primary)] bg-[color:var(--bg-inverse)]">
                <img
                  src={imageUrl}
                  alt="Speaker-aware pose preview"
                  className="w-full h-auto max-h-[50vh] object-contain"
                />
                <div className="p-2 carbon-label-01 text-[color:var(--text-tertiary)] bg-[color:var(--bg-tertiary)]">
                  Green box = identified speaker | Yellow skeleton = pose estimation on speaker only
                </div>
              </div>
            )}

            {/* Video Stats */}
            <div className="border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-4">
              <div className="carbon-body-01 font-medium text-[color:var(--text-primary)] mb-3 truncate">
                {selectedVideo.video}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase mb-1">Baseline</div>
                  <div className="carbon-heading-03 text-[color:var(--text-primary)]">
                    {selectedVideo.baseline?.total} detections
                  </div>
                  <div className="carbon-body-01 text-[color:var(--text-tertiary)]">
                    {selectedVideo.baseline?.avg_per_frame} avg/frame
                  </div>
                </div>
                <div>
                  <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase mb-1">Speaker-Aware</div>
                  <div className="carbon-heading-03 text-[color:var(--text-primary)]">
                    {selectedVideo.speaker_aware?.total} detections
                  </div>
                  <div className="carbon-body-01 text-[color:var(--text-tertiary)]">
                    {selectedVideo.speaker_aware?.avg_per_frame} avg/frame
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[color:var(--border-primary)]">
                <div className="flex items-center justify-between">
                  <span className="carbon-body-01 text-[color:var(--text-secondary)]">Reduction</span>
                  <span className={`carbon-heading-03 font-medium ${
                    selectedVideo.reduction_pct > 50
                      ? 'text-[color:var(--custom-analysis-dark)]'
                      : selectedVideo.reduction_pct > 0
                      ? 'text-[color:var(--custom-analytics-dark)]'
                      : 'text-[color:var(--text-secondary)]'
                  }`}>
                    {selectedVideo.reduction_pct}%
                  </span>
                </div>
                {/* Visual bar */}
                <div className="mt-2 h-3 bg-[color:var(--border-primary)] relative">
                  <div
                    className="h-full bg-[color:var(--button-primary)] absolute left-0"
                    style={{ width: `${100 - selectedVideo.reduction_pct}%` }}
                  />
                  <div
                    className="h-full bg-[color:var(--custom-analysis-dark)] absolute right-0"
                    style={{ width: `${selectedVideo.reduction_pct}%` }}
                  />
                </div>
                <div className="flex justify-between carbon-label-01 text-[color:var(--text-tertiary)] mt-1">
                  <span>Processed ({100 - selectedVideo.reduction_pct}%)</span>
                  <span>Saved ({selectedVideo.reduction_pct}%)</span>
                </div>
              </div>
            </div>

            {/* Method Explanation */}
            <div className="border border-[color:var(--border-primary)] bg-[color:var(--bg-secondary)] p-4 carbon-body-01">
              <div className="font-medium text-[color:var(--text-primary)] mb-2">How it works</div>
              <ol className="list-decimal list-inside space-y-1 text-[color:var(--text-secondary)]">
                <li>Face detection identifies all faces in frame</li>
                <li>Speaker heuristic scores each face by size (40%), center position (35%), confidence (25%)</li>
                <li>Pose estimation runs only on the highest-scoring face region</li>
                <li>Result: Focus on speaker, ignore audience/background people</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default SpeakerAwareViewer
