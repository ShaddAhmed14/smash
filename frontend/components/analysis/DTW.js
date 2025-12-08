'use client'
import { useState, useEffect, memo, useMemo, useCallback } from 'react'
import PlotTemplate from '../PlotTemplate'

const DTW = memo(function DTW({plot_name}) {
  const [dtwData, setDtwData] = useState(null)
  const [videos, setVideos] = useState([null, null])
  
  const layout={
    xaxis: {title: 'x', showgrid: false},
    yaxis: {title: 'y', showgrid: false},
    autosize: true,
    margin: {l: 0, r: 0, t: 0, b: 0}
  }
  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: "DTW Graph",
      height: 500,
      width: 700,
      scale: 1
    }
  }

  let url = process.env.NEXT_PUBLIC_BACKEND_URL  + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_gesture_segment?video_name="
  let dtw_url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_dtw"

  useEffect(() => {
    fetch(dtw_url)
      .then(response => response.json())
      .then(data => {
          const graph_data={
                x: data.x || [],
                y: data.y || [],
                text: data.gesture || [],
                }
        setDtwData(graph_data)
      })
  }, [])

  const handleClick = useCallback((e) => {
    const video_name = e.points[0]?.text
    setVideos(prev => {
      if (prev.includes(video_name)) {
        return prev.filter(v => v !== video_name) // remove video 
      }
      else if (prev.length >= 2) {
        return [prev[1], video_name] // replace the first video if 2 are already selected
      }
      else return [...prev, video_name] // add the new video
  })}, [])

  const processedData = useMemo(() => {
      if (!dtwData) return {}
      const styles = getComputedStyle(document.documentElement)
      const pointsColor = styles.getPropertyValue('--points-color')
      const customAnalysisDark = styles.getPropertyValue('--custom-analysis-dark')

      let returnData = {
        x: dtwData.x || [],
        y: dtwData.y || [],
        text: dtwData.text || [],
        type: 'scatter',
        mode: 'markers',
        marker: {
          color: dtwData.text?.map((video_name, index) => { return videos.includes(video_name) ? customAnalysisDark : pointsColor }) || pointsColor,
          size: dtwData.text?.map((video_name, index) => { return videos.includes(video_name) ? 12 : 6 }) || 6,
        },
        hovertemplate: "X: %{x}<br>Y: %{y}<br>Gesture: %{text}"
      }
      return [returnData]
    }, [dtwData, videos])


  return (

      <div className="flex flex-row justify-evenly gap-4">
        {dtwData ? 
          <PlotTemplate name={plot_name} layout={layout} config={config} data={processedData} handleClick={handleClick} selectedVideos={videos} />
          : null}
        <div className="flex flex-col items-center gap-y-4 align-middle justify-center w-1/3">
            {videos[0] ? <video loop title={videos[0]} src={url+videos[0]} controls /> : <p>Select upto 2 Videos to Preview</p>}
            {videos[1] ? <video loop title={videos[1]} src={url+videos[1]} controls /> : <p></p>}
        </div>
      </div>
  )
})

export default DTW