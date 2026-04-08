'use client'
import { useState, useEffect, memo } from 'react'

import BACKEND_URL from '../../lib/api'
const API_URL = BACKEND_URL

const FilterExperimentViewer = memo(function FilterExperimentViewer() {
  const [experiments, setExperiments] = useState([])
  const [selectedExperiment, setSelectedExperiment] = useState('')
  const [experimentData, setExperimentData] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('comparison') // 'comparison' or 'detail'

  useEffect(() => {
    // Load experiment list
    fetch(`${API_URL}/analytics/pose/experiments/list`)
      .then(res => res.json())
      .then(data => {
        if (data.experiments) {
          setExperiments(data.experiments)
        }
      })
      .catch(err => console.error('Failed to fetch experiments:', err))

    // Load comparison data
    fetch(`${API_URL}/analytics/pose/experiments/compare`)
      .then(res => res.json())
      .then(data => {
        if (data.methods) {
          setComparison(data)
        }
      })
      .catch(err => console.error('Failed to fetch comparison:', err))
  }, [])

  useEffect(() => {
    if (!selectedExperiment) {
      setExperimentData(null)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`${API_URL}/analytics/pose/experiments/${encodeURIComponent(selectedExperiment)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
          setExperimentData(null)
        } else {
          setExperimentData(data)
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [selectedExperiment])

  const getReductionColor = (pct) => {
    if (pct >= 30) return 'text-[color:var(--custom-analysis-dark)]'
    if (pct >= 15) return 'text-[color:var(--custom-analytics-dark)]'
    return 'text-[color:var(--text-secondary)]'
  }

  const getBarWidth = (pct) => Math.min(100, Math.max(5, pct))

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1.5 carbon-body-01 font-medium ${
              viewMode === 'comparison'
                ? 'bg-[color:var(--button-primary)] text-white'
                : 'bg-[color:var(--border-primary)] text-[color:var(--text-secondary)]'
            }`}
          >
            Method Comparison
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`px-3 py-1.5 carbon-body-01 font-medium ${
              viewMode === 'detail'
                ? 'bg-[color:var(--button-primary)] text-white'
                : 'bg-[color:var(--border-primary)] text-[color:var(--text-secondary)]'
            }`}
          >
            Video Detail
          </button>
        </div>

        {/* Comparison View */}
        {viewMode === 'comparison' && comparison && (
          <div className="space-y-4">
            <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase tracking-wide">
              Comparing {comparison.videos?.length || 0} videos
            </div>

            {/* Methods comparison table */}
            <div className="border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)]">
              <div className="grid grid-cols-12 gap-px bg-[color:var(--border-primary)] carbon-label-01 font-medium text-[color:var(--text-tertiary)] uppercase">
                <div className="col-span-3 bg-[color:var(--bg-secondary)] p-2">Method</div>
                <div className="col-span-5 bg-[color:var(--bg-secondary)] p-2">Description</div>
                <div className="col-span-2 bg-[color:var(--bg-secondary)] p-2 text-right">Avg Filtered</div>
                <div className="col-span-2 bg-[color:var(--bg-secondary)] p-2 text-right">Reduction</div>
              </div>

              {Object.entries(comparison.methods || {})
                .sort((a, b) => (b[1].avg_reduction_pct || 0) - (a[1].avg_reduction_pct || 0))
                .map(([methodName, methodData]) => (
                  <div key={methodName} className="grid grid-cols-12 gap-px bg-[color:var(--border-primary)]">
                    <div className="col-span-3 bg-[color:var(--bg-primary)] p-2 carbon-body-01 font-medium text-[color:var(--text-primary)]">
                      {methodName}
                    </div>
                    <div className="col-span-5 bg-[color:var(--bg-primary)] p-2 carbon-body-01 text-[color:var(--text-secondary)]">
                      {methodData.description}
                    </div>
                    <div className="col-span-2 bg-[color:var(--bg-primary)] p-2 carbon-body-01 text-right text-[color:var(--text-primary)]">
                      {methodData.avg_filtered?.toFixed(1) || '-'}
                    </div>
                    <div className={`col-span-2 bg-[color:var(--bg-primary)] p-2 carbon-body-01 text-right font-medium ${getReductionColor(methodData.avg_reduction_pct || 0)}`}>
                      {methodData.avg_reduction_pct?.toFixed(1) || 0}%
                    </div>
                  </div>
                ))}
            </div>

            {/* Visual comparison */}
            <div className="border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-4">
              <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase mb-3">Reduction % by Method</div>
              <div className="space-y-2">
                {Object.entries(comparison.methods || {})
                  .sort((a, b) => (b[1].avg_reduction_pct || 0) - (a[1].avg_reduction_pct || 0))
                  .map(([methodName, methodData]) => (
                    <div key={methodName} className="flex items-center gap-2">
                      <div className="w-28 carbon-label-01 text-[color:var(--text-secondary)] truncate">
                        {methodName}
                      </div>
                      <div className="flex-1 bg-[color:var(--border-primary)] h-5 relative">
                        <div
                          className={`h-full ${
                            (methodData.avg_reduction_pct || 0) >= 20
                              ? 'bg-[color:var(--custom-analysis-dark)]'
                              : (methodData.avg_reduction_pct || 0) >= 10
                              ? 'bg-[color:var(--custom-analytics-dark)]'
                              : 'bg-[color:var(--border-secondary)]'
                          }`}
                          style={{ width: `${getBarWidth(methodData.avg_reduction_pct || 0)}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-end pr-2 carbon-label-01 font-medium text-[color:var(--text-secondary)]">
                          {methodData.avg_reduction_pct?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Per-video breakdown */}
            <div className="border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-4">
              <div className="carbon-label-01 text-[color:var(--text-tertiary)] uppercase mb-3">Per-Video Results</div>
              <div className="space-y-4">
                {comparison.videos?.map((video, idx) => (
                  <div key={idx} className="border-t border-[color:var(--border-primary)] pt-3 first:border-0 first:pt-0">
                    <div className="carbon-body-01 font-medium text-[color:var(--text-primary)] mb-2 truncate">
                      {video.length > 60 ? video.substring(0, 60) + '...' : video}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 carbon-label-01">
                      {Object.entries(comparison.methods || {}).map(([methodName, methodData]) => {
                        const videoStats = methodData.videos?.find(v =>
                          v.video?.toLowerCase().includes(video.toLowerCase().substring(0, 20))
                        )
                        return (
                          <div key={methodName} className="bg-[color:var(--bg-secondary)] p-2 text-center">
                            <div className="font-medium text-[color:var(--text-primary)]">
                              {videoStats?.stats?.reduction_pct?.toFixed(0) || 0}%
                            </div>
                            <div className="text-[color:var(--text-tertiary)] truncate">{methodName}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detail View */}
        {viewMode === 'detail' && (
          <div className="space-y-4">
            {/* Video selector */}
            <div>
              <label className="block carbon-label-01 text-[color:var(--text-tertiary)] mb-1 uppercase tracking-wide">
                Select Experiment
              </label>
              <select
                value={selectedExperiment}
                onChange={(e) => setSelectedExperiment(e.target.value)}
                className="w-full h-9 px-3 carbon-body-01 border border-[color:var(--border-secondary)]
                           bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]
                           focus:outline-none focus:border-[color:var(--button-primary)]"
              >
                <option value="">Select a video experiment</option>
                {experiments.map((exp, idx) => (
                  <option key={idx} value={exp.video}>
                    {exp.video.length > 60 ? exp.video.substring(0, 60) + '...' : exp.video}
                  </option>
                ))}
              </select>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[color:var(--button-primary)] border-t-transparent"></div>
                <span className="ml-2 carbon-body-01 text-[color:var(--text-tertiary)]">Loading...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-[color:var(--bg-secondary)] border-l-4 border-[color:var(--custom-preview-dark)] text-[color:var(--text-primary)] carbon-body-01">
                {error}
              </div>
            )}

            {/* Experiment Results */}
            {!loading && experimentData && (
              <div className="space-y-4">
                {/* Experiment Info */}
                <div className="carbon-label-01 text-[color:var(--text-tertiary)]">
                  <span className="font-medium">Frames:</span> {experimentData.frames_processed} |
                  <span className="font-medium"> Sample Rate:</span> Every {experimentData.sample_rate}th frame |
                  <span className="font-medium"> FPS:</span> {experimentData.fps?.toFixed(1)}
                </div>

                {/* Methods Results */}
                {Object.entries(experimentData.methods || {}).map(([methodName, methodData]) => (
                  <div key={methodName} className="border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)]">
                    <div className="flex items-center justify-between p-3 border-b border-[color:var(--border-primary)]">
                      <div>
                        <div className="font-medium text-[color:var(--text-primary)]">{methodName}</div>
                        <div className="carbon-label-01 text-[color:var(--text-tertiary)]">{methodData.config?.description}</div>
                      </div>
                      <div className={`carbon-heading-03 font-medium ${getReductionColor(methodData.stats?.reduction_pct || 0)}`}>
                        {methodData.stats?.reduction_pct?.toFixed(1) || 0}% reduction
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-px bg-[color:var(--border-primary)]">
                      <div className="bg-[color:var(--bg-primary)] p-2 text-center">
                        <div className="carbon-heading-03 font-light text-[color:var(--text-primary)]">
                          {methodData.stats?.avg_raw?.toFixed(1)}
                        </div>
                        <div className="carbon-label-01 text-[color:var(--text-tertiary)]">Avg Raw</div>
                      </div>
                      <div className="bg-[color:var(--bg-primary)] p-2 text-center">
                        <div className="carbon-heading-03 font-light text-[color:var(--text-primary)]">
                          {methodData.stats?.avg_filtered?.toFixed(1)}
                        </div>
                        <div className="carbon-label-01 text-[color:var(--text-tertiary)]">Avg Filtered</div>
                      </div>
                      <div className="bg-[color:var(--bg-primary)] p-2 text-center">
                        <div className="carbon-heading-03 font-light text-[color:var(--text-primary)]">
                          {methodData.stats?.total_raw}
                        </div>
                        <div className="carbon-label-01 text-[color:var(--text-tertiary)]">Total Raw</div>
                      </div>
                      <div className="bg-[color:var(--bg-primary)] p-2 text-center">
                        <div className="carbon-heading-03 font-light text-[color:var(--text-primary)]">
                          {methodData.stats?.total_filtered}
                        </div>
                        <div className="carbon-label-01 text-[color:var(--text-tertiary)]">Total Filtered</div>
                      </div>
                    </div>

                    {/* Config details */}
                    <div className="p-2 carbon-label-01 text-[color:var(--text-tertiary)] bg-[color:var(--bg-secondary)]">
                      {methodData.config?.min_bbox_height_pct > 0 && (
                        <span className="mr-3">Min Height: {(methodData.config.min_bbox_height_pct * 100).toFixed(0)}%</span>
                      )}
                      {methodData.config?.max_y_position_pct < 1 && (
                        <span className="mr-3">Max Y: {(methodData.config.max_y_position_pct * 100).toFixed(0)}%</span>
                      )}
                      {methodData.config?.min_confidence > 0.2 && (
                        <span className="mr-3">Min Conf: {methodData.config.min_confidence}</span>
                      )}
                      {methodData.config?.roi_x_range && methodData.config.roi_x_range[0] > 0 && (
                        <span className="mr-3">ROI X: {(methodData.config.roi_x_range[0] * 100).toFixed(0)}-{(methodData.config.roi_x_range[1] * 100).toFixed(0)}%</span>
                      )}
                      {methodData.config?.roi_y_range && methodData.config.roi_y_range[0] > 0 && (
                        <span>ROI Y: {(methodData.config.roi_y_range[0] * 100).toFixed(0)}-{(methodData.config.roi_y_range[1] * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && !selectedExperiment && (
              <div className="text-center py-12 text-[color:var(--text-tertiary)] carbon-body-01">
                Select an experiment to view detailed results
              </div>
            )}
          </div>
        )}

        {/* No experiments */}
        {!comparison && !loading && (
          <div className="text-center py-12 text-[color:var(--text-tertiary)] carbon-body-01">
            No filter experiments found. Run pose_filter_experiment.py to generate data.
          </div>
        )}
      </div>
    </div>
  )
})

export default FilterExperimentViewer
