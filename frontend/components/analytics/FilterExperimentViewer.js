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
    if (pct >= 30) return 'text-green-600 dark:text-green-400'
    if (pct >= 15) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getBarWidth = (pct) => Math.min(100, Math.max(5, pct))

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1.5 text-sm font-medium ${
              viewMode === 'comparison'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Method Comparison
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`px-3 py-1.5 text-sm font-medium ${
              viewMode === 'detail'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Video Detail
          </button>
        </div>

        {/* Comparison View */}
        {viewMode === 'comparison' && comparison && (
          <div className="space-y-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Comparing {comparison.videos?.length || 0} videos
            </div>

            {/* Methods comparison table */}
            <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-12 gap-px bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-500 uppercase">
                <div className="col-span-3 bg-gray-100 dark:bg-gray-800 p-2">Method</div>
                <div className="col-span-5 bg-gray-100 dark:bg-gray-800 p-2">Description</div>
                <div className="col-span-2 bg-gray-100 dark:bg-gray-800 p-2 text-right">Avg Filtered</div>
                <div className="col-span-2 bg-gray-100 dark:bg-gray-800 p-2 text-right">Reduction</div>
              </div>

              {Object.entries(comparison.methods || {})
                .sort((a, b) => (b[1].avg_reduction_pct || 0) - (a[1].avg_reduction_pct || 0))
                .map(([methodName, methodData]) => (
                  <div key={methodName} className="grid grid-cols-12 gap-px bg-gray-200 dark:bg-gray-700">
                    <div className="col-span-3 bg-white dark:bg-gray-800 p-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {methodName}
                    </div>
                    <div className="col-span-5 bg-white dark:bg-gray-800 p-2 text-sm text-gray-600 dark:text-gray-400">
                      {methodData.description}
                    </div>
                    <div className="col-span-2 bg-white dark:bg-gray-800 p-2 text-sm text-right text-gray-900 dark:text-gray-100">
                      {methodData.avg_filtered?.toFixed(1) || '-'}
                    </div>
                    <div className={`col-span-2 bg-white dark:bg-gray-800 p-2 text-sm text-right font-medium ${getReductionColor(methodData.avg_reduction_pct || 0)}`}>
                      {methodData.avg_reduction_pct?.toFixed(1) || 0}%
                    </div>
                  </div>
                ))}
            </div>

            {/* Visual comparison */}
            <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="text-xs text-gray-500 uppercase mb-3">Reduction % by Method</div>
              <div className="space-y-2">
                {Object.entries(comparison.methods || {})
                  .sort((a, b) => (b[1].avg_reduction_pct || 0) - (a[1].avg_reduction_pct || 0))
                  .map(([methodName, methodData]) => (
                    <div key={methodName} className="flex items-center gap-2">
                      <div className="w-28 text-xs text-gray-600 dark:text-gray-400 truncate">
                        {methodName}
                      </div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-5 relative">
                        <div
                          className={`h-full ${
                            (methodData.avg_reduction_pct || 0) >= 20
                              ? 'bg-green-500'
                              : (methodData.avg_reduction_pct || 0) >= 10
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          }`}
                          style={{ width: `${getBarWidth(methodData.avg_reduction_pct || 0)}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-gray-800 dark:text-gray-200">
                          {methodData.avg_reduction_pct?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Per-video breakdown */}
            <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="text-xs text-gray-500 uppercase mb-3">Per-Video Results</div>
              <div className="space-y-4">
                {comparison.videos?.map((video, idx) => (
                  <div key={idx} className="border-t border-gray-200 dark:border-gray-700 pt-3 first:border-0 first:pt-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 truncate">
                      {video.length > 60 ? video.substring(0, 60) + '...' : video}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                      {Object.entries(comparison.methods || {}).map(([methodName, methodData]) => {
                        const videoStats = methodData.videos?.find(v =>
                          v.video?.toLowerCase().includes(video.toLowerCase().substring(0, 20))
                        )
                        return (
                          <div key={methodName} className="bg-gray-100 dark:bg-gray-700 p-2 text-center">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {videoStats?.stats?.reduction_pct?.toFixed(0) || 0}%
                            </div>
                            <div className="text-gray-500 truncate">{methodName}</div>
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                Select Experiment
              </label>
              <select
                value={selectedExperiment}
                onChange={(e) => setSelectedExperiment(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:border-blue-500"
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
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <span className="ml-2 text-sm text-gray-500">Loading...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Experiment Results */}
            {!loading && experimentData && (
              <div className="space-y-4">
                {/* Experiment Info */}
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Frames:</span> {experimentData.frames_processed} |
                  <span className="font-medium"> Sample Rate:</span> Every {experimentData.sample_rate}th frame |
                  <span className="font-medium"> FPS:</span> {experimentData.fps?.toFixed(1)}
                </div>

                {/* Methods Results */}
                {Object.entries(experimentData.methods || {}).map(([methodName, methodData]) => (
                  <div key={methodName} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{methodName}</div>
                        <div className="text-xs text-gray-500">{methodData.config?.description}</div>
                      </div>
                      <div className={`text-lg font-medium ${getReductionColor(methodData.stats?.reduction_pct || 0)}`}>
                        {methodData.stats?.reduction_pct?.toFixed(1) || 0}% reduction
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-px bg-gray-200 dark:bg-gray-700">
                      <div className="bg-white dark:bg-gray-800 p-2 text-center">
                        <div className="text-lg font-light text-gray-900 dark:text-gray-100">
                          {methodData.stats?.avg_raw?.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Avg Raw</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-2 text-center">
                        <div className="text-lg font-light text-gray-900 dark:text-gray-100">
                          {methodData.stats?.avg_filtered?.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Avg Filtered</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-2 text-center">
                        <div className="text-lg font-light text-gray-900 dark:text-gray-100">
                          {methodData.stats?.total_raw}
                        </div>
                        <div className="text-xs text-gray-500">Total Raw</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-2 text-center">
                        <div className="text-lg font-light text-gray-900 dark:text-gray-100">
                          {methodData.stats?.total_filtered}
                        </div>
                        <div className="text-xs text-gray-500">Total Filtered</div>
                      </div>
                    </div>

                    {/* Config details */}
                    <div className="p-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900">
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
              <div className="text-center py-12 text-gray-500 text-sm">
                Select an experiment to view detailed results
              </div>
            )}
          </div>
        )}

        {/* No experiments */}
        {!comparison && !loading && (
          <div className="text-center py-12 text-gray-500 text-sm">
            No filter experiments found. Run pose_filter_experiment.py to generate data.
          </div>
        )}
      </div>
    </div>
  )
})

export default FilterExperimentViewer
